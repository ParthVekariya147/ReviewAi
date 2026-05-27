'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from '@/components/ui/chart';
import type { DailyPoint } from '@/types/admin';
import ChartState from './chart-state';

const chartConfig = {
  scans:   { label: 'Scans',   color: 'hsl(var(--chart-1))' },
  reviews: { label: 'Reviews', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

interface LineChartProps {
  data: DailyPoint[];
  height?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function LineChart({ data, height = 300, isLoading, error, onRetry }: LineChartProps) {
  if (isLoading) return <ChartState type="loading" height={height} />;
  if (error)     return <ChartState type="error"   height={height} message={error} onRetry={onRetry} />;
  if (!data.length) return <ChartState type="empty" height={height} />;

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 20, right: 12, left: 12, bottom: 20 }}>
        <defs>
          <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--color-scans)"   stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-scans)"   stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--color-reviews)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-reviews)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => v.slice(5)}
          interval="preserveStartEnd"
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} tick={{ fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="scans"
          type="monotone"
          stroke="var(--color-scans)"
          strokeWidth={2}
          fill="url(#fillScans)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          dataKey="reviews"
          type="monotone"
          stroke="var(--color-reviews)"
          strokeWidth={2}
          fill="url(#fillReviews)"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
