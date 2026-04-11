"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import JoinScreen from "@/components/phone/JoinScreen";
import WaitingScreen from "@/components/phone/WaitingScreen";
import AnswerButtons from "@/components/phone/AnswerButtons";
import ResultFeedback from "@/components/phone/ResultFeedback";
import OrderingSortable from "@/components/phone/OrderingSortable";
import OrderingResultFeedback from "@/components/phone/OrderingResultFeedback";
import TypingBlitzInput from "@/components/phone/TypingBlitzInput";
import TypingBlitzResultFeedback from "@/components/phone/TypingBlitzResultFeedback";

type Phase = "join" | "waiting" | "question" | "answered" | "result" | "scores" | "final";
type QuestionType = "multiple_choice" | "ordering" | "typing_blitz";

interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
}

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("join");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string>();
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const [options, setOptions] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [questionNum, setQuestionNum] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const currentOrderRef = useRef<string[]>([]);

  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);

  // Ordering result state
  const [lastCorrectCount, setLastCorrectCount] = useState(0);
  const [lastTotalItems, setLastTotalItems] = useState(0);

  // Typing Blitz state
  const [typingQuestionText, setTypingQuestionText] = useState("");
  const [typingChips, setTypingChips] = useState<string[]>([]);
  const typingChipsRef = useRef<string[]>([]);
  const [lastTotalSubmitted, setLastTotalSubmitted] = useState(0);

  const handleJoin = useCallback((name: string) => {
    getSocket().emit("player:join", { name });
  }, []);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      setSelectedIndex(optionIndex);
      setPhase("answered");
      getSocket().emit("answer:submit", { questionNum, optionIndex });
    },
    [questionNum]
  );

  const handleOrderingReorder = useCallback(
    (orderedIds: string[]) => {
      setCurrentOrder(orderedIds);
      currentOrderRef.current = orderedIds;
      getSocket().emit("ordering:update", { questionNum, orderedItemIds: orderedIds });
    },
    [questionNum]
  );

  const handleOrderingSubmit = useCallback(
    (orderedIds: string[]) => {
      setPhase("answered");
      getSocket().emit("answer:submit", { questionNum, orderedItemIds: orderedIds });
    },
    [questionNum]
  );

  const handleTypingSubmit = useCallback(
    (word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      // Client-side dedup against echoed chips — avoids unnecessary traffic
      if (typingChipsRef.current.includes(trimmed.toLowerCase())) return;
      getSocket().emit("typing:submit", { questionNum, answer: trimmed });
    },
    [questionNum]
  );

  useEffect(() => {
    const socket = getSocket();

    socket.on("player:joined-ack", (data) => {
      setPlayerName(data.name);
      setPhase("waiting");
    });

    socket.on("game:full", () => {
      setError("Game is full (8/8 players)");
    });

    socket.on("game:in-progress", () => {
      setError("Game already in progress");
    });

    socket.on("join:error", (data) => {
      setError(data.message);
    });

    socket.on("game:start", () => {
      setPhase("waiting");
    });

    socket.on("question:start", (data) => {
      setPhase("question");
      setQuestionNum(data.questionNum);
      setSecondsLeft(data.timeLimit);
      setSelectedIndex(undefined);

      if (data.type === "ordering") {
        setQuestionType("ordering");
        setOrderingItems(data.items);
        const initialOrder = data.items.map((item: OrderingItem) => item.id);
        setCurrentOrder(initialOrder);
        currentOrderRef.current = initialOrder;
      } else if (data.type === "typing_blitz") {
        setQuestionType("typing_blitz");
        setTypingQuestionText(data.text);
        setTypingChips([]);
        typingChipsRef.current = [];
      } else {
        setQuestionType("multiple_choice");
        setOptions(data.options);
      }
    });

    socket.on("timer:tick", (data) => {
      setSecondsLeft(data.secondsLeft);

      // Auto-submit ordering when timer hits 0
      if (data.secondsLeft <= 0) {
        // The server will handle unanswered players, but we try to submit
        // the current arrangement so the player gets credit
        // Only auto-submit if we haven't already submitted
      }
    });

    socket.on("answer:ack", () => {
      // Stay in "answered" phase - buttons locked
    });

    socket.on("typing:submit:ack", (data: { word: string }) => {
      if (typingChipsRef.current.includes(data.word)) return;
      const next = [...typingChipsRef.current, data.word];
      typingChipsRef.current = next;
      setTypingChips(next);
    });

    socket.on("question:end", (data) => {
      if (data.type === "ordering") {
        setQuestionType("ordering");
        const myResult = data.playerResults.find(
          (r: { id: string }) => r.id === socket.id
        );
        if (myResult) {
          setLastCorrectCount(myResult.correctCount);
          setLastTotalItems(myResult.totalItems);
          setLastPoints(myResult.points);
          setScore(myResult.totalScore);
          setLastCorrect(myResult.correctCount === myResult.totalItems);
        }
      } else if (data.type === "typing_blitz") {
        setQuestionType("typing_blitz");
        const myResult = data.playerResults.find(
          (r: { id: string }) => r.id === socket.id
        );
        if (myResult) {
          setLastCorrectCount(myResult.correctCount);
          setLastTotalSubmitted(myResult.totalSubmitted);
          setLastPoints(myResult.points);
          setScore(myResult.totalScore);
          setLastCorrect(myResult.correctCount > 0);
        }
      } else {
        setQuestionType("multiple_choice");
        const myResult = data.playerResults.find(
          (r: { id: string }) => r.id === socket.id
        );
        if (myResult) {
          setLastCorrect(myResult.correct);
          setLastPoints(myResult.points);
          setScore(myResult.totalScore);
        }
      }
      setPhase("result");
    });

    socket.on("scores:shown", (data) => {
      setScore(data.playerScore);
      setRank(data.rank);
      setTotalPlayers(data.totalPlayers);
      setPhase("scores");
    });

    socket.on("game:end", (data) => {
      const myEntry = data.finalLeaderboard.find(
        (e: { id: string }) => e.id === socket.id
      );
      if (myEntry) {
        setScore(myEntry.score);
        setRank(data.finalLeaderboard.indexOf(myEntry) + 1);
        setTotalPlayers(data.finalLeaderboard.length);
      }
      setPhase("final");
    });

    socket.on("game:reset", () => {
      setPhase("waiting");
      setScore(0);
      setRank(0);
      setSelectedIndex(undefined);
      setQuestionType("multiple_choice");
      setTypingChips([]);
      typingChipsRef.current = [];
    });

    return () => {
      socket.off("player:joined-ack");
      socket.off("game:full");
      socket.off("game:in-progress");
      socket.off("join:error");
      socket.off("game:start");
      socket.off("question:start");
      socket.off("timer:tick");
      socket.off("answer:ack");
      socket.off("typing:submit:ack");
      socket.off("question:end");
      socket.off("scores:shown");
      socket.off("game:end");
      socket.off("game:reset");
    };
  }, []);

  // Auto-submit ordering answer when timer expires
  useEffect(() => {
    if (secondsLeft <= 0 && phase === "question" && questionType === "ordering") {
      setPhase("answered");
      getSocket().emit("answer:submit", {
        questionNum,
        orderedItemIds: currentOrderRef.current,
      });
    }
  }, [secondsLeft, phase, questionType, questionNum]);

  return (
    <div className="bg-mesh-animated h-screen w-screen overflow-hidden text-white">
      {phase === "join" && <JoinScreen onJoin={handleJoin} error={error} />}

      {phase === "waiting" && (
        <WaitingScreen playerName={playerName} score={score} />
      )}

      {(phase === "question" || phase === "answered") && questionType === "multiple_choice" && (
        <AnswerButtons
          options={options}
          secondsLeft={secondsLeft}
          onAnswer={handleAnswer}
          disabled={phase === "answered"}
          selectedIndex={selectedIndex}
        />
      )}

      {(phase === "question" || phase === "answered") && questionType === "ordering" && (
        <OrderingSortable
          items={orderingItems}
          currentOrder={currentOrder}
          secondsLeft={secondsLeft}
          onReorder={handleOrderingReorder}
          onSubmit={handleOrderingSubmit}
          disabled={phase === "answered"}
        />
      )}

      {(phase === "question" || phase === "answered") && questionType === "typing_blitz" && (
        <TypingBlitzInput
          questionText={typingQuestionText}
          secondsLeft={secondsLeft}
          chips={typingChips}
          onSubmit={handleTypingSubmit}
          disabled={phase === "answered"}
        />
      )}

      {phase === "result" && questionType === "multiple_choice" && (
        <ResultFeedback
          correct={lastCorrect}
          points={lastPoints}
          totalScore={score}
        />
      )}

      {phase === "result" && questionType === "ordering" && (
        <OrderingResultFeedback
          correctCount={lastCorrectCount}
          totalItems={lastTotalItems}
          points={lastPoints}
          totalScore={score}
        />
      )}

      {phase === "result" && questionType === "typing_blitz" && (
        <TypingBlitzResultFeedback
          correctCount={lastCorrectCount}
          totalSubmitted={lastTotalSubmitted}
          points={lastPoints}
          totalScore={score}
        />
      )}

      {phase === "scores" && (
        <WaitingScreen
          playerName={playerName}
          score={score}
          message={`Rank: ${rank} of ${totalPlayers}`}
        />
      )}

      {phase === "final" && (
        <div className="flex h-screen flex-col items-center justify-center gap-6 p-6">
          <h2 className="bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
            Game Over!
          </h2>
          <div className="glass-strong flex h-28 w-28 items-center justify-center rounded-full">
            <p className="text-5xl font-bold text-yellow-300">#{rank}</p>
          </div>
          <p className="font-mono text-2xl text-white/70">{score.toLocaleString()} pts</p>
          <p className="text-lg text-white/30">{playerName}</p>
        </div>
      )}
    </div>
  );
}
