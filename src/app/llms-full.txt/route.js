import { siteConfig } from '@/lib/seo';
import { getPosts, getDocsBySpace } from '@/lib/content/postsStore';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { toIsoDate } from '@/lib/dateFormat';

// /llms-full.txt — die „lange" Variante der llms.txt (llmstxt.org): nicht nur
// Links, sondern der VOLLSTÄNDIGE Textinhalt von Blog und Dokumentation in einer
// Datei, damit ein LLM alles in einem Abruf aufnehmen kann. Dynamisch aus
// content.db, Bodies sind bereits Markdown.
export const dynamic = 'force-dynamic';

const abs = (path) => `${siteConfig.url}${path}`;
const oneLine = (s) => (s || '').replace(/\s+/g, ' ').trim();

const INTRO = `# René van Dinter – Shopware- & Web-Developer

> ${siteConfig.descriptionLong}

Diese Datei enthält die vollständigen Inhalte von Blog und Dokumentation im
Klartext (Markdown). Profil, Kontakt und Qualifikationen stehen in /llms.txt.
Standort: Stade, Niedersachsen, Deutschland. Sprache: Deutsch.`;

export function GET() {
    const parts = [INTRO];

    // ── Blog: voller Beitragstext ───────────────────────────────────────────
    let posts = [];
    try { posts = getPosts({ type: 'blog', publicOnly: true }); } catch { /* Build ohne DB */ }
    if (posts.length) {
        parts.push('---\n\n# Blog');
        for (const p of posts) {
            const meta = [toIsoDate(p.published_at), p.author].filter(Boolean).join(' · ');
            const block = [
                `## ${p.title}`,
                p.subline ? `*${oneLine(p.subline)}*` : '',
                meta,
                `URL: ${abs(`/blog/${p.slug}`)}`,
                p.teaser ? `\n${oneLine(p.teaser)}` : '',
                p.body ? `\n${p.body.trim()}` : '',
            ].filter(Boolean).join('\n');
            parts.push(block);
        }
    }

    // ── Dokumentation: voller Seitentext je Bereich ─────────────────────────
    let spaces = [];
    try { spaces = getSpaces({ publicOnly: true }); } catch { /* Build ohne DB */ }
    for (const space of spaces) {
        const docs = getDocsBySpace(space.id, { publicOnly: true });
        if (docs.length === 0) continue;
        parts.push(`---\n\n# Dokumentation: ${space.name}${space.description ? `\n\n> ${oneLine(space.description)}` : ''}`);
        for (const d of docs) {
            const block = [
                `## ${d.title}${d.doc_group ? ` (${d.doc_group})` : ''}`,
                d.subline ? `*${oneLine(d.subline)}*` : '',
                `URL: ${abs(`/docs/${space.slug}/${d.slug}`)}`,
                d.teaser ? `\n${oneLine(d.teaser)}` : '',
                d.body ? `\n${d.body.trim()}` : '',
            ].filter(Boolean).join('\n');
            parts.push(block);
        }
    }

    return new Response(`${parts.join('\n\n')}\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
