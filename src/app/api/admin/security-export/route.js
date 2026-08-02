import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { exportLoginEvents } from '@/lib/analytics/securityStore';

// CSV-Export der Login-Sicherheits-Events zum regelmäßigen Prüfen/Archivieren.
// Liegt unter /api → Session hier explizit prüfen.
export const dynamic = 'force-dynamic';

function csvCell(v) {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
        return new Response('Nicht autorisiert', { status: 401 });
    }

    const rows = exportLoginEvents();
    const header = ['id', 'zeit', 'tag', 'ergebnis', 'ip_hash', 'land', 'browser', 'os'];
    const lines = [header.join(';')];
    for (const r of rows) {
        lines.push([
            r.id,
            new Date(r.ts).toISOString(),
            r.day,
            r.outcome,
            r.ip_hash,
            r.country,
            r.browser,
            r.os,
        ].map(csvCell).join(';'));
    }
    const csv = '﻿' + lines.join('\r\n'); // BOM → Umlaute in Excel korrekt

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    return new Response(csv, {
        headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="login-security-${stamp}.csv"`,
            'cache-control': 'no-store',
        },
    });
}
