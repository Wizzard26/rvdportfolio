'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/track';

// Unsichtbarer Seiten-Tracker. Mountet einmal im Portfolio-Layout und läuft
// damit nur auf den öffentlichen Seiten (nicht /dashboard, nicht /login).
//
// - Pageview bei jedem Pfadwechsel (App-Router: usePathname).
// - Verweildauer: Startzeit je Seite merken; beim Verlassen (Pfadwechsel,
//   Tab-Wechsel, Schließen) ein `pageleave` mit Dauer senden. Der letzte
//   pageleave einer Sitzung ist zugleich die Ausstiegsseite.
export default function Tracker() {
    const pathname = usePathname();
    const enteredAt = useRef(Date.now());
    const currentPath = useRef(pathname);

    // Pageview + Zeitmessung bei Pfadwechsel. Vor dem Umschalten den pageleave
    // der vorherigen Seite senden.
    useEffect(() => {
        const now = Date.now();
        if (currentPath.current && currentPath.current !== pathname) {
            track('pageleave', {
                path: currentPath.current,
                duration: now - enteredAt.current,
            });
        }
        // referrer nur beim ersten Pageview einer Sitzung aussagekräftig —
        // document.referrer ist bei interner Navigation die eigene Seite, was
        // die Referrer-Logik korrekt als "internal" einordnet.
        track('pageview', { path: pathname, referrer: document.referrer });
        currentPath.current = pathname;
        enteredAt.current = now;
    }, [pathname]);

    // pageleave auch bei Tab-Wechsel/Schließen — per sendBeacon, damit es den
    // Unload überlebt. `visibilitychange`→hidden ist zuverlässiger als
    // `beforeunload` (Mobile/BFCache).
    useEffect(() => {
        const flush = () => {
            track('pageleave', {
                path: currentPath.current,
                duration: Date.now() - enteredAt.current,
            }, true);
            // Startzeit zurücksetzen, damit ein Wiederkehren (Tab wieder sichtbar)
            // nicht die abwesende Zeit mitzählt.
            enteredAt.current = Date.now();
        };
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') flush();
        };
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('pagehide', flush);
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pagehide', flush);
        };
    }, []);

    return null;
}
