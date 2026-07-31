import { getContentDb } from './db';

// Vertrauliche Referenzen: showcase-ähnliche Arbeitsproben, die NICHT öffentlich
// gezeigt werden dürfen, aber gezielt über eine private Freigabe-Seite
// (/freigabe/<token>, noindex) mitgegeben werden können. Eigener Inhaltstyp,
// physisch getrennt vom öffentlichen Showcase. Jede Referenz hat 0..n Screenshots
// (mit KI-Kennzeichnung). Zuordnung zu einer Freigabe: siehe sharesStore
// (setPrivateRefs / getShareByToken).

const STATUSES = new Set(['live', 'in_entwicklung']);

function fields(data) {
    const status = STATUSES.has(data.status) ? data.status : 'live';
    return {
        title: (data.title || '').trim(),
        context: (data.context || '').trim(),
        description: (data.description || '').trim(),
        tech: (data.tech || '').trim(),
        status,
        is_active: data.is_active ? 1 : 0,
        now: Date.now(),
    };
}

// ─── Referenzen (Text) ────────────────────────────────────────────────────

// Admin: alle (inkl. inaktiver), mit Screenshot-Anzahl für die Liste.
export function getPrivateRefs() {
    return getContentDb().prepare(`
        SELECT r.*, (SELECT COUNT(*) FROM private_ref_images i WHERE i.ref_id = r.id) AS image_count
        FROM private_refs r ORDER BY r.sort_order, r.id
    `).all();
}

// Nur aktive (für den Freigabe-Picker).
export function getActivePrivateRefs() {
    return getContentDb().prepare('SELECT * FROM private_refs WHERE is_active = 1 ORDER BY sort_order, id').all();
}

// Einzelne Referenz inkl. ihrer Screenshots (fürs Admin-Bearbeiten).
export function getPrivateRef(id) {
    const db = getContentDb();
    const ref = db.prepare('SELECT * FROM private_refs WHERE id = ?').get(Number(id));
    if (!ref) return null;
    return { ...ref, images: getRefImages(ref.id) };
}

export function createPrivateRef(data) {
    const db = getContentDb();
    const f = fields(data);
    // Neue Einträge oben einsortieren (wie bei den Referenzen/Stimmen).
    const create = db.transaction(() => {
        db.prepare('UPDATE private_refs SET sort_order = sort_order + 1').run();
        return db.prepare(`
            INSERT INTO private_refs (title, context, description, tech, status, is_active, sort_order, created_at, updated_at)
            VALUES (@title, @context, @description, @tech, @status, @is_active, 0, @now, @now)
        `).run(f).lastInsertRowid;
    });
    return create();
}

export function updatePrivateRef(id, data) {
    const f = fields(data);
    getContentDb().prepare(`
        UPDATE private_refs SET title=@title, context=@context, description=@description,
        tech=@tech, status=@status, is_active=@is_active, updated_at=@now WHERE id=@id
    `).run({ id: Number(id), ...f });
}

export function setPrivateRefActive(id, active) {
    getContentDb().prepare('UPDATE private_refs SET is_active=?, updated_at=? WHERE id=?')
        .run(active ? 1 : 0, Date.now(), Number(id));
}

export function deletePrivateRef(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM private_ref_images WHERE ref_id = ?').run(Number(id));
        db.prepare('DELETE FROM share_private_refs WHERE ref_id = ?').run(Number(id));
        db.prepare('DELETE FROM private_refs WHERE id = ?').run(Number(id));
    })();
}

export function reorderPrivateRefs(orderedIds) {
    const db = getContentDb();
    const upd = db.prepare('UPDATE private_refs SET sort_order=?, updated_at=? WHERE id=?');
    const now = Date.now();
    db.transaction(() => orderedIds.forEach((id, i) => upd.run(i, now, Number(id))))();
}

// ─── Screenshots je Referenz ──────────────────────────────────────────────

export function getRefImages(refId) {
    const id = Number(refId) || 0;
    if (!id) return [];
    return getContentDb()
        .prepare('SELECT * FROM private_ref_images WHERE ref_id = ? ORDER BY sort_order, id')
        .all(id);
}

export function addRefImage({ ref_id, image, ai_image = 0 }) {
    const db = getContentDb();
    const rid = Number(ref_id) || 0;
    const clean = (image || '').trim();
    if (!rid || !clean) return null;
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM private_ref_images WHERE ref_id = ?').get(rid).m;
    return db.prepare(
        'INSERT INTO private_ref_images (ref_id, image, ai_image, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)',
    ).run(rid, clean, ai_image ? 1 : 0, max + 1, Date.now()).lastInsertRowid;
}

export function getRefImage(id) {
    return getContentDb().prepare('SELECT * FROM private_ref_images WHERE id = ?').get(Number(id)) || null;
}

export function updateRefImage(id, { image, ai_image } = {}) {
    const db = getContentDb();
    const row = db.prepare('SELECT * FROM private_ref_images WHERE id = ?').get(Number(id));
    if (!row) return;
    const next = {
        image: image != null && String(image).trim() ? String(image).trim() : row.image,
        ai_image: ai_image != null ? (ai_image ? 1 : 0) : row.ai_image,
    };
    db.prepare('UPDATE private_ref_images SET image=?, ai_image=?, updated_at=? WHERE id=?')
        .run(next.image, next.ai_image, Date.now(), Number(id));
}

export function setRefImageAi(id, ai) {
    getContentDb().prepare('UPDATE private_ref_images SET ai_image = ?, updated_at = ? WHERE id = ?')
        .run(ai ? 1 : 0, Date.now(), Number(id));
}

export function deleteRefImage(id) {
    getContentDb().prepare('DELETE FROM private_ref_images WHERE id = ?').run(Number(id));
}

export function reorderRefImages(refId, orderedIds) {
    const db = getContentDb();
    const rid = Number(refId) || 0;
    const known = new Set(db.prepare('SELECT id FROM private_ref_images WHERE ref_id = ?').all(rid).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((i) => known.has(i));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE private_ref_images SET sort_order = ? WHERE id = ? AND ref_id = ?');
        ids.forEach((i, index) => upd.run(index, i, rid));
    })();
}
