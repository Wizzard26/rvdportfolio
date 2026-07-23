// „Umgekehrte Bewerbung": Der Arbeitgeber bewirbt sich bei René. Client-sicher
// (keine Server-Importe), damit Formular UND Admin dieselben Definitionen nutzen.

// Freitext-Fragen (Textareas), thematisch gruppiert für die Formular-Blöcke:
// eindruck → Erster Eindruck, umfeld → Position & Umfeld, schluss → Zum Schluss.
export const OFFER_TEXT_QUESTIONS = [
    { key: 'found',      group: 'eindruck', label: 'Wie sind Sie auf mich aufmerksam geworden?', placeholder: 'Über meine Website, eine Empfehlung, LinkedIn …' },
    { key: 'profile',    group: 'eindruck', label: 'Was gefällt Ihnen an meinem Profil?', placeholder: 'Was hat Sie überzeugt, gerade mir zu schreiben?' },

    { key: 'tech',       group: 'umfeld', label: 'Welcher Tech-Stack wird gefordert?', placeholder: 'z. B. React, Next.js, TypeScript, PHP / Shopware …' },
    { key: 'ai',         group: 'umfeld', label: 'Wie stehen Sie zur Entwicklung mit KI?', placeholder: 'KI-Tools erlaubt/erwünscht, Copilot & Co., Guidelines, eigene Assistenten …' },
    { key: 'team',       group: 'umfeld', label: 'Wie groß ist das Team – mit wem würde ich arbeiten?', placeholder: 'Team-Größe, Rollen, an wen ich berichte …' },
    { key: 'reviews',    group: 'umfeld', label: 'Wie läuft bei Ihnen Code-Review & Feedback?', placeholder: 'Regelmäßige Code-Reviews, Retrospektiven, 1:1-Gespräche …' },
    { key: 'onboarding', group: 'umfeld', label: 'Wie sieht die Einarbeitung / das Onboarding aus?', placeholder: 'Einarbeitungsplan, Buddy/Mentor, erste Wochen …' },
    { key: 'equipment',  group: 'umfeld', label: 'Welche Tech-Ausstattung bekomme ich – ist die Hardware frei wählbar?', placeholder: 'Notebook (Mac/Windows/Linux), Monitore, Peripherie …' },
    { key: 'growth',     group: 'umfeld', label: 'Welche Weiterentwicklung ermöglichen Sie mir?', placeholder: 'Schulungen, Konferenzen, Verantwortung, neue Technologien …' },
    { key: 'benefits',   group: 'umfeld', label: 'Welche Benefits und welche Kultur bieten Sie?', placeholder: 'Was macht Sie als Arbeitgeber besonders?' },

    { key: 'why',        group: 'schluss', label: 'Warum sollte ich mich für Sie entscheiden?', placeholder: 'Ihr stärkstes Argument …' },
];

export function offerQuestionsByGroup(group) {
    return OFFER_TEXT_QUESTIONS.filter((q) => q.group === group);
}

// Auswahl-Optionen (Mehrfachauswahl).
export const OFFER_WORK_MODELS = [
    'Remote', 'Hybrid', 'Vor Ort', 'Vollzeit', 'Teilzeit', 'Gleitzeit', 'Vertrauensarbeitszeit', '4-Tage-Woche',
];
export const OFFER_CONTRACT_TYPES = ['Unbefristet', 'Befristet', 'Festanstellung', 'Freelance / Contract'];

// Schieber-Grenzen (min, max, step, Standardwerte).
export const OFFER_SALARY = { min: 30000, max: 120000, step: 1000, defMin: 45000, defMax: 90000 };
export const OFFER_HOURS = { min: 10, max: 40, step: 1, def: 24 };
export const OFFER_VACATION = { min: 20, max: 40, step: 1, def: 30 };
export const OFFER_HOMEOFFICE = { min: 0, max: 100, step: 10, def: 100 };
export const OFFER_LEARNING = { min: 0, max: 5000, step: 250, def: 500 };

// Status eines eingegangenen Angebots (aus meiner Sicht).
export const OFFER_STATUS_LABELS = {
    neu: 'Neu',
    interessant: 'Interessant',
    im_gespraech: 'Im Gespräch',
    angenommen: 'Angenommen',
    abgelehnt: 'Abgelehnt',
};
export const OFFER_STATUS_ORDER = ['neu', 'interessant', 'im_gespraech', 'angenommen', 'abgelehnt'];
export const OFFER_STATUS_TONE = {
    neu: 'offen', interessant: 'info', im_gespraech: 'info', angenommen: 'good', abgelehnt: 'bad',
};

// Meine Bewertung des Angebots/Arbeitgebers (Sterne 0–5).
export const OFFER_RATING_FACTORS = [
    { key: 'seriositaet',    label: 'Seriosität & Auftreten' },
    { key: 'gehalt',         label: 'Gehalt & Benefits' },
    { key: 'passung',        label: 'Passung zu mir' },
    { key: 'gesamteindruck', label: 'Gesamteindruck' },
];
