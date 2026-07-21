// Baut aus den Firmendaten einen personalisierten Text für die Freigabe-Seite.
// Rein deterministisch (Vorlage), client-sicher, ohne externe Abhängigkeit.

export const PURPOSE_LABELS = {
    bewerbung: 'Bewerbung auf eine Stelle',
    initiativ: 'Initiativbewerbung',
    sonstiges: 'Sonstiger Zweck',
};

export function buildShareText({ purpose, company, contact, position } = {}) {
    const anrede = contact && contact.trim()
        ? `Sehr geehrte/r ${contact.trim()}`
        : 'Sehr geehrte Damen und Herren';
    const beiFirma = company && company.trim() ? ` bei der ${company.trim()}` : '';
    const alsPos = position && position.trim() ? ` als „${position.trim()}“` : '';
    const fuerPos = position && position.trim() ? ` für die Position „${position.trim()}“` : '';

    let body;
    if (purpose === 'initiativ') {
        body = `mit großem Interesse an Ihrem Unternehmen${company && company.trim() ? ` (${company.trim()})` : ''} sende ich Ihnen meine Initiativbewerbung${alsPos}. Meine vollständigen Unterlagen finden Sie unten zum Download.

Über die Gelegenheit zu einem persönlichen Gespräch freue ich mich sehr.`;
    } else if (purpose === 'sonstiges') {
        body = `anbei stelle ich Ihnen${beiFirma ? ` für ${company.trim()}` : ''} die folgenden Dokumente zum Download bereit.

Bei Rückfragen stehe ich Ihnen jederzeit gern zur Verfügung.`;
    } else {
        body = `vielen Dank für Ihr Interesse. Anbei finden Sie meine vollständigen Bewerbungsunterlagen${fuerPos}${beiFirma}.

Über die Gelegenheit zu einem persönlichen Gespräch freue ich mich sehr.`;
    }

    return `${anrede},

${body}

Mit freundlichen Grüßen
René van Dinter`;
}
