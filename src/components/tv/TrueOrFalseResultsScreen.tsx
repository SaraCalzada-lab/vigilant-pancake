"use client";

interface TrueOrFalsePlayerResult {
  id: string;
  name: string;
  selection: boolean | undefined;
  correct: boolean;
  points: number;
  totalScore: number;
}

interface TrueOrFalseResultsScreenProps {
  questionNum: number;
  totalQuestions: number;
  questionText: string;
  correctAnswer: boolean;
  explanation?: string;
  trueCount: number;
  falseCount: number;
  playerResults: TrueOrFalsePlayerResult[];
}

export default function TrueOrFalseResultsScreen({
  questionNum,
  totalQuestions,
  questionText,
  correctAnswer,
  explanation,
  trueCount,
  falseCount,
  playerResults,
}: TrueOrFalseResultsScreenProps) {
  const correctCount = playerResults.filter((p) => p.correct).length;
  const totalVotes = trueCount + falseCount;

  const renderAnswerCard = (value: boolean, label: string, glyph: string, count: number) => {
    const isCorrect = value === correctAnswer;
    const base = isCorrect
      ? value
        ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg ring-4 ring-white/50"
        : "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg ring-4 ring-white/50"
      : "glass text-white/25";

    return (
      <div
        className={`flex flex-1 items-center justify-between gap-6 rounded-2xl px-10 py-7 text-3xl font-bold transition-all ${base}`}
      >
        <div className="flex items-center gap-5">
          <span className="text-5xl">{glyph}</span>
          <span className="tracking-wide">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-4xl">{count}</span>
          {isCorrect && <span className="text-4xl drop-shadow-lg">&#10003;</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-12">
      {/* Top bar */}
      <div className="glass rounded-full px-6 py-2.5">
        <span className="text-xl font-medium text-white/70">
          Question <span className="text-white">{questionNum + 1}</span> of {totalQuestions}
        </span>
      </div>

      {/* Statement */}
      <h2 className="max-w-4xl text-center text-4xl font-bold text-white/90">
        {questionText}
      </h2>

      {/* Dual TRUE / FALSE cards */}
      <div className="flex w-full max-w-5xl gap-6">
        {renderAnswerCard(true, "TRUE", "\u2713", trueCount)}
        {renderAnswerCard(false, "FALSE", "\u2717", falseCount)}
      </div>

      {/* Split bar */}
      <div className="flex h-3 w-full max-w-2xl overflow-hidden rounded-full">
        {totalVotes === 0 ? (
          <div className="glass h-full w-full" />
        ) : (
          <>
            <div
              className="h-full bg-emerald-500"
              style={{ flexGrow: trueCount }}
            />
            <div
              className="h-full bg-red-500"
              style={{ flexGrow: falseCount }}
            />
          </>
        )}
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="glass max-w-3xl rounded-2xl px-8 py-4">
          <p className="text-center text-xl italic text-white/60">{explanation}</p>
        </div>
      )}

      {/* Player result chips */}
      <div className="flex flex-wrap justify-center gap-3">
        {playerResults.map((p) => {
          const chipClass = p.correct
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
            : "glass text-white/40";
          const label =
            p.selection === undefined
              ? "No answer"
              : p.correct
              ? `+${p.points}`
              : "Wrong";
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center rounded-2xl px-7 py-3.5 ${chipClass}`}
            >
              <span className="text-xl font-semibold">{p.name}</span>
              <span className="text-lg font-medium">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <p className="text-2xl font-medium text-white/40">
        <span className="text-white/70">{correctCount}</span>/{playerResults.length} got it right
      </p>
    </div>
  );
}
