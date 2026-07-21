import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { TbFileTypePdf } from "react-icons/tb";
import { FiDownload, FiLock, FiCheckCircle, FiArchive } from "react-icons/fi";
import { roboto_condensed } from "@/app/fonts";
import { getShareByToken, getShareRawByToken, shareCookieName } from "@/lib/content/sharesStore";
import { unlockShareAction } from "@/lib/content/sharesActions";
import CloseShareButton from "@/components/analytics/CloseShareButton";
import styles from "./styles.module.css";

export const dynamic = 'force-dynamic';

// Privater, per Link geteilter Bereich → nicht indexieren.
export const metadata = {
    title: 'Freigegebene Dokumente',
    robots: { index: false, follow: false },
};

// PLZ-Gate: fragt den Zugriffscode ab, bevor die Dokumente erscheinen.
function GateView({ token, title, error }) {
    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <div className={styles.gate}>
                        <FiLock aria-hidden="true" className={styles.gateIcon} />
                        <h1 className={roboto_condensed.className}>Geschützter Bereich</h1>
                        <p>{title ? `„${title}“ ist ` : 'Dieser Bereich ist '}durch einen Zugriffscode geschützt.
                            Bitte geben Sie den Code ein, den Sie erhalten haben.</p>
                        {error && <p className={styles.gateError}>Der Code ist nicht korrekt. Bitte versuchen Sie es erneut.</p>}
                        <form action={unlockShareAction} className={styles.gateForm}>
                            <input type="hidden" name="token" value={token} />
                            <input name="code" inputMode="numeric" autoComplete="off" placeholder="Zugriffscode"
                                   aria-label="Zugriffscode" required autoFocus />
                            <button type="submit" className={styles.gateBtn}>Freischalten</button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}

function ShareView({ share }) {
    const many = share.documents.length > 1;
    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <header className={styles.teaser}>
                        <h1 className={roboto_condensed.className}>{share.title || 'Freigegebene Dokumente'}</h1>
                        {share.company && <p className={styles.forWhom}>Zusammengestellt für {share.company}</p>}
                        {share.message && <p className={styles.message}>{share.message}</p>}
                    </header>

                    {share.documents.length === 0 ? (
                        <p>Für diese Freigabe sind derzeit keine Dokumente hinterlegt.</p>
                    ) : (
                        <>
                            <div className={styles.tiles}>
                                {share.documents.map((d) => (
                                    <a key={d.id} href={d.file} download className={styles.tile}>
                                        <TbFileTypePdf aria-hidden="true" className={styles.tilePdf} />
                                        <span className={styles.tileTitle}>{d.title}</span>
                                        <span className={styles.tileDownload}><FiDownload aria-hidden="true" /> PDF herunterladen</span>
                                    </a>
                                ))}
                            </div>

                            {many && (
                                <div className={styles.actions}>
                                    <a href={`/freigabe/${share.token}/download`} className={styles.allBtn}>
                                        <FiArchive aria-hidden="true" /> Alle Unterlagen herunterladen (ZIP)
                                    </a>
                                    <CloseShareButton token={share.token} className={styles.closeBtn} />
                                </div>
                            )}
                            {many && (
                                <p className={styles.actionsNote}>
                                    Hinweis: „Alles heruntergeladen" schließt diesen Zugang – der Link ist danach nicht mehr gültig.
                                </p>
                            )}
                        </>
                    )}

                    <p className={styles.note}>Diese Dokumente wurden privat über einen persönlichen Link mit Ihnen geteilt.</p>
                </div>
            </section>
        </main>
    );
}

function ClosedView() {
    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <div className={styles.gate}>
                        <FiCheckCircle aria-hidden="true" className={styles.gateIcon} />
                        <h1 className={roboto_condensed.className}>Vielen Dank!</h1>
                        <p>Dieser Zugang wurde geschlossen. Der Link ist nicht mehr gültig.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default async function SharePage({ params, searchParams }) {
    const { token } = await params;
    const sp = await searchParams;
    const share = getShareByToken(token);
    if (!share) {
        // Gerade selbst geschlossen? → Dank-Ansicht statt 404.
        if (sp?.closed === '1' && getShareRawByToken(token)) return <ClosedView />;
        notFound();
    }

    if (share.access_code) {
        const unlocked = (await cookies()).get(shareCookieName(share.id))?.value === '1';
        if (!unlocked) {
            return <GateView token={token} title={share.title} error={sp?.gate === '1'} />;
        }
    }

    return <ShareView share={share} />;
}
