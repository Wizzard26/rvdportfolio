import Link from 'next/link';

// Umschalter zwischen den beiden Showcase-Verwaltungsbereichen.
export default function ShowcaseAdminTabs({ active }) {
    return (
        <div className="an-tabs">
            <Link href="/dashboard/showcase" className={`an-tab${active === 'projects' ? ' is-active' : ''}`}>Projekte</Link>
            <Link href="/dashboard/showcase/galerien" className={`an-tab${active === 'galleries' ? ' is-active' : ''}`}>Galerien</Link>
        </div>
    );
}
