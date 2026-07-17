'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Anteils-Donut (z. B. Herkunft, Endgerät). Identität kommt über Legende +
// Werte, nie über Farbe allein. `data`: [{ label, value, color }].
export default function DonutChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                >
                    {data.map((d) => <Cell key={d.label} fill={d.color} />)}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e8ea', fontSize: 13 }}
                    formatter={(value, label) => [`${value} (${Math.round((value / total) * 100)}%)`, label]}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
