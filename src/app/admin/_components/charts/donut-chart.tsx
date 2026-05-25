'use client';

import { PieChart, Pie, Cell, Label } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from '@/components/ui/chart';
import type { PlanDist } from '@/types/admin';

const PLAN_COLORS: Record<string, string> = {
  free:       'var(--color-free)',
  starter:    'var(--color-starter)',
  pro:        'var(--color-pro)',
  enterprise: 'var(--color-enterprise)',
};

const planConfig = {
  free:       { label: 'Free',       color: 'hsl(var(--chart-3))' },
  starter:    { label: 'Starter',    color: 'hsl(var(--chart-2))' },
  pro:        { label: 'Pro',        color: 'hsl(var(--chart-1))' },
  enterprise: { label: 'Enterprise', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

interface DonutChartProps {
  data: PlanDist[];
  size?: number;
}

export default function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  // Ensure all 4 plans appear (fill missing with count 0)
  const ALL_PLANS: Array<'free' | 'starter' | 'pro' | 'enterprise'> = ['free', 'starter', 'pro', 'enterprise'];
  const planData = ALL_PLANS.map(plan => ({
    plan,
    count: data.find(d => d.plan === plan)?.count ?? 0,
    fill: PLAN_COLORS[plan],
  }));

  return (
    <ChartContainer config={planConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={planData}
          dataKey="count"
          nameKey="plan"
          innerRadius={60}
          strokeWidth={5}
        >
          {planData.map(entry => (
            <Cell key={entry.plan} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} fontSize={22} fontWeight={700} fill="var(--ink)">
                    {total}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy as number) + 20} fontSize={11} fill="var(--muted)">
                    businesses
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="plan" />} />
      </PieChart>
    </ChartContainer>
  );
}
