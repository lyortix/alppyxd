import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { WorldRoom } from "./rooms/WorldRoom";
import { MAPS } from "./config/maps";

const PORT = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, maps: MAPS.map((m) => m.id) });
});

/**
 * Live population across every instance of every map, aggregated. Polled by
 * the client (~every 4s) to light up busy locations and dim empty ones so
 * players naturally gather instead of splitting.
 */
app.get("/presence", async (_req, res) => {
  const counts: Record<string, number> = {};
  const rooms = await matchMaker.query({ name: "world" });
  for (const map of MAPS) counts[map.id] = 0;
  for (const room of rooms) {
    const mapId = (room.metadata as { mapId?: string } | undefined)?.mapId;
    if (mapId && mapId in counts) counts[mapId] += room.clients;
  }
  res.json({ counts, total: Object.values(counts).reduce((a, b) => a + b, 0) });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

// A single room type; instances group players by map. joinOrCreate with the
// same mapId lands in an existing non-full instance of that map.
gameServer.define("world", WorldRoom).filterBy(["mapId"]);

gameServer.listen(PORT).then(() => {
  console.log(`Lo-Fi Square realtime server listening on ws://localhost:${PORT}`);
});
