import { getContentDb } from './db';

// Einfache Schlüssel/Wert-Einstellungen (z. B. welches Dokument der Vita-Download ist).

export function getSetting(key) {
    const row = getContentDb().prepare('SELECT svalue FROM settings WHERE skey = ?').get(key);
    return row ? row.svalue : null;
}

export function setSetting(key, value) {
    getContentDb().prepare(`
        INSERT INTO settings (skey, svalue) VALUES (@key, @value)
        ON CONFLICT(skey) DO UPDATE SET svalue = @value
    `).run({ key, value: value == null ? '' : String(value) });
}
