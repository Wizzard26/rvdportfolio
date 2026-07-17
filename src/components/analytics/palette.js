// Chart-Farben & Beschriftungen fürs Analytics-Dashboard.
//
// Die kategoriale Palette ist mit dem dataviz-Validator geprüft (Lightness-Band,
// Chroma-Floor, CVD-Trennung). Farben werden in FESTER Reihenfolge vergeben,
// nie zyklisch. Identität wird nie über Farbe allein transportiert — jede
// Kategorie trägt zusätzlich Label + Wert (Legende/direkte Beschriftung).

export const CATEGORICAL = [
    '#1f6fb2', // Blau
    '#e0952b', // Amber
    '#3f9d5a', // Grün
    '#8b5cc7', // Violett
    '#d64545', // Rot
    '#159aab', // Cyan
];

// Markenfarben für die Trend-Serien.
export const SERIES = {
    pageviews: '#3f687e', // Teal (Primary)
    visitors: '#c63e56', // Rot (Secondary)
};

// Herkunfts-Kategorien: deutsche Labels + feste Farbe je Quelle (Farbe folgt
// der Entität, nicht dem Rang).
export const REFERRER_LABELS = {
    direct: 'Direkt',
    organic: 'Organische Suche',
    ai: 'KI-Assistenten',
    social: 'Social Media',
    referral: 'Verweise',
    internal: 'Intern',
};

export const REFERRER_COLORS = {
    direct: '#1f6fb2',
    organic: '#3f9d5a',
    ai: '#8b5cc7',
    social: '#e0952b',
    referral: '#159aab',
    internal: '#9aa4ab',
};

export const DEVICE_LABELS = {
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
};

export const DEVICE_COLORS = {
    desktop: '#1f6fb2',
    mobile: '#e0952b',
    tablet: '#3f9d5a',
};
