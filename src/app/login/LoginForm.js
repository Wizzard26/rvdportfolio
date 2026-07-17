'use client';

import { useActionState } from 'react';
import { login } from '@/lib/authActions';
import styles from './styles.module.css';

// Das eigentliche Login-Formular. Ruft die Server Action `login` über
// `useActionState` auf — bei Erfolg leitet die Action serverseitig weiter,
// bei Fehler landet die Meldung in `state.error`.
export default function LoginForm({ from }) {
    const [state, formAction, pending] = useActionState(login, { error: null });

    return (
        <form action={formAction} className={styles.form}>
            {/* Ziel nach erfolgreichem Login; von der Middleware gesetzt. */}
            <input type="hidden" name="from" value={from} />

            <label htmlFor="password" className={styles.label}>Passwort</label>
            <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                className={styles.input}
                aria-invalid={state.error ? 'true' : undefined}
            />

            {state.error && (
                <p className={styles.error} role="alert">{state.error}</p>
            )}

            <button type="submit" disabled={pending} className={styles.button}>
                {pending ? 'Anmelden …' : 'Anmelden'}
            </button>
        </form>
    );
}
