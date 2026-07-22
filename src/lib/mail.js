import nodemailer from 'nodemailer';

// Wiederverwendbarer Mail-Versand (gleiche Zugangsdaten wie das Kontaktformular).
// Best-effort: fehlt die Konfiguration oder scheitert der Versand, wird nur
// geloggt — der auslösende Vorgang (z. B. eine Arbeitgeber-Reaktion) läuft weiter.

const OWNER = 'info@rene-van-dinter.de';

function isEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
}

// `sender` = optionale Absender-/Antwortadresse (z. B. die Firmenmail), damit
// eine Antwort direkt an den Arbeitgeber geht – analog zum Kontaktformular.
export async function sendOwnerMail(subject, html, sender) {
    const user = process.env.NEXT_CONTACT_MAIL_ADDRESS;
    const pass = process.env.NEXT_CONTACT_MAIL_PASS;
    if (!user || !pass) {
        console.warn('[mail] keine Mail-Zugangsdaten gesetzt – Benachrichtigung übersprungen:', subject);
        return false;
    }
    const port = Number(process.env.NEXT_CONTACT_MAIL_PORT) || 465;
    const from = isEmail(sender) ? sender.trim() : user;
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.NEXT_CONTACT_MAIL_SERVICE || 'gambit24mailer',
            host: process.env.NEXT_CONTACT_MAIL_HOST || 'server.gambit24.de',
            port,
            secure: port === 465,
            auth: { user, pass },
        });
        const opts = { from, to: OWNER, subject, html };
        if (isEmail(sender)) opts.replyTo = sender.trim();
        await transporter.sendMail(opts);
        return true;
    } catch (e) {
        console.error('[mail] Versand fehlgeschlagen:', e.message);
        return false;
    }
}
