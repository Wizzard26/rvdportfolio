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

// Fügt eine Spalte nur hinzu, wenn sie noch fehlt (idempotent). Für bereits
// bestehende Tabellen auf dem Server, die per früherem Deploy ohne die Spalte
// angelegt wurden. DEFAULT 1 sorgt dafür, dass vorhandene Zeilen sichtbar
// bleiben (nur neu Angelegtes startet als Entwurf).
function ensureColumn(database, table, column, definition) {
    const exists = database.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
    if (!exists) database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
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
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_vita_sort ON vita_stations (sort_order);

        CREATE TABLE IF NOT EXISTS vita_areas (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            title         TEXT    NOT NULL DEFAULT '',
            show_headline INTEGER NOT NULL DEFAULT 1,
            sort_order    INTEGER NOT NULL DEFAULT 0,
            updated_at    INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_area_sort ON vita_areas (sort_order);

        CREATE TABLE IF NOT EXISTS vita_area_entries (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            area_id    INTEGER NOT NULL,
            text       TEXT    NOT NULL DEFAULT '',
            link       TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_entry_area ON vita_area_entries (area_id, sort_order);

        CREATE TABLE IF NOT EXISTS showcase_projects (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            category             TEXT    NOT NULL DEFAULT 'shopware',
            variant              TEXT    NOT NULL DEFAULT 'full',
            name                 TEXT    NOT NULL DEFAULT '',
            headline             TEXT    NOT NULL DEFAULT '',
            intro                TEXT    NOT NULL DEFAULT '',
            features             TEXT    NOT NULL DEFAULT '',
            tech                 TEXT    NOT NULL DEFAULT '',
            media_type           TEXT    NOT NULL DEFAULT 'none',
            media                TEXT    NOT NULL DEFAULT '',
            schema_type          TEXT    NOT NULL DEFAULT '',
            application_category TEXT    NOT NULL DEFAULT '',
            sandbox_html         TEXT    NOT NULL DEFAULT '',
            sandbox_css          TEXT    NOT NULL DEFAULT '',
            sandbox_js           TEXT    NOT NULL DEFAULT '',
            is_active            INTEGER NOT NULL DEFAULT 1,
            sort_order           INTEGER NOT NULL DEFAULT 0,
            updated_at           INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_project_cat ON showcase_projects (category, sort_order);

        CREATE TABLE IF NOT EXISTS gallery_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            gallery     TEXT    NOT NULL DEFAULT 'ecommerce',
            title       TEXT    NOT NULL DEFAULT '',
            description TEXT    NOT NULL DEFAULT '',
            technik     TEXT    NOT NULL DEFAULT '',
            image       TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_items (gallery, sort_order);

        CREATE TABLE IF NOT EXISTS documents (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL DEFAULT '',
            slug        TEXT    NOT NULL DEFAULT '',
            file        TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_documents_sort ON documents (sort_order);
        CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents (slug);

        CREATE TABLE IF NOT EXISTS settings (
            skey   TEXT PRIMARY KEY,
            svalue TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS shares (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            token       TEXT    NOT NULL UNIQUE,
            title       TEXT    NOT NULL DEFAULT '',
            message     TEXT    NOT NULL DEFAULT '',
            purpose     TEXT    NOT NULL DEFAULT 'bewerbung',
            company     TEXT    NOT NULL DEFAULT '',
            street      TEXT    NOT NULL DEFAULT '',
            zip         TEXT    NOT NULL DEFAULT '',
            city        TEXT    NOT NULL DEFAULT '',
            contact     TEXT    NOT NULL DEFAULT '',
            position    TEXT    NOT NULL DEFAULT '',
            access_code TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_shares_token ON shares (token);

        CREATE TABLE IF NOT EXISTS share_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            share_id    INTEGER NOT NULL,
            document_id INTEGER NOT NULL,
            sort_order  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_share_items ON share_items (share_id, sort_order);
    `);

    // Nachrüsten für bereits bestehende Tabellen (z. B. Vita auf dem Server).
    ensureColumn(database, 'vita_stations', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    ensureColumn(database, 'showcase_projects', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    ensureColumn(database, 'gallery_items', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    // Sandbox-Felder für den JavaScript-Tab (Phase B) nachrüsten.
    ensureColumn(database, 'showcase_projects', 'sandbox_html', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'showcase_projects', 'sandbox_css', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'showcase_projects', 'sandbox_js', "TEXT NOT NULL DEFAULT ''");
    // Firmendaten/Personalisierung für Freigaben nachrüsten.
    ensureColumn(database, 'shares', 'purpose', "TEXT NOT NULL DEFAULT 'bewerbung'");
    ensureColumn(database, 'shares', 'company', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'street', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'zip', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'city', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'contact', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'position', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'access_code', "TEXT NOT NULL DEFAULT ''");
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
