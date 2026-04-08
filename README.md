# Quiz Game

Multiplayer quiz game with:

- TV screen at `/tv` (host controls + scoreboard)
- Phone screen at `/play` (players join + answer)
- Real-time game state over Socket.IO

This app uses a custom server (`server.ts`) to run Next.js and Socket.IO on the same port.

## Prerequisites

- Node.js 20+ (recommended: Node 22 LTS)
- npm (or another package manager)

## Install

```bash
npm install
```

## Run In Development

If phones join over local network, set your machine IP in `ALLOWED_DEV_ORIGINS`:

```bash
ALLOWED_DEV_ORIGINS=192.168.1.50 npm run dev
```

You can also provide multiple comma-separated origins:

```bash
ALLOWED_DEV_ORIGINS=192.168.1.50,192.168.1.51 npm run dev
```

Then open:

- TV: `http://localhost:3000/tv`
- Phone (same machine): `http://localhost:3000/play`
- Phone (same Wi-Fi): `http://<your-local-ip>:3000/play`

## Build And Run (Production)

```bash
npm run build
npm run start
```

Production start runs `dist/server.js` so Socket.IO is active.

## Scripts

- `npm run dev` - Start custom server with ts-node
- `npm run build` - Build Next app and compile server TypeScript to `dist/`
- `npm run start` - Start compiled custom server in production mode
- `npm run lint` - Run ESLint

## Notes

- Game state is in-memory only. Restarting the server resets games.
- Max players is currently 8.
- Ordering question thumbnails use external Wikimedia image URLs.
