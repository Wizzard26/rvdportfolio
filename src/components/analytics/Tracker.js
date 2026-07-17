'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/track';

// Unsichtbarer Seiten-Tracker. Mountet einmal im Portfolio-Layout und läuft
// damit nur auf den öffentlichen Seiten (nicht /dashboard, nicht /login).
//
// Erfasst: Pageview + Verweildauer/Exit (pageleave), Scrolltiefe,
// Outbound-/Download-Klicks (delegiert, seitenweit) und Web Vitals.

const SCROLL_THRESHOLDS = [25, 50, 75, 100];
const OWN_HOST_RE = /(^|\.)rene-van-dinter\.de$/;

export default function Tracker() {
    const pathname = usePathname();
    const enteredAt = useRef(Date.now());
    const currentPath = useRef(pathname);
    const scrollFired = useRef(new Set());

    // Pageview + Zeitmessung bei Pfadwechsel. Vor dem Umschalten den pageleave
    // der vorherigen Seite senden. Scroll-Schwellen je Seite zurücksetzen.
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
        scrollFired.current = new Set();
    }, [pathname]);

    // Scrolltiefe: bei 25/50/75/100 % je einmal pro Seite ein `scroll`-Event
    // (value = Prozent). Throttled per requestAnimationFrame.
    useEffect(() => {
        let ticking = false;
        const measure = () => {
            ticking = false;
            const doc = document.documentElement;
            const scrollable = doc.scrollHeight - window.innerHeight;
            const pct = scrollable <= 0
                ? 100
                : Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100));
            for (const t of SCROLL_THRESHOLDS) {
                if (pct >= t && !scrollFired.current.has(t)) {
                    scrollFired.current.add(t);
                    track('scroll', { path: currentPath.current, value: t });
                }
            }
        };
        const onScroll = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(measure); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        measure(); // kurze Seiten sofort als 100% werten
        return () => window.removeEventListener('scroll', onScroll);
    }, [pathname]);

    // pageleave bei Tab-Wechsel/Schließen — per sendBeacon (überlebt Unload).
    useEffect(() => {
        const flush = () => {
            track('pageleave', {
                path: currentPath.current,
                duration: Date.now() - enteredAt.current,
            }, true);
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

    // Outbound- & Download-Klicks seitenweit über EINEN delegierten Listener —
    // erspart die Einzel-Instrumentierung von Footer-Links und PDF-Ankern.
    useEffect(() => {
        const onClick = (e) => {
            const a = e.target.closest?.('a[href]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            const isDownload = a.hasAttribute('download') || /\.(pdf|zip|docx?|xlsx?|csv)(\?|$)/i.test(href);

            let host = null;
            try { host = new URL(href, window.location.href).hostname; } catch { /* relativer/mailto/tel-Link */ }

            if (isDownload) {
                const file = href.split('/').pop()?.split('?')[0] || href;
                track('download', { path: currentPath.current, name: file, meta: { href } });
            } else if (host && !OWN_HOST_RE.test(host) && /^https?:/i.test(new URL(href, window.location.href).protocol)) {
                track('outbound', { path: currentPath.current, name: host, referrer: href });
            }
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, []);

    // Web Vitals (Real-User-Monitoring). Dynamischer Import, damit die Library
    // nicht den kritischen Pfad belastet. Je Metrik ein `vital`-Event.
    useEffect(() => {
        let cancelled = false;
        import('web-vitals').then(({ onLCP, onCLS, onINP, onFCP, onTTFB }) => {
            if (cancelled) return;
            const report = (metric) => {
                // Nur endliche Messwerte melden — verhindert null-Werte, die
                // den Durchschnitt verfälschen würden.
                if (!Number.isFinite(metric.value)) return;
                track('vital', {
                    path: window.location.pathname,
                    name: metric.name,
                    value: Math.round(metric.value * 1000) / 1000,
                    meta: { rating: metric.rating },
                }, true);
            };
            onLCP(report); onCLS(report); onINP(report); onFCP(report); onTTFB(report);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

    return null;
}
