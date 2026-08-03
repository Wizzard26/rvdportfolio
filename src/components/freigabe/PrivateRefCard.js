'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiExternalLink, FiX, FiMaximize2 } from 'react-icons/fi';
import RefSlider from './RefSlider';
import styles from './SharePrivateRefs.module.css';
import { PRIVATE_REF_STATUS_LABEL } from '@/lib/privateRefStatus';

const STATUS_CLASS = { in_entwicklung: 'statusDev', auftragsarbeit: 'statusAuftrag', arbeitsstelle: 'statusStelle' };

function splitTech(tech) {
    return (tech || '').split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}
function normalizeUrl(url) {
    const u = (url || '').trim();
    if (!u) return null;
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function StatusBadge({ status }) {
    return (
        <span className={`${styles.status}${STATUS_CLASS[status] ? ' ' + styles[STATUS_CLASS[status]] : ''}`}>
            {PRIVATE_REF_STATUS_LABEL[status] || status}
        </span>
    );
}

function TechChips({ tech }) {
    if (!tech.length) return null;
    return <div className={styles.tech}>{tech.map((t) => <span key={t} className={styles.chip}>{t}</span>)}</div>;
}

function LiveLink({ url, label }) {
    if (!url) return null;
    return (
        <a className={styles.liveLink} href={url} target="_blank" rel="noopener noreferrer nofollow">
            <FiExternalLink aria-hidden="true" /> {label || 'Live ansehen'}
        </a>
    );
}

export default function PrivateRefCard({ item: r, wm }) {
    const tech = splitTech(r.tech);
    const url = normalizeUrl(r.link);

    const descRef = useRef(null);
    const closeRef = useRef(null);
    const [clamped, setClamped] = useState(false);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Ist die (geklappte) Beschreibung länger als der sichtbare Bereich? Bei
    // Größenänderung neu messen (Spaltenzahl/Kartenbreite ändert die Zeilen).
    useEffect(() => {
        const measure = () => {
            const el = descRef.current;
            if (el) setClamped(el.scrollHeight - el.clientHeight > 4);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [r.description]);

    // Modal: Escape schließt, Body-Scroll sperren, Fokus auf Schließen-Button.
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    return (
        <>
            <article className={styles.card}>
                {r.images?.length > 0 && <RefSlider images={r.images} title={r.title} wmStyle={wm} />}

                <div className={styles.body}>
                    <div className={styles.cardHead}>
                        <span className={styles.title}>{r.title}</span>
                        <StatusBadge status={r.status} />
                    </div>
                    {r.context ? <p className={styles.context}>{r.context}</p> : null}

                    {r.description ? <p ref={descRef} className={`${styles.desc} ${styles.descClamp}`}>{r.description}</p> : null}

                    {clamped && (
                        <button type="button" className={styles.moreBtn} onClick={() => setOpen(true)}>
                            <FiMaximize2 aria-hidden="true" /> Mehr anzeigen
                        </button>
                    )}

                    <TechChips tech={tech} />
                    <LiveLink url={url} label={r.link_label} />
                </div>
            </article>

            {mounted && open && createPortal(
                <div className={styles.modalOverlay} onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={r.title}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button ref={closeRef} type="button" className={styles.modalClose} onClick={() => setOpen(false)} aria-label="Schließen">
                            <FiX aria-hidden="true" />
                        </button>

                        {r.images?.length > 0 && <RefSlider images={r.images} title={r.title} wmStyle={wm} />}

                        <div className={styles.modalBody}>
                            <div className={styles.cardHead}>
                                <span className={styles.title}>{r.title}</span>
                                <StatusBadge status={r.status} />
                            </div>
                            {r.context ? <p className={styles.context}>{r.context}</p> : null}
                            {r.description ? <p className={styles.descFull}>{r.description}</p> : null}
                            <TechChips tech={tech} />
                            <LiveLink url={url} label={r.link_label} />
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
