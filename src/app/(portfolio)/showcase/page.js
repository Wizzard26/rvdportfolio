import HeroContent from "@/components/herocontent/page";
import {ranga, roboto_condensed} from "@/app/fonts";

export default function ShowCase() {
    const pageName = "Showcase";

    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="right"
            />
            <main className="main-content">
                <div className="content-inner">
                    <h1 className={`${roboto_condensed.className}`}>Showcase Referenzen und Case Studys</h1>
                    <div className={`row`}>
                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Referenzen, Auftragsarbeiten und Fingerübungen</h3>
                            <p>Hier finden Sie arbeiten, welche ich in den letzten Jahren angefertigt habe. Diese enstanden für Wettbewerbe, freie Mitarbeit bei verschiedenen Agenturen, sowie in meiner Festanstellung als Frontend-Entwickler.</p>
                            <p>Die Sammlung besteht sowohl aus Auftragsarbeiten wie auch aus arbeiten welche einfach nur zu eigenen Trainingszwecke erstellt wurden.</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}