import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiTrash2, FiExternalLink, FiLock, FiSend, FiShield, FiCheck } from 'react-icons/fi';
import { getCompany, getLatestSnapshot, getFindings, OPP_STATUS } from '@/lib/content/radarStore';
import {
    createOpportunityAction, setOpportunityStatusAction, deleteOpportunityAction,
    addContactAction, deleteContactAction, deleteCompanyAction, createFreigabeFromOpportunityAction,
    markArt14SentAction,
} from '@/lib/content/radarActions';

export const dynamic = 'force-dynamic';

const TYP_LABEL = { inhouse_shop: 'Inhouse-Shop', agentur: 'Agentur', hersteller: 'Hersteller', dienstleister: 'Dienstleister', unbekannt: 'unbekannt' };
const OPP_TYP = [['job_inhouse', 'Festanstellung – Stelle'], ['job_agentur', 'Festanstellung – Agenturstelle'], ['initiativ', 'Initiativbewerbung'], ['freelance', 'Freelance (Akquise)']];

// Textbaustein für die Informationspflicht nach Art. 14 DSGVO beim Erstkontakt.
const ART14_TEXT = 'Hinweis zum Datenschutz: Ihre Kontaktdaten (Name, dienstliche E-Mail) habe ich dem öffentlich '
    + 'zugänglichen Impressum bzw. Ihrer Stellenausschreibung entnommen, um Sie einmalig persönlich zu kontaktieren. '
    + 'Rechtsgrundlage ist mein berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO). Ich speichere die Daten nur zu '
    + 'diesem Zweck und lösche sie spätestens sechs Monate nach dem letzten Kontakt. Weitere Informationen und Ihre '
    + 'Rechte: https://rene-van-dinter.de/disclaimer — einem weiteren Kontakt können Sie jederzeit formlos widersprechen.';

const dedate = (ms) => (ms ? new Date(ms).toISOString().slice(0, 10) : '');

export default async function RadarCompanyDetail({ params }) {
    const { id } = await params;
    const c = getCompany(Number(id));
    if (!c) notFound();
    const now = Date.now();
    const activeBlocks = (c.blocks || []).filter((b) => b.gesperrt_bis > now);
    const snap = getLatestSnapshot(c.id);
    const findings = getFindings(c.id);
    const sec = snap && snap.security_header ? (() => { try { return JSON.parse(snap.security_header); } catch { return {}; } })() : {};
    const SCHWERE = { hoch: 'bad', mittel: 'warn', info: 'ok' };

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/radar" className="an-back"><FiArrowLeft aria-hidden="true" /> Zum Radar</Link>
                    <h1>{c.name || c.domain || '(ohne Name)'}</h1>
                    {c.domain && <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer" className="an-muted">{c.domain} <FiExternalLink aria-hidden="true" /></a>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/dashboard/radar/${c.id}/edit`} className="an-btn-secondary"><FiEdit2 aria-hidden="true" /> Bearbeiten</Link>
                    <form action={deleteCompanyAction}><input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="an-btn-secondary an-danger"><FiTrash2 aria-hidden="true" /> Löschen</button></form>
                </div>
            </div>

            {activeBlocks.length > 0 && (
                <p className="an-alert-danger"><FiLock aria-hidden="true" /> Doppelansprache-Sperre aktiv: {activeBlocks.map((b) => `${b.pipeline} bis ${new Date(b.gesperrt_bis).toLocaleDateString('de-DE')}`).join(' · ')}</p>
            )}

            <section className="an-card an-full">
                <h2>Firmendaten</h2>
                <div className="an-tiles">
                    <div className="an-tile"><div className="an-tile-label">Typ</div><div className="an-tile-value" style={{ fontSize: '1.1rem' }}>{TYP_LABEL[c.typ] || c.typ}</div></div>
                    <div className="an-tile"><div className="an-tile-label">Inhouse-Team</div><div className="an-tile-value" style={{ fontSize: '1.1rem' }}>{c.inhouse_team}</div></div>
                    <div className="an-tile"><div className="an-tile-label">Ort</div><div className="an-tile-value" style={{ fontSize: '1.1rem' }}>{[c.plz, c.ort].filter(Boolean).join(' ') || '—'}</div></div>
                    <div className="an-tile"><div className="an-tile-label">Entfernung</div><div className="an-tile-value" style={{ fontSize: '1.1rem' }}>{c.distanz_km ? `${c.distanz_km} km` : '—'}</div></div>
                </div>
                {c.themengebiete && <p className="an-card-note">Themen: {c.themengebiete}</p>}
                {c.notiz && <p className="an-card-note">Notiz: {c.notiz}</p>}
                <p className="an-card-note">
                    {c.karriere_url && <a href={c.karriere_url} target="_blank" rel="noopener noreferrer">Karriereseite ↗ </a>}
                    {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"> · LinkedIn ↗ </a>}
                    {c.github_org && <span> · GitHub: {c.github_org}</span>}
                </p>
            </section>

            {/* Technikprofil (aus dem Fingerprint) */}
            {snap && (
                <section className="an-card an-full">
                    <h2>Technikprofil</h2>
                    <div className="an-tiles">
                        <div className="an-tile"><div className="an-tile-label">Plattform</div><div className="an-tile-value" style={{ fontSize: '1.1rem' }}>{snap.plattform}{snap.version ? ` ${snap.version}` : ''}{snap.version_eol ? ' ⚠' : ''}</div><div className="an-tile-hint">Confidence {Math.round((snap.plattform_confidence || 0) * 100)}%</div></div>
                        <div className="an-tile"><div className="an-tile-label">Frontend</div><div className="an-tile-value" style={{ fontSize: '1.05rem' }}>{snap.frontend}</div></div>
                        <div className="an-tile"><div className="an-tile-label">Theme</div><div className="an-tile-value" style={{ fontSize: '1.05rem' }}>{snap.theme_typ || '—'}</div></div>
                        <div className="an-tile"><div className="an-tile-label">Security-Header</div><div className="an-tile-value" style={{ fontSize: '0.95rem' }}>{['hsts', 'csp', 'xfo'].filter((k) => sec[k]).join(', ').toUpperCase() || '—'}</div></div>
                    </div>
                    <p className="an-card-note">
                        {snap.eigene_namespaces && <>Eigene Bundles: <strong>{snap.eigene_namespaces}</strong> (Inhouse-Indiz). </>}
                        {snap.agentur_credit && <>Agentur-Credit: „{snap.agentur_credit}". </>}
                        {snap.server_header && <>Server: {snap.server_header}.</>}
                    </p>
                </section>
            )}

            {/* Findings (Anschreiben-Aufhänger) */}
            {findings.length > 0 && (
                <section className="an-card an-full">
                    <h2>Findings · {findings.length}</h2>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Titel</th><th>Schwere</th><th>Verwendbar als</th></tr></thead>
                            <tbody>
                                {findings.map((f) => (
                                    <tr key={f.id}>
                                        <td><strong>{f.titel}</strong>{f.beschreibung && <div className="an-muted">{f.beschreibung}</div>}</td>
                                        <td><span className={`an-badge an-badge--${SCHWERE[f.schwere] || 'ok'}`}>{f.schwere}</span></td>
                                        <td>{f.verwendbar_als === 'intern_nur' ? <span className="an-badge an-badge--bad">nur intern</span> : f.verwendbar_als === 'akquise_aufhaenger' ? <span className="an-badge an-badge--ok">Akquise-Aufhänger</span> : f.verwendbar_als}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="an-card-note">Sicherheits-Findings sind bewusst „nur intern" – niemals als Kaltakquise-Aufhänger verwenden.</p>
                </section>
            )}

            {/* Chancen */}
            <section className="an-card an-full">
                <h2>Chancen · {c.opportunities.length}</h2>
                <p className="an-card-note" style={{ marginTop: 0 }}>
                    Unabhängig vom Firmentyp: Zu jeder Firma – ob Shop oder Agentur – kannst du sowohl eine
                    <strong> Festanstellung/Initiativbewerbung</strong> (Pipeline Bewerbung) als auch <strong>Freelance</strong>
                    {' '}(Pipeline Akquise) erfassen. Nur „Freelance" zählt als Akquise.
                </p>
                {c.opportunities.length === 0 ? (
                    <p className="an-card-note">Noch keine Chancen erfasst.</p>
                ) : (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Titel</th><th>Typ</th><th>Score</th><th>Status</th><th></th></tr></thead>
                            <tbody>
                                {c.opportunities.map((o) => (
                                    <tr key={o.id}>
                                        <td>
                                            <strong>{o.titel || '(ohne Titel)'}</strong>
                                            {o.begruendung && <div className="an-muted">{o.begruendung}</div>}
                                            {o.match_luecken && <div className="an-muted">Lücken: {o.match_luecken}</div>}
                                        </td>
                                        <td><span className="an-badge">{(OPP_TYP.find((t) => t[0] === o.typ) || [])[1] || o.typ}</span></td>
                                        <td><strong>{o.score_gesamt}</strong></td>
                                        <td>
                                            <form action={setOpportunityStatusAction} style={{ display: 'flex', gap: 6 }}>
                                                <input type="hidden" name="id" value={o.id} />
                                                <input type="hidden" name="company_id" value={c.id} />
                                                <input type="hidden" name="pipeline" value={o.pipeline} />
                                                <select name="status" defaultValue={o.status}>
                                                    {OPP_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <button type="submit" className="an-btn-secondary an-btn-small">setzen</button>
                                            </form>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            {o.share_id ? (
                                                <Link href={`/dashboard/dokumente/freigaben/${o.share_id}`} className="an-btn-secondary an-btn-small" title="Verknüpfte Freigabe öffnen"><FiSend aria-hidden="true" /> Freigabe</Link>
                                            ) : (
                                                <form action={createFreigabeFromOpportunityAction} style={{ display: 'inline' }}>
                                                    <input type="hidden" name="id" value={o.id} />
                                                    <input type="hidden" name="company_id" value={c.id} />
                                                    <button type="submit" className="an-btn-secondary an-btn-small" title="Vorbefüllte Freigabe mit Anschreiben erstellen"><FiSend aria-hidden="true" /> Freigabe</button>
                                                </form>
                                            )}
                                            <form action={deleteOpportunityAction} style={{ display: 'inline', marginLeft: 6 }}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="company_id" value={c.id} />
                                                <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button></form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <details style={{ marginTop: 14 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>+ Chance hinzufügen</summary>
                    <form action={createOpportunityAction} className="an-form" style={{ marginTop: 12 }}>
                        <input type="hidden" name="company_id" value={c.id} />
                        <div className="an-field-row">
                            <label className="an-field"><span>Titel</span><input name="titel" placeholder="Shopware-Entwickler (m/w/d)" /></label>
                            <label className="an-field"><span>Typ</span>
                                <select name="typ" defaultValue="initiativ">{OPP_TYP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                        </div>
                        <div className="an-field-row">
                            <label className="an-field"><span>Stunden/Woche</span><input name="stunden_woche" placeholder="30" /></label>
                            <label className="an-field"><span>Remote-Anteil</span><input name="remote_anteil" placeholder="hybrid / remote / vor Ort" /></label>
                            <label className="an-field"><span>Gehalt/Rate</span><input name="gehalt_angabe" /></label>
                        </div>
                        <label className="an-field"><span>Erkannter Stack <span className="an-muted">(Komma) → fürs Scoring</span></span>
                            <input name="stack_erkannt" placeholder="Shopware 6, PHP, Symfony, Vue.js" /></label>
                        <label className="an-field"><span>Quell-URL</span><input name="quell_url" placeholder="https://…/jobs/…" /></label>
                        <div className="an-form-actions"><button type="submit" className="an-btn-primary">Chance anlegen (wird bewertet)</button></div>
                    </form>
                </details>
            </section>

            {/* Kontakte */}
            <section className="an-card an-full">
                <h2>Kontakte · {c.contacts.length}</h2>
                {c.contacts.length > 0 && (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Name</th><th>Rolle</th><th>Kontakt</th><th>Quelle</th><th>Art. 14</th><th></th></tr></thead>
                            <tbody>
                                {c.contacts.map((k) => (
                                    <tr key={k.id}>
                                        <td>{k.name || '—'}{k.ist_entscheider ? <span className="an-badge"> Entscheider</span> : null}</td>
                                        <td>{k.rolle || '—'}</td>
                                        <td className="an-muted">{[k.email, k.telefon].filter(Boolean).join(' · ') || '—'}</td>
                                        <td>{k.quelle}</td>
                                        <td>
                                            <form action={markArt14SentAction} style={{ display: 'inline' }}>
                                                <input type="hidden" name="id" value={k.id} />
                                                <input type="hidden" name="company_id" value={c.id} />
                                                <input type="hidden" name="sent" value={k.art14_info_gesendet_am ? '0' : '1'} />
                                                {k.art14_info_gesendet_am
                                                    ? <button type="submit" className="an-badge an-badge--ok" title={`Gesendet am ${dedate(k.art14_info_gesendet_am)} · Klick = zurücksetzen`}><FiCheck aria-hidden="true" /> {dedate(k.art14_info_gesendet_am)}</button>
                                                    : <button type="submit" className="an-btn-secondary an-btn-small" title="Info nach Art. 14 als gesendet markieren"><FiShield aria-hidden="true" /> markieren</button>}
                                            </form>
                                        </td>
                                        <td><form action={deleteContactAction}><input type="hidden" name="id" value={k.id} /><input type="hidden" name="company_id" value={c.id} />
                                            <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button></form></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {c.contacts.length > 0 && (
                    <details style={{ marginTop: 12 }}>
                        <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}><FiShield aria-hidden="true" /> Textbaustein Art. 14 DSGVO</summary>
                        <p className="an-card-note" style={{ marginTop: 10 }}>Beim ersten Kontakt (Mail/Anschreiben) mit anhängen, danach oben „markieren":</p>
                        <pre className="an-input" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{ART14_TEXT}</pre>
                    </details>
                )}
                <details style={{ marginTop: 14 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>+ Kontakt hinzufügen</summary>
                    <form action={addContactAction} className="an-form" style={{ marginTop: 12 }}>
                        <input type="hidden" name="company_id" value={c.id} />
                        <div className="an-field-row">
                            <label className="an-field"><span>Name</span><input name="name" /></label>
                            <label className="an-field"><span>Rolle</span><input name="rolle" placeholder="Teamlead / HR" /></label>
                        </div>
                        <div className="an-field-row">
                            <label className="an-field"><span>E-Mail</span><input name="email" type="email" /></label>
                            <label className="an-field"><span>Telefon</span><input name="telefon" /></label>
                        </div>
                        <div className="an-field-row">
                            <label className="an-field"><span>Quelle</span>
                                <select name="quelle" defaultValue="impressum"><option value="impressum">Impressum</option><option value="stellenanzeige">Stellenanzeige</option><option value="website">Website</option><option value="manuell">manuell</option></select></label>
                            <label className="an-check" style={{ alignSelf: 'flex-end' }}><input type="checkbox" name="ist_entscheider" /><span>Entscheider</span></label>
                        </div>
                        <p className="an-card-note">DSGVO: Herkunft + 6-Monats-Löschfrist werden automatisch gesetzt.</p>
                        <div className="an-form-actions"><button type="submit" className="an-btn-primary">Kontakt anlegen</button></div>
                    </form>
                </details>
            </section>
        </div>
    );
}
