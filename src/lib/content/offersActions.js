'use server';

import { revalidatePath } from 'next/cache';
import { createOffer, updateOfferStatus, updateOfferNotes, rateOffer, deleteOffer } from '@/lib/content/offersStore';
import { sendOwnerMail } from '@/lib/mail';
import { siteConfig } from '@/lib/seo';
import { OFFER_TEXT_QUESTIONS, OFFER_RATING_FACTORS } from '@/lib/offerContent';

const eur = (n) => `${Number(n || 0).toLocaleString('de-DE')} €`;

function esc(s) {
    return (s || '').toString().replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function nl2br(s) {
    return esc(s).replace(/\n/g, '<br>');
}

// Öffentliches Absenden der „umgekehrten Bewerbung" (kein Login).
export async function submitOfferAction(prevState, formData) {
    // Spam-Honeypot: verstecktes Feld – nur Bots füllen es aus.
    if ((formData.get('confirm_email') || '').toString().trim() !== '') {
        return { ok: true };
    }

    const g = (k) => (formData.get(k) || '').toString();
    const joinAll = (k) => formData.getAll(k).map((x) => x.toString()).filter(Boolean).join(', ');
    const data = {
        company: g('company'), contact: g('contact'), email: g('email'),
        website: g('website'), position: g('position'), message: g('message'),
        model: joinAll('model'), contract: joinAll('contract'),
        location: g('location'), start_date: g('start_date'), probation: g('probation'),
        homeoffice_pct: g('homeoffice_pct'), learning_budget: g('learning_budget'),
        hours_per_week: g('hours_per_week'), vacation_days: g('vacation_days'),
        salary_min: g('salary_min'), salary_max: g('salary_max'),
    };
    OFFER_TEXT_QUESTIONS.forEach((q) => { data[q.key] = g(q.key); });

    if (!data.company.trim() || !data.email.trim()) {
        return { ok: false, error: 'Bitte mindestens Firma und E-Mail angeben.', values: data };
    }

    const { id } = createOffer(data);
    revalidatePath('/dashboard/angebote');

    const kopf = [esc(data.contact), data.email && `&lt;${esc(data.email)}&gt;`, esc(data.website), esc(data.position)]
        .filter(Boolean).join(' · ');
    const fakten = [
        data.model && `<strong>Arbeitsmodell:</strong> ${esc(data.model)}`,
        data.location && `<strong>Standort:</strong> ${esc(data.location)}`,
        Number(data.homeoffice_pct) && `<strong>Homeoffice-Anteil:</strong> ${esc(data.homeoffice_pct)} %`,
        Number(data.hours_per_week) && `<strong>Stunden:</strong> ${esc(data.hours_per_week)} h / Woche`,
        Number(data.vacation_days) && `<strong>Urlaub:</strong> ${esc(data.vacation_days)} Tage`,
        data.start_date && `<strong>Frühester Start:</strong> ${esc(data.start_date)}`,
        data.probation && `<strong>Probezeit:</strong> ${esc(data.probation)}`,
        data.contract && `<strong>Vertragsart:</strong> ${esc(data.contract)}`,
        Number(data.learning_budget) && `<strong>Weiterbildungsbudget:</strong> ${eur(data.learning_budget)} / Jahr`,
        (Number(data.salary_min) || Number(data.salary_max)) && `<strong>Gehalt:</strong> ${eur(data.salary_min)} – ${eur(data.salary_max)} p. a.`,
    ].filter(Boolean).join('<br>');
    const rows = OFFER_TEXT_QUESTIONS.filter((q) => (data[q.key] || '').trim())
        .map((q) => `<p><strong>${esc(q.label)}</strong><br>${nl2br(data[q.key])}</p>`).join('');
    await sendOwnerMail(
        `Angebot: ${data.company || 'Ein Arbeitgeber'}`,
        `<p><strong>${esc(data.company)}</strong> möchte Sie gewinnen und hat Ihnen über die umgekehrte Bewerbung ein Angebot gemacht:</p>
         ${kopf ? `<p>${kopf}</p>` : ''}
         ${rows}
         ${fakten ? `<p>${fakten}</p>` : ''}
         ${data.message ? `<p><strong>Nachricht</strong><br>${nl2br(data.message)}</p>` : ''}
         <p><a href="${siteConfig.url}/dashboard/angebote/${id}">Im Dashboard öffnen</a></p>`,
        data.email,
    );

    return { ok: true };
}

// ---- Admin-Aktionen (Login vorausgesetzt über den (admin)-Bereich) ----

function revalidateAdmin(id) {
    revalidatePath('/dashboard/angebote');
    if (id) revalidatePath(`/dashboard/angebote/${id}`);
}

export async function setOfferStatusAction(formData) {
    const id = Number(formData.get('id'));
    updateOfferStatus(id, (formData.get('status') || '').toString());
    revalidateAdmin(id);
}

export async function saveOfferNotesAction(formData) {
    const id = Number(formData.get('id'));
    updateOfferNotes(id, (formData.get('notes') || '').toString());
    revalidateAdmin(id);
}

export async function rateOfferAction(formData) {
    const id = Number(formData.get('id'));
    const data = {};
    OFFER_RATING_FACTORS.forEach((f) => { data[f.key] = formData.get(`rating_${f.key}`); });
    rateOffer(id, data);
    revalidateAdmin(id);
}

export async function deleteOfferAction(formData) {
    deleteOffer(Number(formData.get('id')));
    revalidatePath('/dashboard/angebote');
}
