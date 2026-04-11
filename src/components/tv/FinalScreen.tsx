"use client";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
}

interface FinalScreenProps {
  leaderboard: LeaderboardEntry[];
  onPlayAgain: () => void;
}

export default function FinalScreen({ leaderboard, onPlayAgain }: FinalScreenProps) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = ["h-40", "h-56", "h-32"];
  const podiumGradients = [
    "from-slate-400/40 to-slate-500/20",
    "from-yellow-400/40 to-amber-500/20",
    "from-amber-700/40 to-orange-800/20",
  ];
  const podiumRings = [
    "ring-slate-400/30",
    "ring-yellow-400/40",
    "ring-amber-700/30",
  ];
  const podiumLabels = ["2nd", "1st", "3rd"];
  const nameColors = ["text-slate-200", "text-yellow-200", "text-amber-300"];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 p-12">
      <h2 className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 bg-clip-text text-7xl font-bold text-transparent">
        Final Results
      </h2>

      {/* Podium */}
      <div className="flex items-end gap-6">
        {podiumOrder.map((entry, i) => (
          <div key={entry?.id ?? i} className="flex flex-col items-center gap-3">
            <span className={`text-2xl font-bold ${nameColors[i]}`}>
              {entry?.name ?? "-"}
            </span>
            <span className="text-lg font-medium text-white/50">
              {entry?.score.toLocaleString() ?? 0}
            </span>
            <div
              className={`${podiumHeights[i]} flex w-40 items-center justify-center rounded-t-2xl bg-gradient-to-t ${podiumGradients[i]} ring-1 ${podiumRings[i]} text-3xl font-bold text-white/80`}
            >
              {podiumLabels[i]}
            </div>
          </div>
        ))}
      </div>

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="flex w-full max-w-xl flex-col gap-2">
          {rest.map((entry, i) => (
            <div
              key={entry.id}
              className="glass flex items-center justify-between rounded-xl px-6 py-3.5 text-xl"
            >
              <div className="flex items-center gap-4">
                <span className="text-white/30">{i + 4}.</span>
                <span className="text-white/70">{entry.name}</span>
              </div>
              <span className="font-mono text-white/50">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-12 py-5 text-2xl font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40"
      >
        Play Again
      </button>
    </div>
  );
}
