import { mkdirSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

// Verwaltung der Zeugnis-/Zertifikat-PDFs.
//
// Zwei Quellen:
// - Repo-PDFs in public/document/ → statisch unter /document/... (wie bisher).
// - Hochgeladene PDFs im Volume-Ordner → ausgeliefert via /documents/... (Route).
//
// Das Volume (dort liegt auch content.db) ist zur Laufzeit persistent
// beschreibbar; /public wäre es nicht (Image-Neubau je Deploy).

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const SAFE_NAME = /^[A-Za-z0-9._-]+\.pdf$/i;

// Nur einfache Dateinamen ohne Pfadanteile — schützt die Auslieferungs-Route
// vor Path-Traversal.
export function isSafePdfName(name) {
    return typeof name === 'string' && SAFE_NAME.test(name) && !name.includes('..');
}

// Ordner für hochgeladene PDFs im selben Volume wie content.db.
export function documentsDir() {
    const base = process.env.CONTENT_DB_PATH
        ? dirname(process.env.CONTENT_DB_PATH)
        : (process.env.ANALYTICS_DB_PATH ? dirname(process.env.ANALYTICS_DB_PATH) : './data');
    return join(base, 'documents');
}

// Auswahlliste fürs Dropdown: vorhandene Repo-PDFs + hochgeladene PDFs.
export function listDocuments() {
    const out = [];
    try {
        const repoDir = join(process.cwd(), 'public', 'document');
        for (const f of readdirSync(repoDir)) {
            if (f.toLowerCase().endsWith('.pdf')) out.push({ label: f, link: `/document/${f}`, source: 'repo' });
        }
    } catch { /* Ordner fehlt → ignorieren */ }
    try {
        for (const f of readdirSync(documentsDir())) {
            if (f.toLowerCase().endsWith('.pdf')) out.push({ label: f, link: `/documents/${f}`, source: 'upload' });
        }
    } catch { /* noch keine Uploads */ }
    return out.sort((a, b) => a.label.localeCompare(b.label));
}

// Speichert eine hochgeladene PDF ins Volume und gibt den Link zurück.
// Wirft bei ungültiger Datei (Typ/Größe) — der Aufrufer fängt das ab.
export async function saveUploadedPdf(file) {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return null;

    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (!isPdf) throw new Error('Nur PDF-Dateien erlaubt.');
    if (file.size > MAX_BYTES) throw new Error('PDF ist zu groß (max. 10 MB).');

    // Dateinamen säubern: nur einfacher Basisname, unsichere Zeichen ersetzen,
    // Zeitstempel-Präfix gegen Kollisionen.
    const raw = basename(file.name || 'dokument.pdf');
    const cleaned = raw.replace(/[^A-Za-z0-9._-]/g, '_').replace(/\.pdf$/i, '') || 'dokument';
    const name = `${Date.now()}-${cleaned}.pdf`;

    const dir = documentsDir();
    mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(dir, name), buffer);

    return `/documents/${name}`;
}

export { existsSync };
