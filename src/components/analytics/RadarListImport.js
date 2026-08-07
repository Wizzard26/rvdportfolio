'use client';

import { useActionState, useEffect, useState } from 'react';
import { FiList } from 'react-icons/fi';
import { importDomainListAction } from '@/lib/content/radarActions';

// Schneller Bulk-Import einer Domain-/URL-Liste (z. B. PublicWWW-Marker-Export).
// Der Plattform-Hinweis kommt aus dem gesuchten Marker; verifiziert wird per Re-Scan.
export default function RadarListImport() {
    const [state, action, pending] = useActionState(importDomainListAction, {});
    const [hasText, setHasText] = useState(false);
    const [hasFile, setHasFile] = useState(false);
    // Nach erfolgreichem Import sind die Felder geleert → Button wieder sperren.
    useEffect(() => { if (state?.ok) { setHasText(false); setHasFile(false); } }, [state]);

    return (
        <form action={action}>
            <textarea
                name="domains" rows={4} className="an-input" style={{ width: '100%' }} disabled={pending}
                placeholder="Domains/URLs einfügen (PublicWWW-Export oder je Zeile eine) — volle URLs sind ok, die Domain wird extrahiert"
                onChange={(e) => setHasText(e.target.value.trim().length > 0)}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="an-muted" style={{ fontSize: '0.85em' }}>oder Datei:</span>
                <input
                    type="file" name="file" accept=".csv,.txt,text/csv,text/plain" disabled={pending}
                    style={{ font: 'inherit', fontSize: 13, cursor: 'pointer' }} aria-label="Domainliste"
                    onChange={(e) => setHasFile(!!(e.target.files && e.target.files.length))}
                />
                <select name="plattform" defaultValue="" disabled={pending} aria-label="Plattform-Hinweis">
                    <option value="">Plattform: unbekannt (Re-Scan klärt)</option>
                    <option value="shopware6">= Shopware 6 (Marker /bundles/storefront/)</option>
                    <option value="shopware5">= Shopware 5 (Marker engine/Shopware)</option>
                    <option value="shopify">= Shopify</option>
                </select>
                <button type="submit" className="an-btn-secondary" disabled={pending || !(hasText || hasFile)}>
                    <FiList aria-hidden="true" /> {pending ? 'Importiere …' : 'Liste importieren'}
                </button>
            </div>
            {state?.error && <span className="an-scan-error" role="alert" style={{ display: 'inline-block', marginTop: 8 }}>{state.error}</span>}
            {state?.ok && (
                <span className="an-badge an-badge--ok" style={{ display: 'inline-block', marginTop: 8 }}>
                    {state.found} Domains erkannt · {state.created} neu · {state.updated} aktualisiert{state.skipped ? ` · ${state.skipped} Dubletten/leer` : ''}
                </span>
            )}
        </form>
    );
}
