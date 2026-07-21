'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';

// Zeigt den Freigabe-Link (relativ) und kopiert die absolute URL in die Zwischenablage.
export default function ShareLink({ path }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        const url = typeof window !== 'undefined' ? window.location.origin + path : path;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* Clipboard nicht verfügbar → ignorieren */ }
    };

    return (
        <div className="an-sharelink">
            <code className="an-sharelink-url">{path}</code>
            <button type="button" className="an-icon-btn" onClick={copy} title="Link kopieren">
                {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            </button>
            <a href={path} target="_blank" rel="noreferrer" className="an-icon-btn" title="Öffnen"><FiExternalLink /></a>
        </div>
    );
}
