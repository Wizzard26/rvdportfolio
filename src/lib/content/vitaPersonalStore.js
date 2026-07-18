import { getContentDb } from './db';
import { vitaPersonal } from '@/lib/vita';

// Datenzugriff für die persönlichen Vita-Daten (Sidebar): Bereiche mit Einträgen.
// Zweistufig: vita_areas → vita_area_entries. Anzeige aufsteigend (von oben nach
// unten), anders als die Stationen (neueste zuerst).

// Seed aus der bisherigen statischen vita.js — nur wenn leer.
export function seedPersonalIfEmpty() {
    const db = getContentDb();
    if (db.prepare('SELECT COUNT(*) AS n FROM vita_areas').get().n > 0) return;

    const insArea = db.prepare(`
        INSERT INTO vita_areas (title, show_headline, sort_order, updated_at)
        VALUES (@title, @show_headline, @sort_order, @updated_at)
    `);
    const insEntry = db.prepare(`
        INSERT INTO vita_area_entries (area_id, text, link, sort_order, updated_at)
        VALUES (@area_id, @text, @link, @sort_order, @updated_at)
    `);
    const now = Date.now();
    const seed = db.transaction((areas) => {
        areas.forEach((area, ai) => {
            const info = insArea.run({
                title: area.area || '',
                show_headline: area.showheadline ? 1 : 0,
                sort_order: ai,
                updated_at: now,
            });
            const areaId = info.lastInsertRowid;
            (area.entries || []).forEach((e, ei) => {
                insEntry.run({
                    area_id: areaId,
                    text: e.entry || '',
                    link: e.link || null,
                    sort_order: ei,
                    updated_at: now,
                });
            });
        });
    });
    seed(vitaPersonal);
}

// Alle Bereiche mit ihren Einträgen (beides aufsteigend sortiert).
export function getAreasWithEntries() {
    const db = getContentDb();
    seedPersonalIfEmpty();
    const areas = db.prepare('SELECT * FROM vita_areas ORDER BY sort_order ASC, id ASC').all();
    const entriesStmt = db.prepare('SELECT * FROM vita_area_entries WHERE area_id = ? ORDER BY sort_order ASC, id ASC');
    return areas.map((a) => ({ ...a, entries: entriesStmt.all(a.id) }));
}

// ── Bereiche ──────────────────────────────────────────────────────────────

export function createArea({ title, show_headline }) {
    const db = getContentDb();
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM vita_areas').get().m;
    return db.prepare(`
        INSERT INTO vita_areas (title, show_headline, sort_order, updated_at)
        VALUES (@title, @show_headline, @sort_order, @updated_at)
    `).run({
        title: title || '',
        show_headline: show_headline ? 1 : 0,
        sort_order: max + 1, // neuer Bereich ans Ende
        updated_at: Date.now(),
    }).lastInsertRowid;
}

export function updateArea(id, { title, show_headline }) {
    getContentDb().prepare(`
        UPDATE vita_areas SET title = @title, show_headline = @show_headline, updated_at = @updated_at WHERE id = @id
    `).run({ id, title: title || '', show_headline: show_headline ? 1 : 0, updated_at: Date.now() });
}

// Bereich + zugehörige Einträge löschen (manuelles Cascade in einer Transaktion).
export function deleteArea(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM vita_area_entries WHERE area_id = ?').run(id);
        db.prepare('DELETE FROM vita_areas WHERE id = ?').run(id);
    })();
}

// ── Einträge ──────────────────────────────────────────────────────────────

export function createEntry(areaId, { text, link }) {
    const db = getContentDb();
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM vita_area_entries WHERE area_id = ?').get(areaId).m;
    return db.prepare(`
        INSERT INTO vita_area_entries (area_id, text, link, sort_order, updated_at)
        VALUES (@area_id, @text, @link, @sort_order, @updated_at)
    `).run({
        area_id: areaId,
        text: text || '',
        link: link || null,
        sort_order: max + 1,
        updated_at: Date.now(),
    }).lastInsertRowid;
}

export function updateEntry(id, { text, link }) {
    getContentDb().prepare(`
        UPDATE vita_area_entries SET text = @text, link = @link, updated_at = @updated_at WHERE id = @id
    `).run({ id, text: text || '', link: link || null, updated_at: Date.now() });
}

export function deleteEntry(id) {
    getContentDb().prepare('DELETE FROM vita_area_entries WHERE id = ?').run(id);
}

// ── Reihenfolge (Drag & Drop) ─────────────────────────────────────────────

// Bereiche neu ordnen. `orderedIds` = Anzeige-Reihenfolge (oben zuerst) →
// aufsteigender sort_order.
export function reorderAreas(orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM vita_areas').all().map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE vita_areas SET sort_order = ? WHERE id = ?');
        ids.forEach((id, index) => upd.run(index, id));
    })();
}

// Einträge eines Bereichs neu ordnen.
export function reorderEntries(areaId, orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM vita_area_entries WHERE area_id = ?').all(areaId).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE vita_area_entries SET sort_order = ? WHERE id = ? AND area_id = ?');
        ids.forEach((id, index) => upd.run(index, id, areaId));
    })();
}
