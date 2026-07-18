import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { mediaDir, isSafeImageName } from '@/lib/content/media';

// Liefert hochgeladene Showcase-Bilder aus dem Volume aus.
// (Repo-Bilder unter /img/... werden weiterhin statisch von Next bedient.)
// Streng abgesichert: nur Dateinamen, die isSafeImageName() passieren.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
};

export async function GET(request, { params }) {
    const { file } = await params;
    if (!isSafeImageName(file)) return new Response('Not found', { status: 404 });

    try {
        const data = await readFile(join(mediaDir(), file));
        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch {
        return new Response('Not found', { status: 404 });
    }
}
