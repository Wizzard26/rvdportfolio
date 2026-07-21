import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getDocuments } from '@/lib/content/documentsStore';
import DocumentList from '@/components/analytics/DocumentList';

export const dynamic = 'force-dynamic';

export default async function DocumentsAdmin() {
    const documents = getDocuments();

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

            <section className="an-card">
                <DocumentList documents={documents} />
            </section>
        </div>
    );
}
