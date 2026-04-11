"use client";

import { useEffect } from "react";
import type { GameConfig, QuestionMode } from "@/lib/game-state";
import { getAvailableCounts } from "@/lib/questions";

interface AdminConfigProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  onClose: () => void;
}

export default function AdminConfig({ config, onChange, onClose }: AdminConfigProps) {
  const { modes, questionCount } = config;
  const { max } = getAvailableCounts(modes);

  // Clamp question count when modes change
  useEffect(() => {
    if (questionCount > max) {
      onChange({ ...config, questionCount: max });
    }
  }, [max, questionCount, config, onChange]);

  function toggleMode(mode: QuestionMode) {
    if (modes.includes(mode)) {
      if (modes.length === 1) return;
      onChange({ ...config, modes: modes.filter((m) => m !== mode) });
    } else {
      onChange({ ...config, modes: [...modes, mode] });
    }
  }

  function setCount(count: number) {
    onChange({ ...config, questionCount: Math.max(1, Math.min(max, count)) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong flex w-[420px] flex-col gap-8 rounded-3xl p-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            Game Settings
          </h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-white/40 transition-all hover:bg-white/10 hover:text-white"
          >
            &times;
          </button>
        </div>

        {/* Game Modes */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-wider text-white/40">Modes</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleMode("multiple_choice")}
              className={`flex-1 rounded-2xl px-5 py-3 text-base font-semibold transition-all ${
                modes.includes("multiple_choice")
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                  : "glass text-white/40 hover:text-white/60"
              }`}
            >
              Multiple Choice
            </button>
            <button
              onClick={() => toggleMode("ordering")}
              className={`flex-1 rounded-2xl px-5 py-3 text-base font-semibold transition-all ${
                modes.includes("ordering")
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                  : "glass text-white/40 hover:text-white/60"
              }`}
            >
              Ordering
            </button>
            <button
              onClick={() => toggleMode("typing_blitz")}
              className={`flex-1 rounded-2xl px-5 py-3 text-base font-semibold transition-all ${
                modes.includes("typing_blitz")
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                  : "glass text-white/40 hover:text-white/60"
              }`}
            >
              Typing Blitz
            </button>
          </div>
        </div>

        {/* Question Count */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-wider text-white/40">Questions</p>
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setCount(questionCount - 1)}
              disabled={questionCount <= 1}
              className="glass flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-white/70 transition-all hover:text-white disabled:opacity-20"
            >
              -
            </button>
            <span className="min-w-[120px] text-center text-3xl font-bold text-white">
              {questionCount} <span className="text-lg font-normal text-white/40">/ {max}</span>
            </span>
            <button
              onClick={() => setCount(questionCount + 1)}
              disabled={questionCount >= max}
              className="glass flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-white/70 transition-all hover:text-white disabled:opacity-20"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
