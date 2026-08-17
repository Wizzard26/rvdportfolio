'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

// Deklarations-Aktionen je Firmenzeile im Radar: „als beworben markieren" und
// „verwerfen (Grund)". Bewusst ein echtes In-App-Modal statt window.prompt/confirm
// (Alerts gehören nicht in ein Produktivsystem). Die Server Actions kommen als
// Props von der Server-Seite.
const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000, padding: 16,
    background: 'rgba(4, 21, 31, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const card = {
    background: 'var(--adm-surface, #fff)', color: 'var(--adm-ink, #04151f)',
    border: '1px solid var(--adm-border, #e4e8ea)', borderRadius: 12, padding: '20px 22px',
    maxWidth: 440, width: '100%', boxShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
    // Das Modal steckt im DOM in einer <td> mit white-space:nowrap (vererbt!) →
    // hier zurücksetzen, sonst läuft der Text aus dem Modal.
    whiteSpace: 'normal', overflowWrap: 'anywhere', boxSizing: 'border-box',
};
const actionsRow = { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 };

export default function RadarRowActions({ beworbenAction, verwerfenAction, id, name, showBeworben }) {
    const [mode, setMode] = useState(null); // 'beworben' | 'verwerfen' | null
    const label = name ? `„${name}"` : 'diese Firma';

    useEffect(() => {
        if (!mode) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setMode(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mode]);

    return (
        <>
            {showBeworben && (
                <button type="button" className="an-icon-btn" title="Als beworben markieren" style={{ marginLeft: 6 }} onClick={() => setMode('beworben')}>
                    <FiCheckCircle />
                </button>
            )}
            <button type="button" className="an-icon-btn an-danger" title="Verwerfen (kein Interesse)" style={{ marginLeft: 6 }} onClick={() => setMode('verwerfen')}>
                <FiXCircle />
            </button>

            {mode && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={mode === 'beworben' ? 'Als beworben markieren' : 'Firma verwerfen'}
                    style={overlay}
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setMode(null); }}
                >
                    {mode === 'beworben' ? (
                        <form action={beworbenAction} style={card}>
                            <input type="hidden" name="id" value={id} />
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>Als beworben markieren</h3>
                            <p style={{ margin: 0, color: 'var(--adm-ink-soft, #3b4a52)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                {label} als beworben markieren? Legt bei Bedarf eine Initiativbewerbung an und setzt die Doppelansprache-Sperre.
                            </p>
                            <div style={actionsRow}>
                                <button type="button" className="an-btn-secondary an-btn-small" onClick={() => setMode(null)}>Abbrechen</button>
                                <button type="submit" className="an-btn-primary an-btn-small">Als beworben markieren</button>
                            </div>
                        </form>
                    ) : (
                        <form action={verwerfenAction} style={card}>
                            <input type="hidden" name="id" value={id} />
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>Kein Interesse – verwerfen</h3>
                            <p style={{ margin: '0 0 12px', color: 'var(--adm-ink-soft, #3b4a52)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                {label} verwerfen. Der Grund landet im Verworfen-Tab; reaktivieren ist jederzeit möglich.
                            </p>
                            <label className="an-field" style={{ display: 'block' }}>
                                <span style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Grund</span>
                                <input name="grund" defaultValue="kein Interesse" autoFocus className="an-input" style={{ width: '100%' }} />
                            </label>
                            <div style={actionsRow}>
                                <button type="button" className="an-btn-secondary an-btn-small" onClick={() => setMode(null)}>Abbrechen</button>
                                <button type="submit" className="an-btn-primary an-btn-small an-danger">Verwerfen</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}
