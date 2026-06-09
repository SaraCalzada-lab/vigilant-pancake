import { Server, Socket } from "socket.io";
import {
  QUESTIONS,
  getTimeLimit,
  getRevealDuration,
  getPointsPerAnswer,
  getPointsCorrect,
  shuffleItems,
  selectQuestions,
} from "../lib/questions";
import {
  GameState,
  Player,
  PlayerAnswer,
  createInitialGameState,
  calculateScore,
  calculateOrderingScore,
  calculateTypingScore,
  calculateTrueOrFalseScore,
  normalizeTypingAnswer,
  getLeaderboard,
} from "../lib/game-state";
import type { GameConfig } from "../lib/game-state";
import os from "os";

const MAX_PLAYERS = 8;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

export function registerSocketHandlers(io: Server) {
  let gameState: GameState = createInitialGameState();

  function getPlayersArray(): Omit<Player, "answers">[] {
    return Array.from(gameState.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
    }));
  }

  function startQuestion(questionIndex: number) {
    gameState.currentQuestion = questionIndex;
    gameState.answersThisRound = new Map();
    gameState.typingSubmissionsThisRound = new Map();
    gameState.trueFalseSelectionsThisRound = new Map();
    gameState.phase = { type: "question", questionNum: questionIndex };

    const q = gameState.sessionQuestions[questionIndex];
    const timeLimitSec = getTimeLimit(q);

    if (q.type === "ordering") {
      // Shuffle items and store correct order
      const correctOrder = q.items
        .slice()
        .sort((a, b) => a.correctPosition - b.correctPosition)
        .map((item) => item.id);
      const shuffledItems = shuffleItems(q.items);
      const shuffledOrder = shuffledItems.map((item) => item.id);

      gameState.currentCorrectOrder = correctOrder;
      gameState.currentShuffledOrder = shuffledOrder;

      // Sanitized items (no correctPosition)
      const sanitizedItems = shuffledItems.map(({ id, imageUrl, label }) => ({
        id,
        imageUrl,
        label,
      }));

      // Send to TV
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("question:show", {
          type: "ordering",
          questionNum: questionIndex,
          text: q.text,
          items: sanitizedItems,
          timeLimit: timeLimitSec,
          totalQuestions: gameState.sessionQuestions.length,
        });
      }

      // Send to phones
      for (const [socketId] of gameState.players) {
        io.to(socketId).emit("question:start", {
          type: "ordering",
          questionNum: questionIndex,
          items: sanitizedItems,
          timeLimit: timeLimitSec,
        });
      }
    } else if (q.type === "typing_blitz") {
      // Send prompt to TV (with player roster so TV can render a slot per player)
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("question:show", {
          type: "typing_blitz",
          questionNum: questionIndex,
          text: q.text,
          timeLimit: timeLimitSec,
          totalQuestions: gameState.sessionQuestions.length,
          players: getPlayersArray().map(({ id, name }) => ({ id, name })),
        });
      }

      // Send prompt to every phone (typing_blitz is the only mode where the phone
      // displays the question text itself)
      for (const [socketId] of gameState.players) {
        io.to(socketId).emit("question:start", {
          type: "typing_blitz",
          questionNum: questionIndex,
          text: q.text,
          timeLimit: timeLimitSec,
        });
      }

      // Clear ordering state
      gameState.currentCorrectOrder = undefined;
      gameState.currentShuffledOrder = undefined;
    } else if (q.type === "true_or_false") {
      // Send statement to TV
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("question:show", {
          type: "true_or_false",
          questionNum: questionIndex,
          text: q.text,
          timeLimit: timeLimitSec,
          totalQuestions: gameState.sessionQuestions.length,
        });
      }

      // Send statement to every phone (phone displays the statement itself)
      for (const [socketId] of gameState.players) {
        io.to(socketId).emit("question:start", {
          type: "true_or_false",
          questionNum: questionIndex,
          text: q.text,
          timeLimit: timeLimitSec,
        });
      }

      // Clear ordering state
      gameState.currentCorrectOrder = undefined;
      gameState.currentShuffledOrder = undefined;
    } else {
      // Multiple choice
      // Send full question to TV
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("question:show", {
          type: "multiple_choice",
          questionNum: questionIndex,
          text: q.text,
          options: q.options,
          timeLimit: timeLimitSec,
          totalQuestions: gameState.sessionQuestions.length,
        });
      }

      // Send options only to phones
      for (const [socketId] of gameState.players) {
        io.to(socketId).emit("question:start", {
          type: "multiple_choice",
          questionNum: questionIndex,
          options: q.options,
          timeLimit: timeLimitSec,
        });
      }

      // Clear ordering state
      gameState.currentCorrectOrder = undefined;
      gameState.currentShuffledOrder = undefined;
    }

    // Start server-authoritative timer
    gameState.questionStartTime = Date.now();
    let secondsLeft = timeLimitSec;

    io.emit("timer:tick", { secondsLeft });

    gameState.timerInterval = setInterval(() => {
      secondsLeft--;
      io.emit("timer:tick", { secondsLeft });

      if (secondsLeft <= 0) {
        clearInterval(gameState.timerInterval!);
        gameState.timerInterval = null;
        endQuestion();
      }
    }, 1000);
  }

  async function endQuestion() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }

    const q = gameState.sessionQuestions[gameState.currentQuestion];
    const timeLimitSec = getTimeLimit(q);

    if (q.type === "typing_blitz") {
      // Score every player's submissions (including players who submitted nothing)
      const pointsPerAnswer = getPointsPerAnswer(q);
      for (const player of gameState.players.values()) {
        if (gameState.answersThisRound.has(player.id)) continue;
        const submissions =
          gameState.typingSubmissionsThisRound.get(player.id) ?? [];
        const { points, correctCount, results } = calculateTypingScore(
          submissions,
          q.validAnswers,
          pointsPerAnswer
        );
        const answer: PlayerAnswer = {
          questionNum: gameState.currentQuestion,
          optionIndex: -1,
          timeMs: timeLimitSec * 1000,
          correct: correctCount > 0,
          points,
          typingSubmissions: submissions,
          typingResults: results,
          typingCorrectCount: correctCount,
        };
        gameState.answersThisRound.set(player.id, answer);
        player.answers.push(answer);
        player.score += points;
      }
    } else if (q.type === "true_or_false") {
      // Score every player based on their final selection (undefined = no answer)
      const pointsCorrect = getPointsCorrect(q);
      for (const player of gameState.players.values()) {
        if (gameState.answersThisRound.has(player.id)) continue;
        const selection = gameState.trueFalseSelectionsThisRound.get(player.id);
        const { points, correct } = calculateTrueOrFalseScore(
          selection,
          q.correctAnswer,
          pointsCorrect
        );
        const answer: PlayerAnswer = {
          questionNum: gameState.currentQuestion,
          optionIndex: -1,
          timeMs: timeLimitSec * 1000,
          correct,
          points,
          trueFalseSelection: selection,
        };
        gameState.answersThisRound.set(player.id, answer);
        player.answers.push(answer);
        player.score += points;
      }
    } else {
      // Give 0 points to players who didn't answer
      for (const [socketId] of gameState.players) {
        if (!gameState.answersThisRound.has(socketId)) {
          if (q.type === "ordering") {
            // Auto-submit with shuffled order (current arrangement) for unanswered players
            const answer: PlayerAnswer = {
              questionNum: gameState.currentQuestion,
              optionIndex: -1,
              timeMs: timeLimitSec * 1000,
              correct: false,
              points: 0,
              orderedItemIds: gameState.currentShuffledOrder || [],
              correctCount: 0,
            };
            gameState.answersThisRound.set(socketId, answer);
            gameState.players.get(socketId)!.answers.push(answer);
          } else {
            const answer: PlayerAnswer = {
              questionNum: gameState.currentQuestion,
              optionIndex: -1,
              timeMs: timeLimitSec * 1000,
              correct: false,
              points: 0,
            };
            gameState.answersThisRound.set(socketId, answer);
            gameState.players.get(socketId)!.answers.push(answer);
          }
        }
      }
    }

    if (q.type === "ordering") {
      // Build per-player results for ordering
      const playerResults = Array.from(gameState.players.values()).map((p) => {
        const answer = gameState.answersThisRound.get(p.id);
        return {
          id: p.id,
          name: p.name,
          orderedItemIds: answer?.orderedItemIds ?? [],
          correctCount: answer?.correctCount ?? 0,
          points: answer?.points ?? 0,
          totalScore: p.score,
          totalItems: q.items.length,
        };
      });

      io.emit("question:end", {
        type: "ordering",
        questionNum: gameState.currentQuestion,
        correctOrder: gameState.currentCorrectOrder,
        items: q.items.map(({ id, imageUrl, label }) => ({ id, imageUrl, label })),
        playerResults,
      });
    } else if (q.type === "typing_blitz") {
      const playerResults = Array.from(gameState.players.values()).map((p) => {
        const answer = gameState.answersThisRound.get(p.id);
        const submissions = answer?.typingSubmissions ?? [];
        const results = answer?.typingResults ?? [];
        return {
          id: p.id,
          name: p.name,
          submissions,
          results,
          correctCount: answer?.typingCorrectCount ?? 0,
          totalSubmitted: submissions.length,
          points: answer?.points ?? 0,
          totalScore: p.score,
        };
      });

      io.emit("question:end", {
        type: "typing_blitz",
        questionNum: gameState.currentQuestion,
        validAnswers: q.validAnswers,
        playerResults,
      });

      gameState.typingSubmissionsThisRound = new Map();
    } else if (q.type === "true_or_false") {
      const playerResults = Array.from(gameState.players.values()).map((p) => {
        const answer = gameState.answersThisRound.get(p.id);
        return {
          id: p.id,
          name: p.name,
          selection: answer?.trueFalseSelection,
          correct: answer?.correct ?? false,
          points: answer?.points ?? 0,
          totalScore: p.score,
        };
      });

      const trueCount = playerResults.filter((p) => p.selection === true).length;
      const falseCount = playerResults.filter((p) => p.selection === false).length;

      io.emit("question:end", {
        type: "true_or_false",
        questionNum: gameState.currentQuestion,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        trueCount,
        falseCount,
        playerResults,
      });

      gameState.trueFalseSelectionsThisRound = new Map();
    } else {
      // Build per-player results for MC
      const playerResults = Array.from(gameState.players.values()).map((p) => {
        const answer = gameState.answersThisRound.get(p.id);
        return {
          id: p.id,
          name: p.name,
          optionIndex: answer?.optionIndex ?? -1,
          correct: answer?.correct ?? false,
          points: answer?.points ?? 0,
          totalScore: p.score,
        };
      });

      io.emit("question:end", {
        type: "multiple_choice",
        questionNum: gameState.currentQuestion,
        correctIndex: (q as { correctIndex: number }).correctIndex,
        playerResults,
      });
    }

    // Show results phase
    gameState.phase = { type: "results", questionNum: gameState.currentQuestion };
    await delay(getRevealDuration(q) * 1000);

    // Show leaderboard
    gameState.phase = { type: "leaderboard" };
    const leaderboard = getLeaderboard(gameState.players);

    if (gameState.tvSocketId) {
      io.to(gameState.tvSocketId).emit("scores:show", { leaderboard });
    }

    // Send individual scores to each phone
    for (const [socketId, player] of gameState.players) {
      const rank = leaderboard.findIndex((l) => l.id === socketId) + 1;
      io.to(socketId).emit("scores:shown", {
        playerScore: player.score,
        rank,
        totalPlayers: gameState.players.size,
      });
    }

    await delay(4000);

    // Next question or end game
    if (gameState.currentQuestion < gameState.sessionQuestions.length - 1) {
      startQuestion(gameState.currentQuestion + 1);
    } else {
      endGame();
    }
  }

  function endGame() {
    gameState.phase = { type: "final" };
    const finalLeaderboard = getLeaderboard(gameState.players);
    io.emit("game:end", { finalLeaderboard });
  }

  function resetGame() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }
    const tvSocketId = gameState.tvSocketId;
    const players = gameState.players;

    gameState = createInitialGameState();
    gameState.tvSocketId = tvSocketId;

    // Keep players but reset scores
    for (const [id, player] of players) {
      gameState.players.set(id, {
        id,
        name: player.name,
        score: 0,
        answers: [],
      });
    }
  }

  io.on("connection", (socket: Socket) => {
    console.log(`Connected: ${socket.id}`);

    // TV identifies itself
    socket.on("tv:connect", () => {
      gameState.tvSocketId = socket.id;
      socket.emit("server:info", {
        ip: getLocalIp(),
        port: 3000,
        players: getPlayersArray(),
        phase: gameState.phase,
      });
      console.log("TV connected");
    });

    // Player joins
    socket.on("player:join", ({ name }: { name: string }) => {
      if (gameState.players.size >= MAX_PLAYERS) {
        socket.emit("game:full");
        return;
      }

      if (gameState.phase.type !== "lobby") {
        socket.emit("game:in-progress");
        return;
      }

      const trimmedName = (name || "").trim().slice(0, 15);
      if (!trimmedName) {
        socket.emit("join:error", { message: "Name is required" });
        return;
      }

      const player: Player = {
        id: socket.id,
        name: trimmedName,
        score: 0,
        answers: [],
      };

      gameState.players.set(socket.id, player);

      socket.emit("player:joined-ack", {
        playerId: socket.id,
        name: trimmedName,
      });

      // Notify TV
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("player:joined", {
          players: getPlayersArray(),
        });
      }

      console.log(`Player joined: ${trimmedName} (${socket.id})`);
    });

    // Player submits answer
    socket.on("answer:submit", (data: { questionNum: number; optionIndex?: number; orderedItemIds?: string[] }) => {
      const player = gameState.players.get(socket.id);
      if (!player) return;
      if (gameState.phase.type !== "question") return;
      if (data.questionNum !== gameState.currentQuestion) return;
      if (gameState.answersThisRound.has(socket.id)) return;

      const timeMs = Date.now() - gameState.questionStartTime;
      const q = gameState.sessionQuestions[gameState.currentQuestion];
      const timeLimitMs = getTimeLimit(q) * 1000;

      if (q.type === "ordering" && data.orderedItemIds) {
        const { points, correctCount } = calculateOrderingScore(
          data.orderedItemIds,
          gameState.currentCorrectOrder || [],
          timeMs,
          timeLimitMs
        );

        const allCorrect = correctCount === q.items.length;
        const answer: PlayerAnswer = {
          questionNum: data.questionNum,
          optionIndex: -1,
          timeMs,
          correct: allCorrect,
          points,
          orderedItemIds: data.orderedItemIds,
          correctCount,
        };

        gameState.answersThisRound.set(socket.id, answer);
        player.answers.push(answer);
        player.score += points;
      } else if (q.type === "multiple_choice" && data.optionIndex !== undefined) {
        const correct = data.optionIndex === q.correctIndex;
        const points = calculateScore(timeMs, timeLimitMs, correct);

        const answer: PlayerAnswer = {
          questionNum: data.questionNum,
          optionIndex: data.optionIndex,
          timeMs,
          correct,
          points,
        };

        gameState.answersThisRound.set(socket.id, answer);
        player.answers.push(answer);
        player.score += points;
      } else {
        return;
      }

      socket.emit("answer:ack", { received: true });

      // Notify TV of answer count
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("answer:count", {
          answered: gameState.answersThisRound.size,
          total: gameState.players.size,
        });
      }

      // Check if all players answered
      if (gameState.answersThisRound.size >= gameState.players.size) {
        endQuestion();
      }
    });

    // Ordering: real-time reorder preview
    socket.on("ordering:update", (data: { questionNum: number; orderedItemIds: string[] }) => {
      const player = gameState.players.get(socket.id);
      if (!player) return;
      if (gameState.phase.type !== "question") return;
      if (data.questionNum !== gameState.currentQuestion) return;

      // Forward to TV with player name (TV shows activity count, not individual orders)
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("ordering:update", {
          playerName: player.name,
          questionNum: data.questionNum,
          orderedItemIds: data.orderedItemIds,
        });
      }
    });

    // Typing Blitz: streaming single-word submission
    socket.on("typing:submit", (data: { questionNum: number; answer: string }) => {
      const player = gameState.players.get(socket.id);
      if (!player) return;
      if (gameState.phase.type !== "question") return;
      if (data.questionNum !== gameState.currentQuestion) return;

      const q = gameState.sessionQuestions[gameState.currentQuestion];
      if (q.type !== "typing_blitz") return;

      const normalized = normalizeTypingAnswer(data.answer ?? "");
      if (!normalized) return; // empty / whitespace-only — drop silently

      let words = gameState.typingSubmissionsThisRound.get(socket.id);
      if (!words) {
        words = [];
        gameState.typingSubmissionsThisRound.set(socket.id, words);
      }
      if (words.includes(normalized)) return; // per-player dedup

      words.push(normalized);

      // Ack the player so the phone can echo the word as a chip
      socket.emit("typing:submit:ack", { word: normalized });

      // Push per-player live count to the TV
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("typing:progress", {
          playerId: socket.id,
          count: words.length,
        });
      }
    });

    // True or False: re-selectable live selection
    socket.on("true_false:select", (data: { questionNum: number; selection: boolean }) => {
      const player = gameState.players.get(socket.id);
      if (!player) return;
      if (gameState.phase.type !== "question") return;
      if (data.questionNum !== gameState.currentQuestion) return;

      const q = gameState.sessionQuestions[gameState.currentQuestion];
      if (q.type !== "true_or_false") return;
      if (typeof data.selection !== "boolean") return;

      const wasFirst = !gameState.trueFalseSelectionsThisRound.has(socket.id);
      gameState.trueFalseSelectionsThisRound.set(socket.id, data.selection);

      // Bump the TV answered count only on the player's first selection
      if (wasFirst && gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("answer:count", {
          answered: gameState.trueFalseSelectionsThisRound.size,
          total: gameState.players.size,
        });
      }
      // No early termination — round ends on timer expiry only
    });

    // Host starts the game
    socket.on("admin:start-game", (config?: GameConfig) => {
      if (gameState.phase.type !== "lobby") return;
      if (gameState.players.size === 0) return;

      if (config && config.modes.length > 0) {
        gameState.sessionQuestions = selectQuestions(config);
      } else {
        gameState.sessionQuestions = shuffleItems([...QUESTIONS]);
      }

      console.log(`Game starting with ${gameState.sessionQuestions.length} questions!`);
      io.emit("game:start", { totalQuestions: gameState.sessionQuestions.length });
      startQuestion(0);
    });

    // Host resets the game
    socket.on("admin:reset-game", () => {
      resetGame();
      io.emit("game:reset");
      if (gameState.tvSocketId) {
        io.to(gameState.tvSocketId).emit("player:joined", {
          players: getPlayersArray(),
        });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);

      if (socket.id === gameState.tvSocketId) {
        gameState.tvSocketId = null;
        console.log("TV disconnected");
      } else if (gameState.players.has(socket.id)) {
        gameState.players.delete(socket.id);
        gameState.typingSubmissionsThisRound.delete(socket.id);
        gameState.trueFalseSelectionsThisRound.delete(socket.id);
        if (gameState.tvSocketId) {
          io.to(gameState.tvSocketId).emit("player:joined", {
            players: getPlayersArray(),
          });
        }

        // If game in progress and all remaining players answered, end question
        // (not applicable to typing_blitz or true_or_false — those modes only end on timer expiry)
        const currentQ = gameState.sessionQuestions[gameState.currentQuestion];
        if (
          gameState.phase.type === "question" &&
          gameState.players.size > 0 &&
          currentQ?.type !== "typing_blitz" &&
          currentQ?.type !== "true_or_false" &&
          gameState.answersThisRound.size >= gameState.players.size
        ) {
          endQuestion();
        }
      }
    });
  });
}
