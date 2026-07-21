import Link from 'next/link';

// Umschalter zwischen den beiden Dokument-Bereichen.
export default function DocumentsAdminTabs({ active }) {
    return (
        <div className="an-tabs">
            <Link href="/dashboard/dokumente" className={`an-tab${active === 'documents' ? ' is-active' : ''}`}>Dokumente</Link>
            <Link href="/dashboard/dokumente/freigaben" className={`an-tab${active === 'shares' ? ' is-active' : ''}`}>Freigaben</Link>
        </div>
    );
}
