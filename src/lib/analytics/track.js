// Winziger Client-Helfer zum Senden von Analytics-Events. Wird sowohl vom
// Tracker (pageview/pageleave) als auch von instrumentierten Komponenten
// (CTA/Interaction/Conversion) genutzt.
//
// Cookiefrei: Die Sitzungs-ID lebt in sessionStorage (kein Cookie, verschwindet
// beim Schließen des Tabs). Kein persistenter Identifier.

const SESSION_KEY = 'rvd_sid';

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

    const payload = JSON.stringify({
        type,
        sid: getSessionId(),
        path: opts.path ?? window.location.pathname,
        referrer: opts.referrer,
        name: opts.name,
        duration: opts.duration,
        value: opts.value, // numerischer Messwert (Scrolltiefe %, Web-Vital-Wert)
        meta: opts.meta,
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
