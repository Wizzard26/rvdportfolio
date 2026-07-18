import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getProjects } from '@/lib/content/showcaseStore';
import ShowcaseProjectList from '@/components/analytics/ShowcaseProjectList';
import ShowcaseAdminTabs from '@/components/analytics/ShowcaseAdminTabs';

export const dynamic = 'force-dynamic';

export default async function ShowcaseAdmin() {
    const projects = getProjects();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Showcase verwalten</h1>
                    <p>Projekte anlegen, bearbeiten und je Kategorie per Drag &amp; Drop sortieren · {projects.length} Projekte</p>
                </div>
                <Link href="/dashboard/showcase/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neues Projekt
                </Link>
            </div>

            <ShowcaseAdminTabs active="projects" />

            <section className="an-card">
                <ShowcaseProjectList projects={projects} />
            </section>
        </div>
    );
}
