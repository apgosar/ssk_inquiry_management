"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART } from "@/lib/chart-colors";

export function TrendChart({
  data,
}: {
  data: { monthLabel: string; total: number; enrolled: number; conversionRate: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: CHART.muted }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, borderColor: CHART.grid, fontSize: 13 }}
          formatter={(value, name) => {
            const v = Number(value) || 0;
            return name === "Conversion rate"
              ? [`${v.toFixed(1)}%`, String(name)]
              : [v, String(name)];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="total" name="Total inquiries" fill={CHART.primarySoft} radius={[6, 6, 0, 0]} />
        <Bar yAxisId="left" dataKey="enrolled" name="Enrolled" fill={CHART.enrolled} radius={[6, 6, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversionRate"
          name="Conversion rate"
          stroke={CHART.accent}
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
