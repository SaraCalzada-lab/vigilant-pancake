"use client";

interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
}

interface OrderingQuestionScreenProps {
  questionNum: number;
  totalQuestions: number;
  text: string;
  items: OrderingItem[];
  secondsLeft: number;
  answeredCount: number;
  totalPlayers: number;
  arrangingCount: number;
}

export default function OrderingQuestionScreen({
  questionNum,
  totalQuestions,
  text,
  items,
  secondsLeft,
  answeredCount,
  totalPlayers,
  arrangingCount,
}: OrderingQuestionScreenProps) {
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
            <span className="text-white">{answeredCount}</span>/{totalPlayers} locked in
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

      {/* Question */}
      <h2 className="max-w-5xl text-center text-5xl font-bold leading-snug text-white drop-shadow-lg">
        {text}
      </h2>

      {/* Image cards in a horizontal row */}
      <div className="flex w-full max-w-5xl items-center justify-center gap-5">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="glass-strong flex flex-col items-center gap-3 rounded-2xl p-4"
            style={{ width: 180, height: 180 }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white/60">
              {i + 1}
            </span>
            <img
              src={item.imageUrl}
              alt={item.label}
              className="h-24 w-24 rounded-xl object-cover"
            />
            <span className="text-center text-sm font-semibold text-white/80">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Activity indicator */}
      <p className="text-xl font-medium text-white/40">
        {arrangingCount > 0
          ? `${arrangingCount} player${arrangingCount !== 1 ? "s" : ""} arranging...`
          : "Waiting for players..."}
      </p>
    </div>
  );
}
