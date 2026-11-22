// Formatierungs-Helfer fürs Dashboard (server- wie clientseitig nutzbar).

// Millisekunden → "1m 23s" / "45s".
export function formatDuration(ms) {
    if (!ms || ms < 1000) return `${Math.round((ms || 0) / 1000)}s`;
    const total = Math.round(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m ? `${m}m ${s}s` : `${s}s`;
}

// Zahlen mit Tausenderpunkt (de-DE), ohne Locale-Abhängigkeit im Build.
export function formatNumber(n) {
    return (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Ländercode → Flaggen-Emoji (rein clientfrei, keine Bilddatei).
export function countryFlag(code) {
    if (!code || code.length !== 2) return '🏳️';
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

// Tages-Bereich aus einer Anzahl Tage (inkl. heute), als 'YYYY-MM-DD'-Strings.
export function rangeFromDays(days) {
    const to = new Date();
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - (days - 1));
    const iso = (d) => d.toISOString().slice(0, 10);
    return { from: iso(from), to: iso(to) };
}

// Browser-Zeitzone → Ländercode (nur gängige, eindeutige Zonen). Dient als
// Plausibilitäts-Check zum IP-Land: Weichen beide ab, kam der Aufruf meist über
// VPN, Firmen-Proxy oder iCloud Private Relay. Unbekannte Zonen → null.
const TZ_COUNTRY = {
    'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH',
    'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Luxembourg': 'LU', 'Europe/Paris': 'FR',
    'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Copenhagen': 'DK', 'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ',
    'Europe/Budapest': 'HU', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Lisbon': 'PT',
    'Europe/Athens': 'GR', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Kiev': 'UA',
    'Europe/Kyiv': 'UA', 'Europe/Istanbul': 'TR', 'Europe/Moscow': 'RU', 'Europe/Belgrade': 'RS',
    'Europe/Zagreb': 'HR', 'Europe/Ljubljana': 'SI', 'Europe/Bratislava': 'SK', 'Europe/Vilnius': 'LT',
    'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Asia/Singapore': 'SG', 'Asia/Dubai': 'AE',
    'Australia/Sydney': 'AU', 'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Sao_Paulo': 'BR',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
    'America/Phoenix': 'US',
};

export function tzCountry(tz) {
    return (tz && TZ_COUNTRY[tz]) || null;
}
