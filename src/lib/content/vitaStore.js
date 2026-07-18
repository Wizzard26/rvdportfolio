import { getContentDb } from './db';
import { vitaEntries } from '@/lib/vita';

// Datenzugriff für die Vita-Stationen. Wird von der öffentlichen /vita-Seite
// (lesend) und den Admin-Server-Actions (schreibend) genutzt.

// Befüllt die Tabelle einmalig aus der bisherigen statischen vita.js — nur wenn
// sie leer ist. So sieht die Seite nach dem ersten Start identisch aus und
// nichts geht verloren. `is_current` ersetzt das bisherige end:"Now".
export function seedIfEmpty() {
    const db = getContentDb();
    const count = db.prepare('SELECT COUNT(*) AS n FROM vita_stations').get().n;
    if (count > 0) return;

    const insert = db.prepare(`
        INSERT INTO vita_stations
            (title, company, description, start, end, is_current, sort_order, updated_at)
        VALUES (@title, @company, @description, @start, @end, @is_current, @sort_order, @updated_at)
    `);
    const now = Date.now();
    const seed = db.transaction((rows) => {
        for (const r of rows) {
            const current = r.end === 'Now';
            insert.run({
                title: r.title,
                company: r.company,
                description: r.description || '',
                start: r.start,
                end: current ? '' : (r.end || ''),
                is_current: current ? 1 : 0,
                sort_order: r.id, // ursprüngliche Reihenfolge → DESC = neueste zuerst
                updated_at: now,
            });
        }
    });
    seed(vitaEntries);
}

// Alle Stationen, neueste zuerst (wie die bisherige Anzeige).
// `publicOnly` blendet Entwürfe (is_active=0) aus — für die öffentliche Seite.
export function getStations({ publicOnly = false } = {}) {
    const db = getContentDb();
    seedIfEmpty();
    const where = publicOnly ? 'WHERE is_active = 1' : '';
    return db.prepare(`SELECT * FROM vita_stations ${where} ORDER BY sort_order DESC, id DESC`).all();
}

export function getStation(id) {
    return getContentDb().prepare('SELECT * FROM vita_stations WHERE id = ?').get(id);
}

export function createStation(data) {
    const db = getContentDb();
    // Neue Station bekommt den höchsten sort_order (+1) → erscheint oben.
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM vita_stations').get().m;
    const info = db.prepare(`
        INSERT INTO vita_stations
            (title, company, description, start, end, is_current, is_active, sort_order, updated_at)
        VALUES (@title, @company, @description, @start, @end, @is_current, @is_active, @sort_order, @updated_at)
    `).run({
        title: data.title,
        company: data.company,
        description: data.description || '',
        start: data.start,
        end: data.is_current ? '' : (data.end || ''),
        is_current: data.is_current ? 1 : 0,
        is_active: data.is_active ? 1 : 0, // neu = Entwurf, sofern nicht aktiv gesetzt
        sort_order: max + 1,
        updated_at: Date.now(),
    });
    return info.lastInsertRowid;
}

export function updateStation(id, data) {
    getContentDb().prepare(`
        UPDATE vita_stations
        SET title = @title, company = @company, description = @description,
            start = @start, end = @end, is_current = @is_current, is_active = @is_active, updated_at = @updated_at
        WHERE id = @id
    `).run({
        id,
        title: data.title,
        company: data.company,
        description: data.description || '',
        start: data.start,
        end: data.is_current ? '' : (data.end || ''),
        is_current: data.is_current ? 1 : 0,
        is_active: data.is_active ? 1 : 0,
        updated_at: Date.now(),
    });
}

export function setStationActive(id, active) {
    getContentDb().prepare('UPDATE vita_stations SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteStation(id) {
    getContentDb().prepare('DELETE FROM vita_stations WHERE id = ?').run(id);
}

// Setzt die Reihenfolge komplett neu (Drag & Drop). `orderedIds` ist die
// Anzeige-Reihenfolge von oben nach unten (neueste zuerst). Der oberste Eintrag
// bekommt den höchsten sort_order, damit `ORDER BY sort_order DESC` passt.
export function reorderStations(orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM vita_stations').all().map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (ids.length === 0) return;

    const total = ids.length;
    const apply = db.transaction(() => {
        const upd = db.prepare('UPDATE vita_stations SET sort_order = ? WHERE id = ?');
        ids.forEach((id, index) => upd.run(total - index, id)); // oben = höchster Wert
    });
    apply();
}
