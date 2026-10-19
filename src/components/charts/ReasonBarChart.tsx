"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CHART } from "@/lib/chart-colors";

export function ReasonBarChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: CHART.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={180}
          tick={{ fontSize: 11, fill: CHART.muted }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: CHART.grid, fontSize: 13 }} />
        <Bar dataKey="count" name="Leads" fill={CHART.notJoining} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
