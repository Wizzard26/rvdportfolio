import './../globals.css';
import './admin.css';
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import AdminSidebar from "@/components/adminsidebar/page";
import NotificationBell from "@/components/admin/NotificationBell";
import { logout } from "@/lib/authActions";
import { TrackingOptOutAuto } from "@/components/analytics/TrackingOptOut";
import { requireAdminPage } from "@/lib/adminAuth";

export const metadata = {
    title: 'Portfolio Dashboard',
    description: 'Analytics & Administration',
    // Interner Bereich: gehört in keinen Suchindex. Zusätzlich in robots.txt
    // gesperrt — das Meta-Tag greift auch dann, wenn jemand direkt verlinkt.
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
}

// Moderne Admin-Shell: feste Sidebar links, schlanke Topbar, heller Content-
// Bereich im Card-Stil des Analytics-Dashboards.
// Session-Prüfung zusätzlich zum Proxy (und zu jeder einzelnen Seite): Die
// Admin-Shell wird ohne gültige Session nie gerendert.
export default async function DashboardLayout({ children }) {
    await requireAdminPage();
    return (
        <div className="adm">
            {/* Eigenes Gerät aus der Besucher-Statistik ausschließen (localStorage). */}
            <TrackingOptOutAuto />
            <AdminSidebar />
            <div className="adm-main">
                <header className="adm-topbar">
                    <div className="adm-topbar-actions">
                        <NotificationBell />
                        <Link href="/" className="adm-topbar-link" target="_blank">
                            <FiExternalLink aria-hidden="true" /> Zur Website
                        </Link>
                        {/* Logout via Server Action: Cookie löschen, zurück zum Login. */}
                        <form action={logout}>
                            <button type="submit" className="adm-logout">Logout</button>
                        </form>
                    </div>
                </header>
                <div className="adm-content">
                    {children}
                </div>
            </div>
        </div>
    )
}
