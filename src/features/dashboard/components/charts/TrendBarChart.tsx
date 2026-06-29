import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import type { TrendDatum } from './TrendAreaChart';

interface TrendBarChartProps {
  data: TrendDatum[];
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  name?: string;
  /** Highlight the last bar (e.g. current period) with a brighter color. */
  highlightLast?: boolean;
}

export const TrendBarChart = ({
  data,
  color = CHART_COLORS.info,
  height = 240,
  valueFormatter,
  name = 'Giá trị',
  highlightLast = true,
}: TrendBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
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
          cursor={{ fill: CHART_COLORS.brand, fillOpacity: 0.06 }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar dataKey="value" name={name} radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={color}
              fillOpacity={highlightLast && index === data.length - 1 ? 1 : 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
