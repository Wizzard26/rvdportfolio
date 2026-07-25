import { detectBot } from '@/lib/analytics/bots';
import { recordBotHit } from '@/lib/analytics/botStore';

// Interner Endpunkt: Der Proxy (Edge, kein SQLite möglich) meldet erkannte Bot-
// Zugriffe hierher; hier läuft der DB-Schreib in der Node-Runtime. Es werden
// ausschließlich Bot-Name, Kategorie und Pfad gespeichert — keine IP, keine Kennung.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Nur vom Proxy weitergereichte Aufrufe akzeptieren (einfache Hürde gegen
        // versehentliche/externe Fremdaufrufe).
        if (request.headers.get('x-forwarded-bot') !== '1') {
            return new Response(null, { status: 204 });
        }
        const body = await request.json().catch(() => null);
        if (!body) return new Response(null, { status: 204 });

        // Serverseitig gegenprüfen: nur echte Bots protokollieren.
        const bot = detectBot(String(body.ua || ''));
        if (!bot) return new Response(null, { status: 204 });

        recordBotHit({
            category: bot.category,
            name: bot.name,
            path: typeof body.path === 'string' ? body.path : null,
        });
        return new Response(null, { status: 204 });
    } catch {
        return new Response(null, { status: 204 });
    }
}
