'use client';

import {useState} from "react";
import styles from "./styles.module.css";
import {roboto} from "@/app/fonts";

export default function ContactForm() {

    const [gender, setGender] = useState('mr');
    const [title, setTitle] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [mail, setMail] = useState('');
    const [webUrl, setWebUrl] = useState('');
    const [message, setMessage] = useState('');
    const [sendCopy, setSendCopy] = useState(false);
    const [isSend, setIsSend] =  useState(false);
    const [isError, setIsError] = useState(false);

    const sendMail = async (e) => {
        e.preventDefault();

        const spamcheck = document.querySelector('#confirm-mail').value;
        const isSpam = spamcheck !== '';

        if(!isSpam) {
            const response = await fetch('/api/sendmail', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    gender,
                    title,
                    firstName,
                    lastName,
                    company,
                    phone,
                    mail,
                    webUrl,
                    message,
                    sendCopy
                })
            })

            console.log('RESPONSE:', await response.json());
            if(!response.ok) {
                setIsError(true)
            }

            if (response.ok) {
                setGender('mr');
                setTitle('');
                setFirstName('');
                setLastName('');
                setCompany('');
                setPhone('');
                setMail('');
                setWebUrl('');
                setMessage('');
                setSendCopy(false);
                setIsSend(true);
            }
        } else {
            setGender('Herr');
            setTitle('');
            setFirstName('');
            setLastName('');
            setCompany('');
            setPhone('');
            setMail('');
            setWebUrl('');
            setMessage('');
            setSendCopy(false);
            setIsSend(true);
        }

    }


    return (
        <>

            {isSend &&
                <>
                    <h2 className={roboto.className}>Nachricht wurde versendet!</h2>
                    <div>
                        Danke, Ihre anfrage wurde erfolgreich versendet.
                        Sobald ich alles gesichtet habe, erhalten Sie eine Rückmelung von mir.
                    </div>
                </>
            }

            {isError &&
                <>
                    <h2 className={roboto.className}>Nachricht wurde nicht versendet!</h2>
                    <div>
                        Beim versenden ist leider ein Fehler aufgetreten, bitte prüfen Sie nochmal Ihre Eingaben, oder probieren Sie es zu einem späteren Zeitpunkt nochmal!
                    </div>
                </>
            }
            {!isSend &&
                <>
                    <h2 className={roboto.className}>Schreiben Sie mir eine Nachricht</h2>
                    <form onSubmit={sendMail} aria-labelledby={'contact-form'} className={styles.form}>
                        <div className={`${styles.leftContainer} col-12 col-md-6`}>
                            <h3>Ansprechpartner:</h3>
                            <label htmlFor={'gender'}>Anrede:</label>
                            <select
                                id={'gender'}
                                name={'gender'}
                                className={styles.genderSelect}
                                defaultValue={gender}
                                onChange={(e) => {
                                    setGender(e.target.value)
                                }}
                            >
                                <option value={'Herr'}>Herr</option>
                                <option value={'Frau'}>Frau</option>
                                <option value={'Diverse'}>Diverse</option>
                            </select>
                            <label htmlFor={'title'}>Titel:</label>
                            <input
                                type={"text"}
                                id={'title'}
                                name={'title'}
                                defaultValue={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                }}
                            />
                            <label htmlFor={'firstName'}>Vorname: *</label>
                            <input
                                type={"text"}
                                id={'firstName'}
                                name={'firstName'}
                                defaultValue={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value)
                                }}
                                required={true}
                            />
                            <label htmlFor={'lastName'}>Nachname: *</label>
                            <input
                                type={"text"}
                                id={'lastName'}
                                name={'lastName'}
                                defaultValue={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value)
                                }}
                                required={true}
                            />
                        </div>

                        <div className={`${styles.rightContainer} col-12 col-md-6`}>
                            <h3>Kontaktdaten:</h3>
                            <label htmlFor={'company'}>Firma:</label>
                            <input
                                type={"text"}
                                id={'company'}
                                name={'company'}
                                defaultValue={company}
                                onChange={(e) => {
                                    setCompany(e.target.value)
                                }}
                            />
                            <label htmlFor={'phone'}>Telefon: *</label>
                            <input
                                type={"tel"}
                                id={'phone'}
                                name={'phone'}
                                defaultValue={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value)
                                }}
                                required={true}
                            />
                            <label htmlFor={'mail'}>E-Mail: *</label>
                            <input
                                type={"email"}
                                id={'mail'}
                                name={'mail'}
                                defaultValue={mail}
                                onChange={(e) => {
                                    setMail(e.target.value)
                                }}
                                required={true}
                            />
                            <input
                                type={"hidden"}
                                id={"confirm-mail"}
                                name={'confirm-mail'}
                                value={''}
                            />
                            <label htmlFor={'webpage'}>Webseite:</label>
                            <input
                                type={"url"}
                                id={'webpage'}
                                name={'webpage'}
                                defaultValue={webUrl}
                                onChange={(e) => {
                                    setWebUrl(e.target.value)
                                }}
                            />
                        </div>
                        <div className={`${styles.textAreaContainer} col-12`}>
                            <label htmlFor={'contactText'}>Schreiben Sie hier Ihre Nachricht: *</label>
                            <textarea
                                name={'contactText'}
                                id={'contactText'}
                                defaultValue={message}
                                onChange={(e) => {
                                    setMessage(e.target.value)
                                }}
                                required={true}
                            ></textarea>
                        </div>
                        <div className={`${styles.requiredFields} col-12`}>
                            Mit einem * gekennzeichnete Felder sind Pflichtfelder
                        </div>
                        <div className={`${styles.sendCopy} col-12`}>
                            <label htmlFor={'copysend'}>Möchten Sie eine Kopie der Mail erhalten?</label>
                            <input
                                type={"checkbox"}
                                id={'copysend'}
                                defaultValue={sendCopy}
                                onChange={(e) => {
                                    setSendCopy(e.target.value)
                                }}
                            />
                        </div>
                        <div className={`${styles.formActions} col-12`}>
                            <button className={styles.sendContact} name={'sendContact'} type={"submit"}>Absenden</button>
                        </div>
                    </form>
                </>

            }
        </>

    )

}