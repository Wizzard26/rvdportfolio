'use client';

import ShowcaseProjects from "@/components/showcases/ShowcaseProjects";

// React/Next-Tab: rendert die React-Projekte datengetrieben (aus der Content-DB).
// Die interaktiven Demos (CallEvent, WebPage) laufen als Komponenten-Slots.
export default function ShowReact({ projects = [] }) {
    return <ShowcaseProjects projects={projects} />;
}
