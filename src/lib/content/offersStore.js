import { getContentDb } from './db';
import { OFFER_TEXT_QUESTIONS, OFFER_RATING_FACTORS, OFFER_STATUS_ORDER } from '@/lib/offerContent';

// Datenzugriff für die „umgekehrte Bewerbung": eingehende Angebote von
// Arbeitgebern an René + deren Verlauf/Bewertung.

function logEvent(db, offerId, kind, detail = '') {
    db.prepare('INSERT INTO offer_events (offer_id, kind, detail, at) VALUES (?, ?, ?, ?)')
        .run(offerId, kind, (detail || '').toString().slice(0, 4000), Date.now());
}

export function createOffer(data) {
    const db = getContentDb();
    const now = Date.now();
    const int = (n) => Math.max(0, Math.min(1000000, Math.round(Number(n) || 0)));
    const cols = {
        company: (data.company || '').toString().trim().slice(0, 300),
        contact: (data.contact || '').toString().trim().slice(0, 300),
        email: (data.email || '').toString().trim().slice(0, 300),
        website: (data.website || '').toString().trim().slice(0, 300),
        position: (data.position || '').toString().trim().slice(0, 300),
        model: (data.model || '').toString().trim().slice(0, 300),
        location: (data.location || '').toString().trim().slice(0, 300),
        homeoffice_pct: int(data.homeoffice_pct),
        hours_per_week: int(data.hours_per_week),
        vacation_days: int(data.vacation_days),
        start_date: (data.start_date || '').toString().trim().slice(0, 200),
        probation: (data.probation || '').toString().trim().slice(0, 200),
        contract: (data.contract || '').toString().trim().slice(0, 300),
        learning_budget: int(data.learning_budget),
        salary_min: int(data.salary_min),
        salary_max: int(data.salary_max),
        message: (data.message || '').toString().trim().slice(0, 4000),
        status: 'neu', created_at: now, updated_at: now,
    };
    OFFER_TEXT_QUESTIONS.forEach((q) => { cols[`q_${q.key}`] = (data[q.key] || '').toString().trim().slice(0, 4000); });
    const keys = Object.keys(cols);
    const id = db.prepare(
        `INSERT INTO offers (${keys.join(', ')}) VALUES (${keys.map((k) => '@' + k).join(', ')})`,
    ).run(cols).lastInsertRowid;
    logEvent(db, id, 'created');
    return { id };
}

export function getOffers() {
    return getContentDb().prepare('SELECT * FROM offers ORDER BY created_at DESC, id DESC').all();
}

export function getOffer(id) {
    return getContentDb().prepare('SELECT * FROM offers WHERE id = ?').get(id) || null;
}

export function getOfferEvents(id) {
    return getContentDb().prepare('SELECT kind, detail, at FROM offer_events WHERE offer_id = ? ORDER BY at ASC, id ASC').all(id);
}

// Beim ersten Öffnen im Admin merken (für „neu"-Markierung).
export function markOfferViewed(id) {
    const db = getContentDb();
    const row = db.prepare('SELECT viewed_at FROM offers WHERE id = ?').get(id);
    if (row && !row.viewed_at) db.prepare('UPDATE offers SET viewed_at = ? WHERE id = ?').run(Date.now(), id);
}

export function updateOfferStatus(id, status) {
    if (!OFFER_STATUS_ORDER.includes(status)) return;
    const db = getContentDb();
    const before = db.prepare('SELECT status FROM offers WHERE id = ?').get(id);
    db.prepare('UPDATE offers SET status = ?, updated_at = ? WHERE id = ?').run(status, Date.now(), id);
    if (!before || before.status !== status) logEvent(db, id, 'status', status);
}

export function updateOfferNotes(id, notes) {
    getContentDb().prepare('UPDATE offers SET notes = ?, updated_at = ? WHERE id = ?')
        .run((notes || '').toString().slice(0, 4000), Date.now(), id);
}

export function rateOffer(id, data) {
    const db = getContentDb();
    const clamp = (n) => Math.max(0, Math.min(5, Number(n) || 0));
    const setCols = OFFER_RATING_FACTORS.map((f) => `rating_${f.key} = @r_${f.key}`).join(', ');
    const params = { id, now: Date.now() };
    OFFER_RATING_FACTORS.forEach((f) => { params[`r_${f.key}`] = clamp(data[f.key]); });
    db.prepare(`UPDATE offers SET ${setCols}, rated_at = @now, updated_at = @now WHERE id = @id`).run(params);
    logEvent(db, id, 'rating', OFFER_RATING_FACTORS.map((f) => clamp(data[f.key])).join('/'));
}

export function deleteOffer(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM offer_events WHERE offer_id = ?').run(id);
        db.prepare('DELETE FROM offers WHERE id = ?').run(id);
    })();
}

export function getOfferStats() {
    const offers = getOffers();
    const total = offers.length;
    const neu = offers.filter((o) => o.status === 'neu').length;
    const laufend = offers.filter((o) => o.status === 'interessant' || o.status === 'im_gespraech').length;
    const angenommen = offers.filter((o) => o.status === 'angenommen').length;
    return { total, neu, laufend, angenommen };
}
