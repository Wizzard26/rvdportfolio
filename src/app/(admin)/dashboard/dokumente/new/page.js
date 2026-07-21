import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import DocumentForm from '@/components/analytics/DocumentForm';
import { createDocumentAction } from '@/lib/content/documentsActions';
import { listDocuments } from '@/lib/content/documents';

export const dynamic = 'force-dynamic';

export default function NewDocument() {
    const pdfs = listDocuments();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/dokumente" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Neues Dokument</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <DocumentForm action={createDocumentAction} pdfs={pdfs} />
            </section>
        </div>
    );
}
