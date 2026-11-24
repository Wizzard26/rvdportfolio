import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Serverseitige Admin-Prüfung für Seiten und Server Actions. Der Proxy schützt
// /dashboard nur auf URL-Ebene — Server Actions sind aber öffentliche
// POST-Endpunkte (per Action-ID von JEDER Seite aufrufbar) und Seiten dürfen
// sich nie allein auf den Proxy-Matcher verlassen. Deshalb prüft jede Admin-
// Action und das Admin-Layout die Session hier zusätzlich selbst.

export async function isAdmin() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySessionToken(token);
}

// Für Server Actions: wirft ohne gültige Session (Action läuft nicht weiter).
export async function requireAdmin() {
    if (!(await isAdmin())) throw new Error('Nicht autorisiert');
}

// Für Seiten/Layouts: ohne gültige Session zum Login umleiten.
export async function requireAdminPage(from = '/dashboard') {
    if (!(await isAdmin())) redirect(`/login?from=${encodeURIComponent(from)}`);
}
