import { getContentDb } from './db';
import { getSetting, setSetting } from './settingsStore';

export const VITA_SETTING_KEY = 'vita_document_id';
export const VITA_TEXT_KEY = 'vita_button_text';
export const VITA_TEXT_DEFAULT = 'Vita als Download';

// Beschriftung des „Vita als Download"-Buttons (im Admin änderbar).
export function getVitaButtonText() {
    const t = getSetting(VITA_TEXT_KEY);
    return (t && t.trim()) ? t : VITA_TEXT_DEFAULT;
}

// Datenzugriff für den Dokumente-Bereich (herunterladbare PDFs, z. B. die Vita).
//
// Die eigentlichen Dateien liegen als Repo-PDF (/document/...) oder als Upload im
// Volume (/documents/...) — siehe documents.js. Diese Tabelle hält nur die
// Metadaten (Titel, Kennung, aktueller Datei-Link) und die Reihenfolge.

// Kennung normalisieren: klein, nur a–z, 0–9 und Bindestrich.
export function normalizeSlug(slug) {
    return (slug || '').toString().trim().toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

// Seed: ein „Vita"-Dokument, damit der bestehende Download-Button identisch
// weiterläuft und danach im Admin pflegbar ist. Nur wenn die Tabelle leer ist.
export function seedDocumentsIfEmpty() {
    const db = getContentDb();
    if (db.prepare('SELECT COUNT(*) AS n FROM documents').get().n > 0) return;
    const info = db.prepare(`
        INSERT INTO documents (title, slug, file, is_active, sort_order, updated_at)
        VALUES (@title, @slug, @file, 1, 0, @now)
    `).run({ title: 'Vita / Lebenslauf', slug: 'vita', file: '/document/Vita.pdf', now: Date.now() });
    // Vita-Download standardmäßig diesem Dokument zuordnen (per Auswahl änderbar).
    setSetting(VITA_SETTING_KEY, info.lastInsertRowid);
}

// Stellt sicher, dass die Vita-Einstellung existiert — auch in einer bereits
// befüllten DB (Server), wo der Seed nicht mehr greift. Setzt sie beim Fehlen
// auf das Dokument mit Kennung „vita". Gibt die gewählte ID als String zurück.
export function ensureVitaSetting() {
    seedDocumentsIfEmpty();
    const raw = getSetting(VITA_SETTING_KEY); // null = nie gesetzt, '' = bewusst „keins"
    if (raw === null) {
        const doc = getDocumentBySlug('vita');
        if (doc) { setSetting(VITA_SETTING_KEY, doc.id); return String(doc.id); }
        return '';
    }
    return raw;
}

// Das aktive Dokument für den „Vita als Download"-Button, oder null (dann nutzt
// die Vita-Seite den Hardcoded-Fallback). null bei „keins" oder wenn das gewählte
// Dokument fehlt/inaktiv ist.
export function getVitaDocument() {
    const id = Number(ensureVitaSetting());
    if (!id) return null;
    const doc = getDocument(id);
    return doc && doc.is_active ? doc : null;
}

export function getDocuments() {
    const db = getContentDb();
    seedDocumentsIfEmpty();
    return db.prepare('SELECT * FROM documents ORDER BY sort_order, id').all();
}

export function getActiveDocuments() {
    const db = getContentDb();
    seedDocumentsIfEmpty();
    return db.prepare('SELECT * FROM documents WHERE is_active = 1 ORDER BY sort_order, id').all();
}

export function getDocument(id) {
    return getContentDb().prepare('SELECT * FROM documents WHERE id = ?').get(id) || null;
}

// Aktives Dokument zu einer Kennung — für den Vita-Button und /download/<slug>.
export function getDocumentBySlug(slug) {
    const s = normalizeSlug(slug);
    if (!s) return null;
    const db = getContentDb();
    seedDocumentsIfEmpty();
    return db.prepare('SELECT * FROM documents WHERE slug = ? AND is_active = 1 ORDER BY sort_order, id LIMIT 1').get(s) || null;
}

function fields(data) {
    return {
        title: (data.title || '').trim(),
        slug: normalizeSlug(data.slug),
        file: data.file || '',
        is_active: data.is_active ? 1 : 0,
        updated_at: Date.now(),
    };
}

export function createDocument(data) {
    const db = getContentDb();
    const f = fields(data);
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM documents').get().m;
    return db.prepare(`
        INSERT INTO documents (title, slug, file, is_active, sort_order, updated_at)
        VALUES (@title, @slug, @file, @is_active, @sort_order, @updated_at)
    `).run({ ...f, sort_order: max + 1 }).lastInsertRowid;
}

export function updateDocument(id, data) {
    getContentDb().prepare(`
        UPDATE documents SET title=@title, slug=@slug, file=@file, is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
    `).run({ ...fields(data), id });
}

export function setDocumentActive(id, active) {
    getContentDb().prepare('UPDATE documents SET is_active = ?, updated_at = ? WHERE id = ?')
        .run(active ? 1 : 0, Date.now(), id);
}

export function deleteDocument(id) {
    getContentDb().prepare('DELETE FROM documents WHERE id = ?').run(id);
}

export function reorderDocuments(orderedIds) {
    const db = getContentDb();
    const known = new Set(db.prepare('SELECT id FROM documents').all().map((r) => r.id));
    const ids = orderedIds.map(Number).filter((id) => known.has(id));
    if (!ids.length) return;
    db.transaction(() => {
        const upd = db.prepare('UPDATE documents SET sort_order = ? WHERE id = ?');
        ids.forEach((id, index) => upd.run(index, id));
    })();
}
