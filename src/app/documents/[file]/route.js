import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { documentsDir, isSafePdfName } from '@/lib/content/documents';

// Liefert hochgeladene Zeugnis-/Zertifikat-PDFs aus dem Volume-Ordner aus.
// (Repo-PDFs unter /document/... werden weiterhin statisch von Next bedient.)
//
// Node-Runtime (Dateizugriff). Streng abgesichert: nur Dateinamen, die
// isSafePdfName() passieren — kein Path-Traversal möglich.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { file } = await params;

    if (!isSafePdfName(file)) {
        return new Response('Not found', { status: 404 });
    }

    try {
        const data = await readFile(join(documentsDir(), file));
        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${file}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch {
        return new Response('Not found', { status: 404 });
    }
}
