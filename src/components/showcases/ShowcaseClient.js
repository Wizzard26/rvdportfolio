'use client';
import { ranga, roboto_condensed } from "@/app/fonts";
import ShowCases from "@/components/showcases/ShowCases";
import ShowSwitch from "@/components/showcases/ShowSwitch";
import { useState, useEffect } from "react";

// Der interaktive Teil der Showcase-Seite (Tab-Umschaltung).
//
// Ausgelagert, damit `showcase/page.js` eine Server-Component bleiben kann:
// Nur Server-Components dürfen `metadata` exportieren — als 'use client'-Seite
// hätte die Showcase keinen eigenen Titel und keine eigene Beschreibung
// bekommen können.
//
// Einleitungstext und Switch liegen in einer gemeinsamen Zeile und teilen sich
// den `cases`-State mit der Galerie darunter; deshalb verläuft die Grenze zum
// Client hier und nicht enger.
export default function ShowcaseClient({ shopwareProjects = [], reactProjects = [], codejsProjects = [], galleryItems = [] }) {
    const [cases, setCases] = useState('shopware');

    // Deep-Link vom CV-Assistenten: /showcase#project-<id> öffnet die richtige
    // Kategorie und scrollt zum Projekt (auch wenn es in einem anderen Tab liegt).
    useEffect(() => {
        const m = window.location.hash.match(/^#project-(\d+)$/);
        if (!m) return undefined;
        const pid = Number(m[1]);
        const has = (arr) => arr.some((p) => p.id === pid);
        const cat = has(shopwareProjects) ? 'shopware'
            : has(reactProjects) ? 'react'
                : has(codejsProjects) ? 'codejs' : null;
        if (!cat) return undefined;
        setCases(cat);
        const t = setTimeout(() => {
            document.getElementById(`project-${pid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 160);
        return () => clearTimeout(t);
    }, [shopwareProjects, reactProjects, codejsProjects]);

    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <h1 className={`${roboto_condensed.className}`}>Showcase Referenzen und Case Studys</h1>
                    <div className={`row`}>
                        <div className={`col-12 col-md-6`}>
                            <h2 className={`${ranga.className}`}>Referenzen, Auftragsarbeiten und Fingerübungen</h2>
                            <p>Hier finden Sie arbeiten, welche ich in den letzten Jahren angefertigt habe. Diese
                                enstanden für Wettbewerbe, freie Mitarbeit bei verschiedenen Agenturen, sowie in
                                meiner Festanstellung als Frontend-Entwickler.</p>
                            <p>Die Sammlung besteht sowohl aus Auftragsarbeiten wie auch aus arbeiten welche einfach
                                nur zu eigenen Trainingszwecke erstellt wurden.</p>
                        </div>
                        <div className={`col-12 col-md-6`}>
                            <ShowSwitch cases={cases} setCases={setCases} />
                        </div>
                    </div>
                </div>
            </section>
            <ShowCases
                cases={cases}
                shopwareProjects={shopwareProjects}
                reactProjects={reactProjects}
                codejsProjects={codejsProjects}
                galleryItems={galleryItems}
            />
        </main>
    )
}
