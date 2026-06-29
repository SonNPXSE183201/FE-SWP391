// Shared chart theme tokens — mirror the Tailwind/CSS palette so charts
// match the dark UI without hardcoding magic colors across components.
export const CHART_COLORS = {
  brand: '#6C5CE7',
  brandSoft: '#9B8CFF',
  secondary: '#00CECE',
  success: '#00D68F',
  warning: '#FFAA00',
  danger: '#FF4757',
  info: '#4DABF7',
  grid: '#2E2E3A',
  axis: '#5A5A6E',
  surface: '#22222E',
  border: '#2E2E3A',
  text: '#F0F0F5',
  textMuted: '#8B8B9E',
} as const;

// Default categorical palette for donut / multi-series charts.
export const CATEGORICAL_PALETTE = [
  CHART_COLORS.brand,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.secondary,
];

const compactVND = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Compact currency label for axes/tooltips, e.g. 3,2 Tr. */
export const formatCompactVND = (value: number): string => {
  if (!value) return '0₫';
  return `${compactVND.format(value)}₫`;
};

export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
