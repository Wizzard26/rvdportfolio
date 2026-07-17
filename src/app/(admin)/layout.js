import './../globals.css';
import './admin.css';
import AdminSidebar from "@/components/adminsidebar/page";
import Link from "next/link";
import { logout } from "@/lib/authActions";

export const metadata = {
    title: 'Portfolio Dashboard',
    description: 'My little Dashboard',
    // Interner Bereich: gehört in keinen Suchindex. Zusätzlich in robots.txt
    // gesperrt — das Meta-Tag greift auch dann, wenn jemand direkt verlinkt.
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
}

export default function DashboardLayout({ children }) {
    return (
        <>
            <header className="admin-header">
                <div className="admin-title">Portfolio Administration</div>
                <div className="admin-header-actions">
                    <Link href="/">Go to Frontend</Link>
                    {/* Logout via Server Action: Cookie löschen, zurück zum Login. */}
                    <form action={logout}>
                        <button type="submit" className="admin-logout">Logout</button>
                    </form>
                </div>
            </header>
            <main className="dashboard-main">
                <AdminSidebar />
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </>
    )
}
