"use client";

interface TrueOrFalseQuestionScreenProps {
  questionNum: number;
  totalQuestions: number;
  text: string;
  secondsLeft: number;
  answeredCount: number;
  totalPlayers: number;
}

export default function TrueOrFalseQuestionScreen({
  questionNum,
  totalQuestions,
  text,
  secondsLeft,
  answeredCount,
  totalPlayers,
}: TrueOrFalseQuestionScreenProps) {
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
          <span className="text-xl font-medium text-white/70">
            <span className="text-white">{answeredCount}</span>/{totalPlayers} answered
          </span>
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

      {/* Statement */}
      <h2 className="max-w-5xl text-center text-5xl font-bold leading-snug text-white drop-shadow-lg">
        {text}
      </h2>

      {/* Decorative TRUE / FALSE chips */}
      <div className="flex gap-8">
        <div className="flex items-center gap-3 rounded-full bg-emerald-500/15 px-8 py-3 text-2xl font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
          <span className="text-3xl">&#10003;</span> TRUE
        </div>
        <div className="flex items-center gap-3 rounded-full bg-red-500/15 px-8 py-3 text-2xl font-semibold text-red-300 ring-1 ring-red-500/30">
          <span className="text-3xl">&#10007;</span> FALSE
        </div>
      </div>
    </div>
  );
}
