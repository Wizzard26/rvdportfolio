import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import {
    issueFormToken, checkFormToken, isHoneypotFilled, tooManyLinks, rateLimited, copyLimited, stripLinks, escapeHtml, isEmail,
} from '@/lib/spamGuard';

// Kontaktformular-Versand. Schutz gegen Spam und Missbrauch (siehe lib/spamGuard):
// Honeypot, signiertes Form-Token, Validierung, Link-Limit, Rate-Limit. Alle
// Eingaben werden HTML-escaped; der Absender ist immer das eigene Postfach.
// Die optionale Kopie an den Absender ist reiner Text, enthält die Nachricht ohne
// Links und geht je Empfängeradresse höchstens COPY_MAX-mal pro Tag raus — sonst
// ließe sich das Formular als Relay für Spam an beliebige Adressen missbrauchen.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OWNER = 'info@rene-van-dinter.de';
const LIMITS = { gender: 20, title: 40, firstName: 80, lastName: 80, company: 120, phone: 40, mail: 160, webUrl: 200, message: 5000 };

// Spam bekommt dieselbe Antwort wie ein echter Versand (Bots lernen nichts).
const fakeOk = () => NextResponse.json({ message: "Email was send Successfully" }, { status: 200 });

const oneLine = (s) => (s || '').replace(/[\r\n]+/g, ' ').trim();

function clientIp(headers) {
    const xff = headers.get('x-forwarded-for');
    return xff ? xff.split(',')[0].trim() : (headers.get('x-real-ip') || '');
}

// Formular holt beim Anzeigen ein frisches Token (statische Seite → nicht beim Build).
export async function GET() {
    return NextResponse.json({ token: issueFormToken() }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request){
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') return NextResponse.json({ message: "Invalid request" }, { status: 400 });

        const f = {};
        for (const [k, max] of Object.entries(LIMITS)) f[k] = (typeof body[k] === 'string' ? body[k] : '').trim().slice(0, max);
        const sendCopy = body.sendCopy === true;

        // 1) Bot-Signale → still verwerfen
        const reason = isHoneypotFilled(body.rvd_hp) ? 'honeypot'
            : checkFormToken(body.formToken)
            || (tooManyLinks(`${f.message} ${f.company} ${f.firstName} ${f.lastName}`) ? 'links' : null);
        if (reason) {
            console.warn('[sendmail] Spam verworfen:', reason);
            return fakeOk();
        }

        // 2) Pflichtfelder / Format
        if (!f.firstName || !f.lastName || !f.phone || !f.message || !isEmail(f.mail)) {
            return NextResponse.json({ message: "Invalid input" }, { status: 400 });
        }

        // 3) Rate-Limit je IP
        if (rateLimited(clientIp(request.headers))) {
            return NextResponse.json({ message: "Too many requests" }, { status: 429 });
        }

        const user = process.env.NEXT_CONTACT_MAIL_ADDRESS;
        const mailPort = Number(process.env.NEXT_CONTACT_MAIL_PORT) || 465;

        const transporter = nodemailer.createTransport({
            service: process.env.NEXT_CONTACT_MAIL_SERVICE || 'gambit24mailer',
            host: process.env.NEXT_CONTACT_MAIL_HOST || 'server.gambit24.de',
            port: mailPort,
            secure: mailPort === 465,
            auth: {
                user,
                pass: process.env.NEXT_CONTACT_MAIL_PASS
            }
        })

        const e = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, escapeHtml(v)]));
        e.message = e.message.replace(/\n/g, '<br>');

        const mailOptions = {
            // Absender = eigenes Postfach (SPF/DMARC), Antworten gehen per Reply-To an die Anfrage.
            from: user,
            replyTo: f.mail,
            to: OWNER,
            subject: `Portfolio Kontaktanfrage von ${oneLine(f.firstName)} ${oneLine(f.lastName)}`,
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
        <h3>Sie haben eine Kontaktanfrage von ${e.firstName} ${e.lastName} erhalten.</h3>
        <table>
            <tr class="header">
                <td colspan="2">Ihr Ansprechpartner:</td>
            </tr>
            <tr>
                <td>Anrede:</td>
                <td>${e.gender}</td>
            </tr>
            <tr class="second">
                <td>Titel:</td>
                <td>${e.title}</td>
            </tr>
            <tr>
                <td>Vorname:</td>
                <td>${e.firstName}</td>
            </tr>
            <tr class="second">
                <td>Nachname:</td>
                <td>${e.lastName}</td>
            </tr>
            <tr class="header">
                <td colspan="2">Kontakt Informationen:</td>
            </tr>
            <tr>
                <td>Firma:</td>
                <td>${e.company}</td>
            </tr>
            <tr class="second">
                <td>Telefon:</td>
                <td>${e.phone}</td>
            </tr>
            <tr>
                <td>E-Mail:</td>
                <td>${e.mail}</td>
            </tr>
            <tr class="second">
                <td>Webseite:</td>
                <td>${e.webUrl}</td>
            </tr>
            <tr class="header">
                <td colspan="2">Sendet Ihnen folgende Nachricht:</td>
            </tr>
            <tr class="message">
                <td colspan="2">${e.message}</td>
            </tr>
            <tr class="footer">
                <td colspan="2">René van Dinter | https://www.rene-van-dinter.de</td>
            </tr>
        </table>
        `
        }

        await transporter.sendMail(mailOptions);

        if (sendCopy && !copyLimited(f.mail)) {
            const name = [f.gender, f.title, f.firstName, f.lastName].map(oneLine).filter(Boolean).join(' ');
            const lines = [
                ['Name', name],
                ['Firma', oneLine(f.company)],
                ['Telefon', oneLine(f.phone)],
                ['E-Mail', oneLine(f.mail)],
            ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
            await transporter.sendMail({
                from: user,
                to: f.mail,
                subject: 'Kopie Ihrer Nachricht an René van Dinter',
                text: 'Guten Tag,\n\nvielen Dank für Ihre Nachricht über das Kontaktformular auf rene-van-dinter.de. '
                    + 'Sie ist bei mir eingegangen, ich melde mich zeitnah zurück.\n\n'
                    + 'Hier eine Kopie Ihrer Angaben (Links sind aus Sicherheitsgründen entfernt):\n\n'
                    + `${lines}\n\nNachricht:\n${stripLinks(f.message)}\n\n`
                    + 'Falls Sie diese Nachricht nicht angefordert haben, können Sie sie einfach ignorieren.\n\n'
                    + 'Viele Grüße\nRené van Dinter\nhttps://rene-van-dinter.de',
            }).catch(() => {});
        }

        return NextResponse.json({message: "Email was send Successfully"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Failed to send Email"}, {status: 500})
    }
}
