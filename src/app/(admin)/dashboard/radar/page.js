import Link from 'next/link';
import { FiPlus, FiExternalLink, FiLock, FiTrash2, FiShield, FiUploadCloud, FiArchive, FiRotateCcw } from 'react-icons/fi';
import { getCompanies, getOpportunities, getContactsDueForDeletion, countCompaniesToRescan, countCompanies } from '@/lib/content/radarStore';
import { deleteCompanyAction, deleteContactAction, archiveCompanyAction } from '@/lib/content/radarActions';
import { formatNumber } from '@/lib/analytics/format';
import StatTile from '@/components/analytics/StatTile';
import RadarScanForm from '@/components/analytics/RadarScanForm';
import RadarImportForm from '@/components/analytics/RadarImportForm';
import RadarBatchRescan from '@/components/analytics/RadarBatchRescan';
import RadarCcDiscover from '@/components/analytics/RadarCcDiscover';
import RadarListImport from '@/components/analytics/RadarListImport';

export const dynamic = 'force-dynamic';

const TYP_LABEL = {
    inhouse_shop: 'Inhouse-Shop', agentur: 'Agentur', hersteller: 'Hersteller',
    dienstleister: 'Dienstleister', unbekannt: 'unbekannt',
};
const PLAT_LABEL = {
    shopware6: 'Shopware 6', shopware5: 'Shopware 5', shopify: 'Shopify',
    woocommerce: 'WooCommerce', magento: 'Magento', oxid: 'Oxid', custom: 'Custom', unbekannt: '—',
};

export default async function RadarPage({ searchParams }) {
    const sp = await searchParams;
    const q = (sp?.q || '').toString();
    const typ = (sp?.typ || '').toString();
    const status = ['aktiv', 'verworfen', 'archiviert', 'alle'].includes(sp?.status) ? sp.status : 'aktiv';
    const plattform = (sp?.plattform || '').toString();
    const plz = (sp?.plz || '').toString();

    const PAGE_SIZE = 50;
    const total = countCompanies({ q, typ, status, plattform, plz });
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(pages, Math.max(1, parseInt(sp?.page, 10) || 1));
    const companies = getCompanies({ q, typ, status, plattform, plz, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

    const opps = getOpportunities({});
    const offene = opps.filter((o) => !['absage', 'verworfen'].includes(o.status));
    const dueContacts = getContactsDueForDeletion(14);
    const verworfenCount = countCompanies({ status: 'verworfen' });
    const archivedCount = countCompanies({ status: 'archiviert' });
    const unscanned = countCompaniesToRescan('unscanned');
    const jetzt = Date.now();

    const prioClass = (s) => (s >= 70 ? 'an-badge--ok' : s >= 40 ? 'an-badge--warn' : '');
    // Query-String für Pagination-Links (aktuelle Filter behalten, page setzen).
    const qs = (over = {}) => {
        const o = { q, typ, status, plattform, plz, page, ...over };
        const parts = Object.entries(o).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
        return `?${parts.join('&')}`;
    };

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Radar</h1>
                    <p>Bewerbungs- & Akquise-Listen · {formatNumber(companies.length)} Firmen, {formatNumber(opps.length)} Chancen</p>
                </div>
                <Link href="/dashboard/radar/new" className="an-btn-secondary"><FiPlus aria-hidden="true" /> Manuell anlegen</Link>
            </div>

            <section className="an-card an-full">
                <h2>Shop-/Firmen-URL scannen</h2>
                <p className="an-card-note" style={{ marginTop: 0 }}>
                    URL einfügen, Typ wählen → der Fingerprinter holt die Seite (robots-konform, kein Browser) und legt die Firma
                    automatisch an: Plattform &amp; Version, Inhouse-/Agentur-Indizien, Karriereseite, Ansprechpartner aus dem
                    Impressum und technische Findings als Anschreiben-Aufhänger. Kontakt geht immer von Hand raus.
                </p>
                <RadarScanForm />
            </section>

            <section className="an-card an-full">
                <h2><FiUploadCloud aria-hidden="true" /> Discovery-Import</h2>
                <p className="an-card-note" style={{ marginTop: 0 }}>
                    Externe Listen als Saat einlesen → Firmen + Lead-Prio, dedupliziert per Domain. Kein Crawling.
                    Danach <strong>Re-Scan</strong> für Live-Verifikation (Plattform bestätigen, Karteileichen/weg-migrierte aussortieren, Karriereseite + Kontakt).
                </p>

                <h3 style={{ margin: '4px 0 6px', fontSize: '1rem' }}>① BuiltWith-CSV (reich: Kontakt, Umsatz, Payment …)</h3>
                <RadarImportForm />

                <h3 style={{ margin: '18px 0 6px', fontSize: '1rem' }}>② Domain-/URL-Liste (z. B. PublicWWW-Marker-Export)</h3>
                <p className="an-card-note" style={{ margin: '0 0 8px' }}>
                    In PublicWWW gezielt nach dem Marker suchen (SW6 = <code>/bundles/storefront/</code>, SW5 = <code>engine/Shopware</code>),
                    Land <strong>DE</strong> filtern, nach Popularität sortieren → Domainliste hier einfügen und den passenden Plattform-Hinweis wählen.
                    Kontakt/Version holt der Re-Scan.
                </p>
                <RadarListImport />

                <div style={{ marginTop: 18 }}>
                    <p className="an-card-note" style={{ margin: '0 0 8px' }}>Live-Re-Scan (gedrosselt, robots-konform):</p>
                    <RadarBatchRescan pendingCount={unscanned} />
                </div>
                <details style={{ marginTop: 16 }}>
                    <summary className="an-btn-secondary an-btn-small" style={{ display: 'inline-block' }}>Common-Crawl-Discovery (Prototyp)</summary>
                    <p className="an-card-note" style={{ margin: '10px 0 8px' }}>
                        Domains gegen das öffentliche <strong>Common-Crawl-Archiv</strong> prüfen — die Plattform kommt aus der
                        archivierten Startseite, <strong>ohne die Live-Seite zu belasten</strong>. Treffer landen direkt im Radar
                        (dedupliziert). Grenzen: CC ist nicht vollständig/tagesaktuell; headless/CDN-Shops ohne HTML-Marker rutschen durch.
                        Für echte <strong>Massen-Enumeration</strong> den CC-Columnar-Index (Athena) mit Marker-Query nutzen und den
                        Domain-Export oben als CSV importieren.
                    </p>
                    <RadarCcDiscover />
                </details>
            </section>

            <div className="an-tiles">
                <StatTile value={formatNumber(companies.filter((c) => c.typ === 'inhouse_shop').length)} label="Inhouse-Shops" />
                <StatTile value={formatNumber(companies.filter((c) => c.typ === 'agentur').length)} label="Agenturen" />
                <StatTile value={formatNumber(verworfenCount)} label="Verworfen / Karteileichen" />
                <StatTile value={formatNumber(archivedCount)} label="Archiviert" />
            </div>

            {dueContacts.length > 0 && (
                <section className="an-card an-full">
                    <h2><FiShield aria-hidden="true" /> DSGVO – Löschfristen · {formatNumber(dueContacts.length)}</h2>
                    <p className="an-card-note" style={{ marginTop: 0 }}>
                        Kontakte, deren 6-Monats-Löschfrist erreicht ist oder in den nächsten 14 Tagen fällt. Ohne Kontakt/Aktivität
                        löschen (Recht auf Vergessenwerden); bei laufendem Vorgang genügt eine Notiz an der Firma.
                    </p>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Kontakt</th><th>Firma</th><th>Quelle</th><th>Löschen bis</th><th></th></tr></thead>
                            <tbody>
                                {dueContacts.map((k) => {
                                    const faellig = k.loeschen_am <= jetzt;
                                    return (
                                        <tr key={k.id}>
                                            <td>{k.name || k.email || '—'}</td>
                                            <td><Link href={`/dashboard/radar/${k.company_id}`}>{k.company_name || k.company_domain}</Link></td>
                                            <td className="an-muted">{k.quelle}</td>
                                            <td><span className={`an-badge ${faellig ? 'an-badge--bad' : 'an-badge--warn'}`}>{new Date(k.loeschen_am).toISOString().slice(0, 10)}{faellig ? ' · fällig' : ''}</span></td>
                                            <td>
                                                <form action={deleteContactAction}>
                                                    <input type="hidden" name="id" value={k.id} />
                                                    <input type="hidden" name="company_id" value={k.company_id} />
                                                    <button type="submit" className="an-btn-secondary an-btn-small an-danger" title="Kontakt löschen"><FiTrash2 aria-hidden="true" /> löschen</button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section className="an-card an-full">
                <form className="an-filters" style={{ marginBottom: 6 }}>
                    <input name="q" defaultValue={q} placeholder="Suche: Name, Domain, Ort, Thema" className="an-input" />
                    <select name="plattform" defaultValue={plattform}>
                        <option value="">Alle Plattformen</option>
                        {Object.entries(PLAT_LABEL).filter(([v]) => v !== 'unbekannt').map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                    <input name="plz" defaultValue={plz} placeholder="PLZ-Bereich (z. B. 21)" className="an-input" style={{ maxWidth: 160 }} />
                    <select name="typ" defaultValue={typ}>
                        <option value="">Alle Typen</option>
                        {Object.entries(TYP_LABEL).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                    <select name="status" defaultValue={status}>
                        <option value="aktiv">Aktive</option>
                        <option value="verworfen">Verworfen / Karteileichen</option>
                        <option value="archiviert">Archiviert</option>
                        <option value="alle">Alle</option>
                    </select>
                    <button type="submit" className="an-btn-secondary an-btn-small">Filtern</button>
                </form>
                <p className="an-muted" style={{ margin: '0 0 12px', fontSize: '0.85em' }}>{formatNumber(total)} Firmen{pages > 1 ? ` · Seite ${page}/${pages}` : ''}</p>

                {companies.length === 0 ? (
                    <p className="an-empty">Noch keine Firmen. Lege oben die erste an.</p>
                ) : (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Prio</th><th>Firma</th><th>Typ</th><th>Plattform</th><th>Ort</th><th>Chancen</th><th></th></tr></thead>
                            <tbody>
                                {companies.map((c) => (
                                    <tr key={c.id}>
                                        <td><span className={`an-badge ${prioClass(c.prio_score)}`} title={c.prio_grund || ''}>{formatNumber(c.prio_score || 0)}</span></td>
                                        <td>
                                            <Link href={`/dashboard/radar/${c.id}`}><strong>{c.name || c.domain || '(ohne Name)'}</strong></Link>
                                            {c.blocked && <span className="an-badge an-badge--warn" title="Doppelansprache gesperrt"> <FiLock aria-hidden="true" /> gesperrt</span>}
                                            {c.verworfen_grund && <span className="an-badge an-badge--bad" title={c.verworfen_grund}> verworfen</span>}
                                            {c.domain && <div className="an-muted"><a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer">{c.domain} <FiExternalLink aria-hidden="true" /></a></div>}
                                            {(c.umsatz_est > 0 || c.tech_spend_est > 0) && (
                                                <div className="an-muted" style={{ fontSize: '0.82em' }}>
                                                    {c.umsatz_est > 0 ? `Umsatz ~$${formatNumber(c.umsatz_est)}/M` : ''}
                                                    {c.umsatz_est > 0 && c.tech_spend_est > 0 ? ' · ' : ''}
                                                    {c.tech_spend_est > 0 ? `Tech-Spend ~$${formatNumber(c.tech_spend_est)}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td><span className="an-badge">{TYP_LABEL[c.typ] || c.typ}</span></td>
                                        <td>
                                            {c.plattform && c.plattform !== 'unbekannt'
                                                ? <span className={`an-badge ${c.version_eol ? 'an-badge--warn' : ''}`}>{PLAT_LABEL[c.plattform] || c.plattform}{c.version ? ` ${c.version}` : ''}{c.version_eol ? ' ⚠' : ''}</span>
                                                : <span className="an-muted">nicht erkannt</span>}
                                        </td>
                                        <td>{[c.plz, c.ort].filter(Boolean).join(' ') || '—'}</td>
                                        <td>{formatNumber(c.opp_count)}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <Link href={`/dashboard/radar/${c.id}`} className="an-btn-secondary an-btn-small">Öffnen</Link>
                                            {c.archiviert ? (
                                                <form action={archiveCompanyAction} style={{ display: 'inline', marginLeft: 6 }}>
                                                    <input type="hidden" name="id" value={c.id} />
                                                    <input type="hidden" name="on" value="0" />
                                                    <button type="submit" className="an-icon-btn" title="Reaktivieren"><FiRotateCcw /></button>
                                                </form>
                                            ) : (
                                                <form action={archiveCompanyAction} style={{ display: 'inline', marginLeft: 6 }}>
                                                    <input type="hidden" name="id" value={c.id} />
                                                    <input type="hidden" name="on" value="1" />
                                                    <button type="submit" className="an-icon-btn" title="Archivieren (weglegen, nicht löschen)"><FiArchive /></button>
                                                </form>
                                            )}
                                            <form action={deleteCompanyAction} style={{ display: 'inline', marginLeft: 6 }}>
                                                <input type="hidden" name="id" value={c.id} />
                                                <button type="submit" className="an-icon-btn an-danger" title="Firma löschen"><FiTrash2 /></button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pages > 1 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                        {page > 1 && <Link href={qs({ page: page - 1 })} className="an-btn-secondary an-btn-small">← Zurück</Link>}
                        <span className="an-muted" style={{ fontSize: '0.85em' }}>Seite {page} / {pages}</span>
                        {page < pages && <Link href={qs({ page: page + 1 })} className="an-btn-secondary an-btn-small">Weiter →</Link>}
                    </div>
                )}
            </section>
        </div>
    );
}
