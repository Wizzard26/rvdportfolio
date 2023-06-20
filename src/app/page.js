import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import HeroContent from "@/components/herocontent/page";

export default function Home() {
    return (
        <>
            <Header />
            <main className="main-content">
                <HeroContent
                    className="hero-container"
                    imageUrl="/img/hero_home.jpg"
                    altText="Welcome on my portfolio"
                />
                <div className="content-inner">
                    <h1>Moin und ein herzliches Willkommen</h1>
                    <h2>Sie suchen einen Grafiker, Webdesigner und Frontendentwickler?</h2>
                    <p>Dann sind Sie hier genau richtig.</p>
                    <p>Ich habe das Privileg behaupten zu können, mein Hobby zum Beruf gemacht zu haben. Gut, das ist bereits mehr als 15 Jahre her. In dieser Zeit habe ich sehr viele Erfahrung gesammelt. Ich biete Kenntnisse in den Bereichen: Web- und Grafikdesign, Illustration, Logo und Corporate Design sowie auch HTML5, CSS3, Content Managment Systeme wie Wordpress, Contao, Shopware und kenntnisse in JS, JQuery, PHP, MySql, Git und Vagrant.</p>
                    <p>Durch Schulungen, Ausbildungen und autodidaktischem Lernen eignete ich mir mein heutiges Wissen an. Ich kenne die Facetten unseres Berufs und ich bleibe auch bei erhöhtem Arbeitsaufkommen strukturiert und fokussiert. Testen Sie mich ruhig.</p>
                    <p>Blättern Sie meine Seite gerne durch und schauen Sie auch unter meinen Referenzen.</p>
                </div>
            </main>
            <Footer />
        </>
    )
}
