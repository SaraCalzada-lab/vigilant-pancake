import type { Question } from "./questions";

export type QuestionMode = "multiple_choice" | "ordering" | "typing_blitz" | "true_or_false";

export interface GameConfig {
  questionCount: number;
  modes: QuestionMode[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  answers: PlayerAnswer[];
}

export interface TypingBlitzResult {
  word: string;
  correct: boolean;
}

export interface PlayerAnswer {
  questionNum: number;
  optionIndex: number;
  timeMs: number;
  correct: boolean;
  points: number;
  // Ordering-specific
  orderedItemIds?: string[];
  correctCount?: number;
  // Typing Blitz-specific
  typingSubmissions?: string[];
  typingResults?: TypingBlitzResult[];
  typingCorrectCount?: number;
  // True or False-specific
  trueFalseSelection?: boolean; // undefined = no answer
}

export type PhaseType = "lobby" | "question" | "results" | "leaderboard" | "final";

export interface GamePhase {
  type: PhaseType;
  questionNum?: number;
}

export interface GameState {
  phase: GamePhase;
  players: Map<string, Player>;
  tvSocketId: string | null;
  currentQuestion: number;
  questionStartTime: number;
  answersThisRound: Map<string, PlayerAnswer>;
  timerInterval: ReturnType<typeof setInterval> | null;
  // Ordering-specific
  currentShuffledOrder?: string[];
  currentCorrectOrder?: string[];
  // Typing Blitz-specific — in-progress submissions keyed by socketId
  typingSubmissionsThisRound: Map<string, string[]>;
  // True or False-specific — in-progress selections keyed by socketId
  trueFalseSelectionsThisRound: Map<string, boolean>;
  // Session config
  sessionQuestions: Question[];
}

export function createInitialGameState(): GameState {
  return {
    phase: { type: "lobby" },
    players: new Map(),
    tvSocketId: null,
    currentQuestion: -1,
    questionStartTime: 0,
    answersThisRound: new Map(),
    timerInterval: null,
    typingSubmissionsThisRound: new Map(),
    trueFalseSelectionsThisRound: new Map(),
    sessionQuestions: [],
  };
}

export function calculateScore(responseTimeMs: number, timeLimitMs: number, correct: boolean): number {
  if (!correct) return 0;
  const timeFraction = Math.min(responseTimeMs / timeLimitMs, 1);
  return Math.round(1000 * (1 - timeFraction * 0.5));
}

export function calculateOrderingScore(
  orderedIds: string[],
  correctOrder: string[],
  timeMs: number,
  timeLimitMs: number
): { points: number; correctCount: number } {
  let correctCount = 0;
  for (let i = 0; i < orderedIds.length; i++) {
    if (orderedIds[i] === correctOrder[i]) {
      correctCount++;
    }
  }

  if (correctCount === 0) return { points: 0, correctCount: 0 };

  const timeFraction = Math.min(timeMs / timeLimitMs, 1);
  const timeFactor = 1 - timeFraction * 0.5;
  let points = Math.round(200 * correctCount * timeFactor);

  // Perfect bonus
  if (correctCount === correctOrder.length) {
    points += 500;
  }

  return { points, correctCount };
}

/** Trim + lowercase a typed answer. Returns null for empty/whitespace-only input. */
export function normalizeTypingAnswer(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function calculateTypingScore(
  submissions: string[],
  validAnswers: string[],
  pointsPerAnswer: number
): { points: number; correctCount: number; results: TypingBlitzResult[] } {
  const validSet = new Set(
    validAnswers.map((a) => a.trim().toLowerCase()).filter((a) => a.length > 0)
  );

  const results: TypingBlitzResult[] = submissions.map((word) => ({
    word,
    correct: validSet.has(word),
  }));

  const correctCount = results.reduce((n, r) => (r.correct ? n + 1 : n), 0);
  const points = correctCount * pointsPerAnswer;

  return { points, correctCount, results };
}

export function calculateTrueOrFalseScore(
  selection: boolean | undefined,
  correctAnswer: boolean,
  pointsCorrect: number
): { points: number; correct: boolean } {
  if (selection === undefined) return { points: 0, correct: false };
  const correct = selection === correctAnswer;
  return { points: correct ? pointsCorrect : 0, correct };
}

export function getLeaderboard(players: Map<string, Player>) {
  return Array.from(players.values())
    .map((p) => ({ id: p.id, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}
