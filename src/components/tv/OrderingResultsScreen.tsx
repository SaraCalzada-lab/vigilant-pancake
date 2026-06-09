"use client";

interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
}

interface OrderingPlayerResult {
  id: string;
  name: string;
  correctCount: number;
  totalItems: number;
  points: number;
  totalScore: number;
}

interface OrderingResultsScreenProps {
  questionNum: number;
  totalQuestions: number;
  questionText: string;
  correctOrder: string[];
  items: OrderingItem[];
  playerResults: OrderingPlayerResult[];
}

export default function OrderingResultsScreen({
  questionNum,
  totalQuestions,
  questionText,
  correctOrder,
  items,
  playerResults,
}: OrderingResultsScreenProps) {
  const itemsMap = new Map(items.map((item) => [item.id, item]));
  const orderedCorrectItems = correctOrder.map((id) => itemsMap.get(id)!).filter(Boolean);
  const allCorrectCount = playerResults.filter((p) => p.correctCount === p.totalItems).length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-12">
      <div className="glass rounded-full px-6 py-2.5">
        <span className="text-xl font-medium text-white/70">
          Question <span className="text-white">{questionNum + 1}</span> of {totalQuestions}
        </span>
      </div>

      <h2 className="max-w-4xl text-center text-4xl font-bold text-white/90">{questionText}</h2>

      {/* Correct order - numbered image cards */}
      <div className="flex w-full max-w-5xl items-center justify-center gap-5">
        {orderedCorrectItems.map((item, i) => (
          <div
            key={item.id}
            className="flex h-[170px] w-[160px] flex-col items-center gap-2 rounded-2xl bg-emerald-500/15 p-4 ring-2 ring-emerald-500/30"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300">
              {i + 1}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.label}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <span className="text-center text-sm font-semibold text-emerald-200">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Player results */}
      <div className="flex flex-wrap justify-center gap-3">
        {playerResults.map((p) => {
          const perfect = p.correctCount === p.totalItems;
          const none = p.correctCount === 0;

          let cardClass = "glass text-white/40";
          if (perfect) {
            cardClass = "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30";
          } else if (!none) {
            cardClass = "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
          }

          return (
            <div key={p.id} className={`flex flex-col items-center rounded-2xl px-7 py-3.5 ${cardClass}`}>
              <span className="text-xl font-semibold">{p.name}</span>
              <span className="text-lg font-medium">
                {p.correctCount}/{p.totalItems} correct {p.points > 0 ? `+${p.points}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-2xl font-medium text-white/40">
        <span className="text-white/70">{allCorrectCount}</span>/{playerResults.length} got all correct
      </p>
    </div>
  );
}
