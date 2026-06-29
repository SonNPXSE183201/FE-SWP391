import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORICAL_PALETTE } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  /** Big number rendered in the center of the donut. */
  centerValue?: string | number;
  centerLabel?: string;
  valueFormatter?: (value: number) => string;
}

export const DonutChart = ({
  data,
  height = 200,
  centerValue,
  centerLabel,
  valueFormatter,
}: DonutChartProps) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colored = data.map((d, i) => ({
    ...d,
    color: d.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length],
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            <Pie
              data={colored}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={colored.length > 1 ? 3 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {colored.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerValue != null || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue != null && (
              <span className="text-xl font-bold text-text-primary leading-none">{centerValue}</span>
            )}
            {centerLabel && <span className="text-[10px] text-text-muted mt-1">{centerLabel}</span>}
          </div>
        )}
      </div>

      <ul className="flex-1 w-full space-y-2">
        {colored.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <li key={entry.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-text-secondary truncate">{entry.label}</span>
              <span className="text-xs font-semibold text-text-primary ml-auto">
                {valueFormatter ? valueFormatter(entry.value) : entry.value}
              </span>
              <span className="text-[10px] text-text-muted w-9 text-right">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
