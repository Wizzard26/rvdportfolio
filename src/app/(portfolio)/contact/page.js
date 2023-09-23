import {ranga, roboto} from "@/app/fonts";
import Teaser from "@/components/teaser/page";
import HeroContent from "@/components/herocontent/page";

export default function Contact() {
    const pageName = 'Contact';
    return(
        <>
            <main className="main-content">
                <HeroContent
                    className="hero-container"
                    pageName={pageName}
                />
                <Teaser
                    className="main--teaser"
                    pageName={pageName}
                />
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={roboto.className}>Schreiben Sie mir eine Nachricht</h2>
                        <div>Hier das Kontaktform</div>
                    </div>
                </section>

            </main>
        </>
    )
}