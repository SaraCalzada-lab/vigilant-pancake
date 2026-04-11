"use client";

const OPTION_STYLES = [
  { bg: "from-[#ff6b8a] to-[#e0445f]", label: "A" },
  { bg: "from-[#5b8def] to-[#3a5fd0]", label: "B" },
  { bg: "from-[#ffb830] to-[#e09500]", label: "C" },
  { bg: "from-[#45d483] to-[#28a85e]", label: "D" },
];

interface QuestionScreenProps {
  questionNum: number;
  totalQuestions: number;
  text: string;
  options: string[];
  secondsLeft: number;
  answeredCount: number;
  totalPlayers: number;
}

export default function QuestionScreen({
  questionNum,
  totalQuestions,
  text,
  options,
  secondsLeft,
  answeredCount,
  totalPlayers,
}: QuestionScreenProps) {
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

      {/* Question */}
      <h2 className="max-w-5xl text-center text-5xl font-bold leading-snug text-white drop-shadow-lg">
        {text}
      </h2>

      {/* Options */}
      <div className="grid w-full max-w-5xl grid-cols-2 gap-5">
        {options.map((option, i) => (
          <div
            key={i}
            className={`flex items-center gap-5 rounded-2xl bg-gradient-to-r ${OPTION_STYLES[i].bg} px-8 py-7 text-3xl font-semibold text-white shadow-lg`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 text-2xl font-bold">
              {OPTION_STYLES[i].label}
            </span>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}
