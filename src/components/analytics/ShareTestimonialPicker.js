'use client';

import { useState } from 'react';
import { FiPlus, FiX, FiMessageSquare, FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Ordnet einer Freigabe gezielt einzelne Referenzen/Stimmen zu (passende Stimme
// zum Empfänger). Reihenfolge = Reihenfolge im Slider auf der Freigabe-Seite.
// Für jede gewählte Stimme wird ein verstecktes testimonial_ids-Feld gerendert.
export default function ShareTestimonialPicker({ testimonials = [], initialIds = [] }) {
    const [ids, setIds] = useState(() => initialIds.map(Number).filter(Boolean));
    const [pick, setPick] = useState('');

    const byId = new Map(testimonials.map((t) => [t.id, t]));
    const available = testimonials.filter((t) => !ids.includes(t.id));
    const label = (t) => [t.author, t.company].filter(Boolean).join(' · ');

    const add = () => {
        const id = Number(pick);
        if (!id || ids.includes(id)) return;
        setIds((prev) => [...prev, id]);
        setPick('');
    };
    const remove = (id) => setIds((prev) => prev.filter((x) => x !== id));
    const move = (index, dir) => setIds((prev) => {
        const next = [...prev];
        const to = index + dir;
        if (to < 0 || to >= next.length) return prev;
        [next[index], next[to]] = [next[to], next[index]];
        return next;
    });

    return (
        <fieldset className="an-field an-checkgroup">
            <legend>Referenzen / Stimmen auf dieser Freigabe <span className="an-muted">(passend zum Empfänger wählen)</span></legend>

            {testimonials.length === 0 ? (
                <p className="an-muted">Noch keine aktiven Referenzen – lege welche unter „Referenzen“ an.</p>
            ) : (
                <>
                    {ids.length === 0 ? (
                        <p className="an-muted">Keine zugeordnet – unten passende Stimmen auswählen (leer = keine Stimmen-Karte).</p>
                    ) : (
                        <ul className="an-doclist">
                            {ids.map((id, i) => {
                                const t = byId.get(id);
                                if (!t) return null;
                                return (
                                    <li key={id} className="an-docitem">
                                        <FiMessageSquare aria-hidden="true" className="an-docicon" />
                                        <span className="an-docname">
                                            <strong>{t.author}</strong>{t.company ? <span className="an-muted"> · {t.company}</span> : ''}
                                        </span>
                                        <div className="an-doc-actions">
                                            <button type="button" className="an-icon-btn" title="nach oben"
                                                    onClick={() => move(i, -1)} disabled={i === 0}><FiChevronUp aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn" title="nach unten"
                                                    onClick={() => move(i, 1)} disabled={i === ids.length - 1}><FiChevronDown aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn an-danger" title="Entfernen"
                                                    onClick={() => remove(id)}><FiX aria-hidden="true" /></button>
                                        </div>
                                        <input type="hidden" name="testimonial_ids" value={id} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {available.length > 0 ? (
                        <div className="an-docadd">
                            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Referenz auswählen">
                                <option value="">— Referenz wählen —</option>
                                {available.map((t) => <option key={t.id} value={t.id}>{label(t)}</option>)}
                            </select>
                            <button type="button" className="an-btn-secondary an-btn-small" onClick={add} disabled={!pick}>
                                <FiPlus aria-hidden="true" /> Referenz hinzufügen
                            </button>
                        </div>
                    ) : (
                        <p className="an-muted">Alle aktiven Referenzen sind zugeordnet.</p>
                    )}
                </>
            )}
        </fieldset>
    );
}
