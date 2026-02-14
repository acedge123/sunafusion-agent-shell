import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface KindBreakdownProps {
  byKind: Record<string, number>;
}

const COLORS = [
  "hsl(222 47% 30%)",
  "hsl(210 40% 50%)",
  "hsl(0 84% 60%)",
  "hsl(215 16% 47%)",
  "hsl(210 40% 70%)",
  "hsl(222 47% 50%)",
  "hsl(0 60% 45%)",
  "hsl(210 30% 60%)",
];

const KIND_LABELS: Record<string, string> = {
  general: "General",
  chat_query: "Chat Queries",
  chat_response: "Chat Responses",
  composio_trigger: "Email Triggers",
  person: "People",
  project: "Projects",
  research_summary: "Research",
  memory: "Memory",
  decision: "Decisions",
  github_push_summary: "GitHub",
  email_summary: "Email",
  code_change: "Code Changes",
};

export const KindBreakdown: React.FC<KindBreakdownProps> = ({ byKind }) => {
  const data = Object.entries(byKind)
    .map(([kind, count]) => ({
      name: KIND_LABELS[kind] || kind,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <div className="text-muted-foreground text-sm text-center py-8">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--popover-foreground))",
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => <span className="text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
