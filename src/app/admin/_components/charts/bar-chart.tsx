'use client';

import { BarChart as RBarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import ChartState from './chart-state';

interface BarItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarItem[];
  color?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function BarChart({ data, color, isLoading, error, onRetry }: BarChartProps) {
  const chartConfig: ChartConfig = {
    value: { label: 'Value', color: color ?? 'hsl(var(--chart-1))' },
  };

  if (isLoading) return <ChartState type="loading" />;
  if (error)     return <ChartState type="error" message={error} onRetry={onRetry} />;
  if (!data.length) return <ChartState type="empty" />;

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <RBarChart data={data} layout="vertical" margin={{ left: 0, right: 56, top: 8, bottom: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={88}
          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number | string) => Number(v).toLocaleString()}
            style={{ fontSize: 11, fill: 'var(--muted)' }}
          />
        </Bar>
      </RBarChart>
    </ChartContainer>
  );
}
