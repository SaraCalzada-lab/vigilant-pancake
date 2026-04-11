"use client";

import { useState } from "react";

interface JoinScreenProps {
  onJoin: (name: string) => void;
  error?: string;
}

export default function JoinScreen({ onJoin, error }: JoinScreenProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-5xl font-bold text-transparent">
        Join Game
      </h1>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={15}
          autoFocus
          className="glass rounded-2xl px-6 py-5 text-center text-2xl font-semibold text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition-all focus:ring-violet-500/50"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-5 text-2xl font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] disabled:opacity-20 disabled:shadow-none disabled:hover:scale-100"
        >
          Join
        </button>
        {error && (
          <p className="text-center text-red-400/80">{error}</p>
        )}
      </form>
    </div>
  );
}
