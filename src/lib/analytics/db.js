import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// SQLite-Zugriff für das First-Party-Analytics.
//
// Eine einzige Connection pro Node-Prozess (Singleton). better-sqlite3 ist
// synchron — bei Portfolio-Traffic völlig ausreichend und einfacher als ein
// async-Treiber. WAL-Modus erlaubt gleichzeitige Lese-/Schreibzugriffe
// (Erfassung schreibt, Dashboard liest).
//
// Läuft ausschließlich in der Node-Runtime (Route-Handler /api/collect und die
// Server-Component des Dashboards) — NIE im Proxy (Edge) oder im Client.

const DEFAULT_PATH = './data/analytics.db';

let db;

// Legt Tabelle + Indizes an (idempotent). Ein Event = eine Zeile.
function migrate(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            ts           INTEGER NOT NULL,
            day          TEXT    NOT NULL,
            session_id   TEXT,
            visitor_hash TEXT,
            type         TEXT    NOT NULL,
            path         TEXT,
            ref_source   TEXT,
            ref_domain   TEXT,
            device       TEXT,
            browser      TEXT,
            os           TEXT,
            country      TEXT,
            name         TEXT,
            duration_ms  INTEGER,
            meta         TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_events_ts         ON events (ts);
        CREATE INDEX IF NOT EXISTS idx_events_day        ON events (day);
        CREATE INDEX IF NOT EXISTS idx_events_type       ON events (type);
        CREATE INDEX IF NOT EXISTS idx_events_path       ON events (path);
        CREATE INDEX IF NOT EXISTS idx_events_ref_source ON events (ref_source);
        CREATE INDEX IF NOT EXISTS idx_events_session    ON events (session_id);
    `);
}

// Liefert die (lazy initialisierte) Datenbank. Pfad kommt aus
// ANALYTICS_DB_PATH (auf dem Server ein Volume-Pfad wie /app/data/analytics.db),
// lokal der Default unter ./data. Verzeichnis wird bei Bedarf angelegt.
export function getDb() {
    if (db) return db;

    const path = process.env.ANALYTICS_DB_PATH || DEFAULT_PATH;
    mkdirSync(dirname(path), { recursive: true });

    db = new Database(path);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    migrate(db);
    return db;
}
