import { getDb } from './db';

// Datenzugriff für das serverseitige Bot-/Crawler-Log (Tabelle bot_hits).
// Läuft nur in der Node-Runtime (Route /api/botlog, Dashboard-Server-Component).
// Es werden KEINE IP-Adressen o. Ä. gespeichert — Bots sind keine Personen.

export function recordBotHit({ category, name, path, ts = Date.now() }) {
    const db = getDb();
    const day = new Date(ts).toISOString().slice(0, 10);
    db.prepare(
        'INSERT INTO bot_hits (ts, day, category, name, path) VALUES (?, ?, ?, ?, ?)',
    ).run(ts, day, String(category), String(name), path ? String(path).slice(0, 300) : null);
}

// Kennzahlen für das Admin-Panel über die letzten `days` Tage.
// `days = null` (oder 0) → gesamter Zeitraum (seit Beginn).
// "Bots im Detail" und "Jüngste Zugriffe" sind seitenweise abrufbar
// (botPage/recentPage), damit lange Logs nicht als Endlos-Liste rendern.
export function getBotStats({
    days = 30,
    botPage = 1,
    botPageSize = 20,
    recentPage = 1,
    recentPageSize = 25,
} = {}) {
    const db = getDb();
    const since = days ? Date.now() - Math.max(1, days) * 86_400_000 : 0;

    const total = db.prepare('SELECT COUNT(*) AS n FROM bot_hits WHERE ts >= ?').get(since).n;

    const byCategory = db.prepare(`
        SELECT category, COUNT(*) AS hits, COUNT(DISTINCT name) AS bots
        FROM bot_hits WHERE ts >= ? GROUP BY category ORDER BY hits DESC
    `).all(since);

    // Bots im Detail (paginiert) — Gesamtzahl distinkter Bots + Seiten-Ausschnitt.
    const botTotal = db.prepare(
        'SELECT COUNT(*) AS n FROM (SELECT 1 FROM bot_hits WHERE ts >= ? GROUP BY name)'
    ).get(since).n;
    const botOffset = Math.max(0, (Math.max(1, botPage) - 1) * botPageSize);
    const byBot = db.prepare(`
        SELECT name, category, COUNT(*) AS hits, MAX(ts) AS last_ts
        FROM bot_hits WHERE ts >= ? GROUP BY name ORDER BY hits DESC LIMIT ? OFFSET ?
    `).all(since, botPageSize, botOffset);

    const topPaths = db.prepare(`
        SELECT path, COUNT(*) AS hits FROM bot_hits
        WHERE ts >= ? AND path IS NOT NULL GROUP BY path ORDER BY hits DESC LIMIT 15
    `).all(since);

    // Jüngste Zugriffe (paginiert) — Gesamtzahl = alle Treffer im Zeitraum.
    const recentTotal = total;
    const recentOffset = Math.max(0, (Math.max(1, recentPage) - 1) * recentPageSize);
    const recent = db.prepare(`
        SELECT ts, category, name, path FROM bot_hits
        WHERE ts >= ? ORDER BY ts DESC LIMIT ? OFFSET ?
    `).all(since, recentPageSize, recentOffset);

    return { total, byCategory, byBot, botTotal, topPaths, recent, recentTotal };
}
