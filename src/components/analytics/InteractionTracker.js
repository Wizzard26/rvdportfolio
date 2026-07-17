'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';

// Umschließt eine interaktive Referenz (z. B. eine JS-Demo) und feuert genau
// EIN `interaction`-Event, sobald der Besucher sie zum ersten Mal benutzt
// (Klick oder Tastatureingabe innerhalb des Bereichs). So sehen wir, welche
// Referenzen tatsächlich ausprobiert werden — ohne in die Demo-Logik
// einzugreifen.
export default function InteractionTracker({ name, children }) {
    const ref = useRef(null);
    const fired = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onFirstUse = () => {
            if (fired.current) return;
            fired.current = true;
            track('interaction', { name: `Referenz getestet: ${name}` });
            detach();
        };

        const detach = () => {
            el.removeEventListener('pointerdown', onFirstUse);
            el.removeEventListener('keydown', onFirstUse);
        };

        el.addEventListener('pointerdown', onFirstUse);
        el.addEventListener('keydown', onFirstUse);
        return detach;
    }, [name]);

    return <div ref={ref}>{children}</div>;
}
