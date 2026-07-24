import { getContentDb } from './db';
import { slugify } from './postsStore';
import { ensureDocsSeeded } from './seedBlogDocs';

// Datenzugriff für Doku-Bereiche (mehrere unabhängige Dokus, GitBook-artig).
// Jede Doku-Seite (content_posts type='doc') gehört über space_id zu einem
// Bereich. Der Seiten-Slug ist nur INNERHALB des Bereichs eindeutig.

// Stellt sicher, dass es mindestens einen Bereich gibt und ordnet „heimatlose"
// Doku-Seiten (space_id=0, z. B. aus der Zeit vor der Mehr-Doku-Fähigkeit)
// einem Standardbereich zu — idempotent.
export function ensureDefaultSpace() {
    const db = getContentDb();
    const orphanCount = db.prepare("SELECT COUNT(*) AS n FROM content_posts WHERE type='doc' AND space_id=0").get().n;
    const spaceCount = db.prepare('SELECT COUNT(*) AS n FROM doc_spaces').get().n;
    if (orphanCount === 0 && spaceCount > 0) return;

    let space = db.prepare('SELECT * FROM doc_spaces ORDER BY sort_order, id LIMIT 1').get();
    if (!space) {
        const id = db.prepare(
            'INSERT INTO doc_spaces (name, slug, description, sort_order, updated_at) VALUES (?, ?, ?, 0, ?)',
        ).run('Allgemein', 'allgemein', '', Date.now()).lastInsertRowid;
        space = { id };
    }
    if (orphanCount > 0) {
        db.prepare("UPDATE content_posts SET space_id=? WHERE type='doc' AND space_id=0").run(space.id);
    }
}

export function getSpaces({ publicOnly = false } = {}) {
    const db = getContentDb();
    ensureDocsSeeded();
    ensureDefaultSpace();
    const where = publicOnly ? 'WHERE is_active = 1' : '';
    return db.prepare(`SELECT * FROM doc_spaces ${where} ORDER BY sort_order, id`).all();
}

export function getSpace(id) {
    return getContentDb().prepare('SELECT * FROM doc_spaces WHERE id = ?').get(id) || null;
}

export function getSpaceBySlug(slug) {
    ensureDocsSeeded();
    ensureDefaultSpace();
    return getContentDb().prepare('SELECT * FROM doc_spaces WHERE slug = ?').get(slug) || null;
}

// Eindeutigen Bereichs-Slug bilden (hängt bei Kollision -2, -3 … an).
function uniqueSpaceSlug(db, base, exceptId = 0) {
    let slug = slugify(base) || 'bereich';
    let candidate = slug;
    let n = 1;
    const stmt = db.prepare('SELECT id FROM doc_spaces WHERE slug = ? AND id <> ?');
    while (stmt.get(candidate, exceptId)) {
        n += 1;
        candidate = `${slug}-${n}`;
    }
    return candidate;
}

export function createSpace({ name, description = '' }) {
    const clean = (name || '').trim();
    if (!clean) return null;
    const db = getContentDb();
    const slug = uniqueSpaceSlug(db, clean);
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM doc_spaces').get().m;
    return db.prepare(
        'INSERT INTO doc_spaces (name, slug, description, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)',
    ).run(clean, slug, description.trim(), max + 1, Date.now()).lastInsertRowid;
}

export function updateSpace(id, { name, description = '', is_active }) {
    const clean = (name || '').trim();
    const db = getContentDb();
    const slug = uniqueSpaceSlug(db, clean, id);
    db.prepare(
        'UPDATE doc_spaces SET name=?, slug=?, description=?, is_active=?, updated_at=? WHERE id=?',
    ).run(clean, slug, description.trim(), is_active ? 1 : 0, Date.now(), id);
}

export function setSpaceActive(id, active) {
    getContentDb().prepare('UPDATE doc_spaces SET is_active=?, updated_at=? WHERE id=?')
        .run(active ? 1 : 0, Date.now(), id);
}

// Bereich löschen — inklusive aller zugehörigen Doku-Seiten (bewusst kaskadierend:
// ein Bereich ohne Seiten hat keinen Sinn; der Admin löscht explizit).
export function deleteSpace(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare("DELETE FROM content_posts WHERE type='doc' AND space_id=?").run(id);
        db.prepare('DELETE FROM doc_spaces WHERE id=?').run(id);
    })();
}

export function reorderSpaces(orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM doc_spaces').all().map((r) => r.id));
    const ids = orderedIds.map(Number).filter((sid) => known.has(sid));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE doc_spaces SET sort_order=? WHERE id=?');
        ids.forEach((sid, index) => upd.run(index, sid));
    })();
}

// Anzahl Seiten je Bereich (für die Übersicht).
export function countPagesBySpace(id) {
    return getContentDb().prepare("SELECT COUNT(*) AS n FROM content_posts WHERE type='doc' AND space_id=?").get(id).n;
}
