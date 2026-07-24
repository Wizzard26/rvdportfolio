import { siteConfig } from '@/lib/seo';
import { getPosts, getDocsBySpace } from '@/lib/content/postsStore';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { toIsoDate } from '@/lib/dateFormat';

// Erzeugt /sitemap.xml und ist in robots.txt verlinkt.
//
// Statische Kernseiten + dynamisch alle AKTIVEN Blog-Beiträge und Doku-Seiten
// (aus content.db). `force-dynamic`, weil die Inhalte im Server-Volume erst zur
// Laufzeit existieren — ein Build-Snapshot würde neue Beiträge verpassen.
//
// `priority` ist ein relativer Hinweis innerhalb der eigenen Domain, kein
// Ranking-Faktor.
export const dynamic = 'force-dynamic';

const staticRoutes = [
    { path: '/', changeFrequency: 'monthly', priority: 1.0 },
    { path: '/shopware-entwickler', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/showcase', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/vita', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/about-me', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/docs', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/angebot', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/imprint', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.2 },
];

const abs = (path) => (path === '/' ? siteConfig.url : `${siteConfig.url}${path}`);
const fromEpoch = (ms) => (ms ? new Date(ms) : undefined);

export default function sitemap() {
    const now = new Date();

    const entries = staticRoutes.map((r) => ({
        url: abs(r.path),
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));

    // Blog-Beiträge (nur aktive).
    let posts = [];
    try { posts = getPosts({ type: 'blog', publicOnly: true }); } catch { /* Build ohne DB */ }
    for (const p of posts) {
        const iso = toIsoDate(p.published_at);
        entries.push({
            url: abs(`/blog/${p.slug}`),
            lastModified: fromEpoch(p.updated_at) || (iso ? new Date(iso) : now),
            changeFrequency: 'monthly',
            priority: 0.6,
        });
    }

    // Doku-Bereiche und ihre Seiten (nur aktive; leere Bereiche werden übersprungen).
    let spaces = [];
    try { spaces = getSpaces({ publicOnly: true }); } catch { /* Build ohne DB */ }
    for (const space of spaces) {
        const docs = getDocsBySpace(space.id, { publicOnly: true });
        if (docs.length === 0) continue;
        entries.push({
            url: abs(`/docs/${space.slug}`),
            lastModified: fromEpoch(space.updated_at) || now,
            changeFrequency: 'weekly',
            priority: 0.6,
        });
        for (const d of docs) {
            entries.push({
                url: abs(`/docs/${space.slug}/${d.slug}`),
                lastModified: fromEpoch(d.updated_at) || now,
                changeFrequency: 'monthly',
                priority: 0.5,
            });
        }
    }

    return entries;
}
