"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CHART } from "@/lib/chart-colors";

const STATUS_COLORS: Record<string, string> = {
  PENDING: CHART.pending,
  ENROLLED: CHART.enrolled,
  NOT_JOINING: CHART.notJoining,
};

export function DonutChart({
  data,
}: {
  data: { name: string; value: number; key: "PENDING" | "ENROLLED" | "NOT_JOINING" }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, borderColor: CHART.grid, fontSize: 13 }}
          formatter={(value, name) => {
            const v = Number(value) || 0;
            return [`${v} (${total ? ((v / total) * 100).toFixed(0) : 0}%)`, String(name)];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
