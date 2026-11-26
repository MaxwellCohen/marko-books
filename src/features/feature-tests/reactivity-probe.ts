// Counters only touched in the browser; the server-side calls are no-ops.
type Probe = { mounts: number; boundEvals: number; staticEvals: number };

function probe(): Probe | undefined {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __ftProbe?: Probe };
  return (w.__ftProbe ??= { mounts: 0, boundEvals: 0, staticEvals: 0 });
}

export function trackBound(n: number) {
  const p = probe();
  if (p) p.boundEvals++;
  return n * 2;
}

export function trackStatic() {
  const p = probe();
  if (p) p.staticEvals++;
  return "static";
}

export function trackMount() {
  probe()!.mounts++;
}
