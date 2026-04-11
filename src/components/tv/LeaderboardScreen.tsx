"use client";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
}

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  questionNum: number;
  totalQuestions: number;
}

const RANK_STYLES = [
  "from-yellow-400/30 to-amber-500/20 ring-yellow-400/30 text-yellow-200",
  "from-slate-300/20 to-gray-400/15 ring-slate-400/25 text-slate-200",
  "from-amber-600/20 to-orange-700/15 ring-amber-600/25 text-amber-200",
];

export default function LeaderboardScreen({
  leaderboard,
  questionNum,
  totalQuestions,
}: LeaderboardScreenProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-12">
      <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-5xl font-bold text-transparent">
        Leaderboard
      </h2>
      <p className="text-xl font-medium text-white/40">
        After question {questionNum + 1} of {totalQuestions}
      </p>

      <div className="flex w-full max-w-2xl flex-col gap-3">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between rounded-2xl px-8 py-5 text-2xl font-semibold ring-1 ${
              i < 3
                ? `bg-gradient-to-r ${RANK_STYLES[i]}`
                : "glass text-white/60"
            }`}
          >
            <div className="flex items-center gap-5">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold ${
                  i < 3 ? "bg-white/15" : "bg-white/5 text-white/40"
                }`}
              >
                {i + 1}
              </span>
              <span>{entry.name}</span>
            </div>
            <span className="font-mono">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
