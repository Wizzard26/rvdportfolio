import { randomBytes } from 'node:crypto';
import { getContentDb } from './db';
import { STATUS_ORDER, RUNNING_STATUS } from '@/lib/applicationStatus';

// Freigaben: benannte Dokument-Sammlungen unter /freigabe/<token>, zugleich
// Bewerbungs-Tracking (Status, Termine, Aufrufe/Downloads, Verlauf).

function newToken() {
    return randomBytes(18).toString('base64url');
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// Zugriffscode (PLZ) tolerant vergleichen.
export function normalizeCode(code) {
    return (code || '').toString().replace(/\s+/g, '').toLowerCase();
}

export function shareCookieName(id) {
    return `sf_${id}`;
}

// Abgelaufen, wenn ein Ablaufdatum gesetzt und in der Vergangenheit ist.
export function isExpired(share) {
    return !!(share && share.expires_at && share.expires_at < today());
}

function logEvent(db, shareId, kind, detail = '') {
    db.prepare('INSERT INTO share_events (share_id, kind, detail, at) VALUES (?, ?, ?, ?)')
        .run(shareId, kind, detail || '', Date.now());
}

function setItems(db, shareId, documentIds) {
    const del = db.prepare('DELETE FROM share_items WHERE share_id = ?');
    const ins = db.prepare('INSERT INTO share_items (share_id, document_id, sort_order) VALUES (?, ?, ?)');
    const known = new Set(db.prepare('SELECT id FROM documents').all().map((r) => r.id));
    db.transaction(() => {
        del.run(shareId);
        (documentIds || []).map(Number).filter((id) => known.has(id))
            .forEach((id, i) => ins.run(shareId, id, i));
    })();
}

const PURPOSES = ['bewerbung', 'initiativ', 'sonstiges'];

function fields(data) {
    const status = STATUS_ORDER.includes(data.status) ? data.status : 'offen';
    return {
        title: (data.title || '').trim(),
        message: (data.message || '').trim(),
        purpose: PURPOSES.includes(data.purpose) ? data.purpose : 'bewerbung',
        company: (data.company || '').trim(),
        street: (data.street || '').trim(),
        zip: (data.zip || '').trim(),
        city: (data.city || '').trim(),
        contact: (data.contact || '').trim(),
        position: (data.position || '').trim(),
        access_code: (data.access_code || '').trim(),
        sent_at: (data.sent_at || '').trim(),
        expires_at: (data.expires_at || '').trim(),
        status,
        interview_at: (data.interview_at || '').trim(),
        interview_contact: (data.interview_contact || '').trim(),
        interview_people: (data.interview_people || '').trim(),
        decision_date: (data.decision_date || '').trim(),
        rejection_reason: (data.rejection_reason || '').trim(),
        followup_at: (data.followup_at || '').trim(),
        notes: (data.notes || '').trim(),
        is_active: data.is_active ? 1 : 0,
        now: Date.now(),
    };
}

const COLS = `title=@title, message=@message, purpose=@purpose, company=@company, street=@street,
    zip=@zip, city=@city, contact=@contact, position=@position, access_code=@access_code,
    sent_at=@sent_at, expires_at=@expires_at, status=@status, interview_at=@interview_at,
    interview_contact=@interview_contact, interview_people=@interview_people, decision_date=@decision_date,
    rejection_reason=@rejection_reason, followup_at=@followup_at, notes=@notes,
    is_active=@is_active, updated_at=@now`;

export function createShare(data) {
    const db = getContentDb();
    const token = newToken();
    const f = fields(data);
    const id = db.prepare(`
        INSERT INTO shares (token, ${Object.keys(f).filter((k) => k !== 'now').join(', ')}, created_at, updated_at)
        VALUES (@token, ${Object.keys(f).filter((k) => k !== 'now').map((k) => '@' + k).join(', ')}, @now, @now)
    `).run({ token, ...f }).lastInsertRowid;
    setItems(db, id, data.documentIds);
    logEvent(db, id, 'created');
    if (f.sent_at) logEvent(db, id, 'sent', f.sent_at);
    if (f.status !== 'offen') logEvent(db, id, 'status', f.status);
    return { id, token };
}

export function updateShare(id, data) {
    const db = getContentDb();
    const before = db.prepare('SELECT status, sent_at FROM shares WHERE id = ?').get(id);
    const f = fields(data);
    db.prepare(`UPDATE shares SET ${COLS} WHERE id=@id`).run({ id, ...f });
    setItems(db, id, data.documentIds);
    // Verlauf: Statuswechsel und erstmaliges Zustelldatum protokollieren.
    if (before && before.status !== f.status) logEvent(db, id, 'status', f.status);
    if (f.sent_at && (!before || !before.sent_at)) logEvent(db, id, 'sent', f.sent_at);
}

// Nachricht von René an den Arbeitgeber (Teil des Gesprächsverlaufs).
export function addOwnerMessage(shareId, body) {
    const text = (body || '').toString().trim();
    if (!text) return;
    logEvent(getContentDb(), shareId, 'reply', text.slice(0, 4000));
}

// Gesprächsverlauf (Chat): Rückfragen des Arbeitgebers + Antworten von René.
export function getConversation(shareId) {
    return getContentDb()
        .prepare("SELECT kind, detail, at FROM share_events WHERE share_id = ? AND kind IN ('question','reply') ORDER BY at ASC, id ASC")
        .all(shareId)
        .map((e) => ({ sender: e.kind === 'question' ? 'employer' : 'owner', body: e.detail, at: e.at }));
}

export function setShareActive(id, active) {
    const db = getContentDb();
    db.prepare('UPDATE shares SET is_active = ?, updated_at = ? WHERE id = ?').run(active ? 1 : 0, Date.now(), id);
    logEvent(db, id, active ? 'reopened' : 'closed');
}

export function deleteShare(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM share_events WHERE share_id = ?').run(id);
        db.prepare('DELETE FROM share_items WHERE share_id = ?').run(id);
        db.prepare('DELETE FROM shares WHERE id = ?').run(id);
    })();
}

export function getShares() {
    return getContentDb().prepare(`
        SELECT s.*, (SELECT COUNT(*) FROM share_items si WHERE si.share_id = s.id) AS item_count
        FROM shares s ORDER BY s.updated_at DESC, s.id DESC
    `).all();
}

export function getShare(id) {
    const db = getContentDb();
    const share = db.prepare('SELECT * FROM shares WHERE id = ?').get(id);
    if (!share) return null;
    const documentIds = db.prepare('SELECT document_id FROM share_items WHERE share_id = ? ORDER BY sort_order, id')
        .all(id).map((r) => r.document_id);
    return { ...share, documentIds };
}

export function getShareRawByToken(token) {
    if (!token) return null;
    return getContentDb().prepare('SELECT * FROM shares WHERE token = ?').get(token) || null;
}

// Öffentlicher Zugriff: aktive UND nicht abgelaufene Freigaben.
export function getShareByToken(token) {
    if (!token) return null;
    const db = getContentDb();
    const share = db.prepare('SELECT * FROM shares WHERE token = ? AND is_active = 1').get(token);
    if (!share || isExpired(share)) return null;
    const documents = db.prepare(`
        SELECT d.id, d.title, d.slug, d.file
        FROM share_items si JOIN documents d ON d.id = si.document_id
        WHERE si.share_id = ? ORDER BY si.sort_order, si.id
    `).all(share.id);
    return { ...share, documents };
}

// Aufruf protokollieren (gedrosselt: max. 1× / 20 min).
export function recordView(shareId) {
    const db = getContentDb();
    const last = db.prepare("SELECT at FROM share_events WHERE share_id=? AND kind='view' ORDER BY at DESC LIMIT 1").get(shareId);
    if (last && Date.now() - last.at < 20 * 60 * 1000) return;
    logEvent(db, shareId, 'view');
}

export function recordDownload(shareId, detail = '') {
    logEvent(getContentDb(), shareId, 'download', detail);
}

// Freigabe für eine öffentliche Reaktion (aktiv + nicht abgelaufen).
export function getShareForResponse(token) {
    const share = getShareRawByToken(token);
    if (!share || !share.is_active || isExpired(share)) return null;
    return share;
}

// Arbeitgeber stellt eine Rückfrage.
export function addQuestion(shareId, message) {
    const db = getContentDb();
    logEvent(db, shareId, 'question', (message || '').toString().slice(0, 4000));
    db.prepare('UPDATE shares SET updated_at = ? WHERE id = ?').run(Date.now(), shareId);
}

// Arbeitgeber schlägt bis zu 4 Termine vor (+ optionale Nachricht).
export function addAppointment(shareId, slots, message) {
    const db = getContentDb();
    const clean = (slots || []).map((s) => (s || '').toString().trim()).filter(Boolean).slice(0, 4);
    db.prepare('UPDATE shares SET proposed_slots = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(clean), Date.now(), shareId);
    const detail = clean.length + ' Termin(e)' + (message ? ' · ' + message.toString().slice(0, 2000) : '');
    logEvent(db, shareId, 'appointment', detail);
}

// Arbeitgeber sagt ab (schließt den Prozess) — mit Feedback + 7 Sternen.
export function submitRejection(shareId, data) {
    const db = getContentDb();
    const clamp = (n) => Math.max(0, Math.min(5, Number(n) || 0));
    db.prepare(`UPDATE shares SET status='absage', employer_closed=1, feedback_at=@now,
        feedback_reason=@reason, rating_quality=@quality, rating_fit=@fit, rating_experience=@experience,
        rating_relevance=@relevance, rating_manner=@manner, rating_culture=@culture, rating_overall=@overall,
        updated_at=@now WHERE id=@id`).run({
        id: shareId, now: Date.now(),
        reason: (data.reason || '').toString().slice(0, 4000),
        quality: clamp(data.quality), fit: clamp(data.fit), experience: clamp(data.experience),
        relevance: clamp(data.relevance), manner: clamp(data.manner), culture: clamp(data.culture),
        overall: clamp(data.overall),
    });
    logEvent(db, shareId, 'status', 'absage');
    logEvent(db, shareId, 'rejection', (data.reason || '').toString().slice(0, 200));
}

// Admin bestätigt einen vorgeschlagenen Termin → wird zum Gesprächstermin.
export function confirmSlot(shareId, slot) {
    const db = getContentDb();
    const s = (slot || '').toString().trim();
    if (!s) return;
    db.prepare(`UPDATE shares SET confirmed_slot=@slot, interview_at=@slot, status='gespraech', updated_at=@now WHERE id=@id`)
        .run({ id: shareId, slot: s, now: Date.now() });
    logEvent(db, shareId, 'slot_confirmed', s);
    logEvent(db, shareId, 'status', 'gespraech');
}

export function getShareEvents(shareId) {
    return getContentDb().prepare('SELECT kind, detail, at FROM share_events WHERE share_id = ? ORDER BY at ASC, id ASC').all(shareId);
}

// Bewerbungen (nur Bewerbungs-Zwecke), mit Aggregaten für Übersicht + Signal.
export function getApplications() {
    const rows = getContentDb().prepare(`
        SELECT s.*,
            (SELECT COUNT(*) FROM share_items si WHERE si.share_id = s.id) AS item_count,
            (SELECT COUNT(*) FROM share_events e WHERE e.share_id = s.id AND e.kind='view') AS view_count,
            (SELECT MAX(at) FROM share_events e WHERE e.share_id = s.id AND e.kind='view') AS last_view,
            (SELECT COUNT(*) FROM share_events e WHERE e.share_id = s.id AND e.kind='download') AS download_count,
            (SELECT MAX(at) FROM share_events e WHERE e.share_id = s.id AND e.kind='download') AS last_download,
            (SELECT COUNT(*) FROM share_events e WHERE e.share_id = s.id AND e.kind IN ('question','appointment')) AS response_count,
            (SELECT MAX(at) FROM share_events e WHERE e.share_id = s.id AND e.kind IN ('question','appointment')) AS last_response
        FROM shares s
        WHERE s.purpose IN ('bewerbung', 'initiativ')
        ORDER BY s.created_at DESC, s.id DESC
    `).all();
    return rows.map((s) => {
        const running = !!s.is_active && !isExpired(s) && RUNNING_STATUS.includes(s.status || 'offen');
        // „engaged": Arbeitgeber hat reagiert oder der Status ist über „offen" hinaus.
        const engaged = s.response_count > 0 || !!s.interview_at || (s.status && s.status !== 'offen');
        return { ...s, expired: isExpired(s), running, engaged };
    });
}

// Kennzahlen für die Übersicht.
export function getApplicationStats() {
    const apps = getApplications();
    const total = apps.length;
    const laufend = apps.filter((a) => a.running).length;
    const zusagen = apps.filter((a) => a.status === 'zusage').length;
    const absagen = apps.filter((a) => a.status === 'absage').length;
    const responses = apps.filter((a) => (a.status || 'offen') !== 'offen').length;
    const responseRate = total ? Math.round((responses / total) * 100) : 0;

    // ø Antwortzeit (Tage) über Bewerbungen mit Zustelldatum + Entscheidungsdatum.
    const spans = apps
        .filter((a) => a.sent_at && a.decision_date && a.decision_date >= a.sent_at)
        .map((a) => (new Date(a.decision_date) - new Date(a.sent_at)) / 86400000);
    const avgResponseDays = spans.length ? Math.round(spans.reduce((x, y) => x + y, 0) / spans.length) : null;

    return { total, laufend, zusagen, absagen, responseRate, avgResponseDays };
}
