import Link from 'next/link';

// Seitenzahl-Navigation für Server-Components (Link-basiert, kein Client-State).
// Baut Hrefs mit erhaltenen Query-Parametern; `param` ist der eigene Seiten-
// Parameter (z. B. 'bp' oder 'rp'). Ein optionaler `anchor` (#id) springt zurück
// zum jeweiligen Abschnitt, statt nach ganz oben zu scrollen.
//
// Bewusst im gleichen Stil wie der Ereignisse-Explorer: „← Zurück · Seite X / Y
// · Weiter →" (nutzt die vorhandenen .an-pager-Styles).
export default function PagerLinks({ basePath, param, page, totalPages, params = {}, anchor = '' }) {
    if (!totalPages || totalPages <= 1) return null;

    const href = (p) => {
        const q = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v != null && v !== '') q.set(k, String(v));
        }
        if (p > 1) q.set(param, String(p));
        const qs = q.toString();
        return `${basePath}${qs ? `?${qs}` : ''}${anchor}`;
    };

    const atStart = page <= 1;
    const atEnd = page >= totalPages;

    return (
        <div className="an-pager">
            <Link href={href(page - 1)} className={atStart ? 'is-disabled' : ''} aria-label="Zurück">← Zurück</Link>
            <span>Seite {page} / {totalPages}</span>
            <Link href={href(page + 1)} className={atEnd ? 'is-disabled' : ''} aria-label="Weiter">Weiter →</Link>
        </div>
    );
}
