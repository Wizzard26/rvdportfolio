import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getGalleryItems } from '@/lib/content/galleryStore';
import GalleryItemList from '@/components/analytics/GalleryItemList';
import ShowcaseAdminTabs from '@/components/analytics/ShowcaseAdminTabs';

export const dynamic = 'force-dynamic';

export default async function GalleriesAdmin() {
    const items = getGalleryItems();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Showcase verwalten</h1>
                    <p>Design-Galerien (Layouts, Logos, Print) anlegen, bearbeiten und je Galerie per Drag &amp; Drop sortieren · {items.length} Einträge</p>
                </div>
                <Link href="/dashboard/showcase/galerien/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neuer Eintrag
                </Link>
            </div>

            <ShowcaseAdminTabs active="galleries" />

            <section className="an-card">
                <GalleryItemList items={items} />
            </section>
        </div>
    );
}
