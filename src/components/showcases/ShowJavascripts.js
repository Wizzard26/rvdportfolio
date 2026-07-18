'use client';

import ShowcaseProjects from "@/components/showcases/ShowcaseProjects";

// JavaScript-Tab: rendert die codejs-Einträge datengetrieben (aus der Content-DB).
// Interaktive Demos laufen als Komponenten-Slots (Whitelist) oder als
// admin-gepflegte Sandbox (HTML/CSS/JS im isolierten iframe).
export default function ShowJavascripts({ projects = [] }) {
    return <ShowcaseProjects projects={projects} />;
}
