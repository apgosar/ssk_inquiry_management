"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART, colorFor } from "@/lib/chart-colors";

export function StackedMonthlyChart({
  data,
  seriesKeys,
}: {
  data: Record<string, string | number>[];
  seriesKeys: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: CHART.grid, fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {seriesKeys.map((key, i) => (
          <Bar key={key} dataKey={key} stackId="a" fill={colorFor(i)} radius={i === seriesKeys.length - 1 ? [6, 6, 0, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
