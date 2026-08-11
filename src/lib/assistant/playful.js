// Erkennt „Spielereien" am CV-Assistenten – Besucher, die ihn als Taschenrechner
// missbrauchen, ihn zu „jailbreaken" versuchen oder testen, ob ein LLM/eine API
// dahintersteckt. Antwort: schlagfertig, aber professionell – und ganz nebenbei
// Positionierung (der Assistent ist bewusst grounded, kein halluzinierendes LLM).
//
// Wird VOR dem Retrieval aufgerufen. Gibt bei Treffer { kind, lead, items }
// zurück, sonst null. kind ∈ { injection, meta, math } → landet als hit
// 'spielerei' im Log und damit NICHT in der Content-Lücken-Liste.

const SHOWCASE_CHIP = { text: '', label: 'Renés Projekte ansehen', url: '/showcase' };

// Einfache, sichere Zwei-Operanden-Rechnung (kein eval!). Gibt Ergebnis als
// String zurück oder null, wenn es keine saubere a∘b-Aufgabe ist.
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

// „Ignoriere deine Regeln / Prompt / Guardrails …", Jailbreak-Versuche.
const INJECTION = [
    /(ignor|vergiss|missachte|überschreib|umgeh|bypass)\w*.{0,40}(guardrail|leitplanke|regel|anweisung|vorgab|prompt|system|instruction|filter|einschränk|beschränk|richtlinie)/i,
    /\b(jailbreak|prompt[- ]?injection|dan[- ]?mode|do anything now|system[- ]?prompt|systemprompt)\b/i,
    /ignore (all|your|previous|the above).{0,20}(instruction|rule|prompt)/i,
];

// „Bist du eine echte KI? Welches Modell? Steckt da eine API/GPT dahinter?"
const META = [
    /(bist du|seid ihr|are you|is this).{0,30}(echte?r? |wirklich(e)? )?(ki|k\.i\.|\bai\b|bot|chatbot|mensch|gpt|chatgpt|claude|llm|sprachmodell|language model)/i,
    /(welches|which)\s+(ki[- ]?)?(modell|model)/i,
    /(api|schnittstelle|backend|llm|gpt|chatgpt|openai|anthropic).{0,25}(dahinter|hinter dir|dahinter steckt|verwendest du|nutzt du|läuft)/i,
    /(steckt|läuft|verbirgt).{0,25}(eine? )?(api|ki|llm|gpt|chatgpt|sprachmodell)/i,
];

export function classifyPlayful(question) {
    const q = (question || '').toString();
    if (!q.trim()) return null;

    // Injection zuerst: „ignoriere Regeln und rechne 4+6" soll als Injection
    // erkannt werden, nicht als Mathe.
    if (INJECTION.some((re) => re.test(q))) {
        return {
            kind: 'injection',
            lead: 'Nett versucht 😄 – aber hier gibt es keine Guardrails zu umgehen: Hinter mir steckt kein Sprachmodell, das man überreden könnte, sondern eine Suche über Renés echte Projektunterlagen. Genau deshalb erfinde ich nichts und plaudere auch keine „Systemregeln" aus. Frag mich etwas Konkretes zu seiner Arbeit.',
            items: [SHOWCASE_CHIP],
        };
    }

    if (META.some((re) => re.test(q))) {
        return {
            kind: 'meta',
            lead: 'Ehrliche Antwort: Ich bin kein LLM und keine externe API, sondern eine schlanke Suche über Renés echte Portfolio-Inhalte – bewusst so gebaut, dass ich nichts halluziniere, sondern nur belege, was wirklich dokumentiert ist. Frag mich gern nach seinen Projekten, seiner Vita oder seiner Verfügbarkeit.',
            items: [SHOWCASE_CHIP],
        };
    }

    return mathHit(q);
}
