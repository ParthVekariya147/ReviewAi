'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import type { FunnelStep } from '@/types/admin';
import ChartState from './chart-state';

const chartConfig = {
  count: { label: 'Events', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

interface FunnelChartProps {
  data: FunnelStep[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function FunnelChart({ data, isLoading, error, onRetry }: FunnelChartProps) {
  if (isLoading) return <ChartState type="loading" height={280} />;
  if (error)     return <ChartState type="error"   height={280} message={error} onRetry={onRetry} />;
  if (!data.length) return <ChartState type="empty" height={280} />;

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 60, right: 48, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="event"
          type="category"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4}>
          <LabelList
            dataKey="count"
            position="right"
            formatter={(v: number | string) => Number(v).toLocaleString()}
            style={{ fontSize: 11, fill: 'var(--muted)' }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
