'use client';

import { useState } from 'react';
import { TbStar, TbStarFilled } from 'react-icons/tb';
import { rateOfferAction } from '@/lib/content/offersActions';
import { OFFER_RATING_FACTORS } from '@/lib/offerContent';

function Stars({ name, initial }) {
    const [value, setValue] = useState(Number(initial) || 0);
    const [hover, setHover] = useState(0);
    const active = hover || value;
    return (
        <span className="an-star-input" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="an-star-btn" aria-label={`${n} von 5`}
                        onMouseEnter={() => setHover(n)} onClick={() => setValue(n === value ? 0 : n)}>
                    {n <= active ? <TbStarFilled /> : <TbStar />}
                </button>
            ))}
            <input type="hidden" name={name} value={value} />
        </span>
    );
}

// Meine Sterne-Bewertung des Arbeitgebers/Angebots.
export default function OfferRating({ offer }) {
    return (
        <form action={rateOfferAction} className="an-offer-rating">
            <input type="hidden" name="id" value={offer.id} />
            <ul className="an-ratings">
                {OFFER_RATING_FACTORS.map((f) => (
                    <li key={f.key}>
                        <span>{f.label}</span>
                        <Stars name={`rating_${f.key}`} initial={offer[`rating_${f.key}`]} />
                    </li>
                ))}
            </ul>
            <button type="submit" className="an-btn-secondary an-btn-small">Bewertung speichern</button>
        </form>
    );
}
