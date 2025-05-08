'use client';
import { useEffect} from "react";
import '@/../public/democss/lottogenerator.css';

export default function Lottogenerator() {

    useEffect(() => {
        const container = document.querySelector('.content');
        const system = document.querySelector('#system');
        const generate = document.querySelector('#generate');
        const mainContainer = document.querySelector('.generatet');
        const quInput = document.querySelector('#quantity');

        let game = system.value;
        let min = 1;
        let max;
        let nums;
        let numbers = [];
        let euronumbers = [];

        // Random Number generate with min and max
        const random = (min, max) => {
            return (Math.floor(Math.random() * (max - min)) + min);
        }
        // Sort function to fix number Arrays small to big
        const sort = e => {
            e.sort((a, b) => a - b);
        }

        // Set number arrays to empty arrays
        const resetNumbers = () => {
            numbers = [];
            euronumbers = [];
        }

        // Start Loops for generate the number lists
        const generateLoops = () => {
            let headline = mainContainer.querySelector('h2');
            while(container.firstChild) {
                if (headline) headline.remove();
                container.removeChild(container.firstChild);
            }

            game = system.value;
            let rounds = quInput.value;

            if (rounds > 0 && rounds <= 30) {
                newHeadline();
                createRounds(rounds);
            } else {
                errMsg();
            }

            quInput.blur();
            quInput.value = '';
        }

        // Start to create the Round Tables and number loops
        const createRounds = (rounds) => {
            let count = 1;
            if (game === "euro") {
                max = 50;
                nums = 5;
            } else {
                max = 49;
                nums = 6;
            }

            for (let i = 0; i < rounds;i++) {
                setTimeout (function() {
                    createBox(count);
                    showNumbers();
                    resetNumbers();
                    count++;
                }, 400 * i);
            }
        }

        // Create the random numbers and push this into the arrays
        const createNumbers = (min,max,nums,count) => {
            while (numbers.length < nums) {
                let temp = random(min,max);
                if (!numbers.includes(temp)) {
                    numbers.push(temp);
                }
            }

            if (game === "euro") {
                // xtra loop for euronumbers
                while (euronumbers.length < 2) {
                    let eurotemp = random(1,10);
                    if (!euronumbers.includes(eurotemp)) {
                        euronumbers.push(eurotemp);
                    }
                }
                sort(numbers);
                sort(euronumbers);

                return `<h2>EuroJackpot - Tip #${count}</h2>`;

            } else {
                sort(numbers);

                return `<h2>6 aus 49 - Tip #${count}</h2>`;
            }
        }

        // Loop the number arrays and split the elements for frontend
        const showNumbers = () => {
            let numCards = document.querySelector('.card:last-of-type');


            for (let i = 0; i < numbers.length; i++) {
                createNumBoxes(numCards, i);
            }

            if ( euronumbers.length > 0) {
                createEuroBoxes(numCards);
                let numEuroCards = document.querySelector('.card:last-of-type > .euroBox');

                for (let k = 0; k < euronumbers.length; k++) {
                    createNumEuroBoxes(numEuroCards, k);
                }
            }
        }

        const errMsg = () => {
            let errorMsg = document.createElement('div');
            errorMsg.setAttribute('class','err-msg');
            errorMsg.innerHTML = 'Bitte bei Anzahl der Felder einen Wert zwischen 1 und 30 eingeben um Ihre Zahlen zu Generieren !!';
            container.append(errorMsg);
        }

        const newHeadline = () => {
            let headline = document.createElement('h2');
            headline.setAttribute('class','headline');
            headline.innerHTML = 'Spieltips möglicher Gewinnzahlen:';
            mainContainer.prepend(headline);
        }

        // Create a new card
        const createBox = (count) => {
            let box = document.createElement('div');
            box.setAttribute('class','card');
            box.innerHTML = createNumbers(min,max,nums,count);
            container.append(box);
        }

        // Create a new number box and push it into the gamecard
        const createNumBoxes = (numCards, i) => {
            let numSpan = document.createElement('span');
            numSpan.setAttribute('class','numbers');
            numSpan.innerHTML = numbers[i];
            numCards.append(numSpan);
        }

        // New container to display Euro numbers in an new line
        const createEuroBoxes = (numCards) => {
            let euronumBox = document.createElement('div');
            euronumBox.setAttribute('class','euroBox');
            numCards.append(euronumBox);
        }

        // Create the additional euro number box and push it into the gamecard
        const createNumEuroBoxes = (numEuroCards, k) => {
            let euNumSpan = document.createElement('span');
            euNumSpan.setAttribute('class','euronumbers');
            euNumSpan.innerHTML = euronumbers[k];
            numEuroCards.append(euNumSpan);
        }

        // Eventlistener for button klick and enter key
        generate.addEventListener('click', generateLoops);
        quInput.addEventListener('keydown', (el) => {
            if (el.key === 'Enter') {
                el.preventDefault();
                generateLoops();
            }
        });
    },[]);

    return (
        <>
            <section className="text-image img-right">
                <div className="inner">
                    <div className="image-container">

                    </div>
                    <div className="textbox">
                        <form>
                            <label htmlFor="system">Spiel System</label>
                            <select name="system" id="system">
                                <option value="lotto">Lotto 6 aus 49</option>
                                <option value="euro">EuroJackpott</option>
                            </select>
                            <label htmlFor="quantity">Anzahl der Felder</label>
                            <input type="text" id="quantity"/>
                            <button type="button" id="generate">Generieren</button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="sec-dark">
                <div className="inner">
                    <div className="generatet">
                        <div className="content">
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}