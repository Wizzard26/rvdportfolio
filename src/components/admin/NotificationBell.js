'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    FiBell, FiEye, FiMessageSquare, FiCalendar, FiStar, FiXCircle, FiInbox, FiCheck,
} from 'react-icons/fi';

const ICONS = {
    view: FiEye,
    question: FiMessageSquare,
    appointment: FiCalendar,
    rating: FiStar,
    rejection: FiXCircle,
    offer: FiInbox,
};

function relTime(ts) {
    const diff = Date.now() - ts;
    const min = Math.round(diff / 60000);
    if (min < 1) return 'gerade eben';
    if (min < 60) return `vor ${min} Min.`;
    const h = Math.round(min / 60);
    if (h < 24) return `vor ${h} Std.`;
    const d = Math.round(h / 24);
    if (d < 7) return `vor ${d} ${d === 1 ? 'Tag' : 'Tagen'}`;
    return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Markieren via API (keepalive → übersteht die Navigation beim Klick auf einen Eintrag).
function post(body) {
    try {
        fetch('/api/admin/notifications', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            keepalive: true,
        }).catch(() => {});
    } catch { /* still */ }
}

export default function NotificationBell() {
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            setItems(data.items || []);
            setUnread(data.unread || 0);
        } catch { /* still: Glocke darf das Dashboard nie stören */ }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, 60000);
        return () => clearInterval(id);
    }, [load]);

    useEffect(() => {
        if (!open) return undefined;
        const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
    }, [open]);

    // Einen Eintrag als gelesen markieren, wenn er tatsächlich angeklickt/angesehen wird.
    const readOne = (n) => {
        if (!n.unread) return;
        post({ key: n.key });
        setItems((prev) => prev.map((x) => (x.key === n.key ? { ...x, unread: false } : x)));
        setUnread((u) => Math.max(0, u - 1));
    };

    const readAll = () => {
        if (unread === 0) return;
        post({ all: true });
        setItems((prev) => prev.map((x) => ({ ...x, unread: false })));
        setUnread(0);
    };

    return (
        <div className="adm-bell" ref={rootRef}>
            <button
                type="button"
                className="adm-bell-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label={unread > 0 ? `Benachrichtigungen (${unread} neu)` : 'Benachrichtigungen'}
                aria-expanded={open}
            >
                <FiBell aria-hidden="true" />
                {unread > 0 && <span className="adm-bell-badge">{unread > 99 ? '99+' : unread}</span>}
            </button>

            {open && (
                <div className="adm-bell-panel" role="menu">
                    <div className="adm-bell-head">
                        <span>Benachrichtigungen</span>
                        {unread > 0 && (
                            <button type="button" className="adm-bell-readall" onClick={readAll}>
                                <FiCheck aria-hidden="true" /> Alles als gelesen
                            </button>
                        )}
                    </div>
                    {items.length === 0 ? (
                        <p className="adm-bell-empty">Keine Neuigkeiten.</p>
                    ) : (
                        <ul className="adm-bell-list">
                            {items.map((n) => {
                                const Icon = ICONS[n.kind] || FiBell;
                                return (
                                    <li key={n.key}>
                                        <Link
                                            href={n.href}
                                            className={`adm-bell-item${n.unread ? ' is-new' : ''}`}
                                            onClick={() => { readOne(n); setOpen(false); }}
                                        >
                                            <span className={`adm-bell-ico adm-bell-ico--${n.kind}`}><Icon aria-hidden="true" /></span>
                                            <span className="adm-bell-body">
                                                <span className="adm-bell-text"><strong>{n.who}</strong> {n.text}</span>
                                                <span className="adm-bell-time">{relTime(n.at)}</span>
                                            </span>
                                            {n.unread && <span className="adm-bell-dot" aria-hidden="true" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
