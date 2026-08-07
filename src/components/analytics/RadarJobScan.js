'use client';

import { useState } from 'react';
import { FiBriefcase, FiSquare } from 'react-icons/fi';
import { jobScanBatchAction } from '@/lib/content/radarActions';

// Batch-Karriereseiten-Scan: sammelt Shopware-Stellen aus den Karriereseiten der
// Firmen als Job-Chancen (legitim, keine Portale). Läuft in Häppchen bis fertig.
export default function RadarJobScan({ pendingCount = 0 }) {
    const [running, setRunning] = useState(false);
    const stopRef = useState(() => ({ stop: false }))[0];
    const [remaining, setRemaining] = useState(pendingCount);
    const [jobsAdded, setJobsAdded] = useState(0);
    const [log, setLog] = useState([]);

    async function start() {
        setRunning(true); stopRef.stop = false;
        let total = 0; setJobsAdded(0); setLog([]);
        for (let g = 0; g < 500 && !stopRef.stop; g += 1) {
            const fd = new FormData(); fd.set('limit', '5');
            let res;
            try { res = await jobScanBatchAction({}, fd); } catch { break; }
            if (!res?.ok) break;
            total += res.jobsAdded; setJobsAdded(total);
            setLog((l) => [...res.results.filter((r) => r.found || r.widget).map((r) => `#${r.id}: ${r.added} neu / ${r.found} gefunden${r.widget ? ` (${r.widget}-Widget)` : ''}`), ...l].slice(0, 60));
            setRemaining(res.remaining);
            if (res.remaining <= 0 || res.scanned === 0) break;
        }
        setRunning(false);
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {!running ? (
                    <button type="button" className="an-btn-secondary" onClick={start} disabled={pendingCount === 0}>
                        <FiBriefcase aria-hidden="true" /> Karriereseiten nach Stellen absuchen ({pendingCount})
                    </button>
                ) : (
                    <button type="button" className="an-btn-secondary an-danger" onClick={() => { stopRef.stop = true; }}>
                        <FiSquare aria-hidden="true" /> Stoppen
                    </button>
                )}
                {running && <span className="an-badge an-badge--warn">läuft … noch {remaining}</span>}
                {jobsAdded > 0 && <span className="an-badge an-badge--ok">{jobsAdded} neue Stellen-Chancen</span>}
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
