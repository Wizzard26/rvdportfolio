import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

// Bild-Verwaltung für die Showcase-Projekte — analog zu documents.js (PDFs).
//
// Zwei Quellen:
// - Repo-Bilder in public/img/casestudy/ → statisch unter /img/casestudy/...
// - Hochgeladene Bilder im Volume-Ordner → ausgeliefert via /media/... (Route).

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (Bild)
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB (kurze Demo-Clips; längere/HD → Embed)
const SAFE_NAME = /^[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif)$/i;
const SAFE_MEDIA_NAME = /^[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif|mp4|webm)$/i;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm']);

export function isSafeImageName(name) {
    return typeof name === 'string' && SAFE_NAME.test(name) && !name.includes('..');
}

// Bild- ODER Videodatei (für die /media-Route, die jetzt auch MP4/WEBM ausliefert).
export function isSafeMediaName(name) {
    return typeof name === 'string' && SAFE_MEDIA_NAME.test(name) && !name.includes('..');
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

// Best-Effort-Hinweis, ob ein hochgeladenes Bild laut Metadaten mit KI erzeugt
// wurde. Bewusst OHNE Zusatz-Abhängigkeit: scannt die Datei-Bytes (Anfang/Ende,
// wo Metadaten liegen) nach eindeutigen Provenienz-Markern (IPTC „Digital Source
// Type", C2PA/Content Credentials, bekannte KI-Tools). SynthID (Googles
// Pixel-Wasserzeichen) ist damit NICHT lesbar — dafür gibt es keine offene API.
// Deshalb ist das nur ein Vorschlag; verbindlich bleibt der manuelle Schalter.
// Bei Downscaling/Neukodierung sind solche Metadaten oft schon entfernt.
const AI_MARKERS = [
    'trainedAlgorithmicMedia',            // IPTC DigitalSourceType (KI-generiert)
    'compositeWithTrainedAlgorithmicMedia',
    'algorithmicMedia',
    'contentcredentials', 'content credentials', 'c2pa.assertions', 'c2pa.actions',
    'Made with Google AI', 'Made with Google', 'Google DeepMind', 'SynthID',
    'Gemini', 'Imagen', 'Midjourney', 'Stable Diffusion', 'DALL-E', 'DALL·E',
    'Adobe Firefly',
];

export async function imageAiHint(file) {
    try {
        if (!file || typeof file.arrayBuffer !== 'function' || !file.size) return false;
        const buf = Buffer.from(await file.arrayBuffer());
        const WIN = 262_144; // 256 KB an Anfang UND Ende scannen
        const head = buf.subarray(0, Math.min(buf.length, WIN)).toString('latin1');
        const tail = buf.length > WIN ? buf.subarray(buf.length - WIN).toString('latin1') : '';
        const hay = head + tail;
        return AI_MARKERS.some((m) => hay.includes(m));
    } catch {
        return false;
    }
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

// Speichert ein hochgeladenes Video (kurzer Clip) ins Volume. Für längere/HD-Videos
// ist der YouTube/Vimeo-Embed gedacht (kein Hosting/Limit).
export async function saveUploadedVideo(file) {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return null;

    const okType = ALLOWED_VIDEO_MIME.has(file.type) || /\.(mp4|webm)$/i.test(file.name || '');
    if (!okType) throw new Error('Nur Videodateien (MP4, WEBM) erlaubt.');
    if (file.size > MAX_VIDEO_BYTES) throw new Error('Video ist zu groß (max. 25 MB) – für längere Videos bitte YouTube/Vimeo-Link nutzen.');

    const raw = basename(file.name || 'video.mp4');
    const ext = (raw.match(/\.(mp4|webm)$/i)?.[0] || '.mp4').toLowerCase();
    const cleaned = raw.replace(/\.(mp4|webm)$/i, '').replace(/[^A-Za-z0-9._-]/g, '_') || 'video';
    const name = `${Date.now()}-${cleaned}${ext}`;

    const dir = mediaDir();
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), Buffer.from(await file.arrayBuffer()));

    return `/media/${name}`;
}
