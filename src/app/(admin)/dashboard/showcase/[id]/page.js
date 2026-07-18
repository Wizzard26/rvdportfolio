import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import ProjectForm from '@/components/analytics/ProjectForm';
import { updateProjectAction } from '@/lib/content/showcaseActions';
import { getProject } from '@/lib/content/showcaseStore';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default async function EditProject({ params }) {
    const { id } = await params;
    const project = getProject(Number(id));
    if (!project) notFound();
    const images = listImages();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/showcase" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Projekt bearbeiten</h1>
                    <p>{project.name}</p>
                </div>
            </div>
            <section className="an-card an-card-form">
                <ProjectForm action={updateProjectAction} project={project} images={images} />
            </section>
        </div>
    );
}
