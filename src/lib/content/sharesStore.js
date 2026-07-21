import { randomBytes } from 'node:crypto';
import { getContentDb } from './db';

// Freigaben: benannte Sammlungen von Dokumenten, erreichbar über einen langen,
// nicht erratbaren Token unter /freigabe/<token> (z. B. für Bewerbungen).

function newToken() {
    // 18 Bytes → 24 Zeichen base64url, praktisch nicht erratbar.
    return randomBytes(18).toString('base64url');
}

// Zugriffscode (PLZ) tolerant vergleichen: Leerzeichen weg, klein.
export function normalizeCode(code) {
    return (code || '').toString().replace(/\s+/g, '').toLowerCase();
}

// Cookie-Name für die entsperrte Freigabe.
export function shareCookieName(id) {
    return `sf_${id}`;
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
        is_active: data.is_active ? 1 : 0,
        now: Date.now(),
    };
}

export function createShare(data) {
    const db = getContentDb();
    const token = newToken();
    const id = db.prepare(`
        INSERT INTO shares (token, title, message, purpose, company, street, zip, city, contact, position, access_code, is_active, updated_at)
        VALUES (@token, @title, @message, @purpose, @company, @street, @zip, @city, @contact, @position, @access_code, @is_active, @now)
    `).run({ token, ...fields(data) }).lastInsertRowid;
    setItems(db, id, data.documentIds);
    return { id, token };
}

export function updateShare(id, data) {
    const db = getContentDb();
    db.prepare(`
        UPDATE shares SET title=@title, message=@message, purpose=@purpose, company=@company,
            street=@street, zip=@zip, city=@city, contact=@contact, position=@position,
            access_code=@access_code, is_active=@is_active, updated_at=@now
        WHERE id=@id
    `).run({ id, ...fields(data) });
    setItems(db, id, data.documentIds);
}

export function setShareActive(id, active) {
    getContentDb().prepare('UPDATE shares SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteShare(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM share_items WHERE share_id = ?').run(id);
        db.prepare('DELETE FROM shares WHERE id = ?').run(id);
    })();
}

// Admin-Liste inkl. Dokumentanzahl.
export function getShares() {
    const db = getContentDb();
    return db.prepare(`
        SELECT s.*, (SELECT COUNT(*) FROM share_items si WHERE si.share_id = s.id) AS item_count
        FROM shares s ORDER BY s.updated_at DESC, s.id DESC
    `).all();
}

// Einzelne Freigabe fürs Bearbeiten (mit gewählten Dokument-IDs).
export function getShare(id) {
    const db = getContentDb();
    const share = db.prepare('SELECT * FROM shares WHERE id = ?').get(id);
    if (!share) return null;
    const documentIds = db.prepare('SELECT document_id FROM share_items WHERE share_id = ? ORDER BY sort_order, id')
        .all(id).map((r) => r.document_id);
    return { ...share, documentIds };
}

// Freigabe zum Token unabhängig vom Aktiv-Status (für „geschlossen"-Hinweis
// und das Selbst-Schließen).
export function getShareRawByToken(token) {
    if (!token) return null;
    return getContentDb().prepare('SELECT * FROM shares WHERE token = ?').get(token) || null;
}

// Öffentlicher Zugriff über den Token: nur aktive Freigaben; liefert die
// enthaltenen Dokumente (unabhängig vom Entwurf-Status der Dokumente, da bewusst
// kuratiert), in der festgelegten Reihenfolge.
export function getShareByToken(token) {
    if (!token) return null;
    const db = getContentDb();
    const share = db.prepare('SELECT * FROM shares WHERE token = ? AND is_active = 1').get(token);
    if (!share) return null;
    const documents = db.prepare(`
        SELECT d.id, d.title, d.slug, d.file
        FROM share_items si JOIN documents d ON d.id = si.document_id
        WHERE si.share_id = ?
        ORDER BY si.sort_order, si.id
    `).all(share.id);
    return { ...share, documents };
}
