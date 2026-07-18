import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import GalleryForm from '@/components/analytics/GalleryForm';
import { updateGalleryItemAction } from '@/lib/content/galleryActions';
import { getGalleryItem } from '@/lib/content/galleryStore';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default async function EditGalleryItem({ params }) {
    const { id } = await params;
    const item = getGalleryItem(Number(id));
    if (!item) notFound();
    const images = listImages();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/showcase/galerien" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Galerien</Link>
                    <h1>Galerie-Eintrag bearbeiten</h1>
                    <p>{item.title}</p>
                </div>
            </div>
            <section className="an-card an-card-form">
                <GalleryForm action={updateGalleryItemAction} item={item} images={images} />
            </section>
        </div>
    );
}
