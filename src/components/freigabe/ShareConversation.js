'use client';

import { useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import styles from './conversation.module.css';

function fmt(ts) {
    return new Date(ts).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Dynamischer Gesprächsverlauf (Chat) zwischen René und dem Arbeitgeber.
// `perspective` = Sicht des Betrachters ('owner' im Admin, 'employer' öffentlich)
// → eigene Nachrichten rechts. `sendAction` + `hiddenName/hiddenValue` bestimmen,
// wie eine neue Nachricht gesendet wird (Admin: id, öffentlich: token).
export default function ShareConversation({
    messages = [], perspective, sendAction, hiddenName, hiddenValue, placeholder = 'Nachricht schreiben …',
}) {
    const threadRef = useRef(null);
    useEffect(() => {
        if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }, [messages.length]);

    return (
        <div className={styles.chat}>
            {messages.length === 0 ? (
                <p className={styles.empty}>Noch keine Nachrichten. Schreiben Sie die erste …</p>
            ) : (
                <ul className={styles.thread} ref={threadRef}>
                    {messages.map((m, i) => {
                        const self = m.sender === perspective;
                        const who = m.sender === 'owner'
                            ? 'René van Dinter'
                            : (perspective === 'owner' ? 'Arbeitgeber' : 'Sie');
                        return (
                            <li key={i} className={`${styles.msg} ${self ? styles.self : styles.other}`}>
                                <span className={styles.who}>{who}</span>
                                <p className={styles.body}>{m.body}</p>
                                <time className={styles.time}>{fmt(m.at)}</time>
                            </li>
                        );
                    })}
                </ul>
            )}
            <form action={sendAction} className={styles.form}>
                <input type="hidden" name={hiddenName} value={hiddenValue} />
                <textarea name="message" rows={2} required placeholder={placeholder} />
                <button type="submit" aria-label="Senden"><FiSend aria-hidden="true" /> Senden</button>
            </form>
        </div>
    );
}
