import { siteConfig } from '@/lib/seo';

// Erzeugt /robots.txt zur Build-Zeit.
//
// Haltung: Die Seite ist ein öffentliches Portfolio — sie soll gefunden werden,
// von Suchmaschinen wie von KI-Systemen. Deshalb ist alles erlaubt, was nichts
// Internes preisgibt.
//
// Hinweis zu /blog: bewusst NICHT gesperrt. Die Blog-Seiten tragen ein
// `noindex`-Meta-Tag (Platzhalter-Inhalte) — ein Crawler muss sie abrufen
// dürfen, um dieses Tag überhaupt zu sehen. Ein Disallow würde das noindex
// verstecken und die Seiten könnten trotzdem im Index landen.
export default function robots() {
    // Nicht öffentlich: Admin-Bereich, Login und API-Routen.
    const disallow = ['/api/', '/dashboard', '/login'];

    // KI-Crawler: Training/Suche ausdrücklich erlaubt. `*` erlaubt sie zwar
    // ohnehin, aber `Google-Extended` und `Applebot-Extended` sind reine
    // Opt-out-Tokens — sie hier explizit zu führen dokumentiert die
    // Entscheidung und macht sie später leicht umkehrbar.
    const aiCrawlers = [
        'GPTBot', // OpenAI, Training
        'OAI-SearchBot', // OpenAI, Suchindex
        'ChatGPT-User', // OpenAI, Live-Abruf im Chat
        'ClaudeBot', // Anthropic, Training
        'Claude-User', // Anthropic, Live-Abruf im Chat
        'Claude-SearchBot', // Anthropic, Suchindex
        'PerplexityBot', // Perplexity, Index
        'Perplexity-User', // Perplexity, Live-Abruf
        'Google-Extended', // Google Gemini/Vertex (Opt-out-Token)
        'Applebot-Extended', // Apple Intelligence (Opt-out-Token)
        'CCBot', // Common Crawl
        'meta-externalagent', // Meta AI
    ];

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow,
            },
            ...aiCrawlers.map((userAgent) => ({
                userAgent,
                allow: '/',
                disallow,
            })),
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    };
}
