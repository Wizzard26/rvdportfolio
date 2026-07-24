import Link from 'next/link';
import { FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { roboto } from '@/app/fonts';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { getDocsBySpace } from '@/lib/content/postsStore';
import styles from '@/components/docs/docs.module.css';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
    title: 'Dokumentation',
    description: 'Dokumentationen und Anleitungen von René van Dinter.',
    path: '/docs',
});

// Übersicht aller Doku-Bereiche (wie die Projektauswahl in GitBook). Von hier
// springt man in eine der eigenständigen Dokumentationen.
export default function DocsOverview() {
    const spaces = getSpaces({ publicOnly: true })
        .map((s) => ({ ...s, pages: getDocsBySpace(s.id, { publicOnly: true }).length }))
        .filter((s) => s.pages > 0);

    return (
        <main className="main-content">
            <JsonLd data={breadcrumbSchema([{ name: 'Doku', path: '/docs' }])} />
            <section>
                <div className="content-inner">
                    <h1 className={roboto.className}>Dokumentation</h1>
                    {spaces.length === 0 ? (
                        <p>Hier entstehen die Dokumentationen. Aktuell ist noch nichts veröffentlicht.</p>
                    ) : (
                        <>
                            <p className={styles.overviewLead}>Wähle eine Dokumentation:</p>
                            <div className={styles.spaceCards}>
                                {spaces.map((s) => (
                                    <Link href={`/docs/${s.slug}`} className={styles.spaceCard} key={s.id}>
                                        <span className={styles.spaceCardIcon}><FiBookOpen aria-hidden="true" /></span>
                                        <span className={styles.spaceCardName}>{s.name}</span>
                                        {s.description && <span className={styles.spaceCardDesc}>{s.description}</span>}
                                        <span className={styles.spaceCardFoot}>
                                            <span className={styles.spaceCardMeta}>{s.pages} {s.pages === 1 ? 'Seite' : 'Seiten'}</span>
                                            <span className={styles.spaceCardCta}>Weiterlesen <FiArrowRight aria-hidden="true" /></span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
