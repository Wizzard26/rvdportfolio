import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiMail, FiExternalLink } from 'react-icons/fi';
import { getOffer, getOfferEvents, markOfferViewed } from '@/lib/content/offersStore';
import { saveOfferNotesAction } from '@/lib/content/offersActions';
import { OFFER_TEXT_QUESTIONS } from '@/lib/offerContent';
import OfferStatusForm from '@/components/analytics/OfferStatusForm';
import OfferRating from '@/components/analytics/OfferRating';
import OfferTimeline from '@/components/analytics/OfferTimeline';

export const dynamic = 'force-dynamic';

const eur = (n) => Number(n).toLocaleString('de-DE');
function extUrl(w) {
    const s = (w || '').trim();
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export default async function OfferDetail({ params }) {
    const { id } = await params;
    const offer = getOffer(Number(id));
    if (!offer) notFound();
    markOfferViewed(offer.id);
    const events = getOfferEvents(offer.id);

    // Leere Werte als dezentes „—" (alle Felder werden gezeigt, nicht ausgeblendet).
    const show = (v) => ((v !== undefined && v !== null && String(v).trim()) ? v : <span className="an-muted">—</span>);

    const facts = [
        ['Arbeitsmodell', offer.model],
        ['Standort', offer.location],
        ['Homeoffice-Anteil', offer.homeoffice_pct ? `${offer.homeoffice_pct} %` : ''],
        ['Stunden', offer.hours_per_week ? `${offer.hours_per_week} h / Woche` : ''],
        ['Urlaub', offer.vacation_days ? `${offer.vacation_days} Tage` : ''],
        ['Frühester Start', offer.start_date],
        ['Probezeit', offer.probation],
        ['Vertragsart', offer.contract],
        ['Weiterbildungsbudget', offer.learning_budget ? `${eur(offer.learning_budget)} € / Jahr` : ''],
        ['Gehalt', (offer.salary_min || offer.salary_max) ? `${eur(offer.salary_min)} – ${eur(offer.salary_max)} € p. a.` : ''],
    ];

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/angebote" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Angeboten</Link>
                    <h1>Angebot bearbeiten</h1>
                </div>
            </div>

            <div className="an-edit-grid">
                <div className="an-edit-main">
                    <section className="an-card">
                        <div className="an-offer-head">
                            <h2>{offer.company || '(ohne Firma)'}</h2>
                            <OfferStatusForm offer={offer} />
                        </div>
                        <dl className="an-reaction-meta">
                            <dt>Ansprechpartner:in</dt><dd>{show(offer.contact)}</dd>
                            <dt>E-Mail</dt>
                            <dd>{offer.email ? <a href={`mailto:${offer.email}`}><FiMail aria-hidden="true" /> {offer.email}</a> : show('')}</dd>
                            <dt>Web</dt>
                            <dd>{offer.website ? <a href={extUrl(offer.website)} target="_blank" rel="noreferrer">{offer.website} <FiExternalLink aria-hidden="true" /></a> : show('')}</dd>
                            <dt>Position</dt><dd>{show(offer.position)}</dd>
                        </dl>
                    </section>

                    <section className="an-card">
                        <h3 className="an-catgroup-title">Rahmenbedingungen</h3>
                        <dl className="an-reaction-meta">
                            {facts.map(([k, val]) => <Fragment key={k}><dt>{k}</dt><dd>{show(val)}</dd></Fragment>)}
                        </dl>
                    </section>

                    <section className="an-card">
                        <h3 className="an-catgroup-title">Antworten</h3>
                        {OFFER_TEXT_QUESTIONS.map((q) => (
                            <div className="an-offer-qa" key={q.key}>
                                <strong>{q.label}</strong>
                                <p>{show(offer[`q_${q.key}`])}</p>
                            </div>
                        ))}
                        <div className="an-offer-qa">
                            <strong>Noch etwas, das ich wissen sollte?</strong>
                            <p>{show(offer.message)}</p>
                        </div>
                    </section>

                    <section className="an-card">
                        <h3 className="an-catgroup-title">Meine Bewertung</h3>
                        <OfferRating offer={offer} />
                    </section>

                    <section className="an-card">
                        <h3 className="an-catgroup-title">Interne Notizen</h3>
                        <form action={saveOfferNotesAction} className="an-offer-notes">
                            <input type="hidden" name="id" value={offer.id} />
                            <textarea name="notes" rows={4} defaultValue={offer.notes || ''} placeholder="Nur für dich sichtbar …" />
                            <button type="submit" className="an-btn-secondary an-btn-small">Notiz speichern</button>
                        </form>
                    </section>
                </div>

                <aside className="an-edit-side">
                    <section className="an-card">
                        <h2 className="an-catgroup-title">Verlauf</h2>
                        <OfferTimeline events={events} />
                    </section>
                </aside>
            </div>
        </div>
    );
}
