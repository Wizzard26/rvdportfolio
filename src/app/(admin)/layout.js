import './../globals.css';
import './admin.css';
import AdminSidebar from "@/components/adminsidebar/page";
import Link from "next/link";

export const metadata = {
    title: 'Portfolio Dashboard',
    description: 'My little Dashboard',
}

export default function DashboardLayout({ children }) {
    return (
        <>
            <header className="admin-header">
                <div className="admin-title">Portfolio Administration</div>
                <Link href="/">Go to Frontend</Link>
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
