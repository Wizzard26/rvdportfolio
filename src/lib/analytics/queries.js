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

// ─── Wiederkehrende Besucher (30-Tage-Hash) ──────────────────────────────

// Neu vs. wiederkehrend: ein Besucher gilt als wiederkehrend, wenn sein
// (monatlicher) Hash im Zeitraum an ≥2 verschiedenen Tagen auftaucht.
export function getNewVsReturning(range) {
    const row = getDb().prepare(`
        SELECT
            SUM(CASE WHEN days = 1 THEN 1 ELSE 0 END) AS neu,
            SUM(CASE WHEN days > 1 THEN 1 ELSE 0 END) AS wieder
        FROM (
            SELECT visitor_hash, COUNT(DISTINCT day) AS days
            FROM events WHERE ${RANGE} AND visitor_hash IS NOT NULL
            GROUP BY visitor_hash
        )
    `).get(range);
    return { neu: row.neu || 0, returning: row.wieder || 0 };
}

// Besuchshäufigkeit: Verteilung „an wie vielen Tagen war ein Besucher aktiv".
export function getVisitFrequency(range) {
    return getDb().prepare(`
        SELECT days AS label, COUNT(*) AS n FROM (
            SELECT visitor_hash, COUNT(DISTINCT day) AS days
            FROM events WHERE ${RANGE} AND visitor_hash IS NOT NULL
            GROUP BY visitor_hash
        ) GROUP BY days ORDER BY days
    `).all(range);
}

// ─── Engagement ──────────────────────────────────────────────────────────

// Scrolltiefen-Verteilung (wie viele Sitzungen erreichten 25/50/75/100 %).
export function getScrollDepth(range) {
    const rows = getDb().prepare(`
        SELECT value AS depth, COUNT(DISTINCT session_id || '|' || path) AS n
        FROM events WHERE ${RANGE} AND type = 'scroll' AND value IS NOT NULL
        GROUP BY value ORDER BY value
    `).all(range);
    const byDepth = Object.fromEntries(rows.map((r) => [r.depth, r.n]));
    return [25, 50, 75, 100].map((d) => ({ label: `${d}%`, n: byDepth[d] || 0 }));
}

// Meistgesehene Abschnitte/Projekte (section_view).
export function getSectionViews(range, limit = 15) {
    return getDb().prepare(`
        SELECT name, COUNT(*) AS n, COUNT(DISTINCT session_id) AS sessions
        FROM events WHERE ${RANGE} AND type = 'section_view' AND name IS NOT NULL
        GROUP BY name ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Engagement je Seite: Ø Verweildauer, Ø max. Scrolltiefe, Interaktionen +
// einfacher Score (0–100).
export function getEngagementByPage(range, limit = 12) {
    const time = getDb().prepare(`
        SELECT path, AVG(duration_ms) AS ms FROM events
        WHERE ${RANGE} AND type = 'pageleave' AND duration_ms > 0 GROUP BY path
    `).all(range);
    const scroll = getDb().prepare(`
        SELECT path, AVG(mx) AS depth FROM (
            SELECT path, session_id, MAX(value) AS mx FROM events
            WHERE ${RANGE} AND type = 'scroll' GROUP BY path, session_id
        ) GROUP BY path
    `).all(range);
    const views = getDb().prepare(`
        SELECT path, COUNT(*) AS n FROM events
        WHERE ${RANGE} AND type = 'pageview' GROUP BY path
    `).all(range);

    const tMap = Object.fromEntries(time.map((r) => [r.path, r.ms]));
    const sMap = Object.fromEntries(scroll.map((r) => [r.path, r.depth]));

    return views
        .map((v) => {
            const ms = tMap[v.path] || 0;
            const depth = sMap[v.path] || 0;
            // Score: Zeit (bis 120s = 100) und Scrolltiefe je zur Hälfte gewichtet.
            const timeScore = Math.min(100, (ms / 1000 / 120) * 100);
            const score = Math.round(timeScore * 0.5 + depth * 0.5);
            return { path: v.path, views: v.n, avgTimeMs: Math.round(ms), avgScroll: Math.round(depth), score };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// ─── Journey & Funnel ────────────────────────────────────────────────────

// Häufigste Seitenpfade je Sitzung (Sequenz der Pageviews).
export function getJourneyPaths(range, limit = 12) {
    return getDb().prepare(`
        SELECT seq AS label, COUNT(*) AS n FROM (
            SELECT session_id, group_concat(path, '  →  ') AS seq FROM (
                SELECT session_id, path FROM events
                WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
                ORDER BY session_id, ts
            ) GROUP BY session_id
        ) GROUP BY seq ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Wohin geht es von einer Seite aus weiter (nächste Seite innerhalb der Sitzung).
export function getNextPages(range, path, limit = 8) {
    return getDb().prepare(`
        SELECT next AS label, COUNT(*) AS n FROM (
            SELECT path, LEAD(path) OVER (PARTITION BY session_id ORDER BY ts) AS next
            FROM events WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
        ) WHERE path = @path AND next IS NOT NULL
        GROUP BY next ORDER BY n DESC LIMIT @limit
    `).all({ ...range, path, limit });
}

// Conversion-Funnel: Besuch → Showcase → Kontaktseite → Formular-Start → Absenden.
export function getFunnel(range) {
    const db = getDb();
    const sessionsWith = (cond, params = {}) => db.prepare(
        `SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE ${RANGE} AND session_id IS NOT NULL AND ${cond}`
    ).get({ ...range, ...params }).n;

    return [
        { step: 'Besuch', n: sessionsWith("type = 'pageview'") },
        { step: 'Showcase', n: sessionsWith("type = 'pageview' AND path = '/showcase'") },
        { step: 'Kontaktseite', n: sessionsWith("type = 'pageview' AND path = '/contact'") },
        { step: 'Formular gestartet', n: sessionsWith("type = 'form_start'") },
        { step: 'Abgesendet', n: sessionsWith("type = 'conversion'") },
    ];
}

// Formular-Abbrüche nach zuletzt bearbeitetem Feld.
export function getFormAbandon(range) {
    return getDb().prepare(`
        SELECT name AS label, COUNT(*) AS n FROM events
        WHERE ${RANGE} AND type = 'form_abandon' AND name IS NOT NULL
        GROUP BY name ORDER BY n DESC
    `).all(range);
}

// ─── Herkunft-Detail ─────────────────────────────────────────────────────

export function getReferrerUrls(range, limit = 15) {
    return getDb().prepare(`
        SELECT ref_url AS label, ref_source AS source, COUNT(*) AS n
        FROM events WHERE ${RANGE} AND type = 'pageview' AND ref_url IS NOT NULL AND ref_source != 'internal'
        GROUP BY ref_url ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// Quelle × Einstiegsseite (welche Herkunft landet wo).
export function getSourceByEntry(range, limit = 15) {
    return getDb().prepare(`
        SELECT ref_source AS source, path, COUNT(*) AS n FROM (
            SELECT ref_source, path, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY ts) AS rn
            FROM events WHERE ${RANGE} AND type = 'pageview' AND session_id IS NOT NULL
        ) WHERE rn = 1
        GROUP BY ref_source, path ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// ─── Ziele: Outbound & Downloads ─────────────────────────────────────────

export function getOutbound(range, limit = 15) {
    return getDb().prepare(`
        SELECT name AS label, COUNT(*) AS n FROM events
        WHERE ${RANGE} AND type = 'outbound' AND name IS NOT NULL
        GROUP BY name ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

export function getDownloads(range, limit = 15) {
    return getDb().prepare(`
        SELECT name AS label, COUNT(*) AS n FROM events
        WHERE ${RANGE} AND type = 'download' AND name IS NOT NULL
        GROUP BY name ORDER BY n DESC LIMIT @limit
    `).all({ ...range, limit });
}

// ─── Zeit: Stunde × Wochentag ────────────────────────────────────────────

// Heatmap-Daten: Anzahl Pageviews je Wochentag (0=So) und Stunde (UTC).
export function getHourWeekdayHeatmap(range) {
    return getDb().prepare(`
        SELECT
            CAST(strftime('%w', ts / 1000, 'unixepoch') AS INTEGER) AS weekday,
            CAST(strftime('%H', ts / 1000, 'unixepoch') AS INTEGER) AS hour,
            COUNT(*) AS n
        FROM events WHERE ${RANGE} AND type = 'pageview'
        GROUP BY weekday, hour
    `).all(range);
}

// ─── Web Vitals ──────────────────────────────────────────────────────────

export function getWebVitals(range) {
    return getDb().prepare(`
        SELECT
            name,
            AVG(value) AS avg,
            COUNT(*) AS n,
            SUM(CASE WHEN json_extract(meta,'$.rating')='good' THEN 1 ELSE 0 END) AS good,
            SUM(CASE WHEN json_extract(meta,'$.rating')='needs-improvement' THEN 1 ELSE 0 END) AS ni,
            SUM(CASE WHEN json_extract(meta,'$.rating')='poor' THEN 1 ELSE 0 END) AS poor
        FROM events WHERE ${RANGE} AND type = 'vital' AND value IS NOT NULL
        GROUP BY name
    `).all(range);
}

// ─── Roh-Event-Explorer ──────────────────────────────────────────────────

export function getRawEvents(range, { type, path, limit = 100, offset = 0 } = {}) {
    const filters = [RANGE];
    const params = { ...range, limit, offset };
    if (type) { filters.push('type = @type'); params.type = type; }
    if (path) { filters.push('path LIKE @path'); params.path = `%${path}%`; }
    const where = filters.join(' AND ');

    const rows = getDb().prepare(`
        SELECT ts, type, path, ref_source, ref_domain, device, browser, os, country, name, value
        FROM events WHERE ${where} ORDER BY ts DESC LIMIT @limit OFFSET @offset
    `).all(params);
    const total = getDb().prepare(`SELECT COUNT(*) AS n FROM events WHERE ${where}`).get(params).n;
    return { rows, total };
}

export function getEventTypeCounts(range) {
    return getDb().prepare(`
        SELECT type AS label, COUNT(*) AS n FROM events WHERE ${RANGE}
        GROUP BY type ORDER BY n DESC
    `).all(range);
}

// ─── Aggregatoren je Dashboard-Bereich ───────────────────────────────────

export function getOverviewData(range) {
    return {
        overview: getOverview(range),
        newVsReturning: getNewVsReturning(range),
        timeseries: getTimeseries(range),
        topPages: getTopPages(range, 8),
        referrerSources: getReferrerSources(range),
        devices: getDevices(range),
    };
}

export function getAudienceData(range) {
    return {
        newVsReturning: getNewVsReturning(range),
        visitFrequency: getVisitFrequency(range),
        devices: getDevices(range),
        browsers: getBrowsers(range),
        operatingSystems: getOperatingSystems(range),
        countries: getCountries(range),
        webVitals: getWebVitals(range),
    };
}

export function getBehaviorData(range) {
    return {
        scrollDepth: getScrollDepth(range),
        sectionViews: getSectionViews(range),
        engagementByPage: getEngagementByPage(range),
        journeyPaths: getJourneyPaths(range),
        funnel: getFunnel(range),
        formAbandon: getFormAbandon(range),
        heatmap: getHourWeekdayHeatmap(range),
        interactions: getInteractions(range),
    };
}

export function getAcquisitionData(range) {
    return {
        referrerSources: getReferrerSources(range),
        referrerDomains: getReferrerDomains(range),
        referrerUrls: getReferrerUrls(range),
        sourceByEntry: getSourceByEntry(range),
        entryPages: getEntryPages(range),
        exitPages: getExitPages(range),
    };
}

export function getGoalsData(range) {
    return {
        overview: getOverview(range),
        ctaPerformance: getCtaPerformance(range),
        outbound: getOutbound(range),
        downloads: getDownloads(range),
        sectionViews: getSectionViews(range),
        funnel: getFunnel(range),
    };
}
