import { insertEvent, getSessionIdentity } from './collect';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import {
    isBot,
    deviceFromUa,
    browserFromUa,
    osFromUa,
    visitorHash,
    countryFromIp,
    clientIp,
} from './enrich';

// Serverseitiges Nutzungs-Log des CV-KI-Assistenten. Schreibt in dieselbe
// `events`-Tabelle wie das übrige Analytics (type='assistant'), damit Zeitraum-
// Filter, Aufbewahrung und Backup automatisch mitgelten. Gleiche PII-sichere
// Anreicherung wie /api/collect: IP und roher UA werden NIE gespeichert, nur der
// anonyme Tages-Hash, Ländercode und Geräte-/Browser-/OS-Familie.
//
//   name = 'open' → Widget wurde geöffnet
//   name = 'ask'  → eine Frage wurde gestellt; meta = { q, hit }
//     q   = Fragetext (gekürzt) – der Besucher tippt ihn selbst
//     hit = 'grounded' (echter Treffer) | 'soft' (Überblick-Thema) | 'none' (kein Treffer)
//         | 'spielerei' (Taschenrechner/Jailbreak-/KI-Test → gekontert, keine Content-Lücke)
//     kind = bei 'spielerei': 'math' | 'injection' | 'meta' (optional, für die Auswertung)

const HIT_CLASSES = new Set(['grounded', 'soft', 'none', 'spielerei']);
const MAX_Q = 200; // Fragetext defensiv kürzen

function dayUtc(ts) {
    return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthUtc(ts) {
    return new Date(ts).toISOString().slice(0, 7); // YYYY-MM (Hash-Fenster)
}

/**
 * Protokolliert ein anonymes Assistent-Nutzungs-Event. Fehler werden geschluckt
 * – Tracking darf den Assistenten nie stören.
 */
// Admin-Session-Cookie aus dem Cookie-Header lesen (eigene Tests nicht zählen).
function adminTokenFrom(headers) {
    const raw = headers.get('cookie') || '';
    const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    return hit ? decodeURIComponent(hit.slice(SESSION_COOKIE.length + 1)) : '';
}

export async function recordAssistantEvent({ headers, sid, event, question, hit, kind, path }) {
    try {
        if (event !== 'open' && event !== 'ask') return;

        const ua = headers.get('user-agent') || '';
        if (isBot(ua)) return; // Bots ignorieren (wie /api/collect)
        const adminToken = adminTokenFrom(headers);
        if (adminToken && (await verifySessionToken(adminToken))) return;

        const ts = Date.now();
        const ip = clientIp(headers); // nur transient, wird nicht gespeichert

        const cls = HIT_CLASSES.has(hit) ? hit : 'none';
        const meta = event === 'ask'
            ? {
                hit: cls,
                q: typeof question === 'string' ? question.trim().slice(0, MAX_Q) : '',
                ...(cls === 'spielerei' && ['math', 'injection', 'meta', 'payload', 'secrets', 'task'].includes(kind) ? { kind } : {}),
            }
            : null;

        const sessionId = typeof sid === 'string' ? sid.slice(0, 40) : null;
        const known = getSessionIdentity(sessionId);

        insertEvent({
            ts,
            day: dayUtc(ts),
            session_id: sessionId,
            visitor_hash: known?.visitor_hash || visitorHash(ip, ua, monthUtc(ts)),
            type: 'assistant',
            path: typeof path === 'string' ? path.slice(0, 300) : null,
            device: deviceFromUa(ua),
            browser: browserFromUa(ua),
            os: osFromUa(ua),
            country: known ? known.country : countryFromIp(ip),
            name: event,
            meta,
        });
    } catch {
        // still: Analytics-Fehler dürfen die Assistent-Antwort nie beeinträchtigen.
    }
}
