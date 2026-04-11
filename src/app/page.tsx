import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-mesh flex h-screen flex-col items-center justify-center gap-10">
      <h1 className="bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-6xl font-bold text-transparent">
        Quiz Game
      </h1>
      <p className="text-xl text-white/50">Choose your screen</p>
      <div className="flex gap-6">
        <Link
          href="/tv"
          className="glass-strong rounded-2xl px-10 py-5 text-2xl font-semibold text-white transition-all hover:scale-105 hover:bg-white/15"
        >
          TV Screen
        </Link>
        <Link
          href="/play"
          className="glass-strong rounded-2xl px-10 py-5 text-2xl font-semibold text-white transition-all hover:scale-105 hover:bg-white/15"
        >
          Phone Screen
        </Link>
      </div>
    </div>
  );
}
