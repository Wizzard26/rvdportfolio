import { rangeFromDays } from './format';

const VALID_RANGES = [7, 30, 90];

// Liest & validiert den Zeitraum-Parameter (?range=) einer Dashboard-Unterseite
// und liefert Tage + Tages-Bereich. Zentral, damit alle Bereiche gleich ticken.
export async function resolveRange(searchParams) {
    const params = await searchParams;
    const days = VALID_RANGES.includes(Number(params?.range)) ? Number(params.range) : 30;
    return { days, range: rangeFromDays(days), params: params || {} };
}
