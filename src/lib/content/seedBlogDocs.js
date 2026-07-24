import { getContentDb } from './db';
import docsSeed from './seed/docsSeed.json';
import blogSeed from './seed/blogSeed.json';

// Seedet Blog- und Doku-Inhalte aus committeten Seed-Dateien in die content.db –
// genau wie vita.js/showcaseProjects.js für Vita und Showcase. Dadurch reicht ein
// normaler `git push` (→ Build → Server-Start): Auf einer leeren Tabelle legt die
// App die Inhalte selbst an, ohne dass eine Datenbank hochgeladen werden muss.
//
// NICHT-destruktiv & idempotent: Es wird nur angelegt, was per Slug (bzw. Name)
// noch fehlt. Admin-editierte oder bereits vorhandene Inhalte bleiben unberührt,
// andere Systeme (Showcase, Vita, Tracking …) werden gar nicht angefasst.
//
// Der Modul-Flag sorgt dafür, dass der (etwas teurere) Abgleich nur einmal pro
// Serverprozess läuft, nicht bei jedem Request.

let docsChecked = false;
let blogChecked = false;

export function ensureDocsSeeded() {
    if (docsChecked) return;
    docsChecked = true;

    const db = getContentDb();
    const now = Date.now();
    const findSpace = db.prepare('SELECT id FROM doc_spaces WHERE slug = ?');
    const insSpace = db.prepare(
        'INSERT INTO doc_spaces (name, slug, description, sort_order, is_active, updated_at) VALUES (?, ?, ?, ?, 1, ?)',
    );
    const findPage = db.prepare("SELECT id FROM content_posts WHERE type='doc' AND space_id = ? AND slug = ?");
    const insPage = db.prepare(`
        INSERT INTO content_posts
            (type, slug, title, subline, teaser, body, category, author, image,
             doc_group, parent_id, space_id, published_at, is_active, sort_order, updated_at)
        VALUES
            ('doc', @slug, @title, @subline, @teaser, @body, '', 'René van Dinter', '',
             @doc_group, 0, @space_id, '', 1, @sort_order, @updated_at)
    `);

    db.transaction(() => {
        for (const space of docsSeed) {
            let row = findSpace.get(space.slug);
            const spaceId = row ? row.id
                : insSpace.run(space.name, space.slug, space.description || '', space.sort_order, now).lastInsertRowid;
            for (const p of space.pages) {
                if (findPage.get(spaceId, p.slug)) continue;
                insPage.run({
                    slug: p.slug, title: p.title, subline: p.subline || '', teaser: p.teaser || '',
                    body: p.body || '', doc_group: p.doc_group || '', space_id: spaceId,
                    sort_order: p.sort_order, updated_at: now,
                });
            }
        }
    })();
}

export function ensureBlogSeeded() {
    if (blogChecked) return;
    blogChecked = true;

    const db = getContentDb();
    const now = Date.now();
    const findCat = db.prepare('SELECT id FROM post_categories WHERE name = ?');
    const insCat = db.prepare('INSERT INTO post_categories (name, sort_order, is_active, updated_at) VALUES (?, ?, 1, ?)');
    const findPost = db.prepare("SELECT id FROM content_posts WHERE type='blog' AND slug = ?");
    const insPost = db.prepare(`
        INSERT INTO content_posts
            (type, slug, title, subline, teaser, body, category, author, image,
             doc_group, parent_id, space_id, published_at, is_active, sort_order, updated_at)
        VALUES
            ('blog', @slug, @title, @subline, @teaser, @body, @category, @author, @image,
             '', 0, 0, @published_at, 1, @sort_order, @updated_at)
    `);

    db.transaction(() => {
        for (const c of blogSeed.categories || []) {
            if (!findCat.get(c.name)) insCat.run(c.name, c.sort_order, now);
        }
        for (const p of blogSeed.posts || []) {
            if (findPost.get(p.slug)) continue;
            insPost.run({
                slug: p.slug, title: p.title, subline: p.subline || '', teaser: p.teaser || '',
                body: p.body || '', category: p.category || '', author: p.author || 'René van Dinter',
                image: p.image || '', published_at: p.published_at || '', sort_order: p.sort_order,
                updated_at: now,
            });
        }
    })();
}
