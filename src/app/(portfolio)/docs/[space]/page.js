import Link from 'next/link';
import { notFound } from 'next/navigation';
import { roboto } from '@/app/fonts';
import DocsShell from '@/components/docs/DocsShell';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata, breadcrumbSchema, ogImageUrl } from '@/lib/seo';
import { getSpaceBySlug } from '@/lib/content/docSpacesStore';
import { getDocsBySpace } from '@/lib/content/postsStore';
import { buildDocTree } from '@/lib/docsTree';
import styles from '@/components/docs/docs.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { space } = await params;
    const s = getSpaceBySlug(space);
    if (!s) return pageMetadata({ title: 'Doku nicht gefunden', description: '', path: `/docs/${space}`, noindex: true });
    return pageMetadata({
        title: `${s.name} – Dokumentation`,
        description: s.description || `Dokumentation: ${s.name}`,
        path: `/docs/${s.slug}`,
        image: ogImageUrl(s.name, 'Dokumentation'),
    });
}

// Startseite EINES Doku-Bereichs: Baum-Sidebar + Themenliste des Bereichs.
export default async function SpaceIndex({ params }) {
    const { space } = await params;
    const s = getSpaceBySlug(space);
    if (!s || !s.is_active) notFound();

    const docs = getDocsBySpace(s.id, { publicOnly: true });
    const tree = buildDocTree(docs);

    return (
        <>
            <JsonLd data={breadcrumbSchema([
                { name: 'Doku', path: '/docs' },
                { name: s.name, path: `/docs/${s.slug}` },
            ])} />
            <DocsShell space={s} tree={tree}>
            <h1 className={`${styles.docTitle} ${roboto.className}`}>{s.name}</h1>
            {s.description && <p className={styles.docSubline}>{s.description}</p>}

            {docs.length === 0 ? (
                <p>Diese Dokumentation hat noch keine veröffentlichten Seiten.</p>
            ) : (
                <div className={styles.indexGroups}>
                    {tree.map((grp) => (
                        <div className={styles.indexGroup} key={grp.group || '_'}>
                            {grp.group && <h2 className={styles.indexGroupTitle}>{grp.group}</h2>}
                            <ul className={styles.indexList}>
                                {grp.items.map((item) => (
                                    <li key={item.doc.id}>
                                        <Link href={`/docs/${s.slug}/${item.doc.slug}`}>{item.doc.title}</Link>
                                        {item.doc.teaser && <span className={styles.indexTeaser}>{item.doc.teaser}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            </DocsShell>
        </>
    );
}
