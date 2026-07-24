import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import PostForm from '@/components/analytics/PostForm';
import { createPostAction } from '@/lib/content/postsActions';
import { getDocsBySpace } from '@/lib/content/postsStore';
import { getCategories } from '@/lib/content/categoriesStore';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default async function NewPost({ searchParams }) {
    const { type, space } = await searchParams;
    const isDoc = type === 'doc';
    const images = listImages();
    const categories = getCategories({ publicOnly: true });
    const spaces = getSpaces();

    // Bereich vorbelegen (aus ?space= oder dem ersten Bereich); Eltern-Auswahl
    // auf diesen Bereich beschränken.
    const spaceId = isDoc ? (Number(space) || spaces[0]?.id || 0) : 0;
    const docParents = isDoc && spaceId ? getDocsBySpace(spaceId) : [];
    const backHref = isDoc ? (spaceId ? `/dashboard/blog/docs/${spaceId}` : '/dashboard/blog/docs') : '/dashboard/blog';

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href={backHref} className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>{isDoc ? 'Neue Doku-Seite' : 'Neuer Beitrag'}</h1>
                </div>
            </div>
            <section className="an-card an-card-form an-card-wide">
                <PostForm
                    action={createPostAction}
                    post={{ type: isDoc ? 'doc' : 'blog', is_active: 0, space_id: spaceId }}
                    images={images}
                    categories={categories}
                    docParents={docParents}
                    spaces={spaces}
                />
            </section>
        </div>
    );
}
