'use client';

import { setOfferStatusAction } from '@/lib/content/offersActions';
import { OFFER_STATUS_ORDER, OFFER_STATUS_LABELS } from '@/lib/offerContent';

// Status-Umschalter für ein Angebot – speichert direkt bei Auswahl.
export default function OfferStatusForm({ offer }) {
    return (
        <form action={setOfferStatusAction} className="an-inline-form">
            <input type="hidden" name="id" value={offer.id} />
            <select name="status" defaultValue={offer.status} onChange={(e) => e.currentTarget.form.requestSubmit()}>
                {OFFER_STATUS_ORDER.map((s) => <option key={s} value={s}>{OFFER_STATUS_LABELS[s]}</option>)}
            </select>
        </form>
    );
}
