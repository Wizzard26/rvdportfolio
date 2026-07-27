import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import Button from "@/components/button/Button";
import { ranga, roboto } from "@/app/fonts";

// Gebrandete 404-Seite für die GESAMTE App (unbekannte URLs und alle notFound()-
// Aufrufe). Bewusst selbst-tragend: die root not-found rendert nur im Root-Layout,
// nicht im Portfolio-Layout — deshalb Header/Footer hier selbst einbinden, damit
// jeder 404-Fall dieselbe Optik samt Navigation bekommt. HTTP-Status bleibt 404.
export default function NotFound() {
    return (
        <div className="site-shell">
            <Header />
            <main className="main-content">
                <section>
                    <div
                        className="content-inner is--centered"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 'clamp(320px, 46vh, 560px)',
                        }}
                    >
                        {/* Großes, blasses „404" als Wasserzeichen im Hintergrund. */}
                        <span
                            aria-hidden="true"
                            className={ranga.className}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -52%)',
                                fontSize: 'clamp(180px, 46vw, 520px)',
                                lineHeight: 1,
                                color: 'var(--primary)',
                                opacity: 0.07,
                                zIndex: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            404
                        </span>

                        {/* Inhalt über dem Wasserzeichen. */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h1 className={roboto.className}>Seite nicht gefunden</h1>
                            <p style={{ maxWidth: '620px', margin: '12px auto 28px' }}>
                                Diese Seite existiert nicht (mehr) oder der Link ist fehlerhaft. Über die Navigation
                                oben kommst du überallhin — oder direkt zurück:
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button href="/" title="Zur Startseite" style="primary" text="Zur Startseite" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
