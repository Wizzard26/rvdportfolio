'use client';

import { useState } from 'react';
import { FiPlus, FiX, FiFileText, FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Dynamische Dokumentenauswahl für eine Freigabe: gezielt aus der Liste hinzufügen
// statt einer langen Checkbox-Wand. Die Reihenfolge hier = Reihenfolge der Kacheln
// auf der Freigabe-Seite. Für jedes gewählte Dokument wird ein verstecktes
// document_ids-Feld gerendert, damit die Server-Action unverändert getAll() liest.
export default function ShareDocumentPicker({ documents = [], initialIds = [] }) {
    const [ids, setIds] = useState(() => initialIds.map(Number).filter(Boolean));
    const [pick, setPick] = useState('');

    const byId = new Map(documents.map((d) => [d.id, d]));
    const available = documents.filter((d) => !ids.includes(d.id));

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
            <legend>Dokumente in dieser Freigabe *</legend>

            {documents.length === 0 ? (
                <p className="an-muted">Noch keine Dokumente vorhanden – lege zuerst welche unter „Dokumente“ an.</p>
            ) : (
                <>
                    {ids.length === 0 ? (
                        <p className="an-muted">Noch keine Dokumente hinzugefügt – unten auswählen und hinzufügen.</p>
                    ) : (
                        <ul className="an-doclist">
                            {ids.map((id, i) => {
                                const d = byId.get(id);
                                if (!d) return null;
                                return (
                                    <li key={id} className="an-docitem">
                                        <FiFileText aria-hidden="true" className="an-docicon" />
                                        <span className="an-docname">
                                            {d.title}
                                            {d.is_active ? '' : <span className="an-muted"> — Entwurf</span>}
                                        </span>
                                        <div className="an-doc-actions">
                                            <button type="button" className="an-icon-btn" title="nach oben"
                                                    onClick={() => move(i, -1)} disabled={i === 0}><FiChevronUp aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn" title="nach unten"
                                                    onClick={() => move(i, 1)} disabled={i === ids.length - 1}><FiChevronDown aria-hidden="true" /></button>
                                            <button type="button" className="an-icon-btn an-danger" title="Entfernen"
                                                    onClick={() => remove(id)}><FiX aria-hidden="true" /></button>
                                        </div>
                                        <input type="hidden" name="document_ids" value={id} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {available.length > 0 ? (
                        <div className="an-docadd">
                            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Dokument auswählen">
                                <option value="">— Dokument wählen —</option>
                                {available.map((d) => (
                                    <option key={d.id} value={d.id}>{d.title}{d.is_active ? '' : ' (Entwurf)'}</option>
                                ))}
                            </select>
                            <button type="button" className="an-btn-secondary an-btn-small" onClick={add} disabled={!pick}>
                                <FiPlus aria-hidden="true" /> Dokument hinzufügen
                            </button>
                        </div>
                    ) : (
                        <p className="an-muted">Alle vorhandenen Dokumente sind hinzugefügt.</p>
                    )}
                </>
            )}
        </fieldset>
    );
}
