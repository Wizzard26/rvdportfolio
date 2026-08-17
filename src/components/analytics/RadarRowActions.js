'use client';

import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

// Deklarations-Aktionen je Firmenzeile im Radar: „als beworben markieren"
// (Bestätigung, legt ggf. eine Initiativbewerbung an) und „verwerfen" (Grund
// per Prompt). Server Actions werden als Props aus der Server-Seite übergeben.
export default function RadarRowActions({ beworbenAction, verwerfenAction, id, showBeworben }) {
    return (
        <>
            {showBeworben && (
                <form
                    action={beworbenAction}
                    style={{ display: 'inline', marginLeft: 6 }}
                    onSubmit={(e) => {
                        if (!window.confirm('Diese Firma als beworben markieren? Legt bei Bedarf eine Initiativbewerbung an und setzt die Doppelansprache-Sperre.')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <input type="hidden" name="id" value={id} />
                    <button type="submit" className="an-icon-btn" title="Als beworben markieren"><FiCheckCircle /></button>
                </form>
            )}
            <form
                action={verwerfenAction}
                style={{ display: 'inline', marginLeft: 6 }}
                onSubmit={(e) => {
                    const grund = window.prompt('Warum verwerfen? (Grund – landet im Verworfen-Tab)', 'kein Interesse');
                    if (grund === null) { e.preventDefault(); return; }
                    e.currentTarget.grund.value = grund;
                }}
            >
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="grund" value="" />
                <button type="submit" className="an-icon-btn an-danger" title="Verwerfen (kein Interesse)"><FiXCircle /></button>
            </form>
        </>
    );
}
