import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  elevated: "#eab308",
  attention: "#eab308",
  healthy: "#22c55e",
  champion: "#10b981",
}

interface RiskDonutChartProps {
  data: Record<string, number>
}

export function RiskDonutChart({ data }: RiskDonutChartProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
