const STORAGE_KEY = "lofi-square-device-id";

/**
 * Random per-browser id, never tied to any real identity. Used only so
 * report/no-rematch can recognize "the same person" across sessions
 * without the server ever storing personal data.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
