import { getContentDb } from './db';
import { galleryItems, GALLERIES, GALLERY_LABELS } from '@/lib/galleryItems';

// Datenzugriff für die Design-Galerien (Grafik & Webdesign-Tab).
//
// Vier Galerien in einer Tabelle, unterschieden durch `gallery`:
//   ecommerce | website  → Karte mit Bild, Titel, Beschreibung, einem Tech-Tag
//   logo | print         → nur Bild (title = Alt-Text)
//
// GALLERIES/GALLERY_LABELS leben client-sicher in galleryItems.js; hier nur
// re-exportiert, damit bestehende Importe aus dem Store weiter funktionieren.
export { GALLERIES, GALLERY_LABELS };

// Seed aus der statischen galleryItems.js — nur wenn leer.
export function seedGalleriesIfEmpty() {
    const db = getContentDb();
    if (db.prepare('SELECT COUNT(*) AS n FROM gallery_items').get().n > 0) return;

    const insert = db.prepare(`
        INSERT INTO gallery_items (gallery, title, description, technik, image, sort_order, updated_at)
        VALUES (@gallery, @title, @description, @technik, @image, @sort_order, @updated_at)
    `);
    const now = Date.now();
    const perGallery = {};
    const seed = db.transaction((items) => {
        for (const it of items) {
            const g = GALLERIES.includes(it.gallery) ? it.gallery : 'ecommerce';
            perGallery[g] = (perGallery[g] ?? -1) + 1;
            insert.run({
                gallery: g,
                title: it.title || '',
                description: it.description || '',
                technik: it.technik || '',
                image: it.image || '',
                sort_order: perGallery[g],
                updated_at: now,
            });
        }
    });
    seed(galleryItems);
}

// `publicOnly` blendet Entwürfe (is_active=0) aus — für die öffentliche Seite.
export function getGalleryItems({ publicOnly = false } = {}) {
    const db = getContentDb();
    seedGalleriesIfEmpty();
    const where = publicOnly ? 'WHERE is_active = 1' : '';
    return db.prepare(`SELECT * FROM gallery_items ${where} ORDER BY gallery, sort_order, id`).all();
}

export function getGalleryItemsByGallery(gallery) {
    const db = getContentDb();
    seedGalleriesIfEmpty();
    return db.prepare('SELECT * FROM gallery_items WHERE gallery = ? ORDER BY sort_order, id').all(gallery);
}

export function getGalleryItem(id) {
    return getContentDb().prepare('SELECT * FROM gallery_items WHERE id = ?').get(id) || null;
}

function fields(data) {
    return {
        gallery: GALLERIES.includes(data.gallery) ? data.gallery : 'ecommerce',
        title: data.title || '',
        description: data.description || '',
        technik: data.technik || '',
        image: data.image || '',
        is_active: data.is_active ? 1 : 0,
        updated_at: Date.now(),
    };
}

export function createGalleryItem(data) {
    const db = getContentDb();
    const f = fields(data);
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery_items WHERE gallery = ?').get(f.gallery).m;
    return db.prepare(`
        INSERT INTO gallery_items (gallery, title, description, technik, image, is_active, sort_order, updated_at)
        VALUES (@gallery, @title, @description, @technik, @image, @is_active, @sort_order, @updated_at)
    `).run({ ...f, sort_order: max + 1 }).lastInsertRowid;
}

export function updateGalleryItem(id, data) {
    getContentDb().prepare(`
        UPDATE gallery_items SET
            gallery=@gallery, title=@title, description=@description, technik=@technik,
            image=@image, is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
    `).run({ ...fields(data), id });
}

export function setGalleryItemActive(id, active) {
    getContentDb().prepare('UPDATE gallery_items SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteGalleryItem(id) {
    getContentDb().prepare('DELETE FROM gallery_items WHERE id = ?').run(id);
}

// Reihenfolge innerhalb einer Galerie neu setzen (Drag & Drop).
export function reorderGalleryItems(gallery, orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM gallery_items WHERE gallery = ?').all(gallery).map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE gallery_items SET sort_order = ? WHERE id = ? AND gallery = ?');
        ids.forEach((id, index) => upd.run(index, id, gallery));
    })();
}
