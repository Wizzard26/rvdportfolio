'use client';

import { useState } from 'react';
import { FiRefreshCw, FiSquare } from 'react-icons/fi';
import { rescanBatchAction } from '@/lib/content/radarActions';

const OUTCOME_LABEL = {
    shopware: 'Shopware bestätigt', migrated: 'weg-migriert', unreachable: 'nicht erreichbar', blocked: 'blockiert',
};

// Live-Re-Scan in Häppchen (5/Aufruf, serverseitig gedrosselt). Läuft in einer
// Client-Schleife bis „remaining=0" oder bis der Nutzer stoppt.
export default function RadarBatchRescan({ pendingCount = 0 }) {
    const [running, setRunning] = useState(false);
    const stopRef = useState(() => ({ stop: false }))[0];
    const [remaining, setRemaining] = useState(pendingCount);
    const [tally, setTally] = useState({ shopware: 0, migrated: 0, unreachable: 0, blocked: 0 });
    const [log, setLog] = useState([]);

    async function start(mode) {
        setRunning(true); stopRef.stop = false;
        const t = { shopware: 0, migrated: 0, unreachable: 0, blocked: 0 };
        setTally({ ...t }); setLog([]);
        // Sicherheitslimit gegen Endlosschleife.
        for (let guard = 0; guard < 500 && !stopRef.stop; guard += 1) {
            const fd = new FormData(); fd.set('limit', '5'); fd.set('mode', mode);
            let res;
            try { res = await rescanBatchAction({}, fd); } catch { break; }
            if (!res?.ok) break;
            for (const r of res.results) t[r.outcome] = (t[r.outcome] || 0) + 1;
            setTally({ ...t });
            setLog((l) => [...res.results.map((r) => `${r.domain} → ${OUTCOME_LABEL[r.outcome] || r.outcome}${r.plattform ? ` (${r.plattform})` : ''}`), ...l].slice(0, 60));
            setRemaining(res.remaining);
            if (res.remaining <= 0 || res.scanned === 0) break;
        }
        setRunning(false);
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {!running ? (
                    <>
                        <button type="button" className="an-btn-primary" onClick={() => start('unscanned')} disabled={pendingCount === 0}>
                            <FiRefreshCw aria-hidden="true" /> Neue scannen ({pendingCount})
                        </button>
                        <button type="button" className="an-btn-secondary an-btn-small" onClick={() => start('all')}>
                            Alle neu scannen
                        </button>
                    </>
                ) : (
                    <button type="button" className="an-btn-secondary an-danger" onClick={() => { stopRef.stop = true; }}>
                        <FiSquare aria-hidden="true" /> Stoppen
                    </button>
                )}
                {running && <span className="an-badge an-badge--warn">läuft … noch {remaining}</span>}
            </div>

            {(tally.shopware || tally.migrated || tally.unreachable || tally.blocked) > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    <span className="an-badge an-badge--ok">✓ Shopware {tally.shopware}</span>
                    <span className="an-badge an-badge--warn">→ weg-migriert {tally.migrated}</span>
                    <span className="an-badge an-badge--bad">✕ nicht erreichbar {tally.unreachable}</span>
                    {tally.blocked > 0 && <span className="an-badge">blockiert {tally.blocked}</span>}
                </div>
            )}

            {log.length > 0 && (
                <details style={{ marginTop: 10 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>Verlauf ({log.length})</summary>
                    <pre className="an-input" style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', maxHeight: 220, overflow: 'auto', fontSize: '0.82em' }}>{log.join('\n')}</pre>
                </details>
            )}
        </div>
    );
}
