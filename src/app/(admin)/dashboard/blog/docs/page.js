import { getSpaces, countPagesBySpace } from '@/lib/content/docSpacesStore';
import SpaceManager from '@/components/analytics/SpaceManager';
import PostsAdminTabs from '@/components/analytics/PostsAdminTabs';

export const dynamic = 'force-dynamic';

export default async function DocsAdmin() {
    const spaces = getSpaces().map((s) => ({ ...s, pages: countPagesBySpace(s.id) }));

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Doku-Bereiche verwalten</h1>
                    <p>Mehrere unabhängige Dokumentationen (wie GitBook-Projekte) · {spaces.length} Bereiche</p>
                </div>
            </div>

            <PostsAdminTabs active="doc" />

            <section className="an-card">
                <SpaceManager spaces={spaces} />
            </section>
        </div>
    );
}
