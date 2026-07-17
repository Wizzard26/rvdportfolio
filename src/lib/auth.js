// Minimale Session-Absicherung für den Admin-Bereich (/dashboard).
//
// Ein einzelner Admin, kein User-System: Statt einer Auth-Bibliothek reicht ein
// signiertes Session-Cookie. Der Token ist ein selbstgebautes, kompaktes JWT-
// Äquivalent — Payload + HMAC-SHA256-Signatur.
//
// Bewusst über die Web-Crypto-API (globales `crypto.subtle`) statt Node-`crypto`:
// Die Middleware läuft in der Edge-Runtime, in der das Node-Modul nicht
// verfügbar ist. Web Crypto gibt es in beiden Runtimes (Edge + Node 20).
//
// `crypto.subtle.verify` vergleicht die Signatur intern zeitkonstant — es gibt
// also keinen selbstgeschriebenen, timing-anfälligen Signaturvergleich.

const encoder = new TextEncoder();

// Cookie-Name und Laufzeit. 8 Stunden = ein Arbeitstag; danach neu einloggen.
export const SESSION_COOKIE = 'rvd_admin_session';
export const MAX_AGE_SECONDS = 60 * 60 * 8;

function bytesToBase64Url(bytes) {
    let binary = '';
    for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value) {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function stringToBase64Url(value) {
    return bytesToBase64Url(encoder.encode(value));
}

function base64UrlToString(value) {
    return new TextDecoder().decode(base64UrlToBytes(value));
}

// Importiert AUTH_SECRET als HMAC-Schlüssel. Fehlt das Secret, wird geworfen —
// die Aufrufer behandeln das als "nicht authentifiziert" (fail closed): ohne
// konfiguriertes Secret kommt niemand in den Admin-Bereich.
async function getKey() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error('AUTH_SECRET ist nicht gesetzt');
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    );
}

/**
 * Erzeugt einen signierten Session-Token für den Admin.
 * Format: base64url(payload).base64url(signatur)
 */
export async function createSessionToken() {
    const payload = {
        sub: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    };
    const payloadB64 = stringToBase64Url(JSON.stringify(payload));
    const key = await getKey();
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
    return `${payloadB64}.${bytesToBase64Url(signature)}`;
}

/**
 * Prüft Signatur und Ablaufzeit eines Session-Tokens.
 * Gibt bei jedem Fehler (fehlend, manipuliert, abgelaufen, Secret fehlt) false
 * zurück — nie eine Exception, damit die Middleware simpel bleibt.
 */
export async function verifySessionToken(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, signatureB64] = parts;
    try {
        const key = await getKey();
        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            base64UrlToBytes(signatureB64),
            encoder.encode(payloadB64),
        );
        if (!valid) return false;

        const payload = JSON.parse(base64UrlToString(payloadB64));
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
        return true;
    } catch {
        return false;
    }
}

/**
 * Prüft das eingegebene Passwort gegen ADMIN_PASSWORD (server-seitig, nie im
 * Client-Bundle — wie das Mail-Passwort). Zeitkonstanter Vergleich.
 */
export function verifyPassword(input) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || typeof input !== 'string') return false;

    const a = encoder.encode(input);
    const b = encoder.encode(expected);
    if (a.length !== b.length) return false;

    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
}
