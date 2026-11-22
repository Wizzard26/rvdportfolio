'use client';

import { useEffect, useState } from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import { getTrackingOptOutState, setTrackingOptOut } from '@/lib/analytics/track';

// Unsichtbar im Admin-Layout: Wer den Admin-Bereich öffnet, schließt dieses
// Gerät automatisch von der Besucher-Statistik aus — außer, es wurde bewusst
// wieder eingeschaltet (Wert '0', siehe track.js).
export function TrackingOptOutAuto() {
    useEffect(() => {
        if (getTrackingOptOutState() === null) setTrackingOptOut(true);
    }, []);
    return null;
}

// Schalter für die Ereignisse-Seite: zeigt den Status dieses Geräts.
export default function TrackingOptOutToggle() {
    const [state, setState] = useState(undefined);

    useEffect(() => { setState(getTrackingOptOutState()); }, []);

    if (state === undefined) return null;
    const excluded = state !== '0';

    const toggle = () => {
        setTrackingOptOut(!excluded);
        setState(excluded ? '0' : '1');
    };

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`an-badge ${excluded ? 'an-badge--ok' : 'an-badge--warn'}`}>
                {excluded ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                {excluded ? ' Dieses Gerät wird nicht gezählt' : ' Dieses Gerät wird mitgezählt'}
            </span>
            <button type="button" className="an-btn-secondary an-btn-small" onClick={toggle}>
                {excluded ? 'Zum Testen wieder mitzählen' : 'Dieses Gerät ausschließen'}
            </button>
        </div>
    );
}
