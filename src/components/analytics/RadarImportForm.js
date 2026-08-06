'use client';

import { useActionState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { importBuiltWithAction } from '@/lib/content/radarActions';

// Import einer BuiltWith-CSV (Discovery-Saat): legt Firmen + Kontakte + Tech-
// Snapshot + Lead-Prio an, dedupliziert per Domain. Kein Crawling.
export default function RadarImportForm() {
    const [state, action, pending] = useActionState(importBuiltWithAction, {});
    return (
        <form action={action} className="an-scan" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="file" name="file" accept=".csv,text/csv" required disabled={pending} className="an-input" aria-label="BuiltWith-CSV" />
            <button type="submit" className="an-btn-primary" disabled={pending}>
                <FiUploadCloud aria-hidden="true" /> {pending ? 'Importiere …' : 'CSV importieren'}
            </button>
            {state?.error && <span className="an-scan-error" role="alert">{state.error}</span>}
            {state?.ok && (
                <span className="an-badge an-badge--ok">
                    {state.total} verarbeitet · {state.created} neu · {state.updated} aktualisiert · {state.contactsAdded} Kontakte ·
                    SW5 {state.sw5} / SW6 {state.sw6}{state.shopify ? ` · ${state.shopify}× Shopify-Flag` : ''}{state.skipped ? ` · ${state.skipped} übersprungen` : ''}
                </span>
            )}
        </form>
    );
}
