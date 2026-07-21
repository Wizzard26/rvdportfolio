import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import DocumentForm from '@/components/analytics/DocumentForm';
import { updateDocumentAction } from '@/lib/content/documentsActions';
import { getDocument } from '@/lib/content/documentsStore';
import { listDocuments } from '@/lib/content/documents';

export const dynamic = 'force-dynamic';

export default async function EditDocument({ params }) {
    const { id } = await params;
    const document = getDocument(Number(id));
    if (!document) notFound();
    const pdfs = listDocuments();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/dokumente" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Dokument bearbeiten</h1>
                    <p>{document.title}</p>
                </div>
            </div>
            <section className="an-card an-card-form">
                <DocumentForm action={updateDocumentAction} document={document} pdfs={pdfs} />
            </section>
        </div>
    );
}
