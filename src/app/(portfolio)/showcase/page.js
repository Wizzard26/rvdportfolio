import HeroContent from "@/components/herocontent/page";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import DockerStats from "@/components/dockerstats/Dockerstats";
import ServerList from "@/components/dockerstats/ServerList";



/*
 async function fetchContainerStatus(name, url) {
    try {
        const response = await fetch(url);
        return { name, status: response.ok ? 'Running' : 'Not running' };
    } catch (error) {
        return { name, status: 'Not reachable' };
    }
}
*/


export default async function ShowCase() {
    const pageName = "Showcase";

    /*
    const containerList = [
        {
            name: 'Next.rene-van-dinter.de',
            url: 'http://next.rene-van-dinter.de'
        },
        {
            name: 'rene-van-dinter.de',
            url: 'http://rene-van-dinter.de'
        }
    ];

    const statuses = await Promise.all(
        containerList.map(container => fetchContainerStatus(container.name, container.url))
    );
    */




    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="right"
            />
            <main className="main-content">
                <section>
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
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Projekte und Referenzen</h2>
                        <div className="testContainer">
                            <h4 className="Dockerzise">Docker Container Runnings</h4>
                            <div className="docker-table row">
                                <div className="col-8 col-md-8">Docker Container</div>
                                <div className="col-4 col-md-4">Status</div>
                                <DockerStats/>
                                <div className="col-8 col-md-4">Projekt/Server Name</div>
                                <div className="col-4 col-md-4">Webadresse</div>
                                <div className="col-4 col-md-4">Besitzer</div>
                                <ServerList/>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}