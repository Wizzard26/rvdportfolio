import { randomBytes } from 'node:crypto';
import { getContentDb } from './db';
import { STATUS_ORDER, RUNNING_STATUS, RATING_FACTORS } from '@/lib/applicationStatus';

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

// Welche Referenzen/Stimmen dieser Freigabe zugeordnet sind (Reihenfolge = Slider-Reihenfolge).
function setTestimonials(db, shareId, testimonialIds) {
    const del = db.prepare('DELETE FROM share_testimonials WHERE share_id = ?');
    const ins = db.prepare('INSERT INTO share_testimonials (share_id, testimonial_id, sort_order) VALUES (?, ?, ?)');
    const known = new Set(db.prepare('SELECT id FROM testimonials').all().map((r) => r.id));
    db.transaction(() => {
        del.run(shareId);
        (testimonialIds || []).map(Number).filter((id) => known.has(id))
            .forEach((id, i) => ins.run(shareId, id, i));
    })();
}

// Welche vertraulichen Referenzen dieser Freigabe zugeordnet sind (Reihenfolge = Anzeige).
function setPrivateRefs(db, shareId, refIds) {
    const del = db.prepare('DELETE FROM share_private_refs WHERE share_id = ?');
    const ins = db.prepare('INSERT INTO share_private_refs (share_id, ref_id, sort_order) VALUES (?, ?, ?)');
    const known = new Set(db.prepare('SELECT id FROM private_refs').all().map((r) => r.id));
    db.transaction(() => {
        del.run(shareId);
        (refIds || []).map(Number).filter((id) => known.has(id))
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
        contact_gender: (data.contact_gender || '').trim(),
        position: (data.position || '').trim(),
        employment_type: (data.employment_type || '').trim(),
        hours_from: Math.max(0, parseInt(data.hours_from, 10) || 0),
        hours_to: Math.max(0, parseInt(data.hours_to, 10) || 0),
        work_model: (data.work_model || '').trim(),
        availability: (data.availability || '').trim(),
        salary_amount: (data.salary_amount || '').trim(),
        salary_period: (data.salary_period || '').trim(),
        salary_hours: Math.max(0, parseInt(data.salary_hours, 10) || 0),
        salary_public: data.salary_public ? 1 : 0,
        skills: (data.skills || '').trim(),
        highlights: (data.highlights || '').trim(),
        motivation: (data.motivation || '').trim(),
        mobility: (data.mobility || '').trim(),
        job_ref: (data.job_ref || '').trim(),
        show_showcase_cta: data.show_showcase_cta ? 1 : 0,
        email: (data.email || '').trim(),
        website: (data.website || '').trim(),
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
    zip=@zip, city=@city, contact=@contact, contact_gender=@contact_gender, position=@position,
    employment_type=@employment_type, hours_from=@hours_from, hours_to=@hours_to, work_model=@work_model,
    availability=@availability, salary_amount=@salary_amount, salary_period=@salary_period,
    salary_hours=@salary_hours, salary_public=@salary_public,
    skills=@skills, highlights=@highlights, motivation=@motivation, mobility=@mobility, job_ref=@job_ref,
    show_showcase_cta=@show_showcase_cta,
    email=@email, website=@website, access_code=@access_code,
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
    setTestimonials(db, id, data.testimonialIds);
    setPrivateRefs(db, id, data.privateRefIds);
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
    setTestimonials(db, id, data.testimonialIds);
    setPrivateRefs(db, id, data.privateRefIds);
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
        db.prepare('DELETE FROM share_testimonials WHERE share_id = ?').run(id);
        db.prepare('DELETE FROM share_private_refs WHERE share_id = ?').run(id);
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
    const testimonialIds = db.prepare('SELECT testimonial_id FROM share_testimonials WHERE share_id = ? ORDER BY sort_order, id')
        .all(id).map((r) => r.testimonial_id);
    const privateRefIds = db.prepare('SELECT ref_id FROM share_private_refs WHERE share_id = ? ORDER BY sort_order, id')
        .all(id).map((r) => r.ref_id);
    return { ...share, documentIds, testimonialIds, privateRefIds };
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
    // Zugeordnete Referenzen/Stimmen (nur aktive), in der gewählten Reihenfolge.
    const testimonials = db.prepare(`
        SELECT t.id, t.author, t.role, t.company, t.quote
        FROM share_testimonials st JOIN testimonials t ON t.id = st.testimonial_id
        WHERE st.share_id = ? AND t.is_active = 1 ORDER BY st.sort_order, st.id
    `).all(share.id);
    // Vertrauliche Referenzen (nur aktive) inkl. ihrer Screenshots, in Anzeigereihenfolge.
    const refs = db.prepare(`
        SELECT r.id, r.title, r.context, r.description, r.tech, r.status
        FROM share_private_refs sr JOIN private_refs r ON r.id = sr.ref_id
        WHERE sr.share_id = ? AND r.is_active = 1 ORDER BY sr.sort_order, sr.id
    `).all(share.id);
    const imgStmt = db.prepare('SELECT id, image, ai_image FROM private_ref_images WHERE ref_id = ? ORDER BY sort_order, id');
    const privateRefs = refs.map((r) => ({ ...r, images: imgStmt.all(r.id) }));
    return { ...share, documents, testimonials, privateRefs };
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

// Arbeitgeber schlägt bis zu 4 Termine vor (+ optional Ansprechpartner:in,
// weitere Teilnehmer und eine Anmerkung).
export function addAppointment(shareId, slots, extra = {}) {
    const db = getContentDb();
    const clean = (slots || []).map((s) => (s || '').toString().trim()).filter(Boolean).slice(0, 4);
    const contact = (extra.contact || '').toString().slice(0, 300);
    const people = (extra.people || '').toString().slice(0, 500);
    const message = (extra.message || '').toString().slice(0, 2000);
    db.prepare(`UPDATE shares SET proposed_slots=@slots, proposed_contact=@contact,
        proposed_people=@people, proposed_message=@message, updated_at=@now WHERE id=@id`)
        .run({ id: shareId, slots: JSON.stringify(clean), contact, people, message, now: Date.now() });
    const detail = clean.length + ' Termin(e)' + (message ? ' · ' + message : '');
    logEvent(db, shareId, 'appointment', detail);
}

// Ob für die Freigabe bereits eine Sternebewertung vorliegt.
function isRated(db, shareId) {
    const row = db.prepare('SELECT rated_at FROM shares WHERE id = ?').get(shareId);
    return !!(row && row.rated_at > 0);
}

// Arbeitgeber gibt (prozessunabhängig) eine Sternebewertung ab.
export function submitRating(shareId, data) {
    const db = getContentDb();
    const clamp = (n) => Math.max(0, Math.min(5, Number(n) || 0));
    const setCols = RATING_FACTORS.map((f) => `rating_${f.key}=@r_${f.key}`).join(', ');
    const params = { id: shareId, now: Date.now() };
    RATING_FACTORS.forEach((f) => { params[`r_${f.key}`] = clamp(data[f.key]); });
    db.prepare(`UPDATE shares SET ${setCols}, rated_at=@now, updated_at=@now WHERE id=@id`).run(params);
    logEvent(db, shareId, 'rating', RATING_FACTORS.map((f) => clamp(data[f.key])).join('/'));
}

// Arbeitgeber sagt ab (schließt den Prozess). Wurde noch nicht bewertet, werden
// die mit dem Formular übergebenen Sterne mit erfasst; sonst bleiben sie erhalten.
export function submitRejection(shareId, data) {
    const db = getContentDb();
    if (!isRated(db, shareId)) submitRating(shareId, data);
    db.prepare(`UPDATE shares SET status='absage', employer_closed=1, feedback_at=@now,
        feedback_reason=@reason, updated_at=@now WHERE id=@id`)
        .run({ id: shareId, now: Date.now(), reason: (data.reason || '').toString().slice(0, 4000) });
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

// Auswertung aller abgegebenen Sternebewertungen (prozessunabhängig).
export function getRatingSummary() {
    const db = getContentDb();
    const rows = db.prepare('SELECT * FROM shares WHERE rated_at > 0').all();
    const count = rows.length;
    const round1 = (n) => Math.round(n * 10) / 10;

    const factors = RATING_FACTORS.map((f) => {
        const vals = rows.map((r) => Number(r[`rating_${f.key}`]) || 0).filter((v) => v > 0);
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { key: f.key, label: f.label, avg: round1(avg), rated: vals.length };
    });

    // Gesamtdurchschnitt über alle vergebenen Einzelsterne.
    const all = factors.flatMap((f) => (f.rated ? Array(f.rated).fill(f.avg) : []));
    const overall = all.length ? round1(all.reduce((a, b) => a + b, 0) / all.length) : 0;

    return { count, factors, overall };
}
