# Lo-Fi Square

An anonymous, cozy, online lo-fi neighborhood. Pick a nickname, confirm you're
18+, choose a little character, and step into a hand-drawn 2D world: walk
through sunset streets and rainy cities, duck into the café or the arcade, meet
strangers, chat under the streetlights, wave and dance, and grab a screenshot
when it looks good. No accounts, no tracking, nothing stored.

It's built as the vertical slice of a real social game — a few systems, each
made to feel premium — rather than a wide pile of half-finished features.

> **Privacy first.** No login, no email, no passwords, no profiles. The only
> things that exist are a temporary nickname, a client-side-only age check, and
> a random anonymous device id used purely so blocking/reporting can recognize
> "the same browser." All of it lives in RAM on the server and vanishes when you
> leave. Nothing is ever written to a database.

---

## What's in it

- **A living world.** Four outdoor themes — **Sunset Neighborhood**, **Rainy
  City**, **Snow Village**, **Neon District** — plus four enterable interiors
  (**Corner Café**, **Pixel Arcade**, **Cozy House**, **Rooftop**). Walk in
  through a glowing door, walk out over the exit mat.
- **Smooth multiplayer.** Colyseus-authoritative rooms with client-side
  prediction for your own character and interpolation for everyone else. Live
  population counts light up busy places and dim empty ones, gently gathering
  strangers instead of scattering them.
- **Social interaction.** Realtime chat with Roblox-style overhead speech
  bubbles + a readable chat panel, floating emoji reactions, and synced
  sit/dance actions.
- **Atmosphere.** A fully **procedural** WebAudio soundscape (generative lo-fi
  loop + per-location ambience: rain, wind, city hum, café warmth, arcade
  blips, fireplace crackle) with mute toggles, plus rain/snow weather particles
  and a soft camera vignette.
- **Safety.** Strict 18+ age gate, server-side profanity moderation (handles
  spacing/leetspeak evasion), and a report/block system with **no-rematch**:
  once you block someone you are relocated to a fresh room instance and can
  never be matched with them again.
- **Character system.** Original, procedurally-drawn chibi characters — 3 body
  styles × 8 palettes × 5 accessories (hoodie, headphones, beanie, backpack,
  scarf…) — with idle/walk/sit/dance/wave animations. No copyrighted assets.
- **Ambient NPCs & events.** An old neighbor, a café owner, and a wandering
  street cat you can chat with, plus random world events ("a rain shower is
  passing through…", "the night market opened its lanterns").
- **Photo mode.** Hide the UI, get a cinematic letterboxed frame, and save the
  moment as a PNG.
- **Mobile.** Responsive UI and an analog touch joystick on phones; WASD/arrows
  on desktop.

---

## Architecture

Two independently-deployed services (Vercel doesn't hold persistent websockets
well, so the realtime backend lives elsewhere):

```
┌─────────────────────────────┐        websocket (Colyseus)        ┌──────────────────────────┐
│  web/  — Next.js + Phaser 3  │  ───────────────────────────────▶ │  server/  — Colyseus/Node │
│  (Vercel)                    │  ◀───────────────────────────────  │  (Railway / Render / …)   │
│  React = UI shell            │        REST GET /presence          │  one WorldRoom type,      │
│  Phaser = the world canvas   │                                    │  instances grouped by map │
└─────────────────────────────┘                                    └──────────────────────────┘
```

### `web/` — frontend (Vercel)

Next.js (App Router) + TypeScript + TailwindCSS + Phaser 3. React owns the
menus/HUD/overlays; Phaser owns the world, characters, movement, and rendering.
They talk through a tiny event bus (`game/net/bus.ts`) so React never touches
game state directly — it emits intents ("send this chat") and reacts to facts
("you entered the café"). Phaser is dynamically imported (it touches `window`
at import time) to stay safe under SSR.

The game is organized into modular systems, none of them hardcoded to a
specific map:

| Concern | Where |
| --- | --- |
| Boot / game config | `game/main.ts` |
| The one generic scene | `game/scenes/WorldScene.ts` |
| Maps (pure data) | `game/data/maps/*.ts` |
| Characters (procedural art + anims) | `game/render/characters.ts` |
| Props / buildings / ground | `game/render/{props,buildings,ground}.ts` |
| World construction from data | `game/systems/worldBuilder.ts` |
| Chat bubbles & emotes | `game/systems/bubbles.ts` |
| Weather particles | `game/systems/weather.ts` |
| Procedural audio | `game/systems/audio.ts` |
| Ambient NPCs | `game/systems/npcs.ts` |
| Networking | `game/net/connection.ts` |
| Player/NPC entity | `game/entities/PlayerActor.ts` |

**Adding a new location is data, not code:** add a `MapDef` under
`game/data/maps/`, register it in `game/data/maps/index.ts`, add the matching
matchmaking entry to `server/src/config/maps.ts` (ids must match), and it shows
up in the travel picker, gets collision/doors/signs/NPCs, and joins the
presence system automatically. The same `WorldScene` renders every map.

### `server/` — realtime backend (Railway/Render/…)

Node + TypeScript + Colyseus. A single room type, `WorldRoom`, whose instances
are grouped by `mapId` (`gameServer.define("world", WorldRoom).filterBy(["mapId"])`).
`joinOrCreate` with a given `mapId` lands you in an existing non-full instance
of that map; Colyseus opens a fresh instance once it hits the map's cozy
capacity — which doubles as the no-rematch mechanism.

| Concern | Where |
| --- | --- |
| HTTP + Colyseus bootstrap, `/presence` | `src/index.ts` |
| The room | `src/rooms/WorldRoom.ts` |
| Synced state schema | `src/rooms/schema/WorldState.ts` |
| Map matchmaking config | `src/config/maps.ts` |
| Profanity filter | `src/moderation/profanityFilter.ts` |
| Report/block store (RAM only) | `src/moderation/store.ts` |
| Ambient world-event scheduler | `src/systems/worldEvents.ts` |

Because the two projects deploy separately with no shared package, the small
map subset the server needs (id, capacity, bounds, spawn) is duplicated in
`server/src/config/maps.ts`. The client keeps the rich version. Keep the ids in
sync by hand.

### Privacy & moderation model

- **Nickname + age** are entered on the intro screen. Age is checked purely
  client-side for the 18+ gate and never sent anywhere. The nickname lives only
  in the room's in-RAM state while you're connected and is deleted on leave.
- **Report / block** work through a random **anonymous device id**
  (`crypto.randomUUID()`, `localStorage`), never tied to any real identity. The
  server records mutual blocks in RAM only (`moderation/store.ts`). Reporting or
  blocking someone acks the client, which fades and relocates to a fresh room
  instance; `onAuth` then rejects any future join that would reunite the pair,
  so you're never matched again. Blocked pairs also stop seeing each other's
  chat/emotes immediately, before relocation.
- **Chat** is the only thing broadcast, and only after server-side
  moderation: the message is lowercased, de-accented, leetspeak-normalized, and
  stripped of spacing/punctuation before matching a blacklist — so `f u c k`
  and `s.h.1.t` are caught, not just literal words. A tripped message is
  replaced wholesale. Profane nicknames become `stranger`.

---

## Getting started

Node 18+ (developed on Node 22). The two services run independently — start the
backend first, then the frontend.

### 1. Realtime backend (`server/`)

```bash
cd server
npm install
npm run dev            # tsx watch, http://localhost:2567
```

Production:

```bash
npm run build          # tsc -> build/
npm start              # node build/index.js
```

Env vars (see `server/.env.example`): `PORT` (default `2567`), and optionally
`EVENT_MIN_GAP_MS` / `EVENT_MAX_GAP_MS` to tune how often ambient world events
fire.

### 2. Frontend (`web/`)

```bash
cd web
cp .env.local.example .env.local     # set NEXT_PUBLIC_SERVER_URL
npm install
npm run dev            # http://localhost:3000
```

Production build: `npm run build && npm start`.

`NEXT_PUBLIC_SERVER_URL` is the backend's address (e.g. `http://localhost:2567`
locally, `https://xxx.up.railway.app` in prod). The frontend derives both the
`/presence` REST call and the Colyseus websocket URL from it (`http`→`ws`,
`https`→`wss`).

### Trying multiplayer locally

Open `http://localhost:3000` in two browser tabs (or two windows). Enter a
nickname + age (18+) in each, and you'll see both characters in the same
neighborhood — walk around, chat, wave, and watch the bubbles sync.

---

## Deployment

- **Frontend → Vercel.** Set the project root to `web/`. Add the
  `NEXT_PUBLIC_SERVER_URL` environment variable pointing at your live backend.
- **Realtime backend → Railway / Render** (any host with persistent
  WebSocket support). Project root `server/`, build `npm run build`, start
  `npm start`. Take the live URL it gives you and put it in the frontend's
  `NEXT_PUBLIC_SERVER_URL`.

CORS is open on the backend (`cors()`), and the websocket transport shares the
HTTP server, so a single exposed port/URL is all you need.

---

## Environment variables

| Service | Variable | Default | Purpose |
| --- | --- | --- | --- |
| web | `NEXT_PUBLIC_SERVER_URL` | `http://localhost:2567` | Backend base URL (REST + ws derived from it) |
| server | `PORT` | `2567` | Listen port |
| server | `EVENT_MIN_GAP_MS` | `180000` | Min gap between world events (ms) |
| server | `EVENT_MAX_GAP_MS` | `360000` | Max gap between world events (ms) |

---

## Art direction

Every visual — characters, buildings, props, weather, the cat — is drawn
procedurally at runtime (Phaser `Graphics`/canvas → cached textures). There are
**no image files and no copyrighted assets**. Avatar recipe indices (body,
palette, accessory) are the single source of truth in `web/lib/avatar.ts` and
are what gets synced. Swapping in professional illustrated spritesheets later
means reimplementing one renderer module (`game/render/characters.ts`) while
keeping the recipe indices and animation-key names stable — nothing else has to
change.

---

## Future expansion (deliberately not built yet)

The architecture is set up so these can be added without rework, but per the
brief they're intentionally left out for now:

- Accounts / login (never — the anonymity principle forbids it).
- Payments, cosmetics store, avatar skins (the recipe system is already the hook).
- Voice chat (WebRTC) — text only for now.
- Persistent/private rooms, sponsored buildings.

New maps, new props, new weather types, new emotes, and new world events are all
additive: a new `MapDef`, a new entry in a drawer table, or a new item in a
list. The systems are generic; the content is data.
