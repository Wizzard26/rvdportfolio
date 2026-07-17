import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Schützt den Admin-Bereich. Läuft vor jedem Request auf die unten im
// `matcher` genannten Pfade — in der Edge-Runtime, deshalb nutzt die
// Session-Prüfung Web Crypto (siehe lib/auth.js).
//
// "Proxy" ist ab Next.js 16 der neue Name für die frühere "Middleware"-
// Konvention (Datei src/proxy.js, Funktion `proxy`) — Funktionsweise
// unverändert. Als optimistischer Auth-Check (Cookie prüfen, sonst zum Login
// umleiten) ist das genau der von Next empfohlene Einsatz.
//
// Ohne gültiges Session-Cookie: Redirect auf /login, mit dem ursprünglich
// angefragten Pfad als `from`, damit nach dem Login dorthin zurückgeführt wird.
export async function proxy(request) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (await verifySessionToken(token)) {
        return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

// Nur der Admin-Bereich ist geschützt. /login liegt außerhalb (keine
// Redirect-Schleife), der öffentliche Portfolio-Teil bleibt frei zugänglich.
// Kommen später weitere Admin-Routen dazu, hier ergänzen.
export const config = {
    matcher: ['/dashboard', '/dashboard/:path*'],
};
