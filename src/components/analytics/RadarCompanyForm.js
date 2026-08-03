'use client';

import { useActionState } from 'react';
import Link from 'next/link';

const TYPES = [
    ['inhouse_shop', 'Inhouse-Shop (Bewerbung)'],
    ['agentur', 'Agentur (Akquise)'],
    ['hersteller', 'Hersteller'],
    ['dienstleister', 'Dienstleister'],
    ['unbekannt', 'unbekannt'],
];

export default function RadarCompanyForm({ action, company }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || company || {};

    return (
        <form action={formAction} className="an-form">
            {company?.id && <input type="hidden" name="id" value={company.id} />}
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <div className="an-field-row">
                <label className="an-field"><span>Firma / Name</span>
                    <input name="name" defaultValue={v.name || ''} placeholder="Muster GmbH" /></label>
                <label className="an-field"><span>Domain</span>
                    <input name="domain" defaultValue={v.domain || ''} placeholder="muster-shop.de" /></label>
            </div>

            <div className="an-field-row">
                <label className="an-field"><span>Typ</span>
                    <select name="typ" defaultValue={v.typ || 'unbekannt'}>
                        {TYPES.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select></label>
                <label className="an-field"><span>Inhouse-Team</span>
                    <select name="inhouse_team" defaultValue={v.inhouse_team || 'unklar'}>
                        <option value="unklar">unklar</option>
                        <option value="ja">ja</option>
                        <option value="nein">nein</option>
                    </select></label>
            </div>

            <label className="an-field"><span>Themengebiete <span className="an-muted">(Komma-getrennt)</span></span>
                <input name="themengebiete" defaultValue={v.themengebiete || ''} placeholder="Tiernahrung, Industrie, Automotive" /></label>

            <div className="an-field-row">
                <label className="an-field"><span>PLZ</span><input name="plz" defaultValue={v.plz || ''} /></label>
                <label className="an-field"><span>Ort</span><input name="ort" defaultValue={v.ort || ''} /></label>
                <label className="an-field"><span>Entfernung (km ab Stade)</span>
                    <input name="distanz_km" type="number" min="0" defaultValue={v.distanz_km || ''} /></label>
            </div>

            <div className="an-field-row">
                <label className="an-field"><span>Karriere-URL</span><input name="karriere_url" defaultValue={v.karriere_url || ''} /></label>
                <label className="an-field"><span>LinkedIn</span><input name="linkedin_url" defaultValue={v.linkedin_url || ''} /></label>
                <label className="an-field"><span>GitHub-Org</span><input name="github_org" defaultValue={v.github_org || ''} /></label>
            </div>

            <label className="an-field"><span>Notiz</span>
                <textarea name="notiz" rows={3} defaultValue={v.notiz || ''} /></label>

            <label className="an-check">
                <input type="checkbox" name="aktiv" defaultChecked={company ? !!v.aktiv : true} />
                <span>Aktiv (in Listen führen)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>{pending ? 'Speichern …' : 'Speichern'}</button>
                <Link href="/dashboard/radar" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
