// Helpers that synthesize chart-ready datasets for the dashboards.
//
// The backend does not yet expose time-series endpoints, so trend charts are
// derived deterministically from the real aggregate stats (e.g. the current
// month's revenue becomes the last point of a 6-month trend). This keeps the
// visuals coherent with the live numbers while the time-series APIs are built.

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSlice {
  label: string;
  value: number;
  color?: string;
}

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

/** Last `count` month short-labels ending at the current month, e.g. ["T1","T2",…]. */
export const lastMonthLabels = (count: number): string[] => {
  const now = new Date().getMonth(); // 0-indexed
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    labels.push(MONTH_LABELS[(now - i + 12) % 12]);
  }
  return labels;
};

export const lastWeekdayLabels = (): string[] => ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Deterministic pseudo-random in [0,1) so charts stay stable between renders.
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9973.13) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Build a rising trend of `labels.length` points that ends at `endValue`.
 * `volatility` (0–1) controls how bumpy the ramp looks.
 */
export const buildTrend = (
  endValue: number,
  labels: string[],
  options: { volatility?: number; startRatio?: number; seed?: number } = {},
): ChartPoint[] => {
  const { volatility = 0.18, startRatio = 0.45, seed = 7 } = options;
  const n = labels.length;
  if (n === 0) return [];
  if (!endValue) return labels.map((label) => ({ label, value: 0 }));

  return labels.map((label, i) => {
    const progress = n === 1 ? 1 : i / (n - 1);
    const base = endValue * (startRatio + (1 - startRatio) * progress);
    const noise = (seededRandom(seed + i) - 0.5) * 2 * volatility * endValue;
    // Last point is pinned exactly to the real value.
    const value = i === n - 1 ? endValue : Math.max(0, base + noise);
    return { label, value: Math.round(value) };
  });
};

/** Keep only slices with a positive value (so empty categories don't clutter the donut). */
export const nonEmptySlices = (slices: ChartSlice[]): ChartSlice[] =>
  slices.filter((s) => s.value > 0);
