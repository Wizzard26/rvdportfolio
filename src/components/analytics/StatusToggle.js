'use client';

// Status-Badge + Ein-Klick-Umschalter (Aktiv ⇄ Entwurf). Die passende
// Server-Action (Vita/Showcase/Galerie) wird als `action` hereingereicht.
export default function StatusToggle({ action, id, active }) {
    return (
        <form action={action} className="an-inline-form">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="active" value={active ? '0' : '1'} />
            <button
                type="submit"
                className={`an-status ${active ? 'is-active' : 'is-draft'}`}
                title={active ? 'Aktiv – klicken, um auf Entwurf zu setzen' : 'Entwurf – klicken, um zu aktivieren'}
            >
                {active ? 'Aktiv' : 'Entwurf'}
            </button>
        </form>
    );
}
