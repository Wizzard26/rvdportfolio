import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { mediaDir, isSafeMediaName } from '@/lib/content/media';

// Liefert hochgeladene Showcase-Medien (Bilder UND kurze Videos) aus dem Volume.
// (Repo-Bilder unter /img/... werden weiterhin statisch von Next bedient.)
// Streng abgesichert: nur Dateinamen, die isSafeMediaName() passieren.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
};
const VIDEO = new Set(['.mp4', '.webm']);

export async function GET(request, { params }) {
    const { file } = await params;
    if (!isSafeMediaName(file)) return new Response('Not found', { status: 404 });

    let data;
    try {
        data = await readFile(join(mediaDir(), file));
    } catch {
        return new Response('Not found', { status: 404 });
    }

    const ext = extname(file).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';
    const total = data.length;

    // Videos: Range-Requests unterstützen (Browser seeken/streamen damit).
    const range = VIDEO.has(ext) ? request.headers.get('range') : null;
    if (range) {
        const m = /bytes=(\d*)-(\d*)/.exec(range);
        if (m) {
            const start = m[1] ? parseInt(m[1], 10) : 0;
            const end = m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
            if (start <= end && start < total) {
                return new Response(data.subarray(start, end + 1), {
                    status: 206,
                    headers: {
                        'Content-Type': type,
                        'Content-Range': `bytes ${start}-${end}/${total}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': String(end - start + 1),
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
        }
    }

    return new Response(data, {
        status: 200,
        headers: {
            'Content-Type': type,
            'Content-Length': String(total),
            ...(VIDEO.has(ext) ? { 'Accept-Ranges': 'bytes' } : {}),
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
