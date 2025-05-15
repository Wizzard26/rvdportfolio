'use client';
import { useEffect } from 'react';
import '@/../public/democss/slider.css';



export default function Slider() {


    useEffect(() => {
        const config = {
            autoplay: true,
            stopByHover: true,
            timing: 6000,
            arrows: true,
            icons: false,
            fullscreen: false
        }

        let slideWrapper = document.querySelector('.js_slider');
        let slideContainer = document.querySelector('.slider');
        let slides = Array.from(document.querySelectorAll('.slides'));
        let slideElements = Number(slides.length);

        if (config.fullscreen) {
            slideWrapper.classList.add('fullscreen');
        }


        let slideNav,
            pointer,
            slideIndex,
            slWidth,
            dist,
            navPrev,
            navNext;


        const createPointNav = () => {
            let pointNavCon = document.createElement('nav');
            pointNavCon.setAttribute('class', 'pointer-nav');
            slideWrapper.append(pointNavCon);

            let pointNavUl = document.createElement('ul');
            pointNavCon.append(pointNavUl);

            for (let pointItemNav of slides) {
                let pointNavLi = document.createElement('li');
                pointNavUl.append(pointNavLi);
            }
        }

        if (config.icons) {
            createPointNav();
            slideNav = document.querySelector('.pointer-nav');
            pointer = Array.from(document.querySelectorAll('.pointer-nav ul li'));
        }

        slideIndex = 0;
        slWidth = slideWrapper.clientWidth;
        dist = 0;

        navPrev = document.querySelector('.arrow-prev');
        navNext = document.querySelector('.arrow-next');
        if (!config.arrows) {
            navPrev.style.display = 'none';
            navNext.style.display = 'none';
        }


        const setSlideWidth = () => {
            let pageWidth = Number(slideWrapper.clientWidth);
            let slideWidth = pageWidth * slideElements;
            slideContainer.style.width = `${slideWidth}px`;
        }


        const setSlideHeight = () => {
            let slideImage = document.querySelector('.slides');
            let slideHeight = Number(slideImage.clientHeight);
            slideWrapper.style.height = `${slideHeight}px`;
        }


        const setActive = (index) => {
            let activeFlag = slideContainer.querySelector('.active');
            if (activeFlag) activeFlag.classList.remove('active');
            slides[index].classList.add('active');

            if (config.icons) {
                let activePoint = slideNav.querySelector('.active');
                if (activePoint) activePoint.classList.remove('active');
                pointer[index].classList.add('active');
            }
        }


        const changeActive = (current, direction, newIndex) => {
            if (config.icons) {
                let currentPoint = slideNav.querySelector('.active');
                if (currentPoint) currentPoint.classList.remove('active');
                pointer[newIndex].classList.add('active');
            }
            current.classList.remove('active');
            slides[newIndex].classList.add('active');
        }


        const slideDistance = (slIndex) => {
            dist = slWidth * slIndex;
            slideContainer.style.transform = 'translateX(-' + dist +'px)';
        }


        const nextImage = () => {
            let currentSlide = slideContainer.querySelector('.active');
            let next = currentSlide.nextElementSibling;
            !next || slideIndex === slides.length - 1 ? slideIndex = 0 : slideIndex++;
            changeActive(currentSlide, next, slideIndex);
            slideDistance(slideIndex);
        }


        const prevImage = () => {
            let currentSlide = slideContainer.querySelector('.active');
            let prev = currentSlide.previousElementSibling;
            //if (prev) {slideIndex--;}
            !prev || slideIndex < 1 ? slideIndex = slides.length - 1 : slideIndex--;
            changeActive(currentSlide, prev, slideIndex)
            slideDistance(slideIndex);
        }

        const pointNav = () => {
            let slideIcons = pointer;
            let currentSlide = slideContainer.querySelector('.active');
            for (let i = 0; i < pointer.length; i++) {
                slideIcons[i].addEventListener('click', function(){
                    slideIndex = i;
                    changeActive(currentSlide, undefined, slideIndex);
                    slideDistance(i);
                });
            }
        }

        const init = () => {

            setTimeout(() => {
                setSlideWidth();
                setSlideHeight();
                setActive(0);
            }, 500);


            if (config.icons) {
                pointNav();
            }

            navNext.addEventListener('click', nextImage);
            navPrev.addEventListener('click', prevImage);

            if (config.autoplay) {
                let slideStart = setInterval (nextImage, config.timing);

                if (config.stopByHover) {
                    slideWrapper.addEventListener("mouseover", function () {
                        clearInterval(slideStart);
                    });
                    slideWrapper.addEventListener("mouseleave", function () {
                        slideStart = setInterval(nextImage, config.timing);
                    });
                }
            }
        };

        init();
    }, [])

    return (
        <section className="sec-dark" >
            <div className="image-contaier">
                <div className="js_slider">
                    <div className="slider">
                        <div className="slides">
                            <img src="/demoimg/slider/img/slide-1.jpg" alt="" />
                                <div className="layer-text">
                                    <p>Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel?</p>
                                    <button type="button">Weiterlesen...</button>
                                </div>
                        </div>
                        <div className="slides">
                            <img src="/demoimg/slider/img/slide-2.jpg" alt="" />
                                <div className="layer-text">
                                    <p>Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern?</p>
                                    <button type="button">Weiterlesen...</button>
                                </div>
                        </div>
                        <div className="slides">
                            <img src="/demoimg/slider/img/slide-3.jpg" alt="" />
                                <div className="layer-text">
                                    <p>Oder gehörten die Schritte hinter ihm zu einem der unzähligen Gesetzeshüter dieser Stadt, und die stählerne Acht um seine Handgelenke würde gleich zuschnappen? Er konnte die Aufforderung stehen zu bleiben schon hören.</p>
                                    <button type="button">Weiterlesen...</button>
                                </div>
                        </div>
                        <div className="slides">
                            <img src="/demoimg/slider/img/slide-4.jpg" alt="" />
                                <div className="layer-text">
                                    <p>Gehetzt sah er sich um. Plötzlich erblickte er den schmalen Durchgang. Blitzartig drehte er sich nach rechts und verschwand zwischen den beiden Gebäuden. Beinahe wäre er dabei über den umgestürzten Mülleimer gefallen, der mitten im Weg lag.</p>
                                    <button type="button">Weiterlesen...</button>
                                </div>
                        </div>
                        <div className="slides">
                            <img src="/demoimg/slider/img/slide-5.jpg" alt="" />
                                <div className="layer-text">
                                    <p>Oder gehörten die Schritte hinter ihm zu einem der unzähligen Gesetzeshüter dieser Stadt, und die stählerne Acht um seine Handgelenke würde gleich zuschnappen? Er konnte die Aufforderung stehen zu bleiben schon</p>
                                    <button type="button">Weiterlesen...</button>
                                </div>
                        </div>
                    </div>
                    <div className="arrows arrow-prev"><i className="fas fa-chevron-left"></i><span>prev</span></div>
                    <div className="arrows arrow-next"><i className="fas fa-chevron-right"></i><span>next</span></div>
                </div>
            </div>
        </section>
    )
}