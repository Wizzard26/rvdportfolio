import { getContentDb } from './db';

// Datenzugriff für die Bilder eines Showcase-Projekts (media_type 'gallery'/'slider').
// Ein Projekt hat 0..n Bilder, jedes mit eigener KI-Kennzeichnung und Reihenfolge.

export function getProjectImages(projectId) {
    const id = Number(projectId) || 0;
    if (!id) return [];
    return getContentDb()
        .prepare('SELECT * FROM showcase_images WHERE project_id = ? ORDER BY sort_order, id')
        .all(id);
}

const KINDS = new Set(['image', 'video', 'embed']);

export function addProjectImage({ project_id, image, ai_image = 0, kind = 'image', autoplay = 1 }) {
    const db = getContentDb();
    const pid = Number(project_id) || 0;
    const clean = (image || '').trim();
    if (!pid || !clean) return null;
    const k = KINDS.has(kind) ? kind : 'image';
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM showcase_images WHERE project_id = ?').get(pid).m;
    return db.prepare(
        'INSERT INTO showcase_images (project_id, image, ai_image, kind, autoplay, sort_order, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(pid, clean, ai_image ? 1 : 0, k, autoplay ? 1 : 0, max + 1, Date.now()).lastInsertRowid;
}

export function getProjectImage(id) {
    return getContentDb().prepare('SELECT * FROM showcase_images WHERE id = ?').get(Number(id)) || null;
}

// Einzelnes Item bearbeiten (nur übergebene Felder ändern).
export function updateProjectImage(id, { image, ai_image, kind, autoplay } = {}) {
    const db = getContentDb();
    const row = db.prepare('SELECT * FROM showcase_images WHERE id = ?').get(Number(id));
    if (!row) return;
    const next = {
        image: image != null && String(image).trim() ? String(image).trim() : row.image,
        ai_image: ai_image != null ? (ai_image ? 1 : 0) : row.ai_image,
        kind: kind && KINDS.has(kind) ? kind : row.kind,
        autoplay: autoplay != null ? (autoplay ? 1 : 0) : row.autoplay,
    };
    db.prepare('UPDATE showcase_images SET image=?, ai_image=?, kind=?, autoplay=?, updated_at=? WHERE id=?')
        .run(next.image, next.ai_image, next.kind, next.autoplay, Date.now(), Number(id));
}

export function setImageAi(id, ai) {
    getContentDb().prepare('UPDATE showcase_images SET ai_image = ?, updated_at = ? WHERE id = ?')
        .run(ai ? 1 : 0, Date.now(), Number(id));
}

export function setImageAutoplay(id, on) {
    getContentDb().prepare('UPDATE showcase_images SET autoplay = ?, updated_at = ? WHERE id = ?')
        .run(on ? 1 : 0, Date.now(), Number(id));
}

export function deleteProjectImage(id) {
    getContentDb().prepare('DELETE FROM showcase_images WHERE id = ?').run(Number(id));
}

export function deleteAllProjectImages(projectId) {
    getContentDb().prepare('DELETE FROM showcase_images WHERE project_id = ?').run(Number(projectId));
}

// Reihenfolge innerhalb EINES Projekts neu setzen (Drag & Drop).
export function reorderProjectImages(projectId, orderedIds) {
    const db = getContentDb();
    const pid = Number(projectId) || 0;
    const known = new Set(db.prepare('SELECT id FROM showcase_images WHERE project_id = ?').all(pid).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((i) => known.has(i));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE showcase_images SET sort_order = ? WHERE id = ? AND project_id = ?');
        ids.forEach((i, index) => upd.run(index, i, pid));
    })();
}
