import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { HouseRoom } from "./rooms/HouseRoom";
import { HOUSES, roomNameForHouse } from "./houses";

const PORT = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, houses: HOUSES.map((h) => h.id) });
});

/**
 * Live occupancy across every instance of every house, aggregated. Polled by
 * the neighborhood scene to decide which houses glow, which are still
 * dimmed, and which newly-revealed houses should appear at all.
 */
app.get("/occupancy", async (_req, res) => {
  const counts: Record<string, number> = {};
  for (const house of HOUSES) {
    const rooms = await matchMaker.query({ name: roomNameForHouse(house.id) });
    counts[house.id] = rooms.reduce((sum, room) => sum + room.clients, 0);
  }
  res.json({ counts, total: Object.values(counts).reduce((a, b) => a + b, 0) });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

for (const house of HOUSES) {
  gameServer.define(roomNameForHouse(house.id), HouseRoom, { houseId: house.id });
}

gameServer.listen(PORT).then(() => {
  console.log(`Lo-Fi Square realtime server listening on ws://localhost:${PORT}`);
});
