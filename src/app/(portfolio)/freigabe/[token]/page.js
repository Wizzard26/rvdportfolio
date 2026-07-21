import { notFound } from "next/navigation";
import { TbFileTypePdf } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";
import { roboto_condensed } from "@/app/fonts";
import { getShareByToken } from "@/lib/content/sharesStore";
import styles from "./styles.module.css";

export const dynamic = 'force-dynamic';

// Privater, per Link geteilter Bereich → nicht indexieren.
export const metadata = {
    title: 'Freigegebene Dokumente',
    robots: { index: false, follow: false },
};

export default async function SharePage({ params }) {
    const { token } = await params;
    const share = getShareByToken(token);
    if (!share) notFound();

    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <h1 className={roboto_condensed.className}>{share.title || 'Freigegebene Dokumente'}</h1>
                    {share.message && <p className={styles.message}>{share.message}</p>}

                    {share.documents.length === 0 ? (
                        <p>Für diese Freigabe sind derzeit keine Dokumente hinterlegt.</p>
                    ) : (
                        <ul className={styles.docList}>
                            {share.documents.map((d) => (
                                <li key={d.id}>
                                    <a href={d.file} download className={styles.docLink}>
                                        <TbFileTypePdf aria-hidden="true" className={styles.pdfIcon} />
                                        <span className={styles.docTitle}>{d.title}</span>
                                        <FiDownload aria-hidden="true" className={styles.dlIcon} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className={styles.note}>Diese Dokumente wurden privat über einen persönlichen Link mit Ihnen geteilt.</p>
                </div>
            </section>
        </main>
    );
}
