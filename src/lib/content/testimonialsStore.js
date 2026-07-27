import { getContentDb } from './db';

// Referenzen / Stimmen (Social Proof). Simpler Inhaltstyp wie documents:
// Autor, Rolle, Firma, Zitat + aktiv/inaktiv + Reihenfolge.

// Setting-Keys für die globale Platzierung (Standard: aus). Hier definiert (nicht
// in den Actions), weil 'use server'-Module nur async Funktionen exportieren dürfen.
export const SHOWCASE_KEY = 'testimonials_show_showcase';
export const ABOUT_KEY = 'testimonials_show_about';
export const SHOPWARE_KEY = 'testimonials_show_shopware';

function fields(data) {
    return {
        author: (data.author || '').trim(),
        role: (data.role || '').trim(),
        company: (data.company || '').trim(),
        quote: (data.quote || '').trim(),
        is_active: data.is_active ? 1 : 0,
        now: Date.now(),
    };
}

// Admin: alle (inkl. inaktiver).
export function getTestimonials() {
    return getContentDb().prepare('SELECT * FROM testimonials ORDER BY sort_order, id').all();
}

// Öffentlich: nur aktive.
export function getActiveTestimonials() {
    return getContentDb().prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order, id').all();
}

export function getTestimonial(id) {
    return getContentDb().prepare('SELECT * FROM testimonials WHERE id = ?').get(id) || null;
}

export function createTestimonial(data) {
    const db = getContentDb();
    const f = fields(data);
    // Neue Einträge oben einsortieren (sort_order 0, Rest nach unten schieben).
    const create = db.transaction(() => {
        db.prepare('UPDATE testimonials SET sort_order = sort_order + 1').run();
        return db.prepare(`
            INSERT INTO testimonials (author, role, company, quote, is_active, sort_order, created_at, updated_at)
            VALUES (@author, @role, @company, @quote, @is_active, 0, @now, @now)
        `).run(f).lastInsertRowid;
    });
    return create();
}

export function updateTestimonial(id, data) {
    const f = fields(data);
    getContentDb().prepare(`
        UPDATE testimonials SET author=@author, role=@role, company=@company, quote=@quote,
        is_active=@is_active, updated_at=@now WHERE id=@id
    `).run({ id, ...f });
}

export function setTestimonialActive(id, active) {
    getContentDb().prepare('UPDATE testimonials SET is_active=?, updated_at=? WHERE id=?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteTestimonial(id) {
    getContentDb().prepare('DELETE FROM testimonials WHERE id = ?').run(id);
}

export function reorderTestimonials(orderedIds) {
    const db = getContentDb();
    const upd = db.prepare('UPDATE testimonials SET sort_order=?, updated_at=? WHERE id=?');
    const now = Date.now();
    db.transaction(() => orderedIds.forEach((id, i) => upd.run(i, now, Number(id))))();
}
