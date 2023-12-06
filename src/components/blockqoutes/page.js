'use client'
import styles from './styles.module.css'
import {ranga, roboto_condensed} from "@/app/fonts";
import { useEffect, useState } from "react";

const initId = (quoteData) => {
    return Math.floor(Math.random() * quoteData.length);
}

const Blockquotes = ({quoteData}) => {
    const [currentId, setCurrentId] = useState(initId(quoteData));


    useEffect(() => {
        if(quoteData.length === 0) {
            return
        }

        const interval = setInterval(() => {
            setCurrentId((prevId) => {
                let randomId;
                do {
                    randomId = Math.floor(Math.random() * quoteData.length);
                } while (randomId === prevId);

                return randomId;
            });
        }, 9000);

        return () => clearInterval(interval);
    }, [quoteData]);

    const currentQuote = quoteData[currentId];

    return (

        <section>
            <div className="content-inner">
                <blockquote className={`${roboto_condensed.className} ${styles.blockQuotes}`}>
                    {currentQuote.quote}
                </blockquote>
                <div className={`${ranga.className} ${styles.blockQuotesSub}`}>
                    Zitat: {currentQuote.author}
                </div>
            </div>
        </section>
    );
}


export default Blockquotes
