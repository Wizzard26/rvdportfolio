import { createHash } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDb } from './db';
import { countryFromIp, browserFromUa, osFromUa, clientIp } from './enrich';

// Prüft, ob ein angefragter (evtl. URL-kodierter) Pfad tatsächlich als Datei im
// öffentlichen Verzeichnis existiert. So erkennen wir, ob ein Scanner-Zugriff
// „durchgegangen" wäre (Datei vorhanden → 200/Preisgabe) statt ins Leere zu laufen
// (404). Mit Schutz gegen Path-Traversal (bleibt innerhalb von /public).
const PUBLIC_DIR = resolve(process.cwd(), 'public');
function existsInPublic(rawPath) {
    try {
        let p = decodeURIComponent(String(rawPath || '')).split('?')[0].split('#')[0];
        if (!p.startsWith('/')) p = `/${p}`;
        const target = resolve(PUBLIC_DIR, `.${p}`);
        if (target !== PUBLIC_DIR && !target.startsWith(`${PUBLIC_DIR}/`)) return false; // Traversal-Schutz
        return existsSync(target) && statSync(target).isFile();
    } catch {
        return false;
    }
}

// Admin-Login-Sicherheit: Protokoll aller Login-Versuche + Rate-Limiting gegen
// Brute-Force. Anonymisiert — die IP wird nur als gesalzener Hash gespeichert.

// Rate-Limit: mehr als LIMIT Fehlversuche je IP innerhalb WINDOW_MS werden geblockt.
export const FAIL_LIMIT = 5;
export const FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 Minuten

// Aufbewahrung: Login-Events älter als 90 Tage werden entfernt, damit die Tabelle
// (auch unter Dauer-Brute-Force) nicht unbegrenzt wächst. Opportunistisch – max.
// einmal pro Tag und Prozess, um die Schreibpfade nicht zu belasten.
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
let lastPruneDay = null;
function pruneOld(db, today) {
    if (lastPruneDay === today) return;
    lastPruneDay = today;
    db.prepare('DELETE FROM login_events WHERE ts < ?').run(Date.now() - RETENTION_MS);
}

function dayUtc(ts) {
    return new Date(ts).toISOString().slice(0, 10);
}

// Stabiler IP-Hash (nur IP + Salt → unabhängig vom wechselnden User-Agent, damit
// Rate-Limiting auch bei UA-Rotation greift). Die IP selbst wird nie gespeichert.
export function ipHash(ip) {
    const salt = process.env.ANALYTICS_SALT || 'dev-fallback-salt-change-me';
    return createHash('sha256').update(`login|${ip || ''}|${salt}`).digest('hex').slice(0, 32);
}

// Zahl der Fehlversuche eines IP-Hashes im Rate-Limit-Fenster.
export function recentFailCount(hash) {
    if (!hash) return 0;
    return getDb().prepare(
        "SELECT COUNT(*) AS n FROM login_events WHERE ip_hash = ? AND outcome IN ('fail','blocked') AND ts > ?",
    ).get(hash, Date.now() - FAIL_WINDOW_MS).n;
}

// Ist diese IP gerade gesperrt?
export function isRateLimited(hash) {
    return recentFailCount(hash) >= FAIL_LIMIT;
}

// Einen Login-Versuch protokollieren. `headers` = Web-Headers (aus next/headers).
export function recordLoginAttempt(outcome, headers) {
    try {
        const db = getDb();
        const ts = Date.now();
        const ip = clientIp(headers);
        const ua = headers.get('user-agent') || '';
        db.prepare(`
            INSERT INTO login_events (ts, day, outcome, ip_hash, country, browser, os)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(ts, dayUtc(ts), outcome, ipHash(ip), countryFromIp(ip), browserFromUa(ua), osFromUa(ua));
        pruneOld(db, dayUtc(ts));
    } catch { /* Logging darf den Login nie blockieren */ }
}

// Bei erfolgreichem Login die Fehlversuch-Sperre der IP aufheben (Zähler leeren).
export function clearFails(hash) {
    if (!hash) return;
    getDb().prepare("DELETE FROM login_events WHERE ip_hash = ? AND outcome IN ('fail','blocked')").run(hash);
}

// ─── Dashboard-Panel ──────────────────────────────────────────────────────

export function getLoginEvents({ limit = 25, offset = 0 } = {}) {
    return getDb().prepare(
        'SELECT ts, outcome, country, browser, os FROM login_events ORDER BY ts DESC LIMIT ? OFFSET ?',
    ).all(limit, offset);
}

export function getSecurityStats() {
    const db = getDb();
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const lastSuccess = db.prepare("SELECT ts, country, browser, os FROM login_events WHERE outcome='success' ORDER BY ts DESC LIMIT 1").get();
    const fails24 = db.prepare("SELECT COUNT(*) AS n FROM login_events WHERE outcome IN ('fail','blocked') AND ts > ?").get(dayAgo).n;
    const success24 = db.prepare("SELECT COUNT(*) AS n FROM login_events WHERE outcome='success' AND ts > ?").get(dayAgo).n;
    const total = db.prepare('SELECT COUNT(*) AS n FROM login_events').get().n;
    // Aktuell gesperrte IPs (im Fenster über dem Limit).
    const blockedNow = db.prepare(`
        SELECT COUNT(*) AS n FROM (
            SELECT ip_hash FROM login_events
            WHERE outcome IN ('fail','blocked') AND ts > ?
            GROUP BY ip_hash HAVING COUNT(*) >= ?
        )
    `).get(now - FAIL_WINDOW_MS, FAIL_LIMIT).n;
    return { lastSuccess, fails24, success24, total, blockedNow };
}

export function exportLoginEvents() {
    return getDb().prepare('SELECT id, ts, day, outcome, ip_hash, country, browser, os FROM login_events ORDER BY ts').all();
}

export function countLoginEvents() {
    return getDb().prepare('SELECT COUNT(*) AS n FROM login_events').get().n;
}

// ─── Verdächtige Zugriffe (aus dem Bot-Log) ───────────────────────────────
// Bekannte „Bad-Path"-Muster von Schwachstellen-Scannern. Als Substrings, die
// auch bei URL-Encoding (z. B. %2e für „.") greifen. Auf dieser Seite kommt
// keines davon in legitimen Pfaden vor → praktisch keine Fehltreffer.
const SUSPICIOUS = [
    'env', 'wp-', 'wp_', 'xmlrpc', '.git', 'git/', '.svn', 'sql', 'bak', 'backup',
    'dump', 'config', 'credential', 'secret', 'passwd', 'password', 'phpmyadmin',
    'adminer', 'ssh', 'id_rsa', 'pem', 'p12', 'swagger', 'actuator', 'aws',
    'yml', 'yaml', 'k8s', 'kube', 'vendor', 'composer', 'docker', 'phpinfo', 'shell',
];
const SUSP_WHERE = `path IS NOT NULL AND (${SUSPICIOUS.map(() => 'path LIKE ?').join(' OR ')})`;
const SUSP_ARGS = SUSPICIOUS.map((k) => `%${k}%`);

export function getSuspiciousHits({ limit = 25, offset = 0 } = {}) {
    const rows = getDb().prepare(
        `SELECT ts, name, path FROM bot_hits WHERE ${SUSP_WHERE} ORDER BY ts DESC LIMIT ? OFFSET ?`,
    ).all(...SUSP_ARGS, limit, offset);
    // served = Datei existiert wirklich im /public → wäre 200 (Preisgabe), sonst 404.
    return rows.map((r) => ({ ...r, served: existsInPublic(r.path) }));
}

export function countSuspiciousHits() {
    return getDb().prepare(`SELECT COUNT(*) AS n FROM bot_hits WHERE ${SUSP_WHERE}`).get(...SUSP_ARGS).n;
}

export function getSuspiciousStats() {
    const db = getDb();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const last24 = db.prepare(`SELECT COUNT(*) AS n FROM bot_hits WHERE ${SUSP_WHERE} AND ts > ?`).get(...SUSP_ARGS, dayAgo).n;
    const topPaths = db.prepare(
        `SELECT path, COUNT(*) AS n FROM bot_hits WHERE ${SUSP_WHERE} GROUP BY path ORDER BY n DESC LIMIT 10`,
    ).all(...SUSP_ARGS);
    // Gibt es verdächtige Pfade, die tatsächlich auf dem Server existieren? (echte
    // Preisgabe). Distinct-Pfade prüfen (gedeckelt), damit die Prüfung schlank bleibt.
    const distinctPaths = db.prepare(
        `SELECT DISTINCT path FROM bot_hits WHERE ${SUSP_WHERE} LIMIT 500`,
    ).all(...SUSP_ARGS);
    const exposedPaths = distinctPaths.map((r) => r.path).filter(existsInPublic);
    return { last24, topPaths, exposedPaths };
}

export function exportSuspiciousHits() {
    return getDb().prepare(`SELECT ts, name, path FROM bot_hits WHERE ${SUSP_WHERE} ORDER BY ts`).all(...SUSP_ARGS);
}
