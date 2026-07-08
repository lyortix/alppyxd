/**
 * In-memory report/block store, keyed by the anonymous per-browser device id
 * (crypto.randomUUID(), generated client-side, never tied to any real
 * identity). Intentionally not persisted: it only needs to survive as long
 * as the process does, per the "no personal data storage" principle.
 *
 * Blocks are recorded both ways on report, so neither party is ever
 * re-matched into the same house instance again.
 */

const blockedPairs = new Map<string, Set<string>>();

function ensure(deviceId: string): Set<string> {
  let set = blockedPairs.get(deviceId);
  if (!set) {
    set = new Set();
    blockedPairs.set(deviceId, set);
  }
  return set;
}

export function reportAndBlock(reporterDeviceId: string, targetDeviceId: string): void {
  if (reporterDeviceId === targetDeviceId) return;
  ensure(reporterDeviceId).add(targetDeviceId);
  ensure(targetDeviceId).add(reporterDeviceId);
}

export function isBlockedPair(deviceIdA: string, deviceIdB: string): boolean {
  return blockedPairs.get(deviceIdA)?.has(deviceIdB) ?? false;
}
