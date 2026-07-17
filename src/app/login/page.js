import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import LoginForm from './LoginForm';
import styles from './styles.module.css';

// Login-Seite liegt bewusst NICHT in der (admin)-Gruppe: Sie soll ohne
// Admin-Chrome (Sidebar/Header) erscheinen und darf nicht von der Middleware
// geschützt sein — sonst Redirect-Schleife.
export const metadata = {
    title: 'Login',
    // Interne Seite: raus aus Such- und KI-Index (zusätzlich zu robots.txt).
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LoginPage({ searchParams }) {
    // Wer schon eingeloggt ist, braucht kein Formular.
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token)) {
        redirect('/dashboard');
    }

    const params = await searchParams;
    const rawFrom = params?.from;
    const from = typeof rawFrom === 'string' && rawFrom.startsWith('/dashboard') ? rawFrom : '/dashboard';

    return (
        <main className={styles.wrapper}>
            <div className={styles.card}>
                <h1 className={styles.title}>Administration</h1>
                <p className={styles.subtitle}>Bitte melden Sie sich an, um fortzufahren.</p>
                <LoginForm from={from} />
                <a href="/" className={styles.back}>← Zurück zur Website</a>
            </div>
        </main>
    );
}
