// Lexikalisches Retrieval für den CV-Assistenten (v1) — kostenlos, ohne Modell.
// Bewusst gekapselt: `retrieve(question, chunks)` ist die stabile Schnittstelle.
// Später lässt sich hier ein semantisches Embedding-Scoring einhängen, ohne dass
// API-Route oder UI sich ändern.

// Synonyme / Umschreibungen: gleicht deutsche & englische Fachbegriffe an.
const SYNONYMS = {
    headless: ['kopflos', 'headlesscommerce'],
    kopflos: ['headless'],
    nextjs: ['next', 'nextjs'],
    next: ['nextjs'],
    react: ['reactjs', 'react'],
    reactjs: ['react'],
    shopware: ['sw6', 'shopware6'],
    sw6: ['shopware'],
    php: ['symfony'],
    ts: ['typescript'],
    typescript: ['ts'],
    verfuegbar: ['verfuegbarkeit', 'frei', 'start', 'beginnen', 'anfangen'],
    verfuegbarkeit: ['verfuegbar'],
    kontakt: ['erreichen', 'melden', 'schreiben', 'anschreiben'],
    ki: ['ai', 'kuenstliche', 'intelligenz'],
    ai: ['ki'],
    // Führung / Team-Lead (Station „Teamleitung – PM …") — Varianten angleichen.
    teamleitung: ['teamleiter', 'teamlead', 'leitung'],
    teamleiter: ['teamleitung', 'teamlead', 'leitung'],
    teamlead: ['teamleitung', 'teamleiter'],
    team: ['teamleitung', 'teamleiter'],
    lead: ['teamleitung', 'teamleiter'],
    leitung: ['teamleitung'],
    geleitet: ['teamleitung', 'leitung'],
    leiten: ['teamleitung', 'leitung'],
    fuehrung: ['teamleitung'],
    teamfuehrung: ['teamleitung'],
    fuehrungserfahrung: ['teamleitung', 'fuehrung'],
    // Projektmanagement — „PM" im Titel ↔ ausgeschriebene Begriffe.
    pm: ['projektmanager', 'projektmanagement'],
    projektmanager: ['projektmanagement', 'pm', 'projektleitung'],
    projektmanagement: ['projektmanager', 'pm'],
    projektleitung: ['projektmanager', 'projektmanagement'],
};

const STOPWORDS = new Set(
    ('der die das und oder ein eine einen einem einer ist sind war hat habe haben hast mit fuer von zu im in an auf aus '
        + 'wie was wer wo wann warum welche welcher welches welchen welchem womit worin wieviel wieviele '
        + 'ich mir mich uns bei als auch noch nur schon mal bitte kannst kann koennen habt seid denn dass ob '
        + 'um es am zum zur den dem gut mal etwa eigentlich vor nach ueber sieht aussieht steht '
        + 'nicht kein keine keinen keiner keins nie niemals geht gehts').split(' '),
);

// Profil-Intents: klar erkennbare Standardfragen bekommen eine EINDEUTIGE
// Einzel-Antwort (kein Rauschen). Reihenfolge = Priorität. Regex läuft auf der
// normalisierten Frage (Umlaute ausgeschrieben, klein).
const INTENTS = [
    { id: 'profile-availability', re: /(verfueg|available|availability|ab wann|wann (kannst|koennt|kann).*(anfang|start|beginn)|when can you (start|begin)|kuendigungsfrist|frei ab|sofort verfueg)/ },
    { id: 'profile-contact', re: /(kontakt|erreich|anschreiben|angebot machen|wie (kann|koennte) ich (dich|sie|rene))/ },
    { id: 'profile-identity', re: /(ueber (dich|sich|rene|ihn)|stell (dich|sie|dich mal)|wer bist|wer ist rene|wie heisst|heisst du|steckbrief|erzaehl.*(ueber|von) dir)/ },
];

// Selbstbezug / Person — kommt in fast jeder Frage vor und darf deshalb KEINEN
// Treffer erzeugen. Sonst würde „Kann René mit Java umgehen?" allein über „rene"
// die Profil-Chunks matchen, obwohl Java gar nicht vorkommt.
const GENERIC = new Set(
    ('rene renes du dir dich dein deine deiner deines er ihm ihn sein seine seiner seinem seines '
        + 'sie ihnen ihr euer eure man').split(' '),
);

// Rahmen-Wörter: beschreiben das FRAGEN ("hast du Erfahrung mit …"), nicht das
// Thema. Sie dürfen routen ("Welche Projekte?"), aber ein konkret genanntes Thema
// NICHT ersetzen: Nennt die Frage ein Thema (z. B. „Python"), das nirgends
// vorkommt, wird verneint — auch wenn „Erfahrung" viele Chunks berührt.
const FRAMING = new Set(
    ('erfahrung erfahrungen berufserfahrung werdegang projekt projekte referenz referenzen case study '
        + 'skill skills kenntnisse faehigkeit faehigkeiten stack arbeiten arbeitest arbeitet entwickeln '
        + 'entwickelt entwicklung gebaut gemacht machst umgehen umgang beherrschst beherrscht nutzt nutzen '
        + 'verwendest einsetzt tun themen thema koenntest kennt kennst kennen kenne weiss '
        + 'erstellen erstellt erstellung erstelle bauen baust code programmierst').split(' '),
);

// Deutsche Normalisierung: Umlaute AUSSCHREIBEN (ä→ae, ö→oe, ü→ue, ß→ss), damit
// „über" und „ueber" gleich behandelt werden; danach übrige Diakritika (é …)
// entfernen. So matchen alle Schreibweisen konsistent gegen die Wissensbasis.
function norm(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}

// Alles Nicht-Alphanumerische trennt — auch Bindestrich, Slash und Punkt. So
// werden Komposita wie „Storefront-Themes" oder „Shopware-6-Plugins" in ihre
// Teile zerlegt (storefront, themes / shopware, plugins) und sind einzeln
// auffindbar. „Next.js" → next, js (Synonyme/„next" fangen das ab).
function tokenize(s) {
    return norm(s)
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function expand(tokens) {
    const out = new Set(tokens);
    for (const t of tokens) {
        const syn = SYNONYMS[t];
        if (syn) for (const w of syn) out.add(w);
    }
    return [...out];
}

// Gewichteter Token-Index eines Chunks: Titel zählt am stärksten, dann Keywords,
// dann der Fließtext. Reine Funktion (kein Caching am Chunk-Objekt) — die
// Wissensbasis ist klein und wird ohnehin je Anfrage neu aufgebaut.
function chunkIndex(chunk) {
    const map = new Map();
    const add = (str, weight) => {
        for (const t of tokenize(str)) map.set(t, (map.get(t) || 0) + weight);
    };
    add(chunk.title, 3);
    add(chunk.keywords, 2);
    add(chunk.text, 1);
    // Synonyme des Chunks ebenfalls indizieren, damit „kopflos" auf „headless" trifft.
    for (const t of [...map.keys()]) {
        const syn = SYNONYMS[t];
        if (syn) for (const w of syn) if (!map.has(w)) map.set(w, 1);
    }
    return { map, keys: [...map.keys()] };
}

const PREFIX_MIN = 5; // ab dieser Länge greift Präfix-Matching (Beugungen)

// Bestes Gewicht für einen Frage-Token in einem Chunk: exakter Treffer, sonst
// Präfix-Treffer (kopflosen↔kopflos, shops↔shop, entwicklung↔entwickler …).
function bestWeight(idx, token) {
    // Exakt — inkl. einfacher Plural-Rücknahme (apis→api, apps→app), damit auch
    // kurze Plurale unter der Präfix-Schwelle noch treffen.
    let exact = idx.map.get(token);
    if (!exact && token.length >= 4 && token.endsWith('s')) exact = idx.map.get(token.slice(0, -1));
    if (exact) return exact;
    if (token.length < PREFIX_MIN) return 0;
    let best = 0;
    for (const key of idx.keys) {
        if (key.length < PREFIX_MIN) continue;
        if (key.startsWith(token) || token.startsWith(key)) {
            // Nur bei ähnlicher Länge (Beugung), nicht wenn ein spezifisches Wort
            // bloß mit einem generischen anfängt: „datenschutz" ≠ „daten".
            const ratio = Math.min(key.length, token.length) / Math.max(key.length, token.length);
            if (ratio >= 0.62) best = Math.max(best, idx.map.get(key) * 0.8);
        }
    }
    return best;
}

export function retrieve(question, chunks, { topK = 8 } = {}) {
    // 1) Profil-Intent? → eindeutige Einzel-Antwort (Verfügbarkeit/Kontakt/Profil).
    const intent = INTENTS.find((i) => i.re.test(norm(question)));
    if (intent) {
        const c = chunks.find((x) => x.id === intent.id);
        if (c) return [{ chunk: c, hits: 1, topicHits: 1, score: 5 }];
    }

    // 2) Lexikalisch. Selbstbezug-Wörter entfernen, damit sie keinen Treffer erzeugen.
    const q = expand(tokenize(question)).filter((t) => !GENERIC.has(t));
    if (!q.length) return [];

    // Konkrete Themen-Tokens der Frage (alles außer Rahmen-Wörtern).
    const topicTokens = q.filter((t) => !FRAMING.has(t));
    const matchedGlobal = new Set();

    const scored = chunks
        .map((chunk) => {
            const idx = chunkIndex(chunk);
            let matched = 0;
            let hits = 0;
            let topicHits = 0;
            for (const t of q) {
                const w = bestWeight(idx, t);
                if (w) {
                    matched += w;
                    hits += 1;
                    matchedGlobal.add(t);
                    if (!FRAMING.has(t)) topicHits += 1;
                }
            }
            // Additiver Bonus je Treffer — Füllwörter bestrafen NICHT.
            // `chunk.boost` hebt Flaggschiff-Inhalte an (nur wenn getroffen).
            return { chunk, hits, topicHits, score: matched + 0.35 * hits + (chunk.boost || 0) };
        })
        .filter((r) => r.hits > 0)
        .sort((a, b) => b.score - a.score || b.hits - a.hits);

    // Gate: Nennt die Frage ein konkretes Thema, das NIRGENDS matcht, wird
    // verneint — auch wenn Rahmen-Wörter (Erfahrung/Projekt …) etwas berühren.
    if (topicTokens.length && !topicTokens.some((t) => matchedGlobal.has(t))) return [];

    // Themen-Filter: Nennt die Frage ein Thema, zeigen wir NUR Chunks, die dieses
    // Thema treffen (nicht solche, die bloß ein Rahmen-Wort wie „Erfahrung" teilen).
    const results = topicTokens.length ? scored.filter((r) => r.topicHits > 0) : scored;

    return results.slice(0, topK);
}
