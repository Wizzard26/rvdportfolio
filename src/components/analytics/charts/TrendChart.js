'use client';

import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { SERIES } from '../palette';

// Zeitverlauf von Aufrufen und Besuchern. Zwei Serien, EINE Y-Achse (beide sind
// Zählwerte gleicher Größenordnung, Besucher ≤ Aufrufe) — nie eine zweite Achse.
export default function TrendChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SERIES.pageviews} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={SERIES.pageviews} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SERIES.visitors} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={SERIES.visitors} stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e8ea" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#607079' }} tickFormatter={(d) => d.slice(5)} minTickGap={24} />
                <YAxis tick={{ fontSize: 12, fill: '#607079' }} allowDecimals={false} width={36} />
                <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e8ea', fontSize: 13 }}
                    labelStyle={{ color: '#04151f' }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Area type="monotone" dataKey="pageviews" name="Aufrufe" stroke={SERIES.pageviews} strokeWidth={2} fill="url(#gradViews)" />
                <Area type="monotone" dataKey="visitors" name="Besucher" stroke={SERIES.visitors} strokeWidth={2} fill="url(#gradVisitors)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
