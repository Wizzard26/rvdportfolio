import { NextResponse } from 'next/server';
import { getDocumentBySlug } from '@/lib/content/documentsStore';

// Stabile Download-URL: /download/<kennung> leitet auf die aktuelle Datei des
// aktiven Dokuments mit dieser Kennung weiter. So bleibt ein extern geteilter
// Link gültig, auch wenn die PDF im Admin ausgetauscht wird.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { slug } = await params;
    const doc = getDocumentBySlug(slug);
    if (!doc || !doc.file) {
        return new NextResponse('Dokument nicht gefunden', { status: 404 });
    }
    return NextResponse.redirect(new URL(doc.file, request.url), 307);
}
