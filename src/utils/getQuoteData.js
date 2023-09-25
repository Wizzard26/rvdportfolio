import {quotes} from "@/lib/quotes";

export const getQuoteData = async () => {
    //const data = await getRandomQuote();
    const data = await quotes;
    return (data);
}