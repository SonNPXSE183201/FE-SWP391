import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';

export interface TrendDatum {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendDatum[];
  /** Hex color for the line/fill. Defaults to brand. */
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Series name shown in tooltip. */
  name?: string;
}

export const TrendAreaChart = ({
  data,
  color = CHART_COLORS.brand,
  height = 240,
  valueFormatter,
  name = 'Giá trị',
}: TrendAreaChartProps) => {
  const gradientId = `area-grad-${name.replace(/\s+/g, '')}-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          width={48}
          tickFormatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : String(v))}
        />
        <Tooltip
          cursor={{ stroke: color, strokeOpacity: 0.3, strokeWidth: 1 }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
