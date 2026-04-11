"use client";

interface ResultFeedbackProps {
  correct: boolean;
  points: number;
  totalScore: number;
}

export default function ResultFeedback({ correct, points, totalScore }: ResultFeedbackProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-6">
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-full text-6xl ${
          correct
            ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30"
            : "bg-red-500/20 text-red-400 ring-2 ring-red-500/30"
        }`}
      >
        {correct ? "\u2713" : "\u2717"}
      </div>
      <h2
        className={`text-4xl font-bold ${
          correct ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {correct ? "Correct!" : "Wrong!"}
      </h2>
      {correct && (
        <p className="text-3xl font-semibold text-emerald-300/80">+{points}</p>
      )}
      <p className="font-mono text-xl text-white/30">
        {totalScore.toLocaleString()} pts total
      </p>
    </div>
  );
}
