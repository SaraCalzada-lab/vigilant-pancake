"use client";

interface TypingBlitzPlayer {
  id: string;
  name: string;
}

interface TypingBlitzQuestionScreenProps {
  questionNum: number;
  totalQuestions: number;
  text: string;
  secondsLeft: number;
  players: TypingBlitzPlayer[];
  typingProgress: Map<string, number>;
}

export default function TypingBlitzQuestionScreen({
  questionNum,
  totalQuestions,
  text,
  secondsLeft,
  players,
  typingProgress,
}: TypingBlitzQuestionScreenProps) {
  const timerDanger = secondsLeft <= 5;

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-12">
      {/* Top bar */}
      <div className="flex w-full items-center justify-between">
        <div className="glass rounded-full px-6 py-2.5">
          <span className="text-xl font-medium text-white/70">
            Question <span className="text-white">{questionNum + 1}</span> of {totalQuestions}
          </span>
        </div>
        <div className="glass rounded-full px-6 py-2.5">
          <span className="text-xl font-medium text-white/70">Typing Blitz</span>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full text-6xl font-bold ${
          timerDanger
            ? "timer-danger bg-red-500/30 text-red-400"
            : "glass text-white"
        }`}
      >
        {secondsLeft}
      </div>

      {/* Question */}
      <h2 className="max-w-5xl text-center text-5xl font-bold leading-snug text-white drop-shadow-lg">
        {text}
      </h2>

      {/* Info pill */}
      <div className="glass rounded-full px-6 py-2">
        <span className="text-lg font-medium text-white/60">
          Type as fast as you can &mdash; answers stay hidden until time is up
        </span>
      </div>

      {/* Per-player live counts */}
      <div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-4">
        {players.length === 0 ? (
          <p className="text-xl text-white/30">Waiting for players&hellip;</p>
        ) : (
          players.map((p) => {
            const count = typingProgress.get(p.id) ?? 0;
            return (
              <div
                key={p.id}
                className="glass-strong flex min-w-[160px] flex-col items-center gap-1 rounded-2xl px-6 py-4"
              >
                <span className="text-lg font-semibold text-white/80">{p.name}</span>
                <span className="font-mono text-4xl font-bold text-white">
                  {count}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
