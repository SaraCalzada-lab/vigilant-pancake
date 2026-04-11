"use client";

import { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import AdminConfig from "./AdminConfig";
import type { GameConfig, QuestionMode } from "@/lib/game-state";
import { getAvailableCounts } from "@/lib/questions";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface LobbyScreenProps {
  serverIp: string;
  players: Player[];
  onStartGame: (config: GameConfig) => void;
}

const SLOT_COLORS = [
  "from-[#ff6b8a] to-[#ff4571]",
  "from-[#5b8def] to-[#3a6fdf]",
  "from-[#ffb830] to-[#ff9500]",
  "from-[#45d483] to-[#2bb563]",
  "from-[#a78bfa] to-[#8b5cf6]",
  "from-[#f472b6] to-[#ec4899]",
  "from-[#fb923c] to-[#f97316]",
  "from-[#22d3ee] to-[#06b6d4]",
];

const ALL_MODES: QuestionMode[] = ["multiple_choice", "ordering", "typing_blitz"];

function getConfigSummary(config: GameConfig): string {
  const modeLabels = config.modes.map((m) =>
    m === "multiple_choice" ? "MC" : m === "ordering" ? "Ordering" : "Typing"
  );
  const allModes = config.modes.length === ALL_MODES.length;
  const max = getAvailableCounts(config.modes).max;
  const allQuestions = config.questionCount === max;

  if (allModes && allQuestions) return "All questions";
  const parts: string[] = [];
  parts.push(`${config.questionCount} question${config.questionCount !== 1 ? "s" : ""}`);
  if (!allModes) parts.push(modeLabels.join(" + "));
  return parts.join(" \u00B7 ");
}

export default function LobbyScreen({ serverIp, players, onStartGame }: LobbyScreenProps) {
  const joinUrl = `http://${serverIp}:3000/play`;
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<GameConfig>(() => ({
    modes: ALL_MODES,
    questionCount: getAvailableCounts(ALL_MODES).max,
  }));

  const handleConfigChange = useCallback((newConfig: GameConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-10">
      {/* Settings gear icon */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white/30 transition-all hover:bg-white/10 hover:text-white/70"
        title="Game Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      <h1 className="bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-7xl font-bold text-transparent">
        Quiz Game
      </h1>

      <div className="flex items-center gap-16">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-5">
          <div className="glass rounded-3xl p-8">
            <div className="rounded-2xl bg-white p-5">
              <QRCodeSVG value={joinUrl} size={240} level="M" />
            </div>
          </div>
          <p className="text-lg font-medium text-white/40">Scan to join</p>
          <p className="glass rounded-xl px-5 py-2.5 font-mono text-sm text-white/60">
            {joinUrl}
          </p>
        </div>

        {/* Player slots */}
        <div className="flex flex-col gap-5">
          <p className="text-2xl font-semibold text-white/70">
            Players <span className="text-white">{players.length}</span>/8
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => {
              const player = players[i];
              return (
                <div
                  key={i}
                  className={`flex h-16 w-52 items-center justify-center rounded-2xl text-xl font-semibold transition-all duration-300 ${
                    player
                      ? `bg-gradient-to-r ${SLOT_COLORS[i]} text-white shadow-lg`
                      : "glass border-white/5 text-white/20"
                  }`}
                >
                  {player ? player.name : "---"}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Config summary */}
      <p className="text-base text-white/40">{getConfigSummary(config)}</p>

      <button
        onClick={() => onStartGame(config)}
        disabled={players.length === 0}
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-14 py-5 text-3xl font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:scale-100"
      >
        Start Game
      </button>
      {players.length === 0 && (
        <p className="text-lg text-white/30">Waiting for players to join...</p>
      )}

      {/* Settings modal */}
      {showSettings && (
        <AdminConfig
          config={config}
          onChange={handleConfigChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
