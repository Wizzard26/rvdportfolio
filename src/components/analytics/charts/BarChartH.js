'use client';

import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { CATEGORICAL } from '../palette';

// Horizontale Balken für eine einzelne Verteilung (z. B. Browser, OS).
// Eine Serie, eine Achse. Rundung nur an den Datenenden.
export default function BarChartH({ data, height = 240 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e8ea" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#607079' }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: '#3b4a52' }} width={96} />
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e8ea', fontSize: 13 }}
                />
                <Bar dataKey="n" name="Besucher" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12, fill: '#607079' }}>
                    {data.map((d, i) => <Cell key={d.label} fill={CATEGORICAL[i % CATEGORICAL.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
