'use client';

import { useState } from 'react';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';
import { stellenCheckBatchAction } from '@/lib/content/radarActions';

// Stellen-Check: prüft in Häppchen, ob die erfassten Stellen noch ausgeschrieben
// sind (BA-API bzw. Karriereseite der Firma). Mit companyId nur diese eine Firma.
export default function RadarStellenCheck({ pendingCount = 0, companyId = 0 }) {
    const [running, setRunning] = useState(false);
    const stopRef = useState(() => ({ stop: false }))[0];
    const [archive, setArchive] = useState(true);
    const [remaining, setRemaining] = useState(pendingCount);
    const [sum, setSum] = useState(null);
    const [log, setLog] = useState([]);

    async function start() {
        setRunning(true); stopRef.stop = false; setLog([]);
        const total = { checked: 0, offline: 0, archived: 0, online: 0, unklar: 0 };
        setSum({ ...total });
        for (let g = 0; g < 500 && !stopRef.stop; g += 1) {
            const fd = new FormData();
            fd.set('limit', '4');
            fd.set('archive', archive ? '1' : '0');
            if (companyId) fd.set('company_id', String(companyId));
            let res;
            try { res = await stellenCheckBatchAction({}, fd); } catch { break; }
            if (!res?.ok) break;
            for (const r of res.results) {
                total.checked += r.checked; total.offline += r.offline; total.online += r.online; total.unklar += r.unklar;
                if (r.archived) total.archived += 1;
            }
            setSum({ ...total });
            setLog((l) => [
                ...res.results.map((r) => `${r.name}: ${r.online} online · ${r.offline} offline · ${r.unklar} unklar${r.archived ? ' → archiviert' : ''}`),
                ...l,
            ].slice(0, 80));
            setRemaining(res.remaining);
            if (companyId || res.remaining <= 0 || res.scanned === 0) break;
        }
        setRunning(false);
    }

    const disabled = !companyId && pendingCount === 0;

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {!running ? (
                    <button type="button" className="an-btn-secondary" onClick={start} disabled={disabled}>
                        <FiCheckSquare aria-hidden="true" /> {companyId ? 'Stellen jetzt prüfen' : `Stellen auf Aktualität prüfen (${pendingCount})`}
                    </button>
                ) : (
                    <button type="button" className="an-btn-secondary an-danger" onClick={() => { stopRef.stop = true; }}>
                        <FiSquare aria-hidden="true" /> Stoppen
                    </button>
                )}
                <label className="an-muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: '0.88em' }}>
                    <input type="checkbox" checked={archive} onChange={(e) => setArchive(e.target.checked)} disabled={running} />
                    Firma archivieren, wenn keine offene Stelle mehr übrig ist
                </label>
                {running && !companyId && <span className="an-badge an-badge--warn">läuft … noch {remaining} Firmen</span>}
                {sum && (
                    <span className="an-muted" style={{ fontSize: '0.88em' }}>
                        {sum.checked} geprüft · <span className="an-badge an-badge--ok">{sum.online} online</span>{' '}
                        <span className="an-badge an-badge--bad">{sum.offline} offline</span>{' '}
                        <span className="an-badge">{sum.unklar} unklar</span>
                        {sum.archived > 0 && <> · {sum.archived} Firmen archiviert</>}
                    </span>
                )}
            </div>
            {log.length > 0 && (
                <details style={{ marginTop: 10 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>Verlauf ({log.length})</summary>
                    <pre className="an-input" style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', maxHeight: 200, overflow: 'auto', fontSize: '0.82em' }}>{log.join('\n')}</pre>
                </details>
            )}
        </div>
    );
}
