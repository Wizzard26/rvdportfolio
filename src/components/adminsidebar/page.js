'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid, FiUsers, FiActivity, FiShare2, FiTarget, FiDatabase,
} from "react-icons/fi";
import { roboto_condensed } from "@/app/fonts";

// Navigationspunkte des Analytics-Dashboards. Reihenfolge = Anzeige.
const NAV = [
    { href: '/dashboard', label: 'Überblick', icon: FiGrid },
    { href: '/dashboard/audience', label: 'Zielgruppe', icon: FiUsers },
    { href: '/dashboard/behavior', label: 'Verhalten', icon: FiActivity },
    { href: '/dashboard/acquisition', label: 'Herkunft', icon: FiShare2 },
    { href: '/dashboard/goals', label: 'Ziele', icon: FiTarget },
    { href: '/dashboard/events', label: 'Ereignisse', icon: FiDatabase },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="adm-sidebar">
            <div className={`adm-brand ${roboto_condensed.className}`}>
                <span className="adm-brand-name">René van Dinter</span>
                <span className="adm-brand-sub">Administration</span>
            </div>

            <nav className="adm-nav">
                <div className="adm-nav-title">Analytics</div>
                <ul>
                    {NAV.map(({ href, label, icon: Icon }) => {
                        // Exakte Aktivmarkierung für "/dashboard", Präfix für Unterseiten.
                        const active = href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(href);
                        return (
                            <li key={href}>
                                <Link href={href} className={active ? 'is-active' : ''}>
                                    <Icon aria-hidden="true" />
                                    <span>{label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
