'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { scanUrlAction } from '@/lib/content/radarActions';

// Schnelleingabe: URL + „Shop/Agentur" → Fingerprinter fetcht die Seite und legt
// eine automatisch angereicherte Firma an. Bei Erfolg direkt zur Firma springen.
export default function RadarScanForm() {
    const [state, formAction, pending] = useActionState(scanUrlAction, {});
    const router = useRouter();

    useEffect(() => {
        if (state?.ok && state.companyId) router.push(`/dashboard/radar/${state.companyId}`);
    }, [state, router]);

    return (
        <form action={formAction} className="an-scan">
            <input
                name="url"
                type="text"
                className="an-input an-scan-url"
                placeholder="Shop-/Firmen-URL einfügen, z. B. muster-shop.de"
                aria-label="Shop-URL"
                required
                disabled={pending}
            />
            <select name="typ" defaultValue="inhouse_shop" aria-label="Firmentyp" disabled={pending}>
                <option value="inhouse_shop">Shop / Endkunde</option>
                <option value="agentur">Agentur</option>
            </select>
            <button type="submit" className="an-btn-primary" disabled={pending}>
                <FiSearch aria-hidden="true" /> {pending ? 'Scanne …' : 'Scannen'}
            </button>
            {state?.error && <span className="an-scan-error" role="alert">{state.error}</span>}
        </form>
    );
}
