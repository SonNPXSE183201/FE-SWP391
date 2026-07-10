import type { TooltipContentProps } from 'recharts';

type ValueFormatter = (value: number) => string;

// Recharts injects active/payload/label at runtime, so they're optional here.
type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  valueFormatter?: ValueFormatter;
};

/** Dark-themed tooltip shared by area/bar/donut charts. */
export const ChartTooltip = ({ active, payload, label, valueFormatter }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border-custom rounded-lg px-3 py-2 shadow-lg-custom">
      {label != null && label !== '' && (
        <p className="text-[11px] text-text-muted mb-1.5">{String(label)}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
            />
            <span className="text-[11px] text-text-secondary">{entry.name}</span>
            <span className="text-xs font-semibold text-text-primary ml-auto">
              {valueFormatter ? valueFormatter(Number(entry.value ?? 0)) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
