import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import PrivateRefForm from '@/components/analytics/PrivateRefForm';
import { createPrivateRefAction } from '@/lib/content/privateRefsActions';

export const dynamic = 'force-dynamic';

export default function NewPrivateRef() {
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/vertrauliche-referenzen" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den vertraulichen Referenzen</Link>
                    <h1>Neue vertrauliche Referenz</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <PrivateRefForm action={createPrivateRefAction} />
                <p className="an-card-note" style={{ marginTop: 12 }}>Screenshots kannst du nach dem Speichern
                    im Bearbeiten-Modus hinzufügen.</p>
            </section>
        </div>
    );
}
