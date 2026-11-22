import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

// Serverseitiger Spam-Schutz für öffentliche Formulare (ohne Captcha, ohne
// Fremddienst, ohne Cookie):
//   1. Honeypot  – unsichtbares Feld, das nur Bots ausfüllen.
//   2. Form-Token – signierter Zeitstempel, den der Browser beim Anzeigen des
//      Formulars abholt. Fehlt er, ist er gefälscht, zu frisch (< MIN_AGE, also
//      maschinell ausgefüllt) oder zu alt, wird nicht versendet. Bots, die den
//      Endpoint direkt anfeuern, scheitern hier.
//   3. Inhalt    – zu viele Links / Linkspam-Muster.
//   4. Rate-Limit – je (gehashter) IP nur wenige Nachrichten pro Zeitfenster.
// Spam bekommt bewusst eine normale Erfolgsantwort, damit Bots nichts lernen.

const MIN_AGE_MS = 3 * 1000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 3;
const MAX_LINKS = 2;

function secret() {
    return process.env.AUTH_SECRET || process.env.ANALYTICS_SALT || 'dev-form-secret-change-me';
}

function sign(value) {
    return createHmac('sha256', secret()).update(`form|${value}`).digest('base64url');
}

export function issueFormToken() {
    const ts = Date.now().toString(36);
    return `${ts}.${sign(ts)}`;
}

// Liefert null bei gültigem Token, sonst den Ablehnungsgrund (fürs Log).
export function checkFormToken(token) {
    const [ts, sig] = (typeof token === 'string' ? token : '').split('.');
    if (!ts || !sig) return 'token-fehlt';
    const expected = Buffer.from(sign(ts));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'token-ungueltig';
    const age = Date.now() - parseInt(ts, 36);
    if (!Number.isFinite(age) || age < MIN_AGE_MS) return 'zu-schnell';
    if (age > MAX_AGE_MS) return 'token-abgelaufen';
    return null;
}

export function isHoneypotFilled(value) {
    return typeof value === 'string' && value.trim() !== '';
}

export function countLinks(text) {
    return ((text || '').match(/https?:\/\/|www\.|\[url=|<a\s/gi) || []).length;
}

export function tooManyLinks(text) {
    return countLinks(text) > MAX_LINKS;
}

// In-Memory-Rate-Limit (ein Node-Prozess genügt hier). IP nur gehasht im Speicher.
const hits = new Map();

export function rateLimited(ip) {
    const key = createHash('sha256').update(`${ip || ''}|${secret()}`).digest('hex').slice(0, 24);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX) {
        hits.set(key, recent);
        return true;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
        for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
    }
    return false;
}

// Kopie an den Absender: je (gehashter) Empfängeradresse nur wenige pro Tag, damit
// das Formular nicht als Relay für Nachrichten an fremde Adressen taugt.
const COPY_WINDOW_MS = 24 * 60 * 60 * 1000;
const COPY_MAX = 2;
const copies = new Map();

export function copyLimited(mail) {
    const key = createHash('sha256').update(`copy|${(mail || '').trim().toLowerCase()}|${secret()}`).digest('hex').slice(0, 24);
    const now = Date.now();
    const recent = (copies.get(key) || []).filter((t) => now - t < COPY_WINDOW_MS);
    if (recent.length >= COPY_MAX) {
        copies.set(key, recent);
        return true;
    }
    recent.push(now);
    copies.set(key, recent);
    if (copies.size > 5000) {
        for (const [k, v] of copies) if (!v.some((t) => now - t < COPY_WINDOW_MS)) copies.delete(k);
    }
    return false;
}

// Entfernt Links aus Text, der an eine vom Nutzer angegebene Adresse geht
// (keine klickbaren Phishing-/Spam-Links über das eigene Postfach).
export function stripLinks(text) {
    return (text || '').replace(/(?:https?:\/\/|www\.)[^\s<>"']+/gi, '[Link entfernt]');
}

export function escapeHtml(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function isEmail(s) {
    return /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test((s || '').trim());
}
