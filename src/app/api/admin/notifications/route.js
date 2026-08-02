import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/content/notificationsStore';

// Admin-Benachrichtigungen für die Topbar-Glocke.
//   GET  → { items, unread } (Polling)
//   POST { key }       → einen Eintrag als gelesen markieren (beim Anklicken)
//   POST { all: true } → alles als gelesen markieren
// Liegt unter /api → nicht vom Proxy geschützt, deshalb Session hier prüfen.
export const dynamic = 'force-dynamic';

async function authed() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySessionToken(token);
}

export async function GET() {
    if (!(await authed())) return new Response('Nicht autorisiert', { status: 401 });
    return Response.json(getNotifications({ limit: 25 }), {
        headers: { 'cache-control': 'no-store' },
    });
}

export async function POST(request) {
    if (!(await authed())) return new Response('Nicht autorisiert', { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (body?.all) {
        markAllNotificationsRead();
    } else if (body?.key) {
        markNotificationRead(body.key);
    }
    return new Response(null, { status: 204 });
}
