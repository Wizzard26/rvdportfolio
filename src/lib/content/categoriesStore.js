import { getContentDb } from './db';
import { blogCategories } from '@/lib/blog';

// Datenzugriff für Blog-Kategorien (admin-verwaltet). Beiträge referenzieren
// Kategorien über den Namen (CSV in content_posts.category) — diese Tabelle ist
// die pflegbare Auswahlliste. Umbenennen/Löschen ändert Bestandsbeiträge NICHT
// (sie behalten den gespeicherten Namen); nur die Auswahl wird angepasst.

// Seed aus der statischen blogCategories — nur wenn die Tabelle leer ist.
export function seedCategoriesIfEmpty() {
    const db = getContentDb();
    if (db.prepare('SELECT COUNT(*) AS n FROM post_categories').get().n > 0) return;
    const insert = db.prepare('INSERT OR IGNORE INTO post_categories (name, sort_order, updated_at) VALUES (?, ?, ?)');
    const now = Date.now();
    db.transaction(() => {
        blogCategories.forEach((c, index) => insert.run(c.name, index, now));
    })();
}

// `publicOnly` blendet inaktive Kategorien aus — für die Filter-Sidebar und die
// Auswahl im Beitragsformular. Das Admin (Kategorien-Verwaltung) lädt alle.
export function getCategories({ publicOnly = false } = {}) {
    const db = getContentDb();
    seedCategoriesIfEmpty();
    const where = publicOnly ? 'WHERE is_active = 1' : '';
    return db.prepare(`SELECT * FROM post_categories ${where} ORDER BY sort_order, id`).all();
}

export function setCategoryActive(id, active) {
    getContentDb().prepare('UPDATE post_categories SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

// Legt eine Kategorie an (Duplikate/Leereingaben werden ignoriert).
export function createCategory(name) {
    const clean = (name || '').trim();
    if (!clean) return;
    const db = getContentDb();
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM post_categories').get().m;
    db.prepare('INSERT OR IGNORE INTO post_categories (name, sort_order, updated_at) VALUES (?, ?, ?)')
        .run(clean, max + 1, Date.now());
}

export function deleteCategory(id) {
    getContentDb().prepare('DELETE FROM post_categories WHERE id = ?').run(id);
}

export function reorderCategories(orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM post_categories').all().map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE post_categories SET sort_order = ? WHERE id = ?');
        ids.forEach((id, index) => upd.run(index, id));
    })();
}
