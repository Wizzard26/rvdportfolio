import HeroContent from "@/components/herocontent/page";

export default function Vita() {
    const pageName = "Vita";

    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="left"
            />
            <main className="main-content">
                <div className="content-inner">
                    <h1>Here is my Vita Place</h1>
                </div>
            </main>
        </>
    )
}