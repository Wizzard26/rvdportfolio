import styles from './styles.module.css'
import {ranga, roboto_condensed} from "@/app/fonts";
import { quotes } from "@/lib/quotes";

function getRandomQuote() {
    const randomID = Math.floor(Math.random() * quotes.length);
    return quotes[randomID];
}

export default function Blockqoutes() {
    const randomQuote = getRandomQuote();

    return (
        <section>
            <div className="content-inner">
                <blockquote className={`${roboto_condensed.className} ${styles.blockQuotes}`}>
                    {randomQuote.quote}
                </blockquote>
                <div className={`${ranga.className} ${styles.blockQuotesSub}`}>Zitat: {randomQuote.author}</div>
            </div>
        </section>
    );
}