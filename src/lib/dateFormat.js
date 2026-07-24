// Datums-Helfer für Blog-Beiträge.
//
// Gespeichert wird ein Veröffentlichungsdatum als ISO (YYYY-MM-DD) — das ist
// maschinenlesbar für `datePublished` im JSON-LD und für <time dateTime>. Alte
// Seed-Daten im Format TT/MM/JJJJ werden toleriert und umgewandelt.

export function toIsoDate(value) {
    if (!value) return '';
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;              // bereits ISO
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);         // TT/MM/JJJJ
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return '';
}

// ISO/Alt-Format → „TT.MM.JJJJ" für die Anzeige. Unparsbares wird unverändert
// zurückgegeben (damit nichts „verschwindet").
export function formatGermanDate(value) {
    const iso = toIsoDate(value);
    if (!iso) return String(value || '');
    const [y, mo, d] = iso.split('-');
    return `${d}.${mo}.${y}`;
}
