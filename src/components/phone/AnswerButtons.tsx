"use client";

const OPTION_STYLES = [
  {
    bg: "bg-gradient-to-br from-[#ff6b8a] to-[#d4365a]",
    active: "active:from-[#e0445f] active:to-[#b82e4d]",
    shadow: "shadow-[#ff6b8a]/20",
    label: "A",
  },
  {
    bg: "bg-gradient-to-br from-[#5b8def] to-[#3355c0]",
    active: "active:from-[#4070d0] active:to-[#2a45a0]",
    shadow: "shadow-[#5b8def]/20",
    label: "B",
  },
  {
    bg: "bg-gradient-to-br from-[#ffb830] to-[#d08800]",
    active: "active:from-[#e0a020] active:to-[#b07500]",
    shadow: "shadow-[#ffb830]/20",
    label: "C",
  },
  {
    bg: "bg-gradient-to-br from-[#45d483] to-[#20a555]",
    active: "active:from-[#35b570] active:to-[#189048]",
    shadow: "shadow-[#45d483]/20",
    label: "D",
  },
];

interface AnswerButtonsProps {
  options: string[];
  secondsLeft: number;
  onAnswer: (optionIndex: number) => void;
  disabled: boolean;
  selectedIndex?: number;
}

export default function AnswerButtons({
  options,
  secondsLeft,
  onAnswer,
  disabled,
  selectedIndex,
}: AnswerButtonsProps) {
  const timerDanger = secondsLeft <= 5;

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

      {/* Answer buttons - 2x2 grid */}
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {options.map((option, i) => {
          const style = OPTION_STYLES[i];
          const isSelected = selectedIndex === i;

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center rounded-3xl text-xl font-bold text-white shadow-lg transition-all duration-200 ${style.bg} ${style.shadow} ${
                disabled
                  ? isSelected
                    ? "ring-3 ring-white/70 scale-[0.97]"
                    : "opacity-20 scale-95"
                  : `${style.active} hover:scale-[1.02]`
              }`}
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-black/20 text-base font-bold">
                {style.label}
              </span>
              <span className="px-3 text-center text-lg leading-tight">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
