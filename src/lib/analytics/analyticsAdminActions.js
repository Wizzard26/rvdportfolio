'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { clearEvents, clearBotHits } from './adminData';

// Server Actions zum Zurücksetzen der Analytics-Daten. Der Proxy schützt bereits
// alle /dashboard-Requests; zusätzlich prüfen wir hier die Session explizit
// (Defense-in-Depth), da Actions destruktiv sind.
async function requireAdmin() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
        throw new Error('Nicht autorisiert');
    }
}

// Alle Besucher-Analytics löschen (Tabelle events → betrifft Überblick,
// Zielgruppe, Verhalten, Herkunft, Ziele und Ereignisse gemeinsam).
export async function resetVisitorDataAction() {
    await requireAdmin();
    const deleted = clearEvents();
    for (const p of [
        '/dashboard',
        '/dashboard/audience',
        '/dashboard/behavior',
        '/dashboard/acquisition',
        '/dashboard/goals',
        '/dashboard/events',
    ]) {
        revalidatePath(p);
    }
    return { ok: true, deleted };
}

// Nur das serverseitige Bot-/Crawler-Log löschen (Tabelle bot_hits).
export async function resetBotLogAction() {
    await requireAdmin();
    const deleted = clearBotHits();
    revalidatePath('/dashboard/bots');
    return { ok: true, deleted };
}
