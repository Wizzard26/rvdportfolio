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
export function getBotStats({ days = 30 } = {}) {
    const db = getDb();
    const since = Date.now() - Math.max(1, days) * 86_400_000;

    const total = db.prepare('SELECT COUNT(*) AS n FROM bot_hits WHERE ts >= ?').get(since).n;

    const byCategory = db.prepare(`
        SELECT category, COUNT(*) AS hits, COUNT(DISTINCT name) AS bots
        FROM bot_hits WHERE ts >= ? GROUP BY category ORDER BY hits DESC
    `).all(since);

    const byBot = db.prepare(`
        SELECT name, category, COUNT(*) AS hits, MAX(ts) AS last_ts
        FROM bot_hits WHERE ts >= ? GROUP BY name ORDER BY hits DESC LIMIT 100
    `).all(since);

    const topPaths = db.prepare(`
        SELECT path, COUNT(*) AS hits FROM bot_hits
        WHERE ts >= ? AND path IS NOT NULL GROUP BY path ORDER BY hits DESC LIMIT 15
    `).all(since);

    const recent = db.prepare(`
        SELECT ts, category, name, path FROM bot_hits
        WHERE ts >= ? ORDER BY ts DESC LIMIT 100
    `).all(since);

    return { total, byCategory, byBot, topPaths, recent };
}
