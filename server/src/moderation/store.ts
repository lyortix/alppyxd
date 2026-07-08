/**
 * In-memory report/block store, keyed by the anonymous per-browser device id
 * (crypto.randomUUID(), generated client-side, never tied to any real
 * identity). Intentionally not persisted: it only needs to survive as long
 * as the process does, per the "no personal data storage" principle.
 *
 * Blocks are recorded both ways, so neither party is ever re-matched into
 * the same room instance again and their chat/emotes never reach each other.
 * A report is a block plus a strike counter on the target — enough to build
 * automated throttling on later without storing anything personal.
 */

const blockedPairs = new Map<string, Set<string>>();
const reportStrikes = new Map<string, number>();

function ensure(deviceId: string): Set<string> {
  let set = blockedPairs.get(deviceId);
  if (!set) {
    set = new Set();
    blockedPairs.set(deviceId, set);
  }
  return set;
}

export function blockPair(deviceIdA: string, deviceIdB: string): void {
  if (deviceIdA === deviceIdB) return;
  ensure(deviceIdA).add(deviceIdB);
  ensure(deviceIdB).add(deviceIdA);
}

export function reportAndBlock(reporterDeviceId: string, targetDeviceId: string): void {
  if (reporterDeviceId === targetDeviceId) return;
  blockPair(reporterDeviceId, targetDeviceId);
  reportStrikes.set(targetDeviceId, (reportStrikes.get(targetDeviceId) ?? 0) + 1);
}

export function isBlockedPair(deviceIdA: string, deviceIdB: string): boolean {
  return blockedPairs.get(deviceIdA)?.has(deviceIdB) ?? false;
}

export function getReportStrikes(deviceId: string): number {
  return reportStrikes.get(deviceId) ?? 0;
}
