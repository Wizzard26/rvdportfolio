'use client';

import Image from "next/image";
import { roboto, ranga } from "@/app/fonts";
import styles from "./styles.module.css";
import TechTags from "./TechTags";
import SectionView from "@/components/analytics/SectionView";
import InteractionTracker from "@/components/analytics/InteractionTracker";
import CallEvent from "@/components/showcases/Callevent/CallEvent";
import WebPage from "@/components/showcases/WebProject/WebPage";

// Whitelist interaktiver Komponenten-Slots (feste App-Komponenten).
const COMPONENTS = { CallEvent, WebPage };

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

// Kompakte Karten („Weitere Elemente") als Grid.
function CompactGrid({ projects }) {
    if (projects.length === 0) return null;
    return (
        <section className="secondary--bg">
            <div className="content-inner">
                <h2 className={`${roboto.className} is--centered`}>Weitere Elemente</h2>
                <div className={`row`}>
                    {projects.map((p) => (
                        <div key={p.id} className={`col-6 col-md-3`}>
                            <div className={`${styles.imageRatio}`}>
                                {p.media && (
                                    <Image className={`${styles.imageAuto}`} src={p.media} alt={p.name}
                                           width={500} height={500} unoptimized={isUpload(p.media)} />
                                )}
                            </div>
                            <h3 className={`${ranga.className}`}>{p.name}</h3>
                            {p.introList.map((t, i) => <p key={i}>{t}</p>)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Rendert alle Projekte einer Kategorie datengetrieben (aus der Content-DB).
export default function ShowcaseProjects({ projects = [] }) {
    const full = projects.filter((p) => p.variant === 'full');
    const compact = projects.filter((p) => p.variant === 'compact');
    return (
        <>
            {full.map((p, i) => <FullProject key={p.id} project={p} index={i} />)}
            <CompactGrid projects={compact} />
        </>
    );
}
