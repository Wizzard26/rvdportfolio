import Link from "next/link";

// Navigation der Admin-Sidebar. Der Bereich führt aktuell das Analytics-
// Dashboard; die früheren Platzhalter-Listen (Pages/Blog) sind entfernt.
// Weitere Bereiche kommen mit dem Fullstack-Ausbau dazu.
export default function AdminNavi() {
    return (
        <>
            <div className="admin-cat-title">
                Auswertung
            </div>
            <ul>
                <li><Link href="/dashboard">Analytics-Übersicht</Link></li>
            </ul>
        </>
    )
}
