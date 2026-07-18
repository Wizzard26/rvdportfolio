import Link from 'next/link';

// Umschalter zwischen den beiden Vita-Verwaltungsbereichen.
export default function VitaAdminTabs({ active }) {
    return (
        <div className="an-tabs">
            <Link href="/dashboard/vita" className={`an-tab${active === 'stations' ? ' is-active' : ''}`}>Stationen</Link>
            <Link href="/dashboard/vita/personal" className={`an-tab${active === 'personal' ? ' is-active' : ''}`}>Persönliche Daten</Link>
        </div>
    );
}
