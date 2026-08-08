'use client';

import { useActionState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { ccDiscoverAction } from '@/lib/content/radarActions';

// Prototyp: Domains gegen das Common-Crawl-Archiv prüfen (kein Live-Request) und
// Shopware/Shopify-Treffer ins Radar importieren (dedupliziert per Domain).
export default function RadarCcDiscover() {
    const [state, action, pending] = useActionState(ccDiscoverAction, {});
    return (
        <form action={action}>
            <textarea
                name="domains" rows={3} className="an-input" style={{ width: '100%' }} disabled={pending}
                placeholder="Domains, je Zeile eine (max. 20 pro Lauf) — z. B. beispiel-shop.de"
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="an-btn-secondary" disabled={pending}>
                    <FiSearch aria-hidden="true" /> {pending ? 'Prüfe im CC-Archiv …' : 'Im Common-Crawl-Archiv prüfen'}
                </button>
                {state?.error && <span className="an-scan-error" role="alert">{state.error}</span>}
                {state?.ok && (
                    <span className="an-badge an-badge--ok">
                        {state.checked} geprüft · {state.imported} importiert (SW5 {state.sw5}/SW6 {state.sw6}{state.shopify ? `/Shopify ${state.shopify}` : ''}) ·
                        {state.noCopy} ohne CC-Kopie · {state.other} kein Shopware
                    </span>
                )}
            </div>
            {state?.ok && state.results?.length > 0 && (
                <details style={{ marginTop: 8 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>Details ({state.results.length})</summary>
                    <pre className="an-input" style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', maxHeight: 200, overflow: 'auto', fontSize: '0.82em' }}>{state.results.map((r) => `${r.domain} → ${r.outcome}`).join('\n')}</pre>
                </details>
            )}
        </form>
    );
}
