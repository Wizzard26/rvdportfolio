import Link from 'next/link';
import { FiArrowLeft, FiExternalLink, FiGitMerge, FiCheckCircle, FiBookmark, FiSlash } from 'react-icons/fi';
import { getDuplicateGroups } from '@/lib/content/radarStore';
import { mergeCompaniesAction } from '@/lib/content/radarActions';
import { formatNumber } from '@/lib/analytics/format';

export const dynamic = 'force-dynamic';

const TYP_LABEL = { inhouse_shop: 'Inhouse-Shop', agentur: 'Agentur', hersteller: 'Hersteller', dienstleister: 'Dienstleister', unbekannt: 'unbekannt' };
const QUELLE_LABEL = {
    manuell: 'manuell', scan: 'Scan', builtwith: 'BuiltWith', publicwww: 'PublicWWW',
    bundesagentur: 'Bundesagentur', partnerverzeichnis: 'Partnerverzeichnis', commoncrawl: 'Common Crawl', liste: 'Liste',
};

export default async function RadarDuplikatePage() {
    const groups = getDuplicateGroups();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/radar" className="an-back"><FiArrowLeft aria-hidden="true" /> Zum Radar</Link>
                    <h1>Duplikate</h1>
                    <p>Firmen mit gleichem Namensschlüssel · {formatNumber(groups.length)} {groups.length === 1 ? 'Gruppe' : 'Gruppen'}</p>
                </div>
            </div>

            <section className="an-card an-full">
                <p className="an-card-note" style={{ marginTop: 0 }}>
                    Wahrscheinliche Dubletten – z. B. ein Arbeitgeber aus der Bundesagentur (ohne Domain) und derselbe
                    gecrawlte Shop/Agentur (mit Domain). Wähle die <strong>Sieger-Firma</strong> (bleibt erhalten) und führe
                    die anderen hinein zusammen: Chancen, Kontakte, Technik &amp; Sperren wandern mit, leere Felder werden
                    aufgefüllt, doppelte Chancen (gleicher Titel) als „verworfen" markiert, die Dubletten gelöscht.
                    Der Vorschlag (vorausgewählt) ist die Firma mit Domain / den meisten Chancen.
                </p>
            </section>

            {groups.length === 0 ? (
                <section className="an-card an-full"><p className="an-empty">Keine offensichtlichen Dubletten gefunden. 👍</p></section>
            ) : groups.map((g) => (
                <section className="an-card an-full" key={g[0].id}>
                    <form action={mergeCompaniesAction}>
                        {g.map((c) => <input key={`h-${c.id}`} type="hidden" name="ids" value={c.id} />)}
                        <div className="an-table-wrap">
                            <table className="an-table">
                                <thead><tr><th>Sieger</th><th>Firma</th><th>Quelle</th><th>Typ</th><th>Ort</th><th>Chancen</th><th>Status</th></tr></thead>
                                <tbody>
                                    {g.map((c, i) => (
                                        <tr key={c.id}>
                                            <td><input type="radio" name="survivor" value={c.id} defaultChecked={i === 0} aria-label={`${c.name || c.domain} als Sieger`} /></td>
                                            <td>
                                                <Link href={`/dashboard/radar/${c.id}`}><strong>{c.name || c.domain || '(ohne Name)'}</strong></Link>
                                                {c.domain
                                                    ? <div className="an-muted" style={{ fontSize: '0.82em' }}><a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer">{c.domain} <FiExternalLink aria-hidden="true" /></a></div>
                                                    : <div className="an-muted" style={{ fontSize: '0.82em' }}>ohne Website</div>}
                                            </td>
                                            <td className="an-muted">{QUELLE_LABEL[c.quelle] || c.quelle}</td>
                                            <td><span className="an-badge">{TYP_LABEL[c.typ] || c.typ}</span></td>
                                            <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={[c.plz, c.ort].filter(Boolean).join(' ')}>{[c.plz, c.ort].filter(Boolean).join(' ') || '—'}</td>
                                            <td>{formatNumber(c.opp_count)}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {c.merk ? <span className="an-badge" style={{ color: 'var(--adm-accent)' }} title="Merkliste"><FiBookmark aria-hidden="true" /></span> : null}
                                                {c.beworben_count > 0 ? <span className="an-badge an-badge--ok" title="beworben"><FiCheckCircle aria-hidden="true" /></span> : null}
                                                {!c.beworben_count && c.absage_count > 0 ? <span className="an-badge an-badge--warn" title="Absage"><FiSlash aria-hidden="true" /></span> : null}
                                                {c.verworfen_grund ? <span className="an-badge an-badge--bad" title={c.verworfen_grund}>verw.</span> : null}
                                                {c.archiviert ? <span className="an-badge an-badge--warn" title="archiviert">arch.</span> : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <button type="submit" className="an-btn-primary an-btn-small"><FiGitMerge aria-hidden="true" /> In Sieger zusammenführen</button>
                        </div>
                    </form>
                </section>
            ))}
        </div>
    );
}
