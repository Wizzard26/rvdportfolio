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
        <style>
            table {width: 100%; max-width: 620px;margin: 0 auto;border: 1px solid #f2f2f2;}
            tr.header {background-color: #628395;color:#ffffff;padding: 8px 10px 8px 10px;}
            h3 {color:#ffffff;}
            tr.second {background-color: #f2f3f3;}
            tr td {padding: 5px 10px 5px 10px;}
            tr.message {background-color: #e5e5e5;}
            tr.message td {padding: 10px;}
            tr.footer {background-color: #628395}
            tr.footer td {color: #ffffff; padding: 10px; text-align: center;}
        </style>
        <h3>Sie haben eine Kontaktanfrage von ${firstName} ${lastName} erhalten.</h3>
        <table>
            <tr class="header">
                <td colspan="2">Ihr Ansprechpartner:</td>
            </tr>
            <tr>
                <td>Anrede:</td>
                <td>${gender}</td>
            </tr>
            <tr class="second">
                <td>Titel:</td>
                <td>${title}</td>
            </tr>
            <tr>
                <td>Vorname:</td>
                <td>${firstName}</td>
            </tr>
            <tr class="second">
                <td>Nachname:</td>
                <td>${lastName}</td>
            </tr>
            <tr class="header">
                <td colspan="2">Kontakt Informationen:</td>
            </tr>
            <tr>
                <td>Firma:</td>
                <td>${company}</td>
            </tr>
            <tr class="second">
                <td>Telefon:</td>
                <td>${phone}</td>
            </tr>
            <tr>
                <td>E-Mail:</td>
                <td>${mail}</td>
            </tr>
            <tr class="second">
                <td>Webseite:</td>
                <td>${webUrl}</td>
            </tr>
            <tr class="header">
                <td colspan="2">Sendet Ihnen folgende Nachricht:</td>
            </tr>
            <tr class="message">
                <td colspan="2">${message}</td>
            </tr>
            <tr class="footer">
                <td colspan="2">René van Dinter | https://www.rene-van-dinter.de</td>
            </tr>
        </table>
        `
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: "Email was send Successfully"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Failed to send Email"}, {status: 500})
    }
}