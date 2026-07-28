import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mediaDir } from '@/lib/content/media';

// DSGVO-freundlicher Vorschaubild-Proxy für YouTube/Vimeo-Embeds:
// Der Server holt das Thumbnail (server-zu-server) und cached es im Volume –
// der Besucher lädt es dann von UNSERER Domain. So bekommt er eine echte
// Vorschau, ohne dass seine IP an Google/Vimeo geht (Facade: das eigentliche
// Video-iframe lädt weiterhin erst beim Klick in der Lightbox).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ok(buf) {
    return new Response(buf, {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    });
}

async function youtubeThumbUrl(id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function vimeoThumbUrl(id) {
    try {
        const r = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`, { cache: 'no-store' });
        if (!r.ok) return null;
        const j = await r.json();
        return j.thumbnail_url || null;
    } catch {
        return null;
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const p = (searchParams.get('p') || '').toLowerCase();
    const id = (searchParams.get('id') || '').replace(/[^\w-]/g, '');
    if (!id || (p !== 'youtube' && p !== 'vimeo')) return new Response('bad request', { status: 400 });

    const dir = join(mediaDir(), '_embedthumbs');
    const cachePath = join(dir, `${p}-${id}.jpg`);

    // 1) Cache
    try { return ok(await readFile(cachePath)); } catch { /* nicht gecached */ }

    // 2) Provider-Thumbnail server-seitig holen
    const url = p === 'youtube' ? await youtubeThumbUrl(id) : await vimeoThumbUrl(id);
    if (!url) return new Response('not found', { status: 404 });

    let res;
    try { res = await fetch(url, { cache: 'no-store' }); } catch { return new Response('upstream error', { status: 502 }); }
    if (!res.ok) return new Response('not found', { status: 404 });
    const buf = Buffer.from(await res.arrayBuffer());

    // 3) Cachen (best effort) + ausliefern
    try { await mkdir(dir, { recursive: true }); await writeFile(cachePath, buf); } catch { /* egal */ }
    return ok(buf);
}
