// Winziger Client-Helfer zum Senden von Analytics-Events. Wird sowohl vom
// Tracker (pageview/pageleave) als auch von instrumentierten Komponenten
// (CTA/Interaction/Conversion) genutzt.
//
// Cookiefrei: Die Sitzungs-ID lebt in sessionStorage (kein Cookie, verschwindet
// beim Schließen des Tabs). Kein persistenter Identifier.

const SESSION_KEY = 'rvd_sid';

// Geräte-Opt-out (localStorage, kein Cookie): wird beim Öffnen des Admin-Bereichs
// gesetzt, damit eigene Besuche auch nach Logout/Ablauf der Session nicht zählen.
export const OPT_OUT_KEY = 'rvd_notrack';

export function isTrackingOptedOut() {
    try {
        return localStorage.getItem(OPT_OUT_KEY) === '1';
    } catch {
        return false;
    }
}

// '1' = ausgeschlossen, '0' = bewusst wieder zählen (wird nicht automatisch
// überschrieben), nicht gesetzt = noch nie entschieden.
export function getTrackingOptOutState() {
    try {
        return localStorage.getItem(OPT_OUT_KEY);
    } catch {
        return null;
    }
}

export function setTrackingOptOut(on) {
    try {
        localStorage.setItem(OPT_OUT_KEY, on ? '1' : '0');
    } catch {
        // localStorage blockiert → dann zählt nur der Cookie-Check auf dem Server.
    }
}

// Ferngesteuerte Browser (Puppeteer/Playwright/Selenium) melden sich über
// navigator.webdriver — das sind Bots mit normalem Browser-UA.
function isAutomated() {
    try {
        return navigator.webdriver === true;
    } catch {
        return false;
    }
}

function browserTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    } catch {
        return undefined;
    }
}

// Liefert die kurzlebige Sitzungs-ID (legt sie beim ersten Aufruf an).
export function getSessionId() {
    if (typeof window === 'undefined') return null;
    try {
        let sid = sessionStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
            sessionStorage.setItem(SESSION_KEY, sid);
        }
        return sid;
    } catch {
        return null; // z. B. wenn sessionStorage blockiert ist
    }
}

/**
 * Sendet ein Event an /api/collect.
 * @param {string} type   pageview | pageleave | cta | interaction | conversion |
 *                        scroll | section_view | outbound | download | vital | form_*
 * @param {object} [opts] { name, path, referrer, duration, value, meta }
 * @param {boolean} [beacon] true = navigator.sendBeacon (überlebt Seiten-Unload)
 */
export function track(type, opts = {}, beacon = false) {
    if (typeof window === 'undefined') return;
    if (isTrackingOptedOut() || isAutomated()) return;

    const payload = JSON.stringify({
        type,
        sid: getSessionId(),
        path: opts.path ?? window.location.pathname,
        referrer: opts.referrer,
        name: opts.name,
        duration: opts.duration,
        value: opts.value, // numerischer Messwert (Scrolltiefe %, Web-Vital-Wert)
        meta: opts.meta,
        tz: type === 'pageview' ? browserTimeZone() : undefined,
    });

    try {
        if (beacon && navigator.sendBeacon) {
            navigator.sendBeacon('/api/collect', new Blob([payload], { type: 'application/json' }));
            return;
        }
        // keepalive, damit auch kurz vor einem Navigationswechsel zugestellt wird.
        fetch('/api/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        }).catch(() => {});
    } catch {
        // Analytics darf nie etwas kaputt machen.
    }
}
