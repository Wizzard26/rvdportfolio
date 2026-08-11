// Erkennt „Spielereien" am CV-Assistenten – Besucher, die ihn als Taschenrechner
// missbrauchen, ihn zu „jailbreaken" versuchen, Angriffs-Payloads reinwerfen,
// nach Secrets fischen oder testen, ob ein Allzweck-LLM dahintersteckt. Antwort:
// schlagfertig, aber professionell – und ganz nebenbei Positionierung (der
// Assistent ist bewusst grounded, René baut sicher).
//
// Wird VOR dem Retrieval aufgerufen. Gibt bei Treffer { kind, lead, items }
// zurück, sonst null. kind landet als hit 'spielerei' im Log und damit NICHT in
// der Content-Lücken-Liste. Reihenfolge = Priorität (spezifischste zuerst).

const SHOWCASE_CHIP = { text: '', label: 'Renés Projekte ansehen', url: '/showcase' };

// ── Sichere Zwei-Operanden-Rechnung (kein eval!) ────────────────────────────
function calc(expr) {
    const m = expr.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*x×·/:])\s*(-?\d+(?:[.,]\d+)?)/);
    if (!m) return null;
    const a = parseFloat(m[1].replace(',', '.'));
    const b = parseFloat(m[3].replace(',', '.'));
    let r;
    switch (m[2]) {
        case '+': r = a + b; break;
        case '-': r = a - b; break;
        case '*': case 'x': case '×': case '·': r = a * b; break;
        case '/': case ':': if (b === 0) return null; r = a / b; break;
        default: return null;
    }
    if (!Number.isFinite(r)) return null;
    return Number.isInteger(r) ? String(r) : String(Math.round(r * 100) / 100).replace('.', ',');
}

// Reine Rechenaufgabe? Füllwörter strippen, Rest muss aus Ziffern/Operatoren
// bestehen – so bleibt „Shopware 6 + React" (echtes Thema) außen vor.
function mathHit(q) {
    const cleaned = q
        .replace(/\b(was ist|wie ?viel ist|wieviel ist|berechne|rechne|calculate|whats|what ?s|what is|ergibt|macht|gleich|bitte|mal|plus|minus|geteilt durch|durch|und)\b/gi, ' ')
        .replace(/[=?!.]/g, ' ')
        .trim();
    const looksArith = /[+\-*x×·/:]/.test(cleaned) && /\d/.test(cleaned) && /^[\d\s.,+\-*x×·/:()]+$/.test(cleaned);
    if (!looksArith) return null;
    const ergebnis = calc(cleaned);
    const lead = ergebnis
        ? `${ergebnis} – geschenkt. 😉 Rechnen ist aber nicht mein Job: Ich bin Renés Portfolio-Guide und antworte ausschließlich aus seinen echten Unterlagen. Frag mich lieber nach seinen Shopware-Projekten, seinem Tech-Stack oder seiner Verfügbarkeit.`
        : 'Kopfrechnen ist nicht mein Fach 😉 – ich bin Renés Portfolio-Guide und antworte aus seinen echten Unterlagen. Frag mich z. B. nach Projekten, Tech-Stack oder Verfügbarkeit.';
    return { kind: 'math', lead, items: [SHOWCASE_CHIP] };
}

// ── Muster-Regeln (Reihenfolge = Priorität) ─────────────────────────────────

// Klassische Angriffs-Payloads: XSS, SQLi, Command-Injection, Path-Traversal,
// Template-Injection (SSTI). Für einen Eingabe-Feld-Test unverkennbar.
const PAYLOAD = [
    /<\s*script\b|on(error|load|click|mouseover)\s*=|<\s*(img|svg|iframe|body)\b[^>]*=|javascript:\s*\w/i, // XSS
    /(['"]|\b)\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, // ' OR 1=1
    /\bunion\s+select\b|\bdrop\s+table\b|\binsert\s+into\b|\bselect\s+.*\bfrom\b.*\bwhere\b|--\s*$|;\s*--/i, // SQLi
    /(\.\.[/\\]){2,}|\/etc\/passwd|\/proc\/self|boot\.ini|c:\\windows/i, // Path-Traversal / LFI
    /\$\(\s*\w|;\s*(rm|ls|cat|whoami|id|curl|wget|nc|bash|sh)\b|\|\s*(sh|bash)\b|&&\s*(rm|curl|wget)\b/i, // Command-Injection
    /\{\{\s*[\d'"].*\}\}|\$\{\s*[\d'"]|#\{\s*\d/i, // SSTI: {{7*7}} ${7*7}
    /<\?php\b|\beval\s*\(|\bsystem\s*\(|\bexec\s*\(/i, // Code-Ausführung
];

// Nach Geheimnissen fischen: Keys, Passwörter, .env, Zugangsdaten.
const SECRETS = [
    /\.env\b/i,
    /(gib|zeig|nenn|verrat|sag|list|dump|leak|show|reveal|her mit|druck|print)\w*.{0,30}(api[- ]?key|api[- ]?schlüssel|secret|passwor|passwort|credential|zugangsdaten|token|private[- ]?key|ssh[- ]?key)/i,
    /(deine?|the|your)\b.{0,15}(api[- ]?key|api[- ]?schlüssel|passwor|passwort|credentials|zugangsdaten|secret[- ]?key)/i,
];

// Prompt-Manipulation / -Leak / Rollenwechsel / „Modi".
const INJECTION = [
    /(ignor|vergiss|missachte|überschreib|umgeh|bypass)\w*.{0,40}(guardrail|leitplanke|regel|anweisung|vorgab|prompt|system|instruction|filter|einschränk|beschränk|richtlinie)/i,
    /ignore (all|your|previous|the above).{0,20}(instruction|rule|prompt)/i,
    /(zeig|verrat|nenn|gib|repeat|print|wiederhol|output|reveal)\w*.{0,30}(system[- ]?prompt|systemprompt|prompt|deine? (anweisung|instruktion|regeln|vorgaben)|instruction)/i,
    /\b(jailbreak|prompt[- ]?injection|dan[- ]?mode|do anything now|developer mode|entwicklermodus|admin[- ]?mod(e|us)|sudo\b|root[- ]?zugriff|system[- ]?prompt|systemprompt)\b/i,
    /\b(act as|so tun als|tu so als|pretend (you|to be)|verhalte dich wie|spiele die rolle|you are now)\b/i,
];

// „Bist du eine echte KI? Welches Modell? Steckt da eine API/GPT dahinter?"
const META = [
    /(bist du|seid ihr|are you|is this).{0,30}(echte?r? |wirklich(e)? )?(ki|k\.i\.|\bai\b|bot|chatbot|mensch|gpt|chatgpt|claude|llm|sprachmodell|language model)/i,
    /(welches|which)\s+(ki[- ]?)?(modell|model)/i,
    /(api|schnittstelle|backend|llm|gpt|chatgpt|openai|anthropic).{0,25}(dahinter|hinter dir|verwendest du|nutzt du|läuft)/i,
    /(steckt|läuft|verbirgt)\b.{0,25}(eine? )?(api|ki|llm|gpt|chatgpt|sprachmodell)/i,
    /\b(temperature|token[- ]?limit|kontextfenster|context window|welche version von (gpt|claude))\b/i,
];

// Allzweck-Aufgaben: der Test, ob ein generelles LLM dahintersteckt.
const TASK = [
    /\b(gedicht|witz|joke|poem|limerick|rezept|kochrezept|wetter|sinn des lebens|meaning of life|hausaufgabe|homework|tic[- ]?tac[- ]?toe)\b/i,
    /(schreib|erzähl|generier|dichte?|mal|schreibe)\s+(mir\s+)?(ein|eine|einen|mal ein)\b/i,
    /\b(write|tell) me an? \b/i,
    /(übersetz\w*|translate)/i,
];

const RULES = [
    {
        kind: 'payload', res: PAYLOAD,
        lead: 'Sauberer Versuch 😄 – aber Eingaben werden hier escaped und Datenbank-Abfragen laufen parametrisiert; XSS, SQL-Injection & Co. gehen ins Leere (und eine Nutzer-Tabelle zum „droppen" gibt es hier ohnehin nicht). Genau so baut René: Sicherheit ist kein Nachgedanke. Frag mich lieber etwas zu seiner Arbeit.',
    },
    {
        kind: 'secrets', res: SECRETS,
        lead: 'Nice try 😄 – hier liegen keine API-Keys, Passwörter oder .env-Dateien. Der Assistent kennt ausschließlich Renés öffentliche Portfolio-Inhalte; Secrets gehören serverseitig und nie in den Browser. Frag mich gern etwas zu seinen Projekten.',
    },
    {
        kind: 'injection', res: INJECTION,
        lead: 'Nett versucht 😄 – aber hier gibt es keine Guardrails zu umgehen und keinen System-Prompt zu leaken: Hinter mir steckt kein Sprachmodell, das man überreden könnte, sondern eine Suche über Renés echte Projektunterlagen. Genau deshalb erfinde ich nichts. Frag mich etwas Konkretes zu seiner Arbeit.',
    },
    {
        kind: 'meta', res: META,
        lead: 'Ehrliche Antwort: Ich bin kein LLM und keine externe API, sondern eine schlanke Suche über Renés echte Portfolio-Inhalte – bewusst so gebaut, dass ich nichts halluziniere, sondern nur belege, was wirklich dokumentiert ist. Frag mich gern nach seinen Projekten, seiner Vita oder seiner Verfügbarkeit.',
    },
    {
        kind: 'task', res: TASK,
        lead: 'Ich bin kein Allzweck-Chatbot – Gedichte, Rätsel, Übersetzungen oder fremde Coding-Aufgaben sind nicht mein Ding. Ich bin Renés Portfolio-Guide. Solche React-/Shopware-Lösungen baut aber genau er – wirf einen Blick ins Showcase oder frag mich nach seinem Tech-Stack.',
    },
];

export function classifyPlayful(question) {
    const q = (question || '').toString();
    if (!q.trim()) return null;

    for (const rule of RULES) {
        if (rule.res.some((re) => re.test(q))) {
            return { kind: rule.kind, lead: rule.lead, items: [SHOWCASE_CHIP] };
        }
    }
    // Reine Rechenaufgabe zuletzt (damit „ignoriere Regeln und rechne 4+6" als
    // Injection zählt, nicht als Mathe).
    return mathHit(q);
}
