import { getDb } from './db';

// Aggregations-Queries für das Analytics-Dashboard. Alle Funktionen erwarten
// einen Tages-Bereich `{ from, to }` (Strings 'YYYY-MM-DD', inklusive) und
// geben einfache Objekte/Arrays zurück, die die Server-Component direkt
// rendert. SQLite-Fensterfunktionen (ROW_NUMBER) sind verfügbar.

const RANGE = 'day BETWEEN @from AND @to';

// KPI-Kacheln: Besucher, Aufrufe, Verweildauer, Bounce, Conversions, CTAs.
export function getOverview(range) {
    const db = getDb();

    const visitors = db.prepare(
        `SELECT COUNT(DISTINCT visitor_hash) AS n FROM events WHERE ${RANGE} AND visitor_hash IS NOT NULL`
    ).get(range).n;

    const pageviews = db.prepare(
        `SELECT COUNT(*) AS n FROM events WHERE ${RANGE} AND type = 'pageview'`
    ).get(range).n;

    const avgTime = db.prepare(
        `SELECT AVG(duration_ms) AS ms FROM events WHERE ${RANGE} AND type = 'pageleave' AND duration_ms > 0`
    ).get(range).ms;

    const sessions = db.prepare(
        `SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE ${RANGE} AND session_id IS NOT NULL`
    ).get(range).n;

    // Bounce = Sitzungen mit genau einem Pageview.
    const bounced = db.prepare(`
        SELECT COUNT(*) AS n FROM (
            SELECT session_id FROM events
            WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
            GROUP BY session_id HAVING COUNT(*) = 1
        )
    `).get(range).n;

    const conversions = db.prepare(
        `SELECT COUNT(*) AS n FROM events WHERE ${RANGE} AND type = 'conversion'`
    ).get(range).n;

    const ctaClicks = db.prepare(
        `SELECT COUNT(*) AS n FROM events WHERE ${RANGE} AND type = 'cta'`
    ).get(range).n;

    return {
        visitors,
        pageviews,
        avgTimeMs: Math.round(avgTime || 0),
        sessions,
        bounceRate: sessions ? Math.round((bounced / sessions) * 100) : 0,
        pagesPerSession: sessions ? +(pageviews / sessions).toFixed(1) : 0,
        conversions,
        ctaClicks,
    };
}

// Zeitreihe: Aufrufe + Besucher je Tag (für das Liniendiagramm).
export function getTimeseries(range) {
    return getDb().prepare(`
        SELECT day,
               SUM(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
               COUNT(DISTINCT visitor_hash) AS visitors
        FROM events
        WHERE ${RANGE}
        GROUP BY day
        ORDER BY day
    `).all(range);
}

export function getTopPages(range, limit = 12) {
    return getDb().prepare(`
        SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
        FROM events
        WHERE ${RANGE} AND type = 'pageview' AND path IS NOT NULL
        GROUP BY path ORDER BY views DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Einstiegsseiten: erste Seite je Sitzung.
export function getEntryPages(range, limit = 8) {
    return getDb().prepare(`
        SELECT path, COUNT(*) AS n FROM (
            SELECT path, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY ts) AS rn
            FROM events WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
        ) WHERE rn = 1
        GROUP BY path ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Ausstiegsseiten: letzte Seite je Sitzung.
export function getExitPages(range, limit = 8) {
    return getDb().prepare(`
        SELECT path, COUNT(*) AS n FROM (
            SELECT path, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY ts DESC) AS rn
            FROM events WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
        ) WHERE rn = 1
        GROUP BY path ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Herkunft nach Kategorie (direct/organic/ai/social/referral/internal).
export function getReferrerSources(range) {
    return getDb().prepare(`
        SELECT ref_source AS source, COUNT(*) AS n
        FROM events WHERE ${RANGE} AND type = 'pageview' AND ref_source IS NOT NULL
        GROUP BY ref_source ORDER BY n DESC
    `).all(range);
}

// Top-Referrer-Domains (ohne die eigene Domain).
export function getReferrerDomains(range, limit = 10) {
    return getDb().prepare(`
        SELECT ref_domain AS domain, ref_source AS source, COUNT(*) AS n
        FROM events
        WHERE ${RANGE} AND type = 'pageview' AND ref_domain IS NOT NULL AND ref_source != 'internal'
        GROUP BY ref_domain ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Generischer Verteilungs-Helfer (device / browser / os / country).
function distribution(range, column, limit = 12) {
    return getDb().prepare(`
        SELECT ${column} AS label, COUNT(DISTINCT visitor_hash) AS n
        FROM events WHERE ${RANGE} AND type = 'pageview' AND ${column} IS NOT NULL
        GROUP BY ${column} ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

export const getDevices = (range) => distribution(range, 'device');
export const getBrowsers = (range) => distribution(range, 'browser');
export const getOperatingSystems = (range) => distribution(range, 'os');
export const getCountries = (range, limit = 10) => distribution(range, 'country', limit);

// CTA-Klicks nach Label (welcher Button, wie oft, auf welcher Seite).
export function getCtaPerformance(range, limit = 15) {
    return getDb().prepare(`
        SELECT name, path, COUNT(*) AS clicks
        FROM events WHERE ${RANGE} AND type = 'cta' AND name IS NOT NULL
        GROUP BY name, path ORDER BY clicks DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Interaktionen mit den Referenzen (welche getestet, wie oft).
export function getInteractions(range, limit = 15) {
    return getDb().prepare(`
        SELECT name, COUNT(*) AS n, COUNT(DISTINCT session_id) AS sessions
        FROM events WHERE ${RANGE} AND type = 'interaction' AND name IS NOT NULL
        GROUP BY name ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Sammelt alle Kennzahlen in einem Rutsch für die Dashboard-Seite.
export function getDashboardData(range) {
    return {
        overview: getOverview(range),
        timeseries: getTimeseries(range),
        topPages: getTopPages(range),
        entryPages: getEntryPages(range),
        exitPages: getExitPages(range),
        referrerSources: getReferrerSources(range),
        referrerDomains: getReferrerDomains(range),
        devices: getDevices(range),
        browsers: getBrowsers(range),
        operatingSystems: getOperatingSystems(range),
        countries: getCountries(range),
        ctaPerformance: getCtaPerformance(range),
        interactions: getInteractions(range),
    };
}
