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

export function addProjectImage({ project_id, image, ai_image = 0 }) {
    const db = getContentDb();
    const pid = Number(project_id) || 0;
    const clean = (image || '').trim();
    if (!pid || !clean) return null;
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM showcase_images WHERE project_id = ?').get(pid).m;
    return db.prepare(
        'INSERT INTO showcase_images (project_id, image, ai_image, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)',
    ).run(pid, clean, ai_image ? 1 : 0, max + 1, Date.now()).lastInsertRowid;
}

export function setImageAi(id, ai) {
    getContentDb().prepare('UPDATE showcase_images SET ai_image = ?, updated_at = ? WHERE id = ?')
        .run(ai ? 1 : 0, Date.now(), Number(id));
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
