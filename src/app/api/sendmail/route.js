import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";

export async function POST(request){
    try {
        const {gender, title, firstName, lastName, company, phone, mail, webUrl, message, sendCopy} = await request.json();

        const transporter = nodemailer.createTransport({
            service: 'gambit24mailer',
            host: 'server.gambit24.de',
            port: 465,
            secure: true,
            auth: {
                user: process.env.NEXT_PUBLIC_MAIL_ADDRESS,
                pass: process.env.NEXT_PUBLIC_MAIL_PASS
            }
        })

        const mailOptions = {
            from: mail,
            to: `info@rene-van-dinter.de, ${sendCopy ? mail : ''}`,
            subject: `Portfolio Kontaktanfrage von ${firstName} ${lastName}`,
            html: `
        <h3>Sie haben eine Kontaktanfrage von ${firstName} ${lastName} erhalten.</h3>
        <div>Ihr Ansprechpartner:</div>
        <div>${gender} ${title} ${firstName} ${lastName}</div>
        <div>Von der Firma: ${company}</div>
        <div>Kontakt Informationen:</div>
        <div>Telefon: ${phone}</div>
        <div>E-Mail: ${mail}</div>
        <div>Webseite: ${webUrl}</div>
        <div>Sendet Ihnen folgende Nachricht:</div>
        <div>${message}</div>
        `
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: "Email was send Successfully"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Failed to send Email"}, {status: 500})
    }
}