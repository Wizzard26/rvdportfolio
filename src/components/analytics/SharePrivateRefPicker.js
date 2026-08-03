'use client';

import { useState } from 'react';
import { FiPlus, FiX, FiEyeOff, FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Ordnet einer Freigabe gezielt vertrauliche Referenzen zu (Arbeitsproben, die
// nicht im öffentlichen Showcase stehen). Reihenfolge = Reihenfolge auf der
// Freigabe-Seite. Für jede gewählte Referenz wird ein verstecktes
// private_ref_ids-Feld gerendert.
export default function SharePrivateRefPicker({ refs = [], initialIds = [] }) {
    const [ids, setIds] = useState(() => initialIds.map(Number).filter(Boolean));
    const [pick, setPick] = useState('');

    const byId = new Map(refs.map((r) => [r.id, r]));
    const available = refs.filter((r) => !ids.includes(r.id));
    // Nur der Titel im Auswahlfeld — ein langer Kontext würde das native <select>
    // aufblähen (Kontext steht ohnehin in der Liste darunter).
    const label = (r) => r.title;

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
            <legend>Vertrauliche Referenzen auf dieser Freigabe <span className="an-muted">(nur hier sichtbar, nie öffentlich)</span></legend>

            {refs.length === 0 ? (
                <p className="an-muted">Noch keine aktiven vertraulichen Referenzen – lege welche unter „Vertrauliche Referenzen“ an.</p>
            ) : (
                <>
                    {ids.length === 0 ? (
                        <p className="an-muted">Keine zugeordnet – unten passende Arbeitsproben auswählen (leer = kein vertraulicher Abschnitt).</p>
                    ) : (
                        <ul className="an-doclist">
                            {ids.map((id, i) => {
                                const r = byId.get(id);
                                if (!r) return null;
                                return (
                                    <li key={id} className="an-docitem">
                                        <FiEyeOff aria-hidden="true" className="an-docicon" />
                                        <span className="an-docname">
                                            <strong>{r.title}</strong>{r.context ? <span className="an-muted"> · {r.context}</span> : ''}
                                        </span>
                                        <div className="an-doc-actions">
                                            <button type="button" className="an-icon-btn" title="nach oben"
                                                    onClick={() => move(i, -1)} disabled={i === 0}><FiChevronUp aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn" title="nach unten"
                                                    onClick={() => move(i, 1)} disabled={i === ids.length - 1}><FiChevronDown aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn an-danger" title="Entfernen"
                                                    onClick={() => remove(id)}><FiX aria-hidden="true" /></button>
                                        </div>
                                        <input type="hidden" name="private_ref_ids" value={id} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {available.length > 0 ? (
                        <div className="an-docadd">
                            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Vertrauliche Referenz auswählen">
                                <option value="">— Referenz wählen —</option>
                                {available.map((r) => <option key={r.id} value={r.id}>{label(r)}</option>)}
                            </select>
                            <button type="button" className="an-btn-secondary an-btn-small" onClick={add} disabled={!pick}>
                                <FiPlus aria-hidden="true" /> Referenz hinzufügen
                            </button>
                        </div>
                    ) : (
                        <p className="an-muted">Alle aktiven vertraulichen Referenzen sind zugeordnet.</p>
                    )}
                </>
            )}
        </fieldset>
    );
}
