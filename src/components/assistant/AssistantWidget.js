'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './assistant.module.css';

const STARTERS = [
    'Welche Erfahrung hast du mit Shopware?',
    'Womit arbeitest du am liebsten?',
    'Bist du aktuell verfügbar?',
    'Zeig mir ein Projekt.',
];

const INTRO = {
    role: 'bot',
    lead: 'Moin! Ich bin Renés KI-Assistent und beantworte Fragen zu seinem Profil – Erfahrung, Projekte, Tech-Stack, Verfügbarkeit. Die Antworten kommen ausschließlich aus seinen echten Unterlagen.',
    items: [],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function AssistantWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([INTRO]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const ask = async (question) => {
        const q = question.trim();
        if (!q || loading) return;
        setMessages((m) => [...m, { role: 'user', text: q }]);
        setInput('');
        setLoading(true);
        try {
            // Kleiner „Denkprozess": Antwort UND Mindestdenkzeit abwarten, damit
            // der Tipp-Indikator sichtbar bleibt und sich das Ganze natürlich anfühlt.
            const [res] = await Promise.all([
                fetch('/api/assistant', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ question: q }),
                }),
                sleep(650),
            ]);
            const data = await res.json();
            setMessages((m) => [...m, {
                role: 'bot',
                lead: data.lead || (data.items?.length ? '' : 'Dazu habe ich gerade keine Antwort.'),
                items: data.items || [],
            }]);
        } catch {
            setMessages((m) => [...m, { role: 'bot', lead: 'Da ist etwas schiefgelaufen – bitte versuch es gleich noch einmal.', items: [] }]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        ask(input);
    };

    const showStarters = messages.length <= 1 && !loading;

    return (
        <>
            <button
                type="button"
                className={styles.launcher}
                aria-expanded={open}
                aria-controls="cv-assistant-panel"
                aria-label={open ? 'Schließen' : 'Fragen zu René?'}
                onClick={() => setOpen((v) => !v)}
            >
                <span aria-hidden="true" className={styles.launcherIcon}>{open ? '✕' : '💬'}</span>
                <span className={styles.launcherLabel}>{open ? 'Schließen' : 'Fragen zu René?'}</span>
            </button>

            {open && (
                <section id="cv-assistant-panel" className={styles.panel} aria-label="René-KI-Assistent">
                    <header className={styles.head}>
                        <div>
                            <strong>René-KI-Assistent</strong>
                            <span className={styles.headSub}>KI · antwortet nur aus echten Unterlagen</span>
                        </div>
                        <button type="button" className={styles.close} aria-label="Assistent schließen" onClick={() => setOpen(false)}>✕</button>
                    </header>

                    <div className={styles.messages} ref={listRef}>
                        {messages.map((m, i) => (
                            m.role === 'user' ? (
                                <div key={i} className={styles.user}><p>{m.text}</p></div>
                            ) : (
                                <div key={i} className={styles.bot}>
                                    {m.lead ? <p>{m.lead}</p> : null}
                                    {m.items?.map((it) => (
                                        <div key={it.url + it.label} className={styles.source}>
                                            {it.text ? <span className={styles.sourceText}>{it.text}</span> : null}
                                            <Link href={it.url} className={styles.link} onClick={() => setOpen(false)}>
                                                {it.label} →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )
                        ))}
                        {loading && (
                            <div className={styles.bot}>
                                <p className={styles.typing} aria-label="schaut nach">
                                    <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                                </p>
                            </div>
                        )}
                    </div>

                    {showStarters && (
                        <div className={styles.starters}>
                            {STARTERS.map((s) => (
                                <button key={s} type="button" className={styles.chip} onClick={() => ask(s)}>{s}</button>
                            ))}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={onSubmit}>
                        <input
                            ref={inputRef}
                            className={styles.input}
                            type="text"
                            value={input}
                            maxLength={500}
                            placeholder="Frage zu Renés Profil …"
                            aria-label="Deine Frage"
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className={styles.send} disabled={loading || !input.trim()}>Senden</button>
                    </form>
                </section>
            )}
        </>
    );
}
