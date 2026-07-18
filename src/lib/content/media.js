import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

// Bild-Verwaltung für die Showcase-Projekte — analog zu documents.js (PDFs).
//
// Zwei Quellen:
// - Repo-Bilder in public/img/casestudy/ → statisch unter /img/casestudy/...
// - Hochgeladene Bilder im Volume-Ordner → ausgeliefert via /media/... (Route).

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const SAFE_NAME = /^[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif)$/i;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export function isSafeImageName(name) {
    return typeof name === 'string' && SAFE_NAME.test(name) && !name.includes('..');
}

// Ordner für hochgeladene Bilder im selben Volume wie content.db.
export function mediaDir() {
    const base = process.env.CONTENT_DB_PATH
        ? dirname(process.env.CONTENT_DB_PATH)
        : (process.env.ANALYTICS_DB_PATH ? dirname(process.env.ANALYTICS_DB_PATH) : './data');
    return join(base, 'media');
}

// Rekursiv Bilddateien unter einem Verzeichnis sammeln (nur eine Ebene tief +
// Unterordner der Case-Study-Bilder).
function collect(dir, prefix, out, source) {
    let items = [];
    try { items = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
        if (it.isDirectory()) {
            collect(join(dir, it.name), `${prefix}/${it.name}`, out, source);
        } else if (/\.(png|jpe?g|webp|gif)$/i.test(it.name)) {
            out.push({ label: `${prefix}/${it.name}`.replace(/^\//, ''), link: `${prefix}/${it.name}`, source });
        }
    }
}

// Auswahlliste fürs Dropdown: vorhandene Case-Study-Bilder + hochgeladene.
export function listImages() {
    const out = [];
    collect(join(process.cwd(), 'public', 'img', 'casestudy'), '/img/casestudy', out, 'repo');
    collect(mediaDir(), '/media', out, 'upload');
    return out.sort((a, b) => a.label.localeCompare(b.label));
}

// Speichert ein hochgeladenes Bild ins Volume und gibt den Link zurück.
export async function saveUploadedImage(file) {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return null;

    const okType = ALLOWED_MIME.has(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(file.name || '');
    if (!okType) throw new Error('Nur Bilddateien (PNG, JPG, WEBP, GIF) erlaubt.');
    if (file.size > MAX_BYTES) throw new Error('Bild ist zu groß (max. 5 MB).');

    const raw = basename(file.name || 'bild.jpg');
    const ext = (raw.match(/\.(png|jpe?g|webp|gif)$/i)?.[0] || '.jpg').toLowerCase();
    const cleaned = raw.replace(/\.(png|jpe?g|webp|gif)$/i, '').replace(/[^A-Za-z0-9._-]/g, '_') || 'bild';
    const name = `${Date.now()}-${cleaned}${ext}`;

    const dir = mediaDir();
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), Buffer.from(await file.arrayBuffer()));

    return `/media/${name}`;
}
