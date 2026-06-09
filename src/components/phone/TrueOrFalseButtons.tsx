"use client";

interface TrueOrFalseButtonsProps {
  statement: string;
  secondsLeft: number;
  selection: boolean | undefined;
  onSelect: (selection: boolean) => void;
}

export default function TrueOrFalseButtons({
  statement,
  secondsLeft,
  selection,
  onSelect,
}: TrueOrFalseButtonsProps) {
  const timerDanger = secondsLeft <= 5;
  const locked = secondsLeft <= 0;

  const renderButton = (value: boolean, label: string, glyph: string) => {
    const isSelected = selection === value;
    const isTrue = value === true;
    const base = isTrue
      ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30"
      : "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30";
    const activePress = isTrue
      ? "active:from-emerald-600 active:to-emerald-800"
      : "active:from-red-600 active:to-red-800";

    let stateClass: string;
    if (locked) {
      stateClass = isSelected
        ? "ring-4 ring-white/70 scale-[0.97]"
        : "opacity-20 scale-95";
    } else if (isSelected) {
      stateClass = `ring-4 ring-white/70 scale-[0.97] ${activePress}`;
    } else {
      stateClass = `${activePress} hover:scale-[1.02]`;
    }

    return (
      <button
        onClick={() => onSelect(value)}
        disabled={locked}
        className={`flex flex-col items-center justify-center rounded-3xl text-white shadow-lg transition-all duration-200 ${base} ${stateClass}`}
      >
        <span className="text-6xl leading-none">{glyph}</span>
        <span className="mt-3 text-2xl font-bold tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen flex-col p-3 pb-4">
      {/* Timer */}
      <div className="flex items-center justify-center py-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold transition-all ${
            timerDanger
              ? "timer-danger bg-red-500/25 text-red-400"
              : "glass text-white/80"
          }`}
        >
          {secondsLeft}
        </div>
      </div>

      {/* Statement */}
      <div className="glass-strong mx-3 mb-3 rounded-3xl px-6 py-5 text-center text-xl font-semibold text-white/90">
        {statement}
      </div>

      {/* Info pill */}
      <div className="mb-3 flex justify-center">
        <div className="glass rounded-full px-4 py-1.5 text-sm text-white/50">
          Select True or False before time runs out!
        </div>
      </div>

      {/* TRUE / FALSE buttons */}
      <div className="grid flex-1 grid-cols-2 gap-3">
        {renderButton(true, "TRUE", "\u2713")}
        {renderButton(false, "FALSE", "\u2717")}
      </div>
    </div>
  );
}
