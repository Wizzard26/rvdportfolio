'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { roboto, ranga } from "@/app/fonts";
import styles from "./styles.module.css";
import TechTags from "./TechTags";
import SectionView from "@/components/analytics/SectionView";
import InteractionTracker from "@/components/analytics/InteractionTracker";
import CallEvent from "@/components/showcases/Callevent/CallEvent";
import WebPage from "@/components/showcases/WebProject/WebPage";
import Slider from "@/components/scripts/Slider";
import Lottogenerator from "@/components/scripts/Lottogenerator";
import Cartsystem from "@/components/scripts/Cartsystem";
import Modalbox from "@/components/scripts/Modalbox";
import Sandbox from "@/components/showcases/Sandbox";

// Whitelist interaktiver Komponenten-Slots (feste App-Komponenten).
const COMPONENTS = { CallEvent, WebPage, Slider, Lottogenerator, Cartsystem, Modalbox };

// Uploads (/media/...) an next/image vorbei (dynamische Route, unbekannte Maße).
function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

function Media({ project }) {
    const { media_type, media, name } = project;

    if (media_type === 'component') {
        const Comp = COMPONENTS[media];
        if (!Comp) return null;
        return (
            <InteractionTracker name={`Referenz getestet: ${name}`}>
                <Comp />
            </InteractionTracker>
        );
    }
    if (media_type === 'video' && media) {
        return (
            <video className="promo-video" width="100%" height="100%" controls playsInline>
                <source src={media} type="video/mp4" />
            </video>
        );
    }
    if (media_type === 'image' && media) {
        return (
            <Image className={styles.imageAuto} src={media} alt={name}
                   width={500} height={500} unoptimized={isUpload(media)} />
        );
    }
    if (media_type === 'sandbox') {
        return (
            <InteractionTracker name={`Demo getestet: ${name}`}>
                <Sandbox html={project.sandbox_html} css={project.sandbox_css} js={project.sandbox_js} title={name} />
            </InteractionTracker>
        );
    }
    return null;
}

// Große Case-Study-Sektion im Zickzack (gerade = secondary--bg + row,
// ungerade = normaler Hintergrund + row-reverse) — wie die bisherige Anzeige.
function FullProject({ project, index }) {
    const even = index % 2 === 0;
    return (
        <section className={even ? 'secondary--bg' : ''}>
            <div className="content-inner">
                <SectionView as="h2" name={project.name} className={`${roboto.className}`}>{project.name}</SectionView>
                <div className={even ? 'row' : 'row row-reverse'}>
                    <div className={`col-12 col-md-6 is--centered`}>
                        <Media project={project} />
                    </div>
                    <div className={`col-12 col-md-6`}>
                        {project.headline && <h3 className={`${ranga.className}`}>{project.headline}</h3>}
                        {project.introList.map((p, i) => <p key={i}>{p}</p>)}
                        {project.featureList.length > 0 && (
                            <ul className={`content-list`}>
                                {project.featureList.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        )}
                        {project.techList.length > 0 && <TechTags tags={project.techList} />}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Eine kompakte Karte („Weitere Elemente").
function CompactCard({ project }) {
    return (
        <>
            <div className={`${styles.imageRatio}`}>
                {project.media && (
                    <Image className={`${styles.imageAuto}`} src={project.media} alt={project.name}
                           width={500} height={500} unoptimized={isUpload(project.media)} />
                )}
            </div>
            <h3 className={`${ranga.className}`}>{project.name}</h3>
            {project.introList.map((t, i) => <p key={i}>{t}</p>)}
        </>
    );
}

// Horizontaler Infinity-Slider für die kompakten Karten (ab >4 Elementen).
// Natives Touch-Scrollen (Momentum) + nahtloser Loop: der Track enthält die
// Karten dreifach; beim Verlassen der mittleren Kopie wird die Scrollposition um
// eine Kopienbreite zurückgesetzt (unsichtbar, da identischer Inhalt & keine
// Scrollbar). Pfeile scrollen eine Karte weiter. Keine externe Abhängigkeit.
function CompactSlider({ projects }) {
    const trackRef = useRef(null);
    const n = projects.length;
    const slides = [...projects, ...projects, ...projects];

    useEffect(() => {
        const el = trackRef.current;
        if (!el || n === 0) return;

        let stride = 0; // Breite einer Kopie (n Karten inkl. Gaps)
        const measure = () => {
            const first = el.children[0];
            if (!first) return;
            const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
            stride = (first.offsetWidth + gap) * n;
            el.scrollLeft = stride; // in der mittleren Kopie starten
        };
        // nach dem Layout messen
        const raf = requestAnimationFrame(measure);

        let ticking = false;
        const onScroll = () => {
            if (ticking || !stride) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                // innerhalb der mittleren Kopie halten (±½ Kopie Puffer)
                if (el.scrollLeft < stride * 0.5) el.scrollLeft += stride;
                else if (el.scrollLeft >= stride * 1.5) el.scrollLeft -= stride;
            });
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', measure);
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', measure);
        };
    }, [n]);

    const step = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const first = el.children[0];
        const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
        const itemW = first ? first.offsetWidth + gap : el.clientWidth;
        el.scrollBy({ left: dir * itemW, behavior: 'smooth' });
    };

    return (
        <div className={styles.slider}>
            <button type="button" className={styles.sliderNav} onClick={() => step(-1)} aria-label="Zurück">‹</button>
            <div className={styles.sliderTrack} ref={trackRef}>
                {slides.map((p, i) => (
                    <div key={`${p.id}-${i}`} className={styles.sliderItem}>
                        <CompactCard project={p} />
                    </div>
                ))}
            </div>
            <button type="button" className={styles.sliderNav} onClick={() => step(1)} aria-label="Weiter">›</button>
        </div>
    );
}

// „Weitere Elemente": bis 4 als Grid, ab >4 als Slider.
const COMPACT_GRID_MAX = 4;
function CompactSection({ projects }) {
    if (projects.length === 0) return null;
    return (
        <section className="secondary--bg">
            <div className="content-inner">
                <h2 className={`${roboto.className} is--centered`}>Weitere Elemente</h2>
                {projects.length > COMPACT_GRID_MAX ? (
                    <CompactSlider projects={projects} />
                ) : (
                    <div className={`row`}>
                        {projects.map((p) => (
                            <div key={p.id} className={`col-6 col-md-3`}>
                                <CompactCard project={p} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// Seitenzahl-Navigation (Portfolio-Stil). Zeigt Pfeile + Seitenzahlen.
function Pager({ page, totalPages, onChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className={styles.pager}>
            <button type="button" className={styles.pagerBtn} onClick={() => onChange(page - 1)}
                    disabled={page === 1} aria-label="Vorherige Seite">‹</button>
            {pages.map((p) => (
                <button key={p} type="button"
                        className={`${styles.pagerBtn}${p === page ? ` ${styles.pagerActive}` : ''}`}
                        onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
                    {p}
                </button>
            ))}
            <button type="button" className={styles.pagerBtn} onClick={() => onChange(page + 1)}
                    disabled={page === totalPages} aria-label="Nächste Seite">›</button>
        </div>
    );
}

// Rendert alle Projekte einer Kategorie datengetrieben (aus der Content-DB).
// Große Projekte werden ab >6 paginiert; die kompakten Karten am Ende.
const PAGE_SIZE = 6;
export default function ShowcaseProjects({ projects = [] }) {
    const full = projects.filter((p) => p.variant === 'full');
    const compact = projects.filter((p) => p.variant === 'compact');

    const [page, setPage] = useState(1);
    const topRef = useRef(null);

    const totalPages = Math.max(1, Math.ceil(full.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const pageItems = full.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    const changePage = (p) => {
        setPage(p);
        // an den Anfang der Projektliste scrollen (Zickzack beginnt oben neu).
        if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <div ref={topRef} />
            {pageItems.map((p, i) => <FullProject key={p.id} project={p} index={i} />)}
            {totalPages > 1 && (
                <section>
                    <div className="content-inner">
                        <Pager page={current} totalPages={totalPages} onChange={changePage} />
                    </div>
                </section>
            )}
            <CompactSection projects={compact} />
        </>
    );
}
