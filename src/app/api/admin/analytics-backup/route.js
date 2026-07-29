import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { exportEvents, exportBotHits } from '@/lib/analytics/adminData';

// Backup-Download der Analytics-Rohdaten als JSON. Liegt unter /api und wird
// deshalb NICHT vom Proxy geschützt → Session hier explizit prüfen.
//   ?scope=events → Besucher-Analytics (Tabelle events)
//   ?scope=bots   → Bot-/Crawler-Log (Tabelle bot_hits)
export const dynamic = 'force-dynamic';

export async function GET(request) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
        return new Response('Nicht autorisiert', { status: 401 });
    }

    const scope = new URL(request.url).searchParams.get('scope');
    let table;
    let rows;
    if (scope === 'bots') {
        table = 'bot_hits';
        rows = exportBotHits();
    } else if (scope === 'events') {
        table = 'events';
        rows = exportEvents();
    } else {
        return new Response('Unbekannter scope', { status: 400 });
    }

    const now = new Date();
    const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const body = JSON.stringify({
        table,
        exportedAt: now.toISOString(),
        count: rows.length,
        rows,
    });

    return new Response(body, {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'content-disposition': `attachment; filename="analytics-${table}-backup-${stamp}.json"`,
            'cache-control': 'no-store',
        },
    });
}
