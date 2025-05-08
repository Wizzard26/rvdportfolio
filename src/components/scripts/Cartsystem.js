'use client';
import { useEffect} from "react";
import '@/../public/democss/cartsystem.css';

export default function Cartsystem() {

    useEffect(() => {
        const product =  [
            {
                product: "Waschmaschine",
                productNr: 12345,
                producer: "AEG",
                description: "Lorem ipsum dolor sit amet",
                images: [
                    "./src/cart/images/bild-1.jpg",
                    "./src/cart/images/bild-2.jpg",
                    "./src/cart/images/bild-3.jpg"
                ],
                quantity: 23,
                price: 389.98,
                pseudo: 546.95,
                active: true
            },
            {
                product: "Kühlschrank",
                productNr: 23451,
                producer: "Bosch",
                description: "Lorem ipsum dolor sit amet",
                images: [
                    "./src/cart/images/bild-1.jpg",
                    "./src/cart/images/bild-2.jpg",
                    "./src/cart/images/bild-3.jpg"
                ],
                quantity: 3,
                price: 1250.00,
                pseudo: 0,
                active: true
            },
            {
                product: "Fernseher",
                productNr: 34512,
                producer: "Telefunken",
                description: "Lorem ipsum dolor sit amet",
                images: [
                    "./src/cart/images/bild-1.jpg",
                    "./src/cart/images/bild-2.jpg",
                    "./src/cart/images/bild-3.jpg"
                ],
                quantity: 7,
                price: 299.80,
                pseudo: 449.95,
                active: true
            },
            {
                product: "Laptop",
                productNr: 45123,
                producer: "Toschiba",
                description: "Lorem ipsum dolor sit amet",
                images: [
                    "./src/cart/images/bild-1.jpg",
                    "./src/cart/images/bild-2.jpg",
                    "./src/cart/images/bild-3.jpg"
                ],
                quantity: 3,
                price: 499.99,
                pseudo: 0,
                active: true
            }
        ]

        // Vars Initialisierung
        let pId,
            productName,
            productNr,
            producer,
            description,
            image,
            quantity,
            price,
            pseudo,
            isActive;

        let cartContainer;
        let cartItems = [];

        // Listing and Global Selectors
        let mainContainer = document.querySelector('.content');
        let listingContainer = document.querySelector('.listing');
        let topBasket = document.querySelector('.header > .inner');

        const createCartIcon = () => {
            let basket = document.createElement('div');
            let basketQuant = document.createElement('span');

            basket.classList.add('basket');
            basket.innerHTML = '<i class="fas fa-shopping-cart"></i>Warenkorb';

            basketQuant.classList.add('basket-quantity');
            basketQuant.innerHTML = `${cartItems.length}`;

            topBasket.append(basket);
            basket.append(basketQuant);
        }


        const createCart = () => {
            let cart = document.createElement('div');
            let cartHeader = document.createElement('div');
            let cartClose = document.createElement('span');
            let cartProducts = document.createElement('div');
            let cartSumInfo = document.createElement('div');
            let cartSumPrice = document.createElement('div');

            cart.classList.add('cart');

            cartHeader.classList.add('cart-header');
            cartHeader.innerHTML = 'Warenkorb';

            cartClose.classList.add('close-btn');
            cartClose.innerHTML = 'X';

            cartProducts.classList.add('products-list');

            cartSumInfo.classList.add('cart-price-info');
            cartSumInfo.innerHTML = 'Gesamtpreis';

            cartSumPrice.classList.add('cart-price-gesamt');
            //cartSumPrice.innerHTML = cartSum();

            mainContainer.append(cart);
            cart.append(cartHeader);
            cart.append(cartClose);
            cart.append(cartProducts);
            cart.append(cartSumInfo);
            cart.append(cartSumPrice);
        }

        const createCartItems = (pId, productNr, productName, image, price, quantityEntry) => {
            cartContainer = document.querySelector('.cart > .products-list');

            let cartItems = document.createElement('div'),
                cartImage = document.createElement('img'),
                cartTitle = document.createElement('div'),
                cartProNumber = document.createElement('span'),
                cartQuanDiv = document.createElement('div'),
                cartQuantityLabel = document.createElement('label'),
                cartQuantity = document.createElement('input'),
                cartPrice = document.createElement('div'),
                cartPriceSum = document.createElement('div'),
                cartDeleteItem = document.createElement('span');

            cartItems.classList.add('cart-item');

            cartImage.classList.add('cart-image');
            cartImage.src = `${image}`;

            cartTitle.classList.add('cart-title');
            cartTitle.innerHTML =  `${productName}`;

            cartProNumber.classList.add('cart-product-nr');
            cartProNumber.innerHTML = `ArtNr.: ${productNr}`;

            cartQuanDiv.classList.add('cart-quantity');

            cartQuantityLabel.innerHTML= 'Menge';

            cartQuantity.classList.add('cart-quantity-entry');
            cartQuantity.value = `${quantityEntry}`;

            cartPrice.classList.add('cart-item-price');
            cartPrice.innerHTML = `Einzelpreis: ${Number(price).toFixed(2).replace(".",",")} €`;

            cartPriceSum.classList.add('cart-item-summe');
            cartPriceSum.innerHTML = `Summe: ${Number(price * quantityEntry).toFixed(2).replace(".",",")} €`;

            cartDeleteItem.classList.add('cart-item-delete');
            cartDeleteItem.innerHTML = 'X';

            cartContainer.append(cartItems);
            cartItems.append(cartImage);
            cartItems.append(cartTitle);
            cartTitle.append(cartProNumber);
            cartItems.append(cartQuanDiv);
            cartQuanDiv.append(cartQuantityLabel);
            cartQuanDiv.append(cartQuantity);
            cartItems.append(cartPrice);
            cartItems.append(cartPriceSum);
            cartItems.append(cartDeleteItem);

            cartQuantity.addEventListener('change', function() {
                quantityEntry = cartQuantity.value;
                updateArticleQuantity(productNr, quantityEntry);

                cartPriceSum.innerHTML = `Summe: ${price * quantityEntry} €`;
            })

            cartDeleteItem.addEventListener('click', function() {
                deleteArticle(productNr);
            })
        }

        const init = () => {
            createCartIcon();
            createCart();
            createCatalog();
            showCartItems();
            basketIconOpen();
        }

        const createProductBox = (pId, productName, productNr, producer, description, image, quantity, price, pseudo, isActive) => {
            let box = document.createElement('article'),
                boxInner = document.createElement('div'),
                boxTitle = document.createElement('div'),
                boxImage = document.createElement('img'),
                boxDescription = document.createElement('div'),
                boxPrice = document.createElement('div'),
                boxPricePseudo = document.createElement('span'),
                boxBuyBox = document.createElement('div'),
                boxQuantity = document.createElement('input'),
                boxButton = document.createElement('button');

            box.classList.add('product-box');

            boxInner.classList.add('product-info');

            boxTitle.classList.add('product-title');
            boxTitle.innerHTML = `${productName}`;

            boxImage.classList.add('product-images');
            boxImage.src = `${image}`;

            boxDescription.classList.add('product-description');
            boxDescription.innerHTML = `${description}`;

            boxPrice.classList.add('product-priceinfo');
            boxPrice.innerHTML = `<span class="price">${Number(price).toFixed(2).replace(".",",")} €</span>`;

            boxPricePseudo.classList.add('pseudo-price');
            if (pseudo > 0) {
                boxPricePseudo.innerHTML = `${Number(pseudo).toFixed(2).replace(".",",")} €`;
            }

            boxBuyBox.classList.add('product-buybox');

            boxQuantity.classList.add('product-quantity');
            boxQuantity.setAttribute('type', 'text');
            boxQuantity.setAttribute('max', `${quantity}`);
            boxQuantity.setAttribute('value', '1');

            boxButton.classList.add('product-Buybutton');
            boxButton.setAttribute('type', 'button');
            boxButton.setAttribute('data-id', `${pId}`);
            boxButton.innerHTML = 'In den Warenkorb';
            boxButton.addEventListener('click',  () => {
                addToCart(pId, productNr, productName, image, price, Number(boxQuantity.value));
                boxQuantity.value = 1;
            })

            listingContainer.append(box);
            box.append(boxInner);
            boxInner.append(boxImage);
            boxInner.append(boxTitle);
            boxInner.append(boxDescription);
            boxInner.append(boxPrice);
            boxPrice.append(boxPricePseudo);
            boxInner.append(boxBuyBox);
            boxBuyBox.append(boxQuantity);
            boxBuyBox.append(boxButton);
        }


        const createCatalog =  () => {

            for (let i = 0;i < product.length;i++) {
                pId = i;
                productName = product[i].product;
                productNr = product[i].productNr;
                producer = product[i].producer;
                description = product[i].description;
                image = product[i].images[0];
                quantity = product[i].quantity;
                price = product[i].price;
                pseudo = product[i].pseudo;
                isActive = product[i].active;

                createProductBox(pId, productName, productNr, producer, description, image, quantity, price, pseudo, isActive);

            }
        }

        const addToCart = (pId, productNr, productName, image, price, quantityValue) => {
            let iteminside = false;

            for (let i = 0;i < cartItems.length; i++ ) {
                if(cartItems[i].includes(productNr)) {
                    iteminside = true;
                    cartItems[i].splice(5, 1, quantityValue);
                }
            }

            if(!iteminside) {
                cartItems.push(
                    [
                        pId,
                        productNr,
                        productName,
                        image,
                        price,
                        quantityValue
                    ]
                );
            }

            setLocalStorage();

            showCartItems();
            openCart();
            updateBasketQuantity();
            cartSum();
        }

        // Cart Slide in
        const openCart = () => {
            let cartOpener = document.querySelector('.cart');
            cartOpener.classList.add('cart-open');
            closeCart(cartOpener);
        }

        // Cart closed slide out
        const closeCart = (el) => {
            let cartCloseBtn = document.querySelector('.close-btn');
            cartCloseBtn.addEventListener('click', () => {
                el.classList.remove('cart-open');
            })
        }

        const updateBasketQuantity = () => {
            let basketItemsCount = document.querySelector('.basket-quantity');
            basketItemsCount.innerHTML = `${cartItems.length}`;
            cartItems.length > 0 ? basketItemsCount.classList.add('has-items') : basketItemsCount.classList.remove('has-items');
        }

        const updateArticleQuantity = (productNr, quantityValue) => {
            for (let i = 0;i < cartItems.length; i++ ) {
                if(cartItems[i].includes(productNr)) {
                    cartItems[i].splice(5, 1, quantityValue);
                }
            }
            cartSum();
        }

        const deleteArticle = (productNr) => {

            for (let i = 0;i < cartItems.length; i++ ) {
                if(cartItems[i].includes(productNr)) {
                    cartItems.splice(i, 1);
                }
            }

            setLocalStorage();

            showCartItems();
            updateBasketQuantity();
            cartSum();
        }

        const basketIconOpen = () => {
            let basketIcon = document.querySelector('.basket');
            basketIcon.addEventListener('click', openCart);
        }


        const showCartItems = () => {
            if (cartContainer) {
                while(cartContainer.firstChild){
                    cartContainer.removeChild(cartContainer.firstChild);
                }
            }

            loadLocalStorage();

            for (let i = 0; i < cartItems.length; i++) {
                let pId = cartItems[i][0],
                    productNr = cartItems[i][1],
                    productName = cartItems[i][2],
                    image = cartItems[i][3],
                    price = cartItems[i][4],
                    quantityEntry = cartItems[i][5];

                createCartItems(pId, productNr, productName, image, price, quantityEntry);
            }

            updateBasketQuantity();
            cartSum();
        }

        const cartSum = () => {
            let priceContainer = document.querySelector('.cart-price-gesamt');
            let article = cartItems.length;
            let prices = 0;
            priceContainer.innerHTML = `${prices.toFixed(2).replace(".",",")} €`;

            for (let i = 0;i < article; i++ ) {
                prices += cartItems[i][4] * cartItems[i][5];
            }

            if (prices > 0) {
                priceContainer.innerHTML = `${prices.toFixed(2).replace(".",",")} €`;
            }

            return `${prices.toFixed(2).replace(".",",")} €`;
        }

        const setLocalStorage = () => {
            localStorage.setItem('myCart', JSON.stringify(cartItems));
        }

        const loadLocalStorage = () => {
            if (localStorage.getItem('myCart') !== null) {
                cartItems = JSON.parse(localStorage["myCart"]);
            }
        }


        init();
    },[]);

    return (
        <>
            <section className="sec-dark">
                <div className="header">
                    <div className="inner">

                    </div>
                </div>
                <div className="inner">
                    <main className="content">
                        <div className="inner">
                            <div className="listing">

                            </div>
                        </div>
                    </main>
                </div>
            </section>
        </>
    )
}