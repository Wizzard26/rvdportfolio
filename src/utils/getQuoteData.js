import {quotes} from "@/lib/quotes";

/*
const getRandomQuote = async () => {
    const randomID = Math.floor(Math.random() * quotes.length);
    return quotes[randomID];
}
*/

export const getQuoteData = async () => {
    //const data = await getRandomQuote();
    const data = await quotes;
    return (data);
}