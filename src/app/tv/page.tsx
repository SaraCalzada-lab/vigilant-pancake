"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { GameConfig } from "@/lib/game-state";
import LobbyScreen from "@/components/tv/LobbyScreen";
import QuestionScreen from "@/components/tv/QuestionScreen";
import ResultsScreen from "@/components/tv/ResultsScreen";
import LeaderboardScreen from "@/components/tv/LeaderboardScreen";
import FinalScreen from "@/components/tv/FinalScreen";
import OrderingQuestionScreen from "@/components/tv/OrderingQuestionScreen";
import OrderingResultsScreen from "@/components/tv/OrderingResultsScreen";
import TypingBlitzQuestionScreen from "@/components/tv/TypingBlitzQuestionScreen";
import TypingBlitzResultsScreen from "@/components/tv/TypingBlitzResultsScreen";
import TrueOrFalseQuestionScreen from "@/components/tv/TrueOrFalseQuestionScreen";
import TrueOrFalseResultsScreen from "@/components/tv/TrueOrFalseResultsScreen";

type Phase = "lobby" | "question" | "results" | "leaderboard" | "final";
type QuestionType = "multiple_choice" | "ordering" | "typing_blitz" | "true_or_false";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface PlayerResult {
  id: string;
  name: string;
  optionIndex: number;
  correct: boolean;
  points: number;
  totalScore: number;
}

interface OrderingPlayerResult {
  id: string;
  name: string;
  correctCount: number;
  totalItems: number;
  points: number;
  totalScore: number;
}

interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
}

interface TypingBlitzResultEntry {
  word: string;
  correct: boolean;
}

interface TypingBlitzPlayerResult {
  id: string;
  name: string;
  submissions: string[];
  results: TypingBlitzResultEntry[];
  correctCount: number;
  totalSubmitted: number;
  points: number;
  totalScore: number;
}

interface TypingBlitzRosterPlayer {
  id: string;
  name: string;
}

interface TrueOrFalsePlayerResult {
  id: string;
  name: string;
  selection: boolean | undefined;
  correct: boolean;
  points: number;
  totalScore: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
}

export default function TVPage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [serverIp, setServerIp] = useState("localhost");
  const [players, setPlayers] = useState<Player[]>([]);

  const [questionNum, setQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [answeredCount, setAnsweredCount] = useState(0);

  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>([]);
  const [arrangingCount, setArrangingCount] = useState(0);
  const arrangingPlayersRef = useRef(new Set<string>());

  const [correctIndex, setCorrectIndex] = useState(0);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([]);

  // Ordering results
  const [orderingCorrectOrder, setOrderingCorrectOrder] = useState<string[]>([]);
  const [orderingResultItems, setOrderingResultItems] = useState<OrderingItem[]>([]);
  const [orderingPlayerResults, setOrderingPlayerResults] = useState<OrderingPlayerResult[]>([]);

  // Typing Blitz state
  const [typingRoster, setTypingRoster] = useState<TypingBlitzRosterPlayer[]>([]);
  const [typingProgress, setTypingProgress] = useState<Map<string, number>>(new Map());
  const [typingPlayerResults, setTypingPlayerResults] = useState<TypingBlitzPlayerResult[]>([]);
  const [typingValidAnswers, setTypingValidAnswers] = useState<string[]>([]);

  // True or False state
  const [trueOrFalseCorrect, setTrueOrFalseCorrect] = useState<boolean>(false);
  const [trueOrFalseExplanation, setTrueOrFalseExplanation] = useState<string | undefined>(undefined);
  const [trueOrFalseResults, setTrueOrFalseResults] = useState<TrueOrFalsePlayerResult[]>([]);
  const [trueOrFalseTrueCount, setTrueOrFalseTrueCount] = useState(0);
  const [trueOrFalseFalseCount, setTrueOrFalseFalseCount] = useState(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const handleStartGame = useCallback((config: GameConfig) => {
    getSocket().emit("admin:start-game", config);
  }, []);

  const handlePlayAgain = useCallback(() => {
    getSocket().emit("admin:reset-game");
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("tv:connect");

    socket.on("server:info", (data) => {
      setServerIp(data.ip);
      if (data.players) setPlayers(data.players);
    });

    socket.on("player:joined", (data) => {
      setPlayers(data.players);
    });

    socket.on("game:start", (data) => {
      setTotalQuestions(data.totalQuestions);
    });

    socket.on("question:show", (data) => {
      setPhase("question");
      setQuestionNum(data.questionNum);
      setTotalQuestions(data.totalQuestions);
      setQuestionText(data.text);
      setSecondsLeft(data.timeLimit);
      setAnsweredCount(0);
      setArrangingCount(0);
      arrangingPlayersRef.current = new Set();
      setTypingProgress(new Map());

      if (data.type === "ordering") {
        setQuestionType("ordering");
        setOrderingItems(data.items);
      } else if (data.type === "typing_blitz") {
        setQuestionType("typing_blitz");
        setTypingRoster(data.players ?? []);
      } else if (data.type === "true_or_false") {
        setQuestionType("true_or_false");
      } else {
        setQuestionType("multiple_choice");
        setOptions(data.options);
      }
    });

    socket.on("timer:tick", (data) => {
      setSecondsLeft(data.secondsLeft);
    });

    socket.on("answer:count", (data) => {
      setAnsweredCount(data.answered);
    });

    socket.on("ordering:update", (data) => {
      arrangingPlayersRef.current.add(data.playerName);
      setArrangingCount(arrangingPlayersRef.current.size);
    });

    socket.on("typing:progress", (data: { playerId: string; count: number }) => {
      setTypingProgress((prev) => {
        const next = new Map(prev);
        next.set(data.playerId, data.count);
        return next;
      });
    });

    socket.on("question:end", (data) => {
      setPhase("results");

      if (data.type === "ordering") {
        setQuestionType("ordering");
        setOrderingCorrectOrder(data.correctOrder);
        setOrderingResultItems(data.items);
        setOrderingPlayerResults(data.playerResults);
      } else if (data.type === "typing_blitz") {
        setQuestionType("typing_blitz");
        setTypingValidAnswers(data.validAnswers ?? []);
        setTypingPlayerResults(data.playerResults ?? []);
      } else if (data.type === "true_or_false") {
        setQuestionType("true_or_false");
        setTrueOrFalseCorrect(data.correctAnswer);
        setTrueOrFalseExplanation(data.explanation);
        setTrueOrFalseTrueCount(data.trueCount ?? 0);
        setTrueOrFalseFalseCount(data.falseCount ?? 0);
        setTrueOrFalseResults(data.playerResults ?? []);
      } else {
        setQuestionType("multiple_choice");
        setCorrectIndex(data.correctIndex);
        setPlayerResults(data.playerResults);
      }
    });

    socket.on("scores:show", (data) => {
      setPhase("leaderboard");
      setLeaderboard(data.leaderboard);
    });

    socket.on("game:end", (data) => {
      setPhase("final");
      setLeaderboard(data.finalLeaderboard);
    });

    socket.on("game:reset", () => {
      setPhase("lobby");
      setQuestionNum(0);
      setAnsweredCount(0);
      setQuestionType("multiple_choice");
      setTypingProgress(new Map());
      setTypingPlayerResults([]);
      setTypingRoster([]);
      setTrueOrFalseResults([]);
      setTrueOrFalseTrueCount(0);
      setTrueOrFalseFalseCount(0);
      setTrueOrFalseExplanation(undefined);
    });

    return () => {
      socket.off("server:info");
      socket.off("player:joined");
      socket.off("game:start");
      socket.off("question:show");
      socket.off("timer:tick");
      socket.off("answer:count");
      socket.off("ordering:update");
      socket.off("typing:progress");
      socket.off("question:end");
      socket.off("scores:show");
      socket.off("game:end");
      socket.off("game:reset");
    };
  }, []);

  return (
    <div className="bg-mesh h-screen w-screen overflow-hidden text-white">
      {phase === "lobby" && (
        <LobbyScreen serverIp={serverIp} players={players} onStartGame={handleStartGame} />
      )}
      {phase === "question" && questionType === "multiple_choice" && (
        <QuestionScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          text={questionText}
          options={options}
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          totalPlayers={players.length}
        />
      )}
      {phase === "question" && questionType === "ordering" && (
        <OrderingQuestionScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          text={questionText}
          items={orderingItems}
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          totalPlayers={players.length}
          arrangingCount={arrangingCount}
        />
      )}
      {phase === "question" && questionType === "typing_blitz" && (
        <TypingBlitzQuestionScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          text={questionText}
          secondsLeft={secondsLeft}
          players={typingRoster}
          typingProgress={typingProgress}
        />
      )}
      {phase === "question" && questionType === "true_or_false" && (
        <TrueOrFalseQuestionScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          text={questionText}
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          totalPlayers={players.length}
        />
      )}
      {phase === "results" && questionType === "multiple_choice" && (
        <ResultsScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          questionText={questionText}
          options={options}
          correctIndex={correctIndex}
          playerResults={playerResults}
        />
      )}
      {phase === "results" && questionType === "ordering" && (
        <OrderingResultsScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          questionText={questionText}
          correctOrder={orderingCorrectOrder}
          items={orderingResultItems}
          playerResults={orderingPlayerResults}
        />
      )}
      {phase === "results" && questionType === "typing_blitz" && (
        <TypingBlitzResultsScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          questionText={questionText}
          validAnswers={typingValidAnswers}
          playerResults={typingPlayerResults}
        />
      )}
      {phase === "results" && questionType === "true_or_false" && (
        <TrueOrFalseResultsScreen
          questionNum={questionNum}
          totalQuestions={totalQuestions}
          questionText={questionText}
          correctAnswer={trueOrFalseCorrect}
          explanation={trueOrFalseExplanation}
          trueCount={trueOrFalseTrueCount}
          falseCount={trueOrFalseFalseCount}
          playerResults={trueOrFalseResults}
        />
      )}
      {phase === "leaderboard" && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          questionNum={questionNum}
          totalQuestions={totalQuestions}
        />
      )}
      {phase === "final" && (
        <FinalScreen leaderboard={leaderboard} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}
