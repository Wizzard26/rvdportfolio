// YouTube/Vimeo-Embeds für gemischte Showcase-Galerien. Rein deterministisch,
// client- und server-sicher. Gespeichert wird eine kompakte Kennung
// „youtube:<ID>" bzw. „vimeo:<ID>"; daraus baut das Frontend Player-iframe +
// Vorschaubild.

// URL → „youtube:ID" / „vimeo:ID" (oder null, wenn nicht erkannt).
export function parseEmbed(url) {
    const u = (url || '').toString().trim();
    if (!u) return null;
    let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
    if (m) return `youtube:${m[1]}`;
    m = u.match(/vimeo\.com\/(?:video\/)?(\d{5,})/i);
    if (m) return `vimeo:${m[1]}`;
    return null;
}

// Provider (youtube|vimeo) + Eingabe (ID ODER voller Link) → „provider:ID".
// So kann man im Admin bequem nur den Video-Code eingeben; ein kompletter Link
// wird ebenfalls akzeptiert und automatisch geparst.
export function normalizeEmbed(provider, value) {
    const v = (value || '').toString().trim();
    if (!v) return null;
    const parsed = parseEmbed(v); // voller Link? → gewinnt, provider-unabhängig
    if (parsed) return parsed;
    if (provider === 'youtube' && /^[\w-]{6,}$/.test(v)) return `youtube:${v}`;
    if (provider === 'vimeo' && /^\d{5,}$/.test(v)) return `vimeo:${v}`;
    return null;
}

// Kennung → { provider, id, src (iframe), thumb (oder null) }.
export function embedInfo(value) {
    const v = (value || '').toString().trim();
    const idx = v.indexOf(':');
    const provider = idx > 0 ? v.slice(0, idx) : '';
    const id = idx > 0 ? v.slice(idx + 1) : '';
    if (provider === 'youtube' && id) {
        return {
            provider: 'YouTube',
            id,
            src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
            thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        };
    }
    if (provider === 'vimeo' && id) {
        return {
            provider: 'Vimeo',
            id,
            src: `https://player.vimeo.com/video/${id}`,
            thumb: null, // Vimeo-Vorschau bräuchte die oEmbed-API → generische Kachel
        };
    }
    return null;
}

// Art eines Galerie-Items (Alt-Datensätze ohne kind → 'image').
export function itemKind(item) {
    const k = item && item.kind;
    return k === 'video' || k === 'embed' ? k : 'image';
}
