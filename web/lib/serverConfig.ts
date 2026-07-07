/**
 * The realtime backend is deployed separately from the Vercel frontend
 * (see README). Point this at wherever it lands — Railway/Render/etc.
 */
const HTTP_BASE = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:2567";

export function getHttpBase(): string {
  return HTTP_BASE;
}

export function getWsBase(): string {
  return HTTP_BASE.replace(/^http/, "ws");
}
