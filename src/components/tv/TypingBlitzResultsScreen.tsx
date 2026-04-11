"use client";

interface TypingBlitzResultEntry {
  word: string;
  correct: boolean;
}

interface TypingBlitzPlayerResult {
  id: string;
  name: string;
  submissions: string[];
  results: TypingBlitzResultEntry[];
  correctCount: number;
  totalSubmitted: number;
  points: number;
  totalScore: number;
}

interface TypingBlitzResultsScreenProps {
  questionNum: number;
  totalQuestions: number;
  questionText: string;
  validAnswers: string[];
  playerResults: TypingBlitzPlayerResult[];
}

export default function TypingBlitzResultsScreen({
  questionNum,
  totalQuestions,
  questionText,
  validAnswers,
  playerResults,
}: TypingBlitzResultsScreenProps) {
  const columns =
    playerResults.length <= 2
      ? "grid-cols-1 md:grid-cols-2"
      : playerResults.length <= 4
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 p-10">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div className="glass rounded-full px-6 py-2.5">
          <span className="text-xl font-medium text-white/70">
            Question <span className="text-white">{questionNum + 1}</span> of {totalQuestions}
          </span>
        </div>
        <div className="glass rounded-full px-6 py-2.5">
          <span className="text-xl font-medium text-white/70">
            <span className="text-white">{validAnswers.length}</span> accepted answers
          </span>
        </div>
      </div>

      {/* Question */}
      <h2 className="max-w-5xl text-center text-4xl font-bold text-white/90">
        {questionText}
      </h2>

      {/* Player panels */}
      <div className={`grid w-full max-w-[1400px] flex-1 gap-4 overflow-y-auto ${columns}`}>
        {playerResults.map((p) => {
          const perfect = p.totalSubmitted > 0 && p.correctCount === p.totalSubmitted;
          const none = p.correctCount === 0;

          let headerClass = "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
          if (perfect) {
            headerClass = "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30";
          } else if (none) {
            headerClass = "glass text-white/40";
          }

          return (
            <div
              key={p.id}
              className="glass-strong flex flex-col gap-3 rounded-2xl p-4"
            >
              <div
                className={`flex items-center justify-between rounded-xl px-4 py-2 ${headerClass}`}
              >
                <span className="text-xl font-semibold">{p.name}</span>
                <span className="text-lg font-medium">
                  {p.correctCount}/{p.totalSubmitted || 0} &middot;{" "}
                  {p.points > 0 ? `+${p.points}` : "0"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.results.length === 0 ? (
                  <p className="text-sm italic text-white/30">no submissions</p>
                ) : (
                  p.results.map((r, i) => (
                    <span
                      key={`${r.word}-${i}`}
                      className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                        r.correct
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                          : "bg-red-500/15 text-red-300/80 ring-1 ring-red-500/20 line-through"
                      }`}
                    >
                      {r.word}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
