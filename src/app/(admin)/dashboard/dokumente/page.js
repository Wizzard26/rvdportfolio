import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getDocuments, ensureVitaSetting } from '@/lib/content/documentsStore';
import { setVitaDocumentAction } from '@/lib/content/documentsActions';
import DocumentList from '@/components/analytics/DocumentList';
import DocumentsAdminTabs from '@/components/analytics/DocumentsAdminTabs';

export const dynamic = 'force-dynamic';

export default async function DocumentsAdmin() {
    const documents = getDocuments();
    const vitaId = ensureVitaSetting();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Dokumente verwalten</h1>
                    <p>PDFs hochladen und als Download bereitstellen · {documents.length} Dokumente</p>
                </div>
                <Link href="/dashboard/dokumente/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neues Dokument
                </Link>
            </div>

            <DocumentsAdminTabs active="documents" />

            <section className="an-card an-card-form">
                <form action={setVitaDocumentAction} className="an-form an-inline-select">
                    <label className="an-field">
                        <span>„Vita als Download"-Button verwendet dieses Dokument</span>
                        <select name="document_id" defaultValue={String(vitaId)}>
                            <option value="">— keins (Fallback: /document/Vita.pdf) —</option>
                            {documents.map((d) => (
                                <option key={d.id} value={d.id}>{d.title}{d.is_active ? '' : ' (Entwurf)'}</option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" className="an-btn-primary">Übernehmen</button>
                </form>
            </section>

            <section className="an-card">
                <DocumentList documents={documents} />
            </section>
        </div>
    );
}
