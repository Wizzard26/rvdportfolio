import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getPosts } from '@/lib/content/postsStore';
import PostList from '@/components/analytics/PostList';
import PostsAdminTabs from '@/components/analytics/PostsAdminTabs';

export const dynamic = 'force-dynamic';

export default async function BlogAdmin() {
    const posts = getPosts({ type: 'blog' });

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Blog verwalten</h1>
                    <p>Beiträge anlegen, bearbeiten und per Drag &amp; Drop sortieren · {posts.length} Beiträge</p>
                </div>
                <Link href="/dashboard/blog/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neuer Beitrag
                </Link>
            </div>

            <PostsAdminTabs active="blog" />

            <section className="an-card">
                <PostList posts={posts} type="blog" />
            </section>
        </div>
    );
}
