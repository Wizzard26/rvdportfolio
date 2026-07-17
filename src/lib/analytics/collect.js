import { getDb } from './db';

// Schreibt Events in die Datenbank. Wird vom Route-Handler /api/collect nach
// der Anreicherung aufgerufen.

let insertStmt;
let lastPruneDay = null;

// Aufbewahrung: Events älter als 12 Monate löschen. Opportunistisch — höchstens
// einmal pro Tag und Prozess, damit es die Schreibpfade nicht belastet.
function pruneOldEvents(db, today) {
    if (lastPruneDay === today) return;
    lastPruneDay = today;
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    db.prepare('DELETE FROM events WHERE ts < ?').run(cutoff);
}

/**
 * Speichert ein angereichertes Event.
 * `row` enthält bereits alle abgeleiteten, anonymen Felder (kein IP/roher UA).
 */
export function insertEvent(row) {
    const db = getDb();
    if (!insertStmt) {
        insertStmt = db.prepare(`
            INSERT INTO events
                (ts, day, session_id, visitor_hash, type, path, ref_source,
                 ref_domain, device, browser, os, country, name, duration_ms, meta)
            VALUES
                (@ts, @day, @session_id, @visitor_hash, @type, @path, @ref_source,
                 @ref_domain, @device, @browser, @os, @country, @name, @duration_ms, @meta)
        `);
    }

    insertStmt.run({
        ts: row.ts,
        day: row.day,
        session_id: row.session_id ?? null,
        visitor_hash: row.visitor_hash ?? null,
        type: row.type,
        path: row.path ?? null,
        ref_source: row.ref_source ?? null,
        ref_domain: row.ref_domain ?? null,
        device: row.device ?? null,
        browser: row.browser ?? null,
        os: row.os ?? null,
        country: row.country ?? null,
        name: row.name ?? null,
        duration_ms: row.duration_ms ?? null,
        meta: row.meta ? JSON.stringify(row.meta) : null,
    });

    pruneOldEvents(db, row.day);
}
