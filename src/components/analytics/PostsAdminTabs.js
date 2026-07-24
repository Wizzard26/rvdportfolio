import Link from 'next/link';

// Umschalter zwischen Blog-Beiträgen und Doku-Seiten (eine Engine, zwei Modi).
export default function PostsAdminTabs({ active }) {
    return (
        <div className="an-tabs">
            <Link href="/dashboard/blog" className={`an-tab${active === 'blog' ? ' is-active' : ''}`}>Blog</Link>
            <Link href="/dashboard/blog/docs" className={`an-tab${active === 'doc' ? ' is-active' : ''}`}>Doku</Link>
            <Link href="/dashboard/blog/kategorien" className={`an-tab${active === 'categories' ? ' is-active' : ''}`}>Kategorien</Link>
        </div>
    );
}
