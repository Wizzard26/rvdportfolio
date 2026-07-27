// Baut aus den Freigabe-Angaben einen personalisierten Anschreiben-Text plus die
// scannbaren Keyfacts für die Freigabe-Seite (Bewerbung → Arbeitgeber).
// Rein deterministisch (Vorlage), client-sicher, ohne externe Abhängigkeit.

export const PURPOSE_LABELS = {
    bewerbung: 'Bewerbung auf eine Stelle',
    initiativ: 'Initiativbewerbung',
    sonstiges: 'Sonstiger Zweck',
};

// Anrede-Optionen (Reihenfolge = Select-Reihenfolge im Admin).
export const CONTACT_GENDER_LABELS = {
    '': 'Keine/r bekannt – „Damen und Herren“',
    herr: 'Herr',
    frau: 'Frau',
    divers: 'Divers / neutral',
    team: 'An das Team der Firma',
};

export const EMPLOYMENT_LABELS = {
    vollzeit: 'Vollzeit',
    teilzeit: 'Teilzeit',
    beides: 'Voll- oder Teilzeit',
};

export const WORK_MODEL_LABELS = {
    vor_ort: 'Vor Ort',
    hybrid: 'Hybrid',
    remote: 'Remote',
    flexibel: 'Flexibel',
};

// Als Suffix hinter dem Betrag: „55.000 € / Jahr“.
export const SALARY_PERIOD_LABELS = {
    jahr: '/ Jahr',
    monat: '/ Monat',
    stunde: '/ Stunde',
};

const trim = (s) => (s || '').toString().trim();

// Skills: Zeilen- ODER kommagetrennt (kurze Tags → Chips).
export function toList(value) {
    return trim(value)
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

// Besonderheiten: NUR pro Zeile (ganze Sätze dürfen Kommata enthalten).
export function toLines(value) {
    return trim(value)
        .split(/[\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

// Umfang als kurzer Text: „Vollzeit“, „Teilzeit · 20–30 Std./Woche“, „30 Std./Woche“.
export function employmentText({ employment_type, hours_from, hours_to } = {}) {
    const base = EMPLOYMENT_LABELS[employment_type] || '';
    const from = Number(hours_from) || 0;
    const to = Number(hours_to) || 0;
    let hours = '';
    if (from && to) hours = `${from}–${to} Std./Woche`;
    else if (to) hours = `bis ${to} Std./Woche`;
    else if (from) hours = `ab ${from} Std./Woche`;
    if (base && hours) return `${base} · ${hours}`;
    return base || hours;
}

// Gehalt als Text: „55.000–60.000 € / Jahr“, bei Teilzeit z. B.
// „3.000 € / Monat bei 24 Std./Woche“. Leerer String, wenn kein Betrag.
export function salaryText({ salary_amount, salary_period, salary_hours } = {}) {
    const amount = trim(salary_amount);
    if (!amount) return '';
    const per = SALARY_PERIOD_LABELS[salary_period] || '';
    const euro = /€|eur/i.test(amount) ? amount : `${amount} €`;
    const base = per ? `${euro} ${per}` : euro;
    const hrs = Number(salary_hours) || 0;
    // Bezug nur bei Monats-/Jahresangaben sinnvoll (nicht beim Stundenlohn).
    return hrs && salary_period !== 'stunde' ? `${base} bei ${hrs} Std./Woche` : base;
}

// Die scannbare Keyfacts-Karte als Datenstruktur (Frontend rendert daraus Zeilen/Chips).
export function buildKeyfacts(data = {}) {
    const facts = {
        position: trim(data.position),
        availability: trim(data.availability),
        model: [WORK_MODEL_LABELS[data.work_model] || '', employmentText(data)].filter(Boolean).join(' · '),
        salary: data.salary_public ? salaryText(data) : '',
        mobility: trim(data.mobility),
        skills: toList(data.skills),
        highlights: toLines(data.highlights),
    };
    const has = facts.position || facts.availability || facts.model || facts.salary
        || facts.mobility || facts.skills.length || facts.highlights.length;
    return has ? facts : null;
}

// Anrede aus Anrede-Typ + Name (+ Firma für die Team-Variante).
function salutation(gender, contact, company) {
    const name = trim(contact);
    if (gender === 'herr' && name) return `Sehr geehrter Herr ${name}`;
    if (gender === 'frau' && name) return `Sehr geehrte Frau ${name}`;
    if (gender === 'divers') return name ? `Guten Tag ${name}` : 'Guten Tag';
    if (gender === 'team') return company ? `Sehr geehrtes Team der ${company}` : 'Sehr geehrtes Team';
    // Fallback: bekannter Name ohne Geschlecht → neutrale Anrede, sonst Standard.
    if (name && gender !== '') return `Guten Tag ${name}`;
    return 'Sehr geehrte Damen und Herren';
}

// Der individuelle Anschreiben-Text (Keyfacts stehen bewusst in der Karte, nicht hier).
export function buildShareText(data = {}) {
    const purpose = data.purpose;
    const company = trim(data.company);
    const position = trim(data.position);
    const motivation = trim(data.motivation);
    const jobRef = trim(data.job_ref);

    const anrede = salutation(data.contact_gender, data.contact, company);
    const posAls = position ? ` als „${position}“` : '';
    const beiFirma = company ? ` bei der ${company}` : '';

    const paras = [];
    if (purpose === 'initiativ') {
        paras.push(`mit großem Interesse${company ? ` an der ${company}` : ' an Ihrem Unternehmen'} sende ich Ihnen meine Initiativbewerbung${posAls}.`);
    } else if (purpose === 'sonstiges') {
        paras.push(`anbei stelle ich Ihnen${company ? ` für ${company}` : ''} die folgenden Dokumente bereit.`);
    } else {
        const bezug = jobRef ? `mit Bezug auf ${jobRef} ` : '';
        paras.push(`${bezug}bewerbe ich mich${posAls}${beiFirma}.`);
    }

    // Der „Warum ihr“-Satz macht das Anschreiben individuell – wörtlich übernehmen.
    if (motivation) paras.push(motivation);

    if (purpose === 'sonstiges') {
        paras.push('Bei Rückfragen stehe ich Ihnen jederzeit gern zur Verfügung.');
    } else {
        paras.push('Die wichtigsten Eckdaten finden Sie in der Übersicht, meine vollständigen Unterlagen unten zum Download. Über die Gelegenheit zu einem persönlichen Gespräch freue ich mich sehr.');
    }

    return `${anrede},\n\n${paras.join('\n\n')}\n\nMit freundlichen Grüßen\nRené van Dinter`;
}
