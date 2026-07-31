import { getDb } from './db';

// Datenverwaltung fürs Analytics-Backend (Node-Runtime): Zählen, Backup-Export
// und vollständiges Zurücksetzen der beiden getrennten Datenquellen.
//   • events   → Besucher-Analytics (Überblick/Zielgruppe/Verhalten/…)
//   • bot_hits → serverseitiges KI-/Bot-Crawler-Log
// Reset leert die jeweilige Tabelle komplett (für einen sauberen Neustart).

export function countEvents() {
    return getDb().prepare('SELECT COUNT(*) AS n FROM events').get().n;
}

export function countBotHits() {
    return getDb().prepare('SELECT COUNT(*) AS n FROM bot_hits').get().n;
}

// Alle Zeilen als einfache Objekte (für den JSON-Backup-Download).
export function exportEvents() {
    return getDb().prepare('SELECT * FROM events ORDER BY ts').all();
}

export function exportBotHits() {
    return getDb().prepare('SELECT * FROM bot_hits ORDER BY ts').all();
}

// Komplettes Leeren. Gibt die Anzahl gelöschter Zeilen zurück. Auch der
// AUTOINCREMENT-Zähler wird zurückgesetzt, damit IDs sauber neu bei 1 starten.
export function clearEvents() {
    const db = getDb();
    const n = countEvents();
    db.transaction(() => {
        db.prepare('DELETE FROM events').run();
        db.prepare("DELETE FROM sqlite_sequence WHERE name = 'events'").run();
    })();
    return n;
}

export function clearBotHits() {
    const db = getDb();
    const n = countBotHits();
    db.transaction(() => {
        db.prepare('DELETE FROM bot_hits').run();
        db.prepare("DELETE FROM sqlite_sequence WHERE name = 'bot_hits'").run();
    })();
    return n;
}

// ─── CV-KI-Assistent (Teilmenge von events, type='assistant') ─────────────
// Liegt in derselben Tabelle wie die Besucher-Analytics; deshalb NUR die
// Assistent-Zeilen zählen/exportieren/leeren und den AUTOINCREMENT-Zähler in
// Ruhe lassen (die übrigen Events bleiben ja bestehen).

export function countAssistantEvents() {
    return getDb().prepare("SELECT COUNT(*) AS n FROM events WHERE type = 'assistant'").get().n;
}

export function exportAssistantEvents() {
    return getDb().prepare("SELECT * FROM events WHERE type = 'assistant' ORDER BY ts").all();
}

export function clearAssistantEvents() {
    const db = getDb();
    const n = countAssistantEvents();
    db.prepare("DELETE FROM events WHERE type = 'assistant'").run();
    return n;
}
