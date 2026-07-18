'use client';

import ShowcaseProjects from "@/components/showcases/ShowcaseProjects";

// Shopware-Tab: rendert die Shopware-Projekte datengetrieben (aus der Content-DB).
export default function ShowShopware({ projects = [] }) {
    return <ShowcaseProjects projects={projects} />;
}
