"use client";

const OPTION_STYLES = [
  { bg: "from-[#ff6b8a] to-[#e0445f]" },
  { bg: "from-[#5b8def] to-[#3a5fd0]" },
  { bg: "from-[#ffb830] to-[#e09500]" },
  { bg: "from-[#45d483] to-[#28a85e]" },
];

interface PlayerResult {
  id: string;
  name: string;
  optionIndex: number;
  correct: boolean;
  points: number;
  totalScore: number;
}

interface ResultsScreenProps {
  questionNum: number;
  totalQuestions: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  playerResults: PlayerResult[];
}

export default function ResultsScreen({
  questionNum,
  totalQuestions,
  questionText,
  options,
  correctIndex,
  playerResults,
}: ResultsScreenProps) {
  const correctCount = playerResults.filter((p) => p.correct).length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-12">
      <div className="glass rounded-full px-6 py-2.5">
        <span className="text-xl font-medium text-white/70">
          Question <span className="text-white">{questionNum + 1}</span> of {totalQuestions}
        </span>
      </div>

      <h2 className="max-w-4xl text-center text-4xl font-bold text-white/90">{questionText}</h2>

      {/* Options with correct highlighted */}
      <div className="grid w-full max-w-5xl grid-cols-2 gap-5">
        {options.map((option, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 rounded-2xl px-8 py-6 text-3xl font-semibold transition-all ${
              i === correctIndex
                ? `bg-gradient-to-r ${OPTION_STYLES[i].bg} text-white shadow-lg ring-4 ring-white/50`
                : "glass text-white/25"
            }`}
          >
            {option}
            {i === correctIndex && (
              <span className="ml-auto text-4xl drop-shadow-lg">&#10003;</span>
            )}
          </div>
        ))}
      </div>

      {/* Player results */}
      <div className="flex flex-wrap justify-center gap-3">
        {playerResults.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col items-center rounded-2xl px-7 py-3.5 ${
              p.correct
                ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                : "glass text-white/40"
            }`}
          >
            <span className="text-xl font-semibold">{p.name}</span>
            <span className="text-lg font-medium">
              {p.correct ? `+${p.points}` : "Wrong"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-2xl font-medium text-white/40">
        <span className="text-white/70">{correctCount}</span>/{playerResults.length} got it right
      </p>
    </div>
  );
}
