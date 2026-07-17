import { siteConfig } from '@/lib/seo';

// Erzeugt /sitemap.xml zur Build-Zeit und ist in robots.txt verlinkt.
//
// Enthalten sind nur indexierbare Seiten. Bewusst NICHT gelistet:
// - /blog + /blog/[slug] → tragen `noindex` (Platzhalter-Inhalte)
// - /dashboard, /api      → nicht öffentlich
//
// `priority` ist ein relativer Hinweis innerhalb der eigenen Domain, kein
// Ranking-Faktor: Er sagt Crawlern nur, welche Seiten uns selbst am wichtigsten
// sind. Showcase und Vita stehen deshalb vor den Rechtstexten.
const routes = [
    { path: '/', changeFrequency: 'monthly', priority: 1.0 },
    { path: '/showcase', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/vita', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/about-me', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/imprint', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.2 },
];

export default function sitemap() {
    // Build-Zeitpunkt als lastModified. Da bei jedem Merge nach main neu
    // gebaut und deployt wird, entspricht das dem Stand des Deployments.
    const lastModified = new Date();

    return routes.map((route) => ({
        url: route.path === '/' ? siteConfig.url : `${siteConfig.url}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
