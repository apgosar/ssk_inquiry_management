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
import { CHART } from "@/lib/chart-colors";

export function ConversionBarChart({
  data,
  height = 300,
}: {
  data: { name: string; total: number; enrolled: number; conversionRate: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: CHART.muted }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, borderColor: CHART.grid, fontSize: 13 }}
          formatter={(value, name) => [String(value), String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="total" name="Total inquiries" fill={CHART.primarySoft} radius={[0, 6, 6, 0]} />
        <Bar dataKey="enrolled" name="Enrolled" fill={CHART.enrolled} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
