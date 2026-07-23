'use client';

import { useState } from 'react';
import { roboto_condensed } from '@/app/fonts';
import ContactForm from './ContactForm';
import OfferForm from '@/components/offer/OfferForm';
import styles from './switch.module.css';

// Umschalter auf der Kontaktseite: klassische Nachricht ⇄ „umgekehrte Bewerbung".
export default function ContactSwitch() {
    const [mode, setMode] = useState('message');

    return (
        <div>
            <div className={styles.switch} role="tablist" aria-label="Kontaktart wählen">
                <button type="button" role="tab" aria-selected={mode === 'message'}
                        className={`${roboto_condensed.className} ${styles.tab} ${mode === 'message' ? styles.active : ''}`}
                        onClick={() => setMode('message')}>
                    Nachricht schreiben
                </button>
                <button type="button" role="tab" aria-selected={mode === 'offer'}
                        className={`${roboto_condensed.className} ${styles.tab} ${mode === 'offer' ? styles.active : ''}`}
                        onClick={() => setMode('offer')}>
                    Mir ein Angebot machen
                </button>
            </div>

            {mode === 'message' ? (
                <ContactForm />
            ) : (
                <div className={styles.offer}>
                    <h2 className={roboto_condensed.className}>Bewerben Sie sich bei mir</h2>
                    <p className={styles.lead}>Ein ehrlicher Perspektivwechsel: Beantworten Sie einmal die Fragen, die
                        sonst ich beantworten müsste – und machen Sie mir Ihr Angebot.</p>
                    <OfferForm />
                </div>
            )}
        </div>
    );
}
