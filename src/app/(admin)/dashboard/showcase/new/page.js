import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import ProjectForm from '@/components/analytics/ProjectForm';
import { createProjectAction } from '@/lib/content/showcaseActions';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default function NewProject() {
    const images = listImages();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/showcase" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Neues Projekt</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <ProjectForm action={createProjectAction} images={images} />
            </section>
        </div>
    );
}
