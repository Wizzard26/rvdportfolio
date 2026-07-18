import { getAreasWithEntries } from '@/lib/content/vitaPersonalStore';
import { listDocuments } from '@/lib/content/documents';
import VitaAdminTabs from '@/components/analytics/VitaAdminTabs';
import VitaPersonalManager from '@/components/analytics/VitaPersonalManager';

export const dynamic = 'force-dynamic';

export default async function VitaPersonalAdmin() {
    const areas = getAreasWithEntries();
    const documents = listDocuments();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Vita verwalten</h1>
                    <p>Persönliche Daten, Qualifikationen und Zertifikate · {areas.length} Bereiche</p>
                </div>
            </div>

            <VitaAdminTabs active="personal" />

            <section className="an-card">
                <VitaPersonalManager areas={areas} documents={documents} />
            </section>
        </div>
    );
}
