import Teaser from "@/components/teaser/page";
import HeroContent from "@/components/herocontent/page";
import styles from "./styles.module.css";
import ContactForm from "@/components/contact/ContactForm";
import ContactData from "@/components/contact/ContactData";

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
                        <div className={'row'}>
                            <div className={'col-12 col-lg-3'}>
                                <ContactData />
                            </div>
                            <div className={'col-12 col-lg-9'}>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}