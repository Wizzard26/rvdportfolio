import { unstable_cache } from 'next/cache';
import { fetchGithubCalendar } from './github';
import { fetchGitlabCalendar } from './gitlab';

// Zusammengeführte Entwickler-Aktivität aus mehreren Accounts (GitHub + GitLab).
//
// Es werden ausschließlich AGGREGIERTE Tages-Beiträge gelesen — keine Repo-Namen,
// keine Commit-Inhalte. Der Private-Status der Projekte bleibt vollständig
// erhalten. Accounts ohne hinterlegtes Token werden still übersprungen; sind gar
// keine Daten verfügbar, liefert `getActivity()` null (Bereich wird ausgeblendet).
//
// Benötigte Env-Variablen (nur serverseitig, read-only Tokens):
//   ACTIVITY_GH_WIZZARD26   – GitHub-PAT (read:user) für github.com/Wizzard26
//   ACTIVITY_GH_RENE_TCI    – GitHub-PAT (read:user) für github.com/rene-tci
//   ACTIVITY_GL_GAMBIT24    – GitLab-Token (read_api) für gitlab.com/Gambit24
// Zum lokalen Vorschauen ohne Tokens: ACTIVITY_DEMO=1

const SOURCES = [
    { type: 'github', user: 'Wizzard26', token: process.env.ACTIVITY_GH_WIZZARD26 },
    { type: 'github', user: 'rene-tci', token: process.env.ACTIVITY_GH_RENE_TCI },
    { type: 'gitlab', user: 'Gambit24', token: process.env.ACTIVITY_GL_GAMBIT24, base: 'https://gitlab.com' },
];

const DAY = 86_400_000;

function utcToday() {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}
const iso = (d) => d.toISOString().slice(0, 10);

// Baut das Wochenraster (Spalten = Wochen So–Sa, ~53 Wochen bis heute).
function buildWeeks(countByDate) {
    const end = utcToday();
    const start = new Date(end.getTime() - 52 * 7 * DAY);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // auf Sonntag ausrichten

    const weeks = [];
    let cur = new Date(start);
    while (cur <= end) {
        const week = [];
        for (let i = 0; i < 7; i += 1) {
            const key = iso(cur);
            const inRange = cur <= end;
            week.push({ date: key, count: inRange ? (countByDate[key] || 0) : null, month: cur.getUTCMonth() });
            cur = new Date(cur.getTime() + DAY);
        }
        weeks.push(week);
    }
    return weeks;
}

function computeStats(countByDate) {
    const end = utcToday();
    const start = new Date(end.getTime() - 364 * DAY);

    let total = 0;
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY)) {
        total += countByDate[iso(d)] || 0;
    }

    // Aktueller Streak: rückwärts ab heute; heute mit 0 bricht ihn nicht (Kulanz).
    let current = 0;
    let cursor = new Date(end);
    if ((countByDate[iso(cursor)] || 0) === 0) cursor = new Date(cursor.getTime() - DAY);
    while ((countByDate[iso(cursor)] || 0) > 0) {
        current += 1;
        cursor = new Date(cursor.getTime() - DAY);
    }

    // Längster Streak im Zeitraum.
    let longest = 0;
    let run = 0;
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY)) {
        if ((countByDate[iso(d)] || 0) > 0) { run += 1; longest = Math.max(longest, run); } else run = 0;
    }

    return { total, current, longest };
}

// Deterministische Demo-Daten (ACTIVITY_DEMO=1) — nur zum Vorschauen des Designs.
function demoCounts() {
    const end = utcToday();
    const start = new Date(end.getTime() - 371 * DAY);
    const counts = {};
    let seed = 12345;
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY)) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const r = (seed % 1000) / 1000;
        const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
        let c = 0;
        if (r > (weekend ? 0.75 : 0.35)) c = Math.floor(r * (weekend ? 5 : 12));
        counts[iso(d)] = c;
    }
    return counts;
}

async function fetchAll() {
    const range = { from: new Date(utcToday().getTime() - 371 * DAY), to: new Date() };
    const demo = process.env.ACTIVITY_DEMO === '1';

    let results = [];
    if (!demo) {
        results = await Promise.all(SOURCES.map((s) => (
            s.type === 'github' ? fetchGithubCalendar(s, range) : fetchGitlabCalendar(s, range)
        )));
    }
    const used = results.filter(Boolean);

    const countByDate = demo ? demoCounts() : {};
    if (!demo) {
        for (const r of used) {
            for (const day of r.days) countByDate[day.date] = (countByDate[day.date] || 0) + day.count;
        }
    }

    const hasData = demo || used.length > 0;
    if (!hasData) return null;

    const stats = computeStats(countByDate);
    return {
        weeks: buildWeeks(countByDate),
        stats,
        // Anzahl beitragender Quellen (ohne Namen — Accounts gehen niemanden etwas an).
        sourceCount: demo ? 3 : used.length,
    };
}

// Tages-Cache: schont API-Limits, hält die Seite schnell. Bei Fehlern null.
export const getActivity = unstable_cache(
    async () => {
        try { return await fetchAll(); } catch { return null; }
    },
    ['dev-activity-v1'],
    { revalidate: 86_400, tags: ['activity'] },
);
