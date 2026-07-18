import { getContentDb } from './db';
import { showcaseProjects } from '@/lib/showcaseProjects';

// Datenzugriff für die Showcase-Projekte (Case Studies).
//
// Speicherung: intro als Text mit Leerzeile zwischen Absätzen, features als Text
// mit Zeilenumbruch je Punkt, tech kommagetrennt — im Store zu Arrays geparst,
// damit die Anzeige einfach bleibt.

function toArrayParagraphs(text) {
    return (text || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}
function toArrayLines(text) {
    return (text || '').split('\n').map((s) => s.trim()).filter(Boolean);
}
function toArrayCsv(text) {
    return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// DB-Zeile → Anzeige-/Formularobjekt (Arrays statt Textblöcke).
function hydrate(row) {
    return {
        ...row,
        introList: toArrayParagraphs(row.intro),
        featureList: toArrayLines(row.features),
        techList: toArrayCsv(row.tech),
    };
}

// Seed aus der statischen showcaseProjects.js — nur wenn leer.
export function seedShowcaseIfEmpty() {
    const db = getContentDb();
    if (db.prepare('SELECT COUNT(*) AS n FROM showcase_projects').get().n > 0) return;

    const insert = db.prepare(`
        INSERT INTO showcase_projects
            (category, variant, name, headline, intro, features, tech, media_type, media,
             schema_type, application_category, sort_order, updated_at)
        VALUES
            (@category, @variant, @name, @headline, @intro, @features, @tech, @media_type, @media,
             @schema_type, @application_category, @sort_order, @updated_at)
    `);
    const now = Date.now();
    const perCat = {};
    const seed = db.transaction((projects) => {
        for (const p of projects) {
            const cat = p.category || 'shopware';
            perCat[cat] = (perCat[cat] ?? -1) + 1;
            insert.run({
                category: cat,
                variant: p.variant || 'full',
                name: p.name || '',
                headline: p.headline || '',
                intro: Array.isArray(p.intro) ? p.intro.join('\n\n') : (p.intro || ''),
                features: Array.isArray(p.features) ? p.features.join('\n') : (p.features || ''),
                tech: Array.isArray(p.tech) ? p.tech.join(', ') : (p.tech || ''),
                media_type: p.media_type || 'none',
                media: p.media || '',
                schema_type: p.schema_type || p.type || '',
                application_category: p.application_category || p.applicationCategory || '',
                sort_order: perCat[cat],
                updated_at: now,
            });
        }
    });
    seed(showcaseProjects);
}

// Alle Projekte (für Admin + JSON-LD), nach Kategorie & sort_order.
// `publicOnly` blendet Entwürfe (is_active=0) aus — für die öffentliche Seite.
export function getProjects({ publicOnly = false } = {}) {
    const db = getContentDb();
    seedShowcaseIfEmpty();
    const where = publicOnly ? 'WHERE is_active = 1' : '';
    return db.prepare(`SELECT * FROM showcase_projects ${where} ORDER BY category, sort_order, id`).all().map(hydrate);
}

export function getProjectsByCategory(category) {
    const db = getContentDb();
    seedShowcaseIfEmpty();
    return db.prepare('SELECT * FROM showcase_projects WHERE category = ? ORDER BY sort_order, id').all(category).map(hydrate);
}

export function getProject(id) {
    const row = getContentDb().prepare('SELECT * FROM showcase_projects WHERE id = ?').get(id);
    return row ? hydrate(row) : null;
}

function fields(data) {
    return {
        category: data.category || 'shopware',
        variant: data.variant || 'full',
        name: data.name || '',
        headline: data.headline || '',
        intro: data.intro || '',
        features: data.features || '',
        tech: data.tech || '',
        media_type: data.media_type || 'none',
        media: data.media || '',
        schema_type: data.schema_type || '',
        application_category: data.application_category || '',
        is_active: data.is_active ? 1 : 0,
        updated_at: Date.now(),
    };
}

export function createProject(data) {
    const db = getContentDb();
    const f = fields(data);
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM showcase_projects WHERE category = ?').get(f.category).m;
    return db.prepare(`
        INSERT INTO showcase_projects
            (category, variant, name, headline, intro, features, tech, media_type, media,
             schema_type, application_category, is_active, sort_order, updated_at)
        VALUES
            (@category, @variant, @name, @headline, @intro, @features, @tech, @media_type, @media,
             @schema_type, @application_category, @is_active, @sort_order, @updated_at)
    `).run({ ...f, sort_order: max + 1 }).lastInsertRowid;
}

export function updateProject(id, data) {
    getContentDb().prepare(`
        UPDATE showcase_projects SET
            category=@category, variant=@variant, name=@name, headline=@headline, intro=@intro,
            features=@features, tech=@tech, media_type=@media_type, media=@media,
            schema_type=@schema_type, application_category=@application_category,
            is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
    `).run({ ...fields(data), id });
}

export function setProjectActive(id, active) {
    getContentDb().prepare('UPDATE showcase_projects SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteProject(id) {
    getContentDb().prepare('DELETE FROM showcase_projects WHERE id = ?').run(id);
}

// Reihenfolge innerhalb einer Kategorie neu setzen (Drag & Drop, oben zuerst).
export function reorderProjects(category, orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM showcase_projects WHERE category = ?').all(category).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE showcase_projects SET sort_order = ? WHERE id = ? AND category = ?');
        ids.forEach((id, index) => upd.run(index, id, category));
    })();
}
