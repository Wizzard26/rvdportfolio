'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    SESSION_COOKIE,
    MAX_AGE_SECONDS,
    verifyPassword,
    createSessionToken,
} from '@/lib/auth';

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

    if (!verifyPassword(password)) {
        // Bewusst unspezifisch — keine Rückschlüsse, was genau falsch war.
        return { error: 'Zugang verweigert. Bitte Passwort prüfen.' };
    }

    const token = await createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true, // kein Zugriff aus JavaScript → schützt vor XSS-Diebstahl
        secure: process.env.NODE_ENV === 'production', // nur über HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE_SECONDS,
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
