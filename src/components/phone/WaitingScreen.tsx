"use client";

interface WaitingScreenProps {
  playerName: string;
  score?: number;
  message?: string;
}

export default function WaitingScreen({ playerName, score, message }: WaitingScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="glass-strong rounded-2xl px-8 py-3">
        <h2 className="text-3xl font-bold text-white">{playerName}</h2>
      </div>
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-5xl">
        &#128250;
      </div>
      <p className="text-2xl font-medium text-white/50">{message || "Look at the TV!"}</p>
      {score !== undefined && score > 0 && (
        <p className="font-mono text-xl text-white/30">{score.toLocaleString()} pts</p>
      )}
    </div>
  );
}
