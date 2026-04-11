"use client";

interface TypingBlitzResultFeedbackProps {
  correctCount: number;
  totalSubmitted: number;
  points: number;
  totalScore: number;
}

export default function TypingBlitzResultFeedback({
  correctCount,
  totalSubmitted,
  points,
  totalScore,
}: TypingBlitzResultFeedbackProps) {
  const noneSubmitted = totalSubmitted === 0;
  const perfect = !noneSubmitted && correctCount === totalSubmitted;
  const none = correctCount === 0;

  let ringColor = "ring-amber-500/30";
  let bgColor = "bg-amber-500/20";
  let textColor = "text-amber-400";
  let headingColor = "text-amber-400";
  let heading = `${correctCount} of ${totalSubmitted} Correct`;

  if (noneSubmitted) {
    ringColor = "ring-red-500/30";
    bgColor = "bg-red-500/20";
    textColor = "text-red-400";
    headingColor = "text-red-400";
    heading = "No Answers";
  } else if (perfect) {
    ringColor = "ring-emerald-500/30";
    bgColor = "bg-emerald-500/20";
    textColor = "text-emerald-400";
    headingColor = "text-emerald-400";
    heading = "Perfect!";
  } else if (none) {
    ringColor = "ring-red-500/30";
    bgColor = "bg-red-500/20";
    textColor = "text-red-400";
    headingColor = "text-red-400";
    heading = "None Correct";
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-6">
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-full ring-2 ${ringColor} ${bgColor}`}
      >
        <span className={`text-4xl font-bold ${textColor}`}>
          {correctCount}
          {totalSubmitted > 0 && <span className="text-2xl">/{totalSubmitted}</span>}
        </span>
      </div>
      <h2 className={`text-4xl font-bold ${headingColor}`}>{heading}</h2>
      {points > 0 && (
        <p className="text-3xl font-semibold text-emerald-300/80">+{points}</p>
      )}
      <p className="font-mono text-xl text-white/30">
        {totalScore.toLocaleString()} pts total
      </p>
    </div>
  );
}
