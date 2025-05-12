'use client';

import {useState, useEffect} from "react";
import styles from "./styles.module.css";
import ProStep1 from "@/components/showcases/WebProject/ProStep1";
import ProStep2 from "@/components/showcases/WebProject/ProStep2";
import ProStep3 from "@/components/showcases/WebProject/ProStep3";
import ProStep4 from "@/components/showcases/WebProject/ProStep4";
import ProStep5 from "@/components/showcases/WebProject/ProStep5";
import ProStep6 from "@/components/showcases/WebProject/ProStep6";
import ProStep7 from "@/components/showcases/WebProject/ProStep7";
import ProStep8 from "@/components/showcases/WebProject/ProStep8";
import ProStep9 from "@/components/showcases/WebProject/ProStep9";
import ProStep10 from "@/components/showcases/WebProject/ProStep10";
import ProStep11 from "@/components/showcases/WebProject/ProStep11";
import ProStep12 from "@/components/showcases/WebProject/ProStep12";
import ProStep13 from "@/components/showcases/WebProject/ProStep13";
import ProEntrys from "@/components/showcases/WebProject/ProEntrys";

export default function WebPage() {
    const [currentStep, setCurrentStep] = useState(1);

    const [success, setSuccess ] = useState(true);
    const [error, setError] = useState(true);

    const [formData, setFormData] = useState({
        project: '',
        webpage: '',
        business: '',
        properties: [],
        goals: [],
        pages: '',
        contents: [],
        features: [],
        optionalFeatures: '',
        layout: '',
        contentEdit: '',
        deadline: '',
        budget: '',
        contact: {
            gender: '',
            title: '',
            name: '',
            lastname: '',
            company: '',
            position: '',
            email: '',
            phone: '',
        }
    });

    const formatDataForEmail = (data) => {
        return {
            "art_des_projekts": data.project,
            "webseite": data.webpage || "Keine Angabe",
            "thema": data.business,
            "eigenschaften": data.properties.join(", "),
            "zielsetzung": data.goals.join(", "),
            "anzahl_der_seiten": data.pages,
            "inhalte": data.contents.join(", "),
            "erweiterungen": data.features.join(", "),
            "optionale_erweiterungen": data.optionalFeatures || "Keine",
            "design": data.layout,
            "bearbeitung": data.contentEdit,
            "fertigstellung": data.deadline,
            "budget": data.budget,
            "anrede": data.contact.gender,
            "titel": data.contact.title || "Keine",
            "ansprechpartner": `${data.contact.name} ${data.contact.lastname}`,
            "firma": data.contact.company || "Keine",
            "position": data.contact.position || "Keine",
            "email": data.contact.email,
            "telefon": data.contact.phone
        };
    };


    const handleSendMail = async (e, data) => {
        e.preventDefault();

        /*
         const mailData = formatDataForEmail(data);

        console.log('SHOW MAIL FORMDATA', mailData);

        setSuccess(false);
        setError(false);

        const res = await fetch(`/api/sendinquiry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mailData)
        });

        const sendData = await res.json();

        if(sendData.message) {
            toast.success("Ihre Anfrage wurde erfolgreich abgeschickt!");
            setSuccess(true);
        } else {
            setError(true);
            toast.error("Es ist ein Fehler beim Versenden aufgetreten, bitte versuchen Sie es Später nochmal!")
        }
        */

    }

    const handleNext = (data) => {
        setFormData({ ...formData, ...data });
        setCurrentStep((prev) => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const steps = [
        <ProStep1 key={1} data={formData} onNext={handleNext} />,
        <ProStep2 key={2} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep3 key={3} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep4 key={4} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep5 key={5} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep6 key={6} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep7 key={7} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep8 key={8} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep9 key={9} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep10 key={10} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep11 key={11} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep12 key={12} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProStep13 key={13} data={formData} onNext={handleNext} onPrevious={handlePrevious} />,
        <ProEntrys key={14} data={formData} onNext={handleSendMail} onPrevious={handlePrevious} />,
    ]

    return (
        <>
        {/*<ProjectSteps currentStep={currentStep} data={[formData]} />
            <div>Current Step is: {currentStep}</div>*/}

            {steps[currentStep - 1]}
            {/*<div>Schritt: {currentStep}</div>*/}
        </>
    );
}