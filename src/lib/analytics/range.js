import { rangeFromDays } from './format';

const VALID_RANGES = [7, 30, 90];

// Tages-Bereich, der bewusst ALLE vorhandenen Daten umfasst ("Gesamt").
// `day` ist ein 'YYYY-MM-DD'-String → lexikografischer Vergleich deckt alles ab.
const ALL_RANGE = { from: '0000-01-01', to: '9999-12-31' };

// Liest & validiert den Zeitraum-Parameter (?range=) einer Dashboard-Unterseite
// und liefert Tage + Tages-Bereich. Zentral, damit alle Bereiche gleich ticken.
//
// `?range=all` → gesamter Zeitraum (keine Tages-Begrenzung). In diesem Fall ist
// `days` null; Aufrufer, die auf Tage rechnen (z. B. das Bot-Log), behandeln
// null als "seit Beginn".
export async function resolveRange(searchParams) {
    const params = await searchParams;
    const raw = params?.range;

    if (raw === 'all') {
        return {
            days: null,
            range: ALL_RANGE,
            params: params || {},
            rangeKey: 'all',
            label: 'Gesamt',
            phrase: 'gesamter Zeitraum',
        };
    }

    const days = VALID_RANGES.includes(Number(raw)) ? Number(raw) : 30;
    return {
        days,
        range: rangeFromDays(days),
        params: params || {},
        rangeKey: days,
        label: `${days} Tage`,
        phrase: `letzte ${days} Tage`,
    };
}
