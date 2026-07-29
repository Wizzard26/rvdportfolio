'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// Karte zur Datenverwaltung eines Analytics-Scopes: Backup-Download + Reset.
// `action` ist eine Server Action, die die Zeilen löscht und { deleted } liefert.
// Der Reset ist zweistufig (Klick → Bestätigen), damit nichts versehentlich
// gelöscht wird; ein Backup lässt sich vorher herunterladen.
export default function DataResetCard({ title, description, count = 0, backupHref, action }) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [pending, startTransition] = useTransition();
    const [deleted, setDeleted] = useState(null);
    const [error, setError] = useState('');

    const runReset = () => {
        setError('');
        setDeleted(null);
        startTransition(async () => {
            try {
                const res = await action();
                setDeleted(res?.deleted ?? 0);
                setConfirming(false);
                router.refresh();
            } catch {
                setError('Zurücksetzen fehlgeschlagen. Bitte erneut anmelden und noch einmal versuchen.');
                setConfirming(false);
            }
        });
    };

    return (
        <section className="an-card an-full an-danger-card">
            <h2>{title}</h2>
            <p className="an-card-note">{description}</p>

            <div className="an-data-actions">
                <a className="an-btn-secondary" href={backupHref} download>↓ Backup herunterladen</a>

                {!confirming ? (
                    <button
                        type="button"
                        className="an-btn-danger"
                        onClick={() => { setConfirming(true); setDeleted(null); setError(''); }}
                        disabled={pending || count === 0}
                    >
                        Zurücksetzen{count ? ` (${count})` : ''}
                    </button>
                ) : (
                    <span className="an-confirm">
                        <span>Wirklich alle {count} Einträge unwiderruflich löschen?</span>
                        <button type="button" className="an-btn-danger" onClick={runReset} disabled={pending}>
                            {pending ? 'Lösche…' : 'Ja, löschen'}
                        </button>
                        <button type="button" className="an-btn-secondary" onClick={() => setConfirming(false)} disabled={pending}>
                            Abbrechen
                        </button>
                    </span>
                )}
            </div>

            {deleted != null && (
                <p className="an-note-ok">{deleted} Einträge gelöscht — die Auswertung startet jetzt sauber neu.</p>
            )}
            {error && <p className="an-note-err">{error}</p>}
        </section>
    );
}
