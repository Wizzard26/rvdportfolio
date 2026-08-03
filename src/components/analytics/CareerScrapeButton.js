'use client';

import { useActionState } from 'react';
import { FiDownloadCloud } from 'react-icons/fi';
import { scrapeCareerJobsAction } from '@/lib/content/radarActions';

// Zieht on-demand die Stellen von der Karriereseite der Firma und legt sie als
// Chancen-Entwürfe an. Zeigt gefunden/neu/bekannt als Rückmeldung.
export default function CareerScrapeButton({ companyId }) {
    const [state, action, pending] = useActionState(scrapeCareerJobsAction, {});
    return (
        <form action={action} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input type="hidden" name="company_id" value={companyId} />
            <button type="submit" className="an-btn-secondary an-btn-small" disabled={pending}>
                <FiDownloadCloud aria-hidden="true" /> {pending ? 'Lese Karriereseite …' : 'Stellen von Karriereseite ziehen'}
            </button>
            {state?.ok && state.found > 0 && (
                <span className="an-badge an-badge--ok">
                    {state.found} gefunden · {state.added} neu{state.skipped ? ` · ${state.skipped} bekannt` : ''}
                </span>
            )}
            {state?.ok && state.found === 0 && (
                <span className="an-badge an-badge--warn">
                    Keine Stellen erkennbar{state.widget ? ` — Stellen liegen im ${state.widget}-Widget (per JS, nicht auslesbar); Karriereseite manuell prüfen` : ' — evtl. JS-Widget ohne Feed oder aktuell keine offenen Stellen'}
                </span>
            )}
            {state?.error && <span className="an-scan-error" role="alert">{state.error}</span>}
        </form>
    );
}
