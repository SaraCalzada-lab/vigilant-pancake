"use client";

import { useEffect, useRef, useState } from "react";

interface TypingBlitzInputProps {
  questionText: string;
  secondsLeft: number;
  chips: string[];
  onSubmit: (word: string) => void;
  disabled: boolean;
}

export default function TypingBlitzInput({
  questionText,
  secondsLeft,
  chips,
  onSubmit,
  disabled,
}: TypingBlitzInputProps) {
  const timerDanger = secondsLeft <= 5;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const locked = disabled || secondsLeft <= 0;

  // Auto-focus on mount so the mobile keyboard opens immediately
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

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

      {/* Question */}
      <div className="glass-strong mb-3 rounded-2xl px-5 py-4">
        <p className="text-center text-lg font-semibold leading-snug text-white">
          {questionText}
        </p>
      </div>

      {/* Info pill */}
      <div className="mb-3 flex justify-center">
        <div className="glass rounded-full px-4 py-1.5 text-center text-sm text-white/50">
          Type answers and press Enter to submit each one
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={locked ? "Time's up" : "Type an answer\u2026"}
        disabled={locked}
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        className={`glass rounded-2xl px-6 py-5 text-center text-2xl font-semibold text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition-all focus:ring-violet-500/50 ${
          locked ? "opacity-40" : ""
        }`}
      />

      {/* Chip list */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {chips.length === 0 ? (
          <p className="mt-4 text-center text-sm text-white/25">
            Your answers will appear here
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((chip) => (
              <div
                key={chip}
                className="glass rounded-full px-3 py-1 text-sm text-white/70"
              >
                {chip}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      <p className="mt-2 text-center font-mono text-sm text-white/30">
        {chips.length} submitted
      </p>
    </div>
  );
}
