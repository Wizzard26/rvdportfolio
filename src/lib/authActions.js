'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    SESSION_COOKIE,
    MAX_AGE_SECONDS,
    REMEMBER_MAX_AGE_SECONDS,
    verifyPassword,
    createSessionToken,
} from '@/lib/auth';
import { clientIp } from '@/lib/analytics/enrich';
import { ipHash, isRateLimited, recordLoginAttempt, clearFails } from '@/lib/analytics/securityStore';

// Erlaubt nur interne Weiterleitungsziele im Admin-Bereich. Verhindert Open
// Redirects über einen manipulierten `from`-Parameter (z. B. //evil.com).
function safeRedirectTarget(from) {
    if (typeof from === 'string' && from.startsWith('/dashboard')) return from;
    return '/dashboard';
}

// Server Action des Login-Formulars. Signatur passt zu `useActionState`.
// Bei Erfolg wird das Session-Cookie gesetzt und weitergeleitet; bei Fehler
// kommt ein Zustand mit Fehlermeldung zurück ins Formular.
export async function login(prevState, formData) {
    const password = formData.get('password');
    const from = formData.get('from');
    const remember = !!formData.get('remember');

    const h = await headers();
    const hash = ipHash(clientIp(h));

    // Rate-Limit: zu viele Fehlversuche derselben IP → vorübergehend sperren
    // (Brute-Force-Schutz), bevor das Passwort überhaupt geprüft wird.
    if (isRateLimited(hash)) {
        recordLoginAttempt('blocked', h);
        return { error: 'Zu viele Fehlversuche. Bitte in einigen Minuten erneut versuchen.' };
    }

    if (!verifyPassword(password)) {
        recordLoginAttempt('fail', h);
        // Bewusst unspezifisch — keine Rückschlüsse, was genau falsch war.
        return { error: 'Zugang verweigert. Bitte Passwort prüfen.' };
    }

    recordLoginAttempt('success', h);
    clearFails(hash); // erfolgreicher Login hebt die Fehlversuch-Sperre auf

    // „Angemeldet bleiben" → 30 Tage, sonst 8 Stunden. Token-Laufzeit = Cookie-Laufzeit.
    const maxAge = remember ? REMEMBER_MAX_AGE_SECONDS : MAX_AGE_SECONDS;
    const token = await createSessionToken(maxAge);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true, // kein Zugriff aus JavaScript → schützt vor XSS-Diebstahl
        secure: process.env.NODE_ENV === 'production', // nur über HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge,
    });

    // redirect() wirft intern — muss außerhalb des try/catch-Kontexts stehen.
    redirect(safeRedirectTarget(from));
}

// Meldet den Admin ab: Cookie löschen, zurück zum Login.
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect('/login');
}
