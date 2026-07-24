import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { getSpace } from '@/lib/content/docSpacesStore';
import { getDocsBySpace } from '@/lib/content/postsStore';
import PostList from '@/components/analytics/PostList';
import SpaceEditForm from '@/components/analytics/SpaceEditForm';

export const dynamic = 'force-dynamic';

export default async function SpaceDetail({ params }) {
    const { spaceId } = await params;
    const space = getSpace(Number(spaceId));
    if (!space) notFound();
    const pages = getDocsBySpace(space.id);

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/blog/docs" className="an-back"><FiArrowLeft aria-hidden="true" /> Alle Bereiche</Link>
                    <h1>{space.name}</h1>
                    <p>Doku-Bereich · {pages.length} {pages.length === 1 ? 'Seite' : 'Seiten'} · öffentlich unter <code>/docs/{space.slug}</code></p>
                </div>
                <Link href={`/dashboard/blog/new?type=doc&space=${space.id}`} className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Seite
                </Link>
            </div>

            <section className="an-card an-card-form">
                <h2>Bereich bearbeiten</h2>
                <SpaceEditForm space={space} />
            </section>

            <section className="an-card">
                <h2>Seiten</h2>
                <PostList posts={pages} type="doc" spaceId={space.id} />
            </section>
        </div>
    );
}
