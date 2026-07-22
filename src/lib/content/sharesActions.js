'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
    createShare, updateShare, deleteShare, setShareActive, getShareByToken, getShareRawByToken,
    normalizeCode, shareCookieName, getShareForResponse, addQuestion, addAppointment, submitRejection,
} from '@/lib/content/sharesStore';
import { sendOwnerMail } from '@/lib/mail';
import { siteConfig } from '@/lib/seo';

// Server Actions für die Freigaben (Dokument-Sammlungen mit geheimem Link).

function revalidate() {
    revalidatePath('/dashboard/dokumente/freigaben');
    revalidatePath('/dashboard/bewerbungen');
}

function parse(formData) {
    const g = (k) => (formData.get(k) || '').toString();
    return {
        title: g('title'),
        message: g('message'),
        purpose: g('purpose'),
        company: g('company'),
        street: g('street'),
        zip: g('zip'),
        city: g('city'),
        contact: g('contact'),
        position: g('position'),
        access_code: g('access_code'),
        sent_at: g('sent_at'),
        expires_at: g('expires_at'),
        status: g('status'),
        interview_at: g('interview_at'),
        interview_contact: g('interview_contact'),
        interview_people: g('interview_people'),
        decision_date: g('decision_date'),
        rejection_reason: g('rejection_reason'),
        followup_at: g('followup_at'),
        notes: g('notes'),
        is_active: formData.get('is_active') ? 1 : 0,
        documentIds: formData.getAll('document_ids').map((v) => Number(v)).filter(Boolean),
    };
}

export async function createShareAction(prevState, formData) {
    const data = parse(formData);
    if (!data.title.trim()) return { error: 'Titel fehlt', values: data };
    if (data.documentIds.length === 0) return { error: 'Bitte mindestens ein Dokument auswählen.', values: data };
    createShare(data);
    revalidate();
    redirect('/dashboard/dokumente/freigaben');
}

export async function updateShareAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parse(formData);
    if (!data.title.trim()) return { error: 'Titel fehlt', values: { ...data, id } };
    if (data.documentIds.length === 0) return { error: 'Bitte mindestens ein Dokument auswählen.', values: { ...data, id } };
    updateShare(id, data);
    revalidate();
    redirect('/dashboard/dokumente/freigaben');
}

export async function deleteShareAction(formData) {
    deleteShare(Number(formData.get('id')));
    revalidate();
}

export async function toggleShareAction(formData) {
    setShareActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

// Öffentliches PLZ-Gate: prüft den Code gegen die hinterlegte PLZ und setzt bei
// Erfolg ein Cookie, das die Freigabe-Seite freischaltet.
export async function unlockShareAction(formData) {
    const token = (formData.get('token') || '').toString();
    const code = (formData.get('code') || '').toString();
    const share = getShareByToken(token);
    if (share && share.access_code && normalizeCode(code) === normalizeCode(share.access_code)) {
        (await cookies()).set(shareCookieName(share.id), '1', {
            httpOnly: true, sameSite: 'lax', path: `/freigabe/${token}`, maxAge: 60 * 60 * 24 * 7,
        });
        redirect(`/freigabe/${token}`);
    }
    redirect(`/freigabe/${token}?gate=1`);
}

// ---- Öffentliche Reaktionen des Arbeitgebers (per Token, kein Login) ----

function esc(s) {
    return (s || '').toString().replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function adminLink(id) {
    return `${siteConfig.url}/dashboard/dokumente/freigaben/${id}`;
}
async function notify(share, titel, bodyHtml) {
    const wer = share.company || share.title || 'Ein Arbeitgeber';
    await sendOwnerMail(
        `Bewerbung: ${titel} – ${wer}`,
        `<p><strong>${esc(wer)}</strong> hat auf „${esc(share.title)}" reagiert:</p>${bodyHtml}
         <p><a href="${adminLink(share.id)}">Im Admin öffnen</a></p>`,
    );
}

export async function submitQuestionAction(formData) {
    const token = (formData.get('token') || '').toString();
    const message = (formData.get('message') || '').toString().trim();
    const share = getShareForResponse(token);
    if (!share || !message) redirect(`/freigabe/${token}`);
    addQuestion(share.id, message);
    revalidate();
    await notify(share, 'Rückfrage', `<blockquote>${esc(message).replace(/\n/g, '<br>')}</blockquote>`);
    redirect(`/freigabe/${token}?sent=question`);
}

export async function submitAppointmentAction(formData) {
    const token = (formData.get('token') || '').toString();
    const slots = [1, 2, 3, 4].map((i) => (formData.get(`slot_${i}`) || '').toString().trim()).filter(Boolean);
    const message = (formData.get('message') || '').toString().trim();
    const share = getShareForResponse(token);
    if (!share || slots.length === 0) redirect(`/freigabe/${token}`);
    addAppointment(share.id, slots, message);
    revalidate();
    const list = slots.map((s) => `<li>${esc(s.replace('T', ' '))} Uhr</li>`).join('');
    await notify(share, 'Terminvorschlag', `<ul>${list}</ul>${message ? `<blockquote>${esc(message)}</blockquote>` : ''}`);
    redirect(`/freigabe/${token}?sent=termin`);
}

export async function submitRejectionAction(formData) {
    const token = (formData.get('token') || '').toString();
    const share = getShareForResponse(token);
    if (!share) redirect(`/freigabe/${token}`);
    const data = {
        reason: (formData.get('reason') || '').toString().trim(),
        quality: formData.get('rating_quality'),
        fit: formData.get('rating_fit'),
        overall: formData.get('rating_overall'),
    };
    submitRejection(share.id, data);
    revalidate();
    const stars = (n) => '★'.repeat(Number(n) || 0) + '☆'.repeat(5 - (Number(n) || 0));
    await notify(share, 'Absage', `
        <p>${data.reason ? esc(data.reason).replace(/\n/g, '<br>') : '(kein Grund angegeben)'}</p>
        <p>Unterlagen: ${stars(data.quality)} · Passung: ${stars(data.fit)} · Gesamt: ${stars(data.overall)}</p>`);
    redirect(`/freigabe/${token}?sent=absage`);
}

// „Alles heruntergeladen": schließt den Zugang (Freigabe wird deaktiviert, Link
// danach ungültig). Vom Empfänger auf der Freigabe-Seite ausgelöst.
export async function finishShareAction(formData) {
    const token = (formData.get('token') || '').toString();
    const share = getShareRawByToken(token);
    if (share) setShareActive(share.id, false);
    revalidatePath(`/freigabe/${token}`);
    redirect(`/freigabe/${token}?closed=1`);
}
