import { getContentDb } from './db';
import { getSetting, setSetting } from './settingsStore';

// Benachrichtigungen für die Admin-Topbar-Glocke: Neuigkeiten aus den
// Bewerbungsprozessen (Freigaben) und den eingegangenen Angeboten.
//
// Lesestatus zweistufig:
//   • notification_reads: EINZELN gelesene Einträge (beim Anklicken markiert).
//   • notif_seen_at (settings): Wasserzeichen für „Alles als gelesen" – alles
//     davor gilt als gelesen. Beim Setzen wird notification_reads geleert
//     (dann ohnehin durch das Wasserzeichen abgedeckt).
// Ungelesen = at > Wasserzeichen UND Schlüssel nicht einzeln gelesen.

const SEEN_KEY = 'notif_seen_at';
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // Liste der letzten 30 Tage

const SHARE_KINDS = ['view', 'question', 'appointment', 'rating', 'rejection'];
const SHARE_TEXT = {
    view: 'hat sich die Unterlagen angesehen',
    question: 'hat eine Rückfrage gestellt',
    appointment: 'hat Terminvorschläge gemacht',
    rating: 'hat eine Bewertung abgegeben',
    rejection: 'hat den Prozess abgesagt',
};

function seenAt() {
    return Number(getSetting(SEEN_KEY) || 0);
}

export function getNotifications({ limit = 25 } = {}) {
    const db = getContentDb();
    const seen = seenAt();
    const since = Date.now() - WINDOW_MS;
    const ph = SHARE_KINDS.map(() => '?').join(',');
    const readKeys = new Set(db.prepare('SELECT nkey FROM notification_reads').all().map((r) => r.nkey));

    const shareRows = db.prepare(`
        SELECT e.id AS eid, e.kind, e.at, s.id AS share_id, s.company, s.title
        FROM share_events e JOIN shares s ON s.id = e.share_id
        WHERE e.kind IN (${ph}) AND e.at >= ?
        ORDER BY e.at DESC LIMIT ?
    `).all(...SHARE_KINDS, since, limit);

    const offerRows = db.prepare(`
        SELECT id, company, created_at AS at FROM offers
        WHERE created_at >= ? ORDER BY created_at DESC LIMIT ?
    `).all(since, limit);

    const decorate = (key, at) => ({ key, unread: at > seen && !readKeys.has(key) });

    const items = [
        ...shareRows.map((r) => ({
            ...decorate(`e${r.eid}`, r.at),
            at: r.at,
            kind: r.kind,
            who: (r.company || r.title || 'Ein Arbeitgeber'),
            text: SHARE_TEXT[r.kind] || 'hat reagiert',
            href: `/dashboard/dokumente/freigaben/${r.share_id}`,
        })),
        ...offerRows.map((r) => ({
            ...decorate(`o${r.id}`, r.at),
            at: r.at,
            kind: 'offer',
            who: (r.company || 'Ein Unternehmen'),
            text: 'hat Ihnen ein Angebot gemacht',
            href: `/dashboard/angebote/${r.id}`,
        })),
    ].sort((a, b) => b.at - a.at).slice(0, limit);

    // Badge = exakt die ungelesenen Einträge, die auch in der Liste stehen
    // (gleiches 30-Tage-Fenster & Limit) → Zähler und Dropdown stimmen überein.
    const unread = items.filter((n) => n.unread).length;

    return { items, unread };
}

// Einen einzelnen Eintrag als gelesen markieren (beim Anklicken).
export function markNotificationRead(nkey) {
    const key = (nkey || '').toString();
    if (!/^[eo]\d+$/.test(key)) return; // nur gültige Schlüssel
    getContentDb().prepare('INSERT OR IGNORE INTO notification_reads (nkey, read_at) VALUES (?, ?)')
        .run(key, Date.now());
}

// Alles als gelesen: Wasserzeichen = jetzt; Einzel-Markierungen werden dadurch
// abgedeckt und können geleert werden.
export function markAllNotificationsRead() {
    const db = getContentDb();
    db.transaction(() => {
        setSetting(SEEN_KEY, String(Date.now()));
        db.prepare('DELETE FROM notification_reads').run();
    })();
}
