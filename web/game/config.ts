/**
 * Central gameplay/visual constants. Map layouts live in game/data/maps;
 * avatar recipes in lib/avatar.ts.
 */

export const PLAYER_SPEED = 220;
/** How often the local player pushes its transform to the server (ms). */
export const MOVE_SEND_INTERVAL_MS = 50;
/** Remote players lerp toward their server position with this factor/frame @60fps. */
export const REMOTE_LERP = 0.18;

export const CHAT_BUBBLE_LIFETIME_MS = 4500;
export const EMOTE_LIFETIME_MS = 1800;

/** Presence poll cadence for the location picker / HUD population counts. */
export const PRESENCE_POLL_MS = 4000;

export const GAME_BG_COLOR = "#1c1a24";
