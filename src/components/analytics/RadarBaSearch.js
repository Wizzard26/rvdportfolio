'use client';

import { useActionState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { searchBaJobsAction } from '@/lib/content/radarActions';

// Bundesagentur-Jobsuche → Job-Chancen (Arbeitgeber + Ort). Offizielle API.
export default function RadarBaSearch() {
    const [state, action, pending] = useActionState(searchBaJobsAction, {});
    return (
        <form action={action} className="an-scan" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <input name="was" defaultValue="Shopware" className="an-input" placeholder="Suchbegriff, z. B. Shopware Entwickler" style={{ flex: '1 1 220px' }} disabled={pending} aria-label="Suchbegriff" />
            <input name="wo" className="an-input" placeholder="Ort/PLZ (optional)" style={{ maxWidth: 150 }} disabled={pending} aria-label="Ort" />
            <select name="umkreis" defaultValue="" disabled={pending} aria-label="Umkreis">
                <option value="">Umkreis</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="200">200 km</option>
            </select>
            <select name="size" defaultValue="50" disabled={pending} aria-label="Anzahl">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
            <button type="submit" className="an-btn-secondary" disabled={pending}>
                <FiSearch aria-hidden="true" /> {pending ? 'Suche …' : 'Bundesagentur suchen'}
            </button>
            {state?.error && <span className="an-scan-error" role="alert">{state.error}</span>}
            {state?.ok && (
                <span className="an-badge an-badge--ok">
                    {state.total} Treffer · {state.found} geladen → {state.newCompanies} neue Arbeitgeber · {state.newOpps} Job-Chancen
                    {state.skipped ? ` · ${state.skipped} bekannt` : ''}{state.archived ? ` · ${state.archived} archiviert` : ''}
                </span>
            )}
        </form>
    );
}
