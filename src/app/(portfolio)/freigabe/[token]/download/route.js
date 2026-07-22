import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { getShareByToken, shareCookieName, recordDownload } from '@/lib/content/sharesStore';
import { documentsDir, isSafePdfName } from '@/lib/content/documents';
import { createZip } from '@/lib/zip';
import { SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Löst einen Dokument-Link zu Dateibytes auf (Repo-PDF oder Volume-Upload),
// path-traversal-sicher. Gibt null zurück, wenn ungültig/fehlend.
function readDoc(file) {
    const name = basename(file || '');
    if (!isSafePdfName(name)) return null;
    let path = null;
    if (file.startsWith('/document/')) path = join(process.cwd(), 'public', 'document', name);
    else if (file.startsWith('/documents/')) path = join(documentsDir(), name);
    if (!path) return null;
    try { return readFileSync(path); } catch { return null; }
}

function safeEntryName(title, used) {
    let base = (title || 'Dokument').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim() || 'Dokument';
    let name = `${base}.pdf`;
    let i = 2;
    while (used.has(name.toLowerCase())) { name = `${base}-${i}.pdf`; i++; }
    used.add(name.toLowerCase());
    return name;
}

export async function GET(request, { params }) {
    const { token } = await params;
    const share = getShareByToken(token);
    if (!share) return new NextResponse('Nicht gefunden', { status: 404 });

    // PLZ-Gate respektieren: ohne Freischaltung kein Sammel-Download.
    if (share.access_code) {
        const ok = request.cookies.get(shareCookieName(share.id))?.value === '1';
        if (!ok) return new NextResponse('Gesperrt', { status: 403 });
    }

    const used = new Set();
    const entries = [];
    for (const d of share.documents) {
        const data = readDoc(d.file);
        if (data) entries.push({ name: safeEntryName(d.title, used), data });
    }
    if (entries.length === 0) return new NextResponse('Keine Dateien', { status: 404 });

    // Download protokollieren (eigene Downloads des Admins ausgenommen).
    if (!request.cookies.get(SESSION_COOKIE)?.value) recordDownload(share.id, 'zip');

    const zip = createZip(entries);
    const zipName = (share.purpose === 'bewerbung' || share.purpose === 'initiativ')
        ? 'Bewerbung-rvd.zip' : 'Unterlagen-rvd.zip';

    return new NextResponse(zip, {
        status: 200,
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipName}"`,
            'Content-Length': String(zip.length),
            'Cache-Control': 'no-store',
        },
    });
}
