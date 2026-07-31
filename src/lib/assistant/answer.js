// Baut aus den Retrieval-Treffern eine grounded Antwort: mehrere KURZE
// Ausschnitte aus VERSCHIEDENEN Chunks (max. 2 je Art → Vielfalt), jeweils mit
// Quelle/Link. Erfindet nichts; bei zu schwachem Treffer ehrlicher Fallback.

// Untergrenze: `retrieve` gated bereits auf echte Themen-Treffer (Gate +
// Themen-Filter). Hier nur noch Null-/Rausch-Treffer aussortieren; ein einzelner
// Fließtext-Treffer (Gewicht 1 → Score ~1.35) soll durchkommen.
const MIN_SCORE = 1.0;
const MAX_ITEMS = 4; // so viele Ausschnitte maximal zeigen
const MAX_PER_KIND = 2; // je Art (vita/projekt/blog/profil) höchstens so viele

const KIND_LABEL = {
    profil: 'Profil',
    vita: 'Vita',
    projekt: 'Showcase',
    blog: 'Blog',
};

// Kürzt auf ~n Zeichen an einer Satz-/Wortgrenze.
function snippet(text, n = 170) {
    const t = String(text || '').trim();
    if (t.length <= n) return t;
    const cut = t.slice(0, n);
    const punct = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (punct > n * 0.5) return cut.slice(0, punct + 1).trim();
    const space = cut.lastIndexOf(' ');
    return `${(space > n * 0.5 ? cut.slice(0, space) : cut).trim()} …`;
}

export function buildAnswer(results, { soft = false } = {}) {
    const good = results.filter((r) => r.score >= MIN_SCORE);

    if (!good.length) {
        return {
            grounded: false,
            lead: 'Dazu finde ich in Renés Unterlagen nichts – das gehört (noch) nicht zu seinem Profil. Sein Schwerpunkt liegt auf Shopware 6, JavaScript/React/Next.js und PHP/Symfony. Frag gern danach – oder nimm direkt Kontakt auf.',
            items: [{ text: '', label: 'Zum Kontakt', url: '/contact' }],
        };
    }

    // Soft-Topic: kuratierter Überblick (nicht direkt aus den Unterlagen). Der
    // Text steht als Lead, dazu ein deutlicher Kontakt-Hinweis für die Details.
    if (soft) {
        return {
            grounded: true,
            lead: good[0].chunk.detail || good[0].chunk.text,
            items: [{ text: '', label: 'Für Details: Kontakt aufnehmen', url: '/contact' }],
        };
    }

    const perKind = {};
    const items = [];
    for (const r of good) {
        const kind = r.chunk.kind;
        if ((perKind[kind] || 0) >= MAX_PER_KIND) continue;
        perKind[kind] = (perKind[kind] || 0) + 1;
        items.push({
            text: snippet(r.chunk.detail || r.chunk.text),
            label: `${KIND_LABEL[kind] || ''}: ${r.chunk.title}`.replace(/^: /, ''),
            url: r.chunk.url,
        });
        if (items.length >= MAX_ITEMS) break;
    }

    return {
        grounded: true,
        lead: items.length > 1 ? 'Dazu passt aus Renés Unterlagen:' : '',
        items,
    };
}
