import { notFound } from 'next/navigation';
import { roboto } from '@/app/fonts';
import Markdown from '@/components/blog/Markdown';
import DocsShell from '@/components/docs/DocsShell';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata, techArticleSchema, breadcrumbSchema, ogImageUrl } from '@/lib/seo';
import { getSpaceBySlug } from '@/lib/content/docSpacesStore';
import { getDocsBySpace, getDocBySpaceAndSlug } from '@/lib/content/postsStore';
import { buildDocTree, flattenDocs, extractHeadings } from '@/lib/docsTree';
import styles from '@/components/docs/docs.module.css';

// Inhalte aus content.db (admin-editierbar) → dynamisch. Nur aktive Bereiche +
// Seiten sind öffentlich. `noindex` bleibt vorerst gesetzt (wie Blog).
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { space, slug } = await params;
    const s = getSpaceBySlug(space);
    const doc = s ? getDocBySpaceAndSlug(s.id, slug) : null;
    if (!doc) {
        return pageMetadata({ title: 'Seite nicht gefunden', description: 'Diese Doku-Seite existiert nicht.', path: `/docs/${space}/${slug}`, noindex: true });
    }
    return pageMetadata({
        title: `${doc.title} · ${s.name}`,
        description: doc.teaser || `Dokumentation: ${doc.title}`,
        path: `/docs/${s.slug}/${doc.slug}`,
        image: ogImageUrl(doc.title, s.name),
    });
}

export default async function DocPage({ params }) {
    const { space, slug } = await params;
    const s = getSpaceBySlug(space);
    if (!s || !s.is_active) notFound();

    const doc = getDocBySpaceAndSlug(s.id, slug);
    if (!doc || !doc.is_active) notFound();

    const docs = getDocsBySpace(s.id, { publicOnly: true });
    const tree = buildDocTree(docs);
    const flat = flattenDocs(tree);
    const index = flat.findIndex((d) => d.id === doc.id);
    const prev = index > 0 ? flat[index - 1] : null;
    const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
    const headings = extractHeadings(doc.body);

    return (
        <>
            <JsonLd data={[
                techArticleSchema(doc, s),
                breadcrumbSchema([
                    { name: 'Doku', path: '/docs' },
                    { name: s.name, path: `/docs/${s.slug}` },
                    { name: doc.title, path: `/docs/${s.slug}/${doc.slug}` },
                ]),
            ]} />
            <DocsShell space={s} tree={tree} activeSlug={doc.slug} headings={headings} prev={prev} next={next}>
                <h1 className={`${styles.docTitle} ${roboto.className}`}>{doc.title}</h1>
                {doc.subline && <p className={styles.docSubline}>{doc.subline}</p>}
                {doc.body && <Markdown>{doc.body}</Markdown>}
            </DocsShell>
        </>
    );
}
