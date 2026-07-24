import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import PostForm from '@/components/analytics/PostForm';
import { updatePostAction } from '@/lib/content/postsActions';
import { getPost, getDocsBySpace } from '@/lib/content/postsStore';
import { getCategories } from '@/lib/content/categoriesStore';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { listImages } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

export default async function EditPost({ params }) {
    const { id } = await params;
    const post = getPost(Number(id));
    if (!post) notFound();
    const isDoc = post.type === 'doc';
    const images = listImages();
    const categories = getCategories({ publicOnly: true });
    const spaces = isDoc ? getSpaces() : [];
    // Eltern-Auswahl auf den Bereich der Seite beschränken.
    const docParents = isDoc && post.space_id ? getDocsBySpace(post.space_id) : [];
    const backHref = isDoc ? (post.space_id ? `/dashboard/blog/docs/${post.space_id}` : '/dashboard/blog/docs') : '/dashboard/blog';

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href={backHref} className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>{isDoc ? 'Doku-Seite bearbeiten' : 'Beitrag bearbeiten'}</h1>
                    <p>{post.title}</p>
                </div>
            </div>
            <section className="an-card an-card-form an-card-wide">
                <PostForm action={updatePostAction} post={post} images={images} categories={categories} docParents={docParents} spaces={spaces} />
            </section>
        </div>
    );
}
