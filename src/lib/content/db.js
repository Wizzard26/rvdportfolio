import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Content-Datenbank (redaktionelle Inhalte, z. B. Vita-Stationen).
//
// Bewusst getrennt von der Analytics-DB: Inhalte sind wertvoller (bearbeitet,
// nicht rekonstruierbar) und sollen unabhängig gesichert werden können.
//
// Pfad: CONTENT_DB_PATH, sonst im selben Verzeichnis wie die Analytics-DB
// (ANALYTICS_DB_PATH) — dadurch landet die Datei automatisch im bestehenden
// Server-Volume (/app/data), ohne neuen Env-Eintrag oder Volume-Schritt.
// Lokal fällt sie auf ./data/content.db zurück.
//
// Läuft nur in der Node-Runtime (Route-Handler, Server-Components, Server
// Actions) — nie im Proxy (Edge) oder Client.

let db;

function resolvePath() {
    if (process.env.CONTENT_DB_PATH) return process.env.CONTENT_DB_PATH;
    const analyticsPath = process.env.ANALYTICS_DB_PATH;
    if (analyticsPath) return join(dirname(analyticsPath), 'content.db');
    return './data/content.db';
}

function migrate(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS vita_stations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            company     TEXT    NOT NULL,
            description TEXT    NOT NULL DEFAULT '',
            start       TEXT    NOT NULL,
            end         TEXT    NOT NULL DEFAULT '',
            is_current  INTEGER NOT NULL DEFAULT 0,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_vita_sort ON vita_stations (sort_order);
    `);
}

export function getContentDb() {
    if (db) return db;

    const path = resolvePath();
    mkdirSync(dirname(path), { recursive: true });

    db = new Database(path);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    migrate(db);
    return db;
}
