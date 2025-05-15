'use client';
import  { useEffect } from "react";
import '@/../public/democss/modalbox.css';

export default function Modalbox() {

    useEffect(() => {
        const button = document.querySelector('.modal--open');
        const modal = document.querySelector('.overlay');
        const closeBtns = document.querySelectorAll('.modal--close');
        const bodycontainer = document.querySelector('.modal-main');

        const toggleModal = (event) => {
            modal.classList.toggle('hidden');
        };

        // Events definieren
        const handleOpen = (event) => {
            console.log('Button clicked!');
            toggleModal(event);
        };

        const handleClose = (event) => {
            event.preventDefault();
            toggleModal(event);
        };

        const handleOverlayClick = (event) => {
            if (event.target === modal) {
                toggleModal(event);
            }
        };

        // Listener setzen
        button?.addEventListener('click', handleOpen);
        closeBtns.forEach(btn => btn.addEventListener('click', handleClose));
        bodycontainer?.addEventListener('click', handleOverlayClick);

        // Cleanup-Funktion beim Unmount
        return () => {
            button?.removeEventListener('click', handleOpen);
            closeBtns.forEach(btn => btn.removeEventListener('click', handleClose));
            bodycontainer?.removeEventListener('click', handleOverlayClick);
        };

    }, []);

    return (
        <>
            <div className="modal-main">
                <section>
                    <div className="inner--content">
                        <div className="box">
                            <header>
                                <h2>Lorem Ipsum dolor</h2>
                            </header>
                            <div className="box--content">
                                <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                                    tempor
                                    invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. </p>
                            </div>
                            <button className="btn modal--open is--primary">Modal Open</button>
                        </div>
                    </div>
                </section>
                <div className="hidden overlay">
                    <div className="modal-box">
                        <header>
                            <h3>lorem ipsum dolor sit amet</h3>
                            <div className="close modal--close">&#xD7;</div>
                        </header>
                        <div className="content">
                            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
                                invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
                                accusam
                                et justo duo dolores et ea rebum.</p>
                        </div>
                        <div className="actions">
                            <button className="btn is--primary modal--close">Schließen</button>
                            <button className="btn is--secondary">Mehr Lesen</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}