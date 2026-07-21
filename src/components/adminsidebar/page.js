'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid, FiUsers, FiActivity, FiShare2, FiTarget, FiDatabase, FiFileText, FiLayers, FiDownload,
} from "react-icons/fi";
import { roboto_condensed } from "@/app/fonts";

// Navigation der Admin-Sidebar, gruppiert. Reihenfolge = Anzeige.
const NAV_GROUPS = [
    {
        title: 'Analytics',
        items: [
            { href: '/dashboard', label: 'Überblick', icon: FiGrid, exact: true },
            { href: '/dashboard/audience', label: 'Zielgruppe', icon: FiUsers },
            { href: '/dashboard/behavior', label: 'Verhalten', icon: FiActivity },
            { href: '/dashboard/acquisition', label: 'Herkunft', icon: FiShare2 },
            { href: '/dashboard/goals', label: 'Ziele', icon: FiTarget },
            { href: '/dashboard/events', label: 'Ereignisse', icon: FiDatabase },
        ],
    },
    {
        title: 'Inhalte',
        items: [
            { href: '/dashboard/vita', label: 'Vita', icon: FiFileText },
            { href: '/dashboard/showcase', label: 'Showcase', icon: FiLayers },
            { href: '/dashboard/dokumente', label: 'Dokumente', icon: FiDownload },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="adm-sidebar">
            <div className={`adm-brand ${roboto_condensed.className}`}>
                <span className="adm-brand-name">René van Dinter</span>
                <span className="adm-brand-sub">Administration</span>
            </div>

            {NAV_GROUPS.map((group) => (
                <nav className="adm-nav" key={group.title}>
                    <div className="adm-nav-title">{group.title}</div>
                    <ul>
                        {group.items.map(({ href, label, icon: Icon, exact }) => {
                            const active = exact ? pathname === href : pathname.startsWith(href);
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
            ))}
        </aside>
    );
}
