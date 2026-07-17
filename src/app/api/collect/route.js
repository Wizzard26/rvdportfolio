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
import { insertEvent } from '@/lib/analytics/collect';

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

export async function POST(request) {
    try {
        const ua = request.headers.get('user-agent') || '';

        // Bots (inkl. der KI-Crawler) gar nicht erst erfassen.
        if (isBot(ua)) return new Response(null, { status: 204 });

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

        insertEvent({
            ts,
            day,
            session_id: typeof body.sid === 'string' ? body.sid.slice(0, 40) : null,
            // Hash-Fenster = Kalendermonat → wiederkehrende Besucher innerhalb ~30 Tagen.
            visitor_hash: visitorHash(ip, ua, monthUtc(ts)),
            type: body.type,
            path: typeof body.path === 'string' ? body.path.slice(0, 300) : null,
            ref_source: source,
            ref_domain: domain,
            ref_url: url,
            device: deviceFromUa(ua),
            browser: browserFromUa(ua),
            os: osFromUa(ua),
            country: countryFromIp(ip),
            name: typeof body.name === 'string' ? body.name.slice(0, 120) : null,
            duration_ms: Number.isFinite(body.duration) ? Math.max(0, Math.round(body.duration)) : null,
            value: Number.isFinite(body.value) ? body.value : null,
            meta: body.meta && typeof body.meta === 'object' ? body.meta : null,
        });

        return new Response(null, { status: 204 });
    } catch {
        // Bewusst still: Analytics-Fehler dürfen den Besuch nie beeinträchtigen.
        return new Response(null, { status: 204 });
    }
}
