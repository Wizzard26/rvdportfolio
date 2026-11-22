import {
    classifyReferrer,
    isBot,
    deviceFromUa,
    browserFromUa,
    osFromUa,
    visitorHash,
    countryFromIp,
    clientIp,
} from '@/lib/analytics/enrich';
import { insertEvent, getSessionIdentity } from '@/lib/analytics/collect';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// First-Party-Erfassungs-Endpoint. Der Client-Tracker schickt hierher seine
// Events (per fetch/keepalive oder navigator.sendBeacon). Läuft in der
// Node-Runtime (better-sqlite3 braucht Node, nicht Edge).
//
// Grundsatz: Analytics darf NIE einen Nutzer-Request stören. Deshalb alles in
// try/catch und immer 204 zurück — Fehler werden geschluckt, nicht sichtbar.

export const runtime = 'nodejs';
// Nicht vorab rendern/cachen — der Endpoint schreibt bei jedem Aufruf.
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set([
    'pageview', 'pageleave', 'cta', 'interaction', 'conversion',
    'scroll', 'section_view', 'outbound', 'download', 'vital',
    'form_start', 'form_abandon',
]);

function todayUtc(ts) {
    return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthUtc(ts) {
    return new Date(ts).toISOString().slice(0, 7); // YYYY-MM (Hash-Fenster)
}

// Zeitzone des Browsers (nur bei pageview, z. B. "Europe/Berlin") — grob genug,
// um nichts über die Person zu verraten, aber ein Plausibilitäts-Check fürs Land:
// Zeigt die IP z. B. "US", der Browser aber Europe/Berlin, kam der Aufruf sehr
// wahrscheinlich über VPN, Firmen-Proxy oder iCloud Private Relay.
function buildMeta(body) {
    const meta = body.meta && typeof body.meta === 'object' ? { ...body.meta } : {};
    if (body.type === 'pageview' && typeof body.tz === 'string' && /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(body.tz)) {
        meta.tz = body.tz.slice(0, 40);
    }
    return Object.keys(meta).length ? meta : null;
}

export async function POST(request) {
    try {
        const ua = request.headers.get('user-agent') || '';

        // Bots (inkl. der KI-Crawler) gar nicht erst erfassen.
        if (isBot(ua)) return new Response(null, { status: 204 });

        // Eigene Besuche nicht mitzählen: Wer als Admin angemeldet ist, schickt das
        // Session-Cookie (Pfad "/") auch hier mit — egal in welchem Tab.
        const adminToken = request.cookies.get(SESSION_COOKIE)?.value;
        if (adminToken && (await verifySessionToken(adminToken))) {
            return new Response(null, { status: 204 });
        }

        const body = await request.json().catch(() => null);
        if (!body || !ALLOWED_TYPES.has(body.type)) {
            return new Response(null, { status: 204 });
        }

        const ts = Date.now();
        const day = todayUtc(ts);
        const ip = clientIp(request.headers); // nur transient, wird nicht gespeichert

        // Referrer-Klassifikation nur beim Seiteneinstieg sinnvoll; der Client
        // schickt document.referrer bei pageview mit.
        const { source, domain, url } = classifyReferrer(body.referrer);

        const sessionId = typeof body.sid === 'string' ? body.sid.slice(0, 40) : null;
        // Innerhalb einer Sitzung bleiben Hash und Land stabil (siehe getSessionIdentity).
        const known = getSessionIdentity(sessionId);

        insertEvent({
            ts,
            day,
            session_id: sessionId,
            // Hash-Fenster = Kalendermonat → wiederkehrende Besucher innerhalb ~30 Tagen.
            visitor_hash: known?.visitor_hash || visitorHash(ip, ua, monthUtc(ts)),
            type: body.type,
            path: typeof body.path === 'string' ? body.path.slice(0, 300) : null,
            ref_source: source,
            ref_domain: domain,
            ref_url: url,
            device: deviceFromUa(ua),
            browser: browserFromUa(ua),
            os: osFromUa(ua),
            country: known ? known.country : countryFromIp(ip),
            name: typeof body.name === 'string' ? body.name.slice(0, 120) : null,
            duration_ms: Number.isFinite(body.duration) ? Math.max(0, Math.round(body.duration)) : null,
            value: Number.isFinite(body.value) ? body.value : null,
            meta: buildMeta(body),
        });

        return new Response(null, { status: 204 });
    } catch {
        // Bewusst still: Analytics-Fehler dürfen den Besuch nie beeinträchtigen.
        return new Response(null, { status: 204 });
    }
}
