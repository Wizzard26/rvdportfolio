import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import GalleryForm from '@/components/analytics/GalleryForm';
import { createGalleryItemAction } from '@/lib/content/galleryActions';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default function NewGalleryItem() {
    const images = listImages();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/showcase/galerien" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Galerien</Link>
                    <h1>Neuer Galerie-Eintrag</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <GalleryForm action={createGalleryItemAction} images={images} />
            </section>
        </div>
    );
}
