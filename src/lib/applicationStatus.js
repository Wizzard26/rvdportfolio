// Status eines Bewerbungsprozesses (client-sicher, ohne Server-Importe).

export const STATUS_LABELS = {
    offen: 'Offen – wartet auf Antwort',
    gespraech: 'Einladung zum Gespräch',
    naechste_runde: 'Nächste Runde',
    zusage: 'Zusage',
    absage: 'Absage',
};

// Reihenfolge für Selects.
export const STATUS_ORDER = ['offen', 'gespraech', 'naechste_runde', 'zusage', 'absage'];

// Laufend vs. abgeschlossen.
export const RUNNING_STATUS = ['offen', 'gespraech', 'naechste_runde'];
export const DONE_STATUS = ['zusage', 'absage'];

export function isRunningStatus(s) {
    return RUNNING_STATUS.includes(s || 'offen');
}

export function statusLabel(s) {
    return STATUS_LABELS[s] || STATUS_LABELS.offen;
}

// Bewertungsfaktoren für das Absage-Feedback (Sterne 0–5).
// `key` = Formularfeld `rating_<key>` und Spalte `rating_<key>`.
export const RATING_FACTORS = [
    { key: 'quality', label: 'Qualität der Unterlagen' },
    { key: 'fit', label: 'Fachliche Qualifikation' },
    { key: 'experience', label: 'Relevante Erfahrung' },
    { key: 'relevance', label: 'Bezug zu Stelle & Firma' },
    { key: 'manner', label: 'Auftreten / Freundlichkeit' },
    { key: 'culture', label: 'Team-/Kultur-Passung' },
    { key: 'overall', label: 'Gesamteindruck' },
];

// Farbklasse fürs Badge (siehe admin.css .an-appstatus--*).
export const STATUS_TONE = {
    offen: 'offen',
    gespraech: 'info',
    naechste_runde: 'info',
    zusage: 'good',
    absage: 'bad',
};
