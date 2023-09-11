import HeroContent from "@/components/herocontent/page";
import Teaser from "@/components/teaser/page";
//import Blockqoutes from "@/components/blockqoutes/page";
import { getQuoteData } from "@/utils/getQuoteData";
import dynamic from 'next/dynamic';

const Blockqoutes = dynamic(() => import('@/components/blockqoutes/page'), {
    ssr: false,
    loading: () => <section><div className="content-inner"><blockquote style={{ textAlign: 'center' }}>Loading random quote ...</blockquote></div></section>
})

export default async function AboutMe() {
    const pageName = "AboutMe";
    //const { author, quote } = await getQuoteData();
    const quoteData = await getQuoteData();

    return (
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
            />
            <Teaser
                className="main--teaser"
                pageName={pageName}
            />
            <Blockqoutes quoteData={quoteData}  />
        </>
    )
}