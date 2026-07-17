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
