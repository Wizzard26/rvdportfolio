import { getContentDb } from './db';
import { blogEntries } from '@/lib/blog';
import { ensureBlogSeeded, ensureDocsSeeded } from './seedBlogDocs';

// Datenzugriff für redaktionelle Beiträge (Blog + Doku), Tabelle content_posts.
//
// Eine Engine, zwei Modi über die Spalte `type`:
//   'blog' → datierte Beiträge mit Kategorien (Übersicht + Einzelseite)
//   'doc'  → Doku-Seiten, über doc_group/parent_id zum Seitenbaum gruppiert
//
// `body` ist Markdown und wird erst im Frontend (src/lib/markdown.js) gerendert.
// `category` liegt als kommagetrennter Text vor und wird hier zu einem Array
// hydriert, damit Anzeige und Formular einfach bleiben.

function toArrayCsv(text) {
    return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// DB-Zeile → Anzeige-/Formularobjekt (Kategorien als Array).
function hydrate(row) {
    return {
        ...row,
        categoryList: toArrayCsv(row.category),
    };
}

// Seed aus der statischen blog.js — nur wenn noch gar keine Blog-Beiträge
// existieren. Bewusst als Entwurf (is_active = 0): Die Alt-Beiträge sind
// Platzhalter; das Veröffentlichen (und das spätere Entfernen von noindex)
// bleibt eine bewusste Entscheidung.
export function seedPostsIfEmpty() {
    const db = getContentDb();
    if (db.prepare("SELECT COUNT(*) AS n FROM content_posts WHERE type = 'blog'").get().n > 0) return;

    const insert = db.prepare(`
        INSERT INTO content_posts
            (type, slug, title, subline, teaser, body, category, author, image,
             published_at, is_active, sort_order, updated_at)
        VALUES
            ('blog', @slug, @title, @subline, @teaser, '', @category, @author, @image,
             @published_at, 0, @sort_order, @updated_at)
    `);
    const now = Date.now();
    const run = db.transaction((rows) => {
        rows.forEach((e, index) => {
            insert.run({
                slug: e.slug || '',
                title: e.title || '',
                subline: e.subline || '',
                teaser: e.teaser || '',
                category: Array.isArray(e.category) ? e.category.join(', ') : (e.category || ''),
                author: e.author || 'René van Dinter',
                image: e.image || '',
                published_at: e.date || '',
                sort_order: index,
                updated_at: now,
            });
        });
    });
    run(blogEntries);
}

// Alle Beiträge eines Typs, nach sort_order. `publicOnly` blendet Entwürfe aus.
export function getPosts({ type = 'blog', publicOnly = false } = {}) {
    const db = getContentDb();
    seedPostsIfEmpty();
    if (type === 'doc') ensureDocsSeeded(); else ensureBlogSeeded();
    const active = publicOnly ? 'AND is_active = 1' : '';
    return db.prepare(
        `SELECT * FROM content_posts WHERE type = ? ${active} ORDER BY sort_order, id`,
    ).all(type).map(hydrate);
}

export function getPost(id) {
    const row = getContentDb().prepare('SELECT * FROM content_posts WHERE id = ?').get(id);
    return row ? hydrate(row) : null;
}

export function getPostBySlug(type, slug) {
    seedPostsIfEmpty();
    if (type === 'doc') ensureDocsSeeded(); else ensureBlogSeeded();
    const row = getContentDb().prepare(
        'SELECT * FROM content_posts WHERE type = ? AND slug = ?',
    ).get(type, slug);
    return row ? hydrate(row) : null;
}

function fields(data) {
    return {
        type: data.type === 'doc' ? 'doc' : 'blog',
        slug: data.slug || '',
        title: data.title || '',
        subline: data.subline || '',
        teaser: data.teaser || '',
        body: data.body || '',
        category: data.category || '',
        author: data.author || 'René van Dinter',
        image: data.image || '',
        doc_group: data.doc_group || '',
        parent_id: Number(data.parent_id) || 0,
        space_id: Number(data.space_id) || 0,
        published_at: data.published_at || '',
        is_active: data.is_active ? 1 : 0,
        updated_at: Date.now(),
    };
}

export function createPost(data) {
    const db = getContentDb();
    const f = fields(data);
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM content_posts WHERE type = ?').get(f.type).m;
    return db.prepare(`
        INSERT INTO content_posts
            (type, slug, title, subline, teaser, body, category, author, image,
             doc_group, parent_id, space_id, published_at, is_active, sort_order, updated_at)
        VALUES
            (@type, @slug, @title, @subline, @teaser, @body, @category, @author, @image,
             @doc_group, @parent_id, @space_id, @published_at, @is_active, @sort_order, @updated_at)
    `).run({ ...f, sort_order: max + 1 }).lastInsertRowid;
}

export function updatePost(id, data) {
    getContentDb().prepare(`
        UPDATE content_posts SET
            type=@type, slug=@slug, title=@title, subline=@subline, teaser=@teaser,
            body=@body, category=@category, author=@author, image=@image,
            doc_group=@doc_group, parent_id=@parent_id, space_id=@space_id, published_at=@published_at,
            is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
    `).run({ ...fields(data), id });
}

// ── Doku-spezifisch: Seiten je Bereich (space) ──────────────────────────────

export function getDocsBySpace(spaceId, { publicOnly = false } = {}) {
    const db = getContentDb();
    ensureDocsSeeded();
    const active = publicOnly ? 'AND is_active = 1' : '';
    return db.prepare(
        `SELECT * FROM content_posts WHERE type='doc' AND space_id = ? ${active} ORDER BY sort_order, id`,
    ).all(spaceId).map(hydrate);
}

export function getDocBySpaceAndSlug(spaceId, slug) {
    ensureDocsSeeded();
    const row = getContentDb().prepare(
        "SELECT * FROM content_posts WHERE type='doc' AND space_id = ? AND slug = ?",
    ).get(spaceId, slug);
    return row ? hydrate(row) : null;
}

// Reihenfolge der Seiten innerhalb EINES Bereichs neu setzen. sort_order ist je
// Bereich gedacht (Abfragen filtern immer nach space_id) — Kollisionen zwischen
// Bereichen spielen daher keine Rolle.
export function reorderDocsInSpace(spaceId, orderedIds) {
    const db = getContentDb();
    const known = new Set(
        db.prepare("SELECT id FROM content_posts WHERE type='doc' AND space_id = ?").all(spaceId).map((r) => r.id),
    );
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare("UPDATE content_posts SET sort_order = ? WHERE id = ? AND space_id = ?");
        ids.forEach((id, index) => upd.run(index, id, spaceId));
    })();
}

export function setPostActive(id, active) {
    getContentDb().prepare('UPDATE content_posts SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deletePost(id) {
    getContentDb().prepare('DELETE FROM content_posts WHERE id = ?').run(id);
}

// Reihenfolge innerhalb eines Typs neu setzen (Drag & Drop, oben zuerst).
export function reorderPosts(type, orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM content_posts WHERE type = ?').all(type).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE content_posts SET sort_order = ? WHERE id = ? AND type = ?');
        ids.forEach((id, index) => upd.run(index, id, type));
    })();
}

// Eindeutigen Slug aus einem Titel bilden (für die „Neu"-Maske als Vorschlag).
export function slugify(text) {
    return (text || '')
        .toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
