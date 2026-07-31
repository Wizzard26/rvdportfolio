import { insertEvent } from './collect';
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

const HIT_CLASSES = new Set(['grounded', 'soft', 'none']);
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
export function recordAssistantEvent({ headers, sid, event, question, hit, path }) {
    try {
        if (event !== 'open' && event !== 'ask') return;

        const ua = headers.get('user-agent') || '';
        if (isBot(ua)) return; // Bots ignorieren (wie /api/collect)

        const ts = Date.now();
        const ip = clientIp(headers); // nur transient, wird nicht gespeichert

        const meta = event === 'ask'
            ? {
                hit: HIT_CLASSES.has(hit) ? hit : 'none',
                q: typeof question === 'string' ? question.trim().slice(0, MAX_Q) : '',
            }
            : null;

        insertEvent({
            ts,
            day: dayUtc(ts),
            session_id: typeof sid === 'string' ? sid.slice(0, 40) : null,
            visitor_hash: visitorHash(ip, ua, monthUtc(ts)),
            type: 'assistant',
            path: typeof path === 'string' ? path.slice(0, 300) : null,
            device: deviceFromUa(ua),
            browser: browserFromUa(ua),
            os: osFromUa(ua),
            country: countryFromIp(ip),
            name: event,
            meta,
        });
    } catch {
        // still: Analytics-Fehler dürfen die Assistent-Antwort nie beeinträchtigen.
    }
}
