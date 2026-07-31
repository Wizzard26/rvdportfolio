import { buildKnowledge } from '@/lib/assistant/knowledge';
import { buildSoftTopics } from '@/lib/assistant/topics';
import { retrieve } from '@/lib/assistant/retrieve';
import { buildAnswer } from '@/lib/assistant/answer';
import { recordAssistantEvent } from '@/lib/analytics/assistant';

// Öffentlicher CV-Assistent: beantwortet Besucherfragen ausschließlich aus den
// echten Portfolio-Inhalten (keine externe API, keine Halluzination). Node-
// Runtime wegen SQLite-Zugriff auf content.db.
export const dynamic = 'force-dynamic';

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
    }

    // Nutzungs-Signal „Widget geöffnet" (ohne Frage-Inhalt) – nur anonym zählen.
    if (body?.event === 'open') {
        recordAssistantEvent({ headers: request.headers, sid: body.sid, event: 'open', path: body.path });
        return new Response(null, { status: 204 });
    }

    const question = (body?.question || '').toString().slice(0, 500).trim();
    if (!question) {
        return Response.json({
            lead: 'Stell mir gern eine Frage zu Renés Profil – z. B. zu Erfahrung, Projekten, Tech-Stack oder Verfügbarkeit.',
            items: [],
            grounded: false,
        });
    }

    // Begrüßung / Smalltalk → freundliche Hilfe statt Zufallstreffer.
    const gq = question.toLowerCase();
    if (/^(hi|hey|hallo|moin|servus|tach|yo|hej|guten (tag|morgen|abend)|good (morning|day)|hello|thx|danke|dankeschön|merci)\b|^\s*(alles klar|na\??|wie geht'?s|wie geht es dir)\s*[?!.]*$/.test(gq)) {
        return Response.json({
            lead: 'Moin! Frag mich gern etwas zu Renés Profil – zum Beispiel zu seiner Erfahrung, seinen Projekten, seinem Tech-Stack oder seiner Verfügbarkeit.',
            items: [],
            grounded: false,
        });
    }

    try {
        // 1) Harte Wissensbasis (echte Dokumente) hat Vorrang.
        let results = retrieve(question, buildKnowledge());
        let soft = false;
        // 2) Nichts gefunden? Kuratierte Überblick-Themen prüfen (profil-nah).
        if (!results.length) {
            results = retrieve(question, buildSoftTopics());
            soft = results.length > 0;
        }
        const { lead, items, grounded } = buildAnswer(results, { soft });
        // Anonym protokollieren, WAS gefragt wurde und ob es einen Treffer gab
        // (grounded/soft/keiner) – für die Auswertung unter /dashboard/assistant.
        recordAssistantEvent({
            headers: request.headers,
            sid: body.sid,
            event: 'ask',
            question,
            hit: !grounded ? 'none' : (soft ? 'soft' : 'grounded'),
            path: body.path,
        });
        return Response.json({ lead, items, grounded });
    } catch {
        // Fällt nie hart aus — der Assistent bleibt bedienbar.
        return Response.json({
            lead: 'Das kann ich gerade nicht beantworten. Frag es gern anders – oder nimm direkt Kontakt auf.',
            items: [{ text: '', label: 'Zum Kontakt', url: '/contact' }],
            grounded: false,
        });
    }
}
