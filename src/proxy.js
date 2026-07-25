import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { detectBot } from '@/lib/analytics/bots';

// Läuft vor jedem Seiten-Request (siehe `matcher`) in der Edge-Runtime. Zwei
// Aufgaben:
//   1) Serverseitiges Bot-/Crawler-Logging (anonym, ohne IP) — erkennt den
//      User-Agent und reicht Treffer an die Node-Route /api/botlog weiter, weil
//      in der Edge-Runtime kein SQLite möglich ist. Fire-and-forget, verzögert
//      die Antwort nicht.
//   2) Admin-Schutz — NUR für /dashboard. Ohne gültiges Session-Cookie Redirect
//      auf /login (Session-Prüfung via Web Crypto, siehe lib/auth.js).
//
// "Proxy" ist ab Next.js 16 der neue Name der früheren "Middleware"-Konvention
// (Datei src/proxy.js, Funktion `proxy`).
export async function proxy(request) {
    const { pathname } = request.nextUrl;
    const ua = request.headers.get('user-agent') || '';

    // 1) Bot-Zugriffe auf ÖFFENTLICHE Seiten protokollieren (jeder erkannte
    //    Crawler, jede Kategorie). Admin/Login bleiben außen vor, damit sie die
    //    Crawler-Statistik („Top-Seiten") nicht verfälschen.
    const isAdminPath = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/login';
    if (!isAdminPath && detectBot(ua)) {
        try {
            // Nicht awaiten: Der laufende Node-Serverprozess führt den fetch zu
            // Ende, ohne die Bot-Antwort zu verzögern.
            fetch(new URL('/api/botlog', request.url), {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-forwarded-bot': '1' },
                body: JSON.stringify({ ua, path: pathname }),
            }).catch(() => {});
        } catch {
            // Logging darf den Seitenaufruf nie stören.
        }
    }

    // 2) Admin-Schutz ausschließlich für /dashboard (der Matcher deckt jetzt alle
    //    Seiten ab, deshalb hier explizit eingrenzen — sonst würde die ganze
    //    Seite auf /login umgeleitet).
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (!(await verifySessionToken(token))) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Läuft auf allen Seiten-Requests (für das Bot-Logging), ausgenommen interne
// Next-Pfade, die API (u. a. /api/botlog selbst → keine Schleife), statische
// Dateien und die SEO-Dateien.
export const config = {
    matcher: [
        '/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|llms.txt|llms-full.txt|.*\\.[\\w]+$).*)',
    ],
};
