import Link from 'next/link';
import { FiPlus, FiExternalLink, FiLock, FiTrash2 } from 'react-icons/fi';
import { getCompanies, getOpportunities } from '@/lib/content/radarStore';
import { deleteCompanyAction } from '@/lib/content/radarActions';
import { formatNumber } from '@/lib/analytics/format';
import StatTile from '@/components/analytics/StatTile';
import RadarScanForm from '@/components/analytics/RadarScanForm';

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

    const companies = getCompanies({ q, typ });
    const opps = getOpportunities({});
    const offene = opps.filter((o) => !['absage', 'verworfen'].includes(o.status));

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

            <div className="an-tiles">
                <StatTile value={formatNumber(companies.filter((c) => c.typ === 'inhouse_shop').length)} label="Inhouse-Shops" />
                <StatTile value={formatNumber(companies.filter((c) => c.typ === 'agentur').length)} label="Agenturen" />
                <StatTile value={formatNumber(offene.length)} label="Offene Chancen" />
                <StatTile value={formatNumber(companies.filter((c) => c.blocked).length)} label="Gesperrt (Doppelansprache)" />
            </div>

            <section className="an-card an-full">
                <form className="an-filters" style={{ marginBottom: 14 }}>
                    <input name="q" defaultValue={q} placeholder="Suche: Name, Domain, Ort, Thema" className="an-input" />
                    <select name="typ" defaultValue={typ}>
                        <option value="">Alle Typen</option>
                        {Object.entries(TYP_LABEL).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                    <button type="submit" className="an-btn-secondary an-btn-small">Filtern</button>
                </form>

                {companies.length === 0 ? (
                    <p className="an-empty">Noch keine Firmen. Lege oben die erste an.</p>
                ) : (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Firma</th><th>Typ</th><th>Plattform</th><th>Ort</th><th>Chancen</th><th></th></tr></thead>
                            <tbody>
                                {companies.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <Link href={`/dashboard/radar/${c.id}`}><strong>{c.name || c.domain || '(ohne Name)'}</strong></Link>
                                            {c.blocked && <span className="an-badge an-badge--warn" title="Doppelansprache gesperrt"> <FiLock aria-hidden="true" /> gesperrt</span>}
                                            {c.domain && <div className="an-muted"><a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer">{c.domain} <FiExternalLink aria-hidden="true" /></a></div>}
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
            </section>
        </div>
    );
}
