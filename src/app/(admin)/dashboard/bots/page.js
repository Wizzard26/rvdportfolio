import { getBotStats } from '@/lib/analytics/botStore';
import { BOT_CATEGORIES } from '@/lib/analytics/bots';
import { formatNumber } from '@/lib/analytics/format';
import { formatBerlinDateTime } from '@/lib/dateFormat';
import { resolveRange } from '@/lib/analytics/range';
import AnHead from '@/components/analytics/AnHead';
import StatTile from '@/components/analytics/StatTile';
import PagerLinks from '@/components/analytics/PagerLinks';
import DataResetCard from '@/components/analytics/DataResetCard';
import { countBotHits } from '@/lib/analytics/adminData';
import { resetBotLogAction } from '@/lib/analytics/analyticsAdminActions';

export const dynamic = 'force-dynamic';

const CAT_ORDER = ['ai', 'search', 'seo', 'other'];
const BOT_PAGE_SIZE = 20;
const RECENT_PAGE_SIZE = 25;

export default async function BotsPage({ searchParams }) {
    const { days, rangeKey, phrase, params } = await resolveRange(searchParams);

    const botPage = Math.max(1, Number(params.bp) || 1);
    const recentPage = Math.max(1, Number(params.rp) || 1);

    const { total, byCategory, byBot, botTotal, topPaths, recent, recentTotal } = getBotStats({
        days,
        botPage,
        botPageSize: BOT_PAGE_SIZE,
        recentPage,
        recentPageSize: RECENT_PAGE_SIZE,
    });

    const catMap = Object.fromEntries(byCategory.map((c) => [c.category, c]));

    const botPages = Math.max(1, Math.ceil(botTotal / BOT_PAGE_SIZE));
    const recentPages = Math.max(1, Math.ceil(recentTotal / RECENT_PAGE_SIZE));

    // Für die Datenverwaltung zählt der gesamte Bestand (unabhängig vom Zeitraum).
    const botAllTime = countBotHits();

    // Zeitraum in den Pager-Links erhalten (Default 30 bleibt außen vor).
    const rangeParam = rangeKey === 30 ? undefined : rangeKey;

    return (
        <div className="an-dashboard">
            <AnHead
                title="KI & Bots"
                subtitle={`Serverseitiges Crawler-Log · ${formatNumber(total)} Zugriffe · ${phrase}`}
                active={rangeKey}
                basePath="/dashboard/bots"
            />

            <p className="an-card-note">
                Anonymes serverseitiges Protokoll automatischer Zugriffe (Crawler/Bots), erkannt am User-Agent.
                Es werden keine Cookies gesetzt und keine IP-Adressen gespeichert. Menschliche Klicks, die aus
                KI-Antworten kommen (ChatGPT, Perplexity, Claude …), stehen dagegen unter <strong>Herkunft</strong>.
            </p>

            {/* Zusammenfassung je Kategorie */}
            <div className="an-tiles">
                {CAT_ORDER.map((cat) => {
                    const c = catMap[cat] || { hits: 0, bots: 0 };
                    return (
                        <StatTile
                            key={cat}
                            value={formatNumber(c.hits)}
                            label={BOT_CATEGORIES[cat]}
                            hint={`${formatNumber(c.bots)} ${c.bots === 1 ? 'Bot' : 'Bots'}`}
                        />
                    );
                })}
            </div>

            {/* Bots im Detail */}
            <section className="an-card an-full" id="bots-detail">
                <h2>Bots im Detail{botTotal ? ` · ${formatNumber(botTotal)}` : ''}</h2>
                {byBot.length ? (
                    <>
                        <div className="an-table-wrap">
                            <table className="an-table">
                                <thead>
                                    <tr><th>Bot</th><th>Kategorie</th><th>Zugriffe</th><th>Zuletzt</th></tr>
                                </thead>
                                <tbody>
                                    {byBot.map((b) => (
                                        <tr key={b.name}>
                                            <td>{b.name}</td>
                                            <td><span className="an-badge">{BOT_CATEGORIES[b.category] || b.category}</span></td>
                                            <td>{formatNumber(b.hits)}</td>
                                            <td>{formatBerlinDateTime(b.last_ts)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PagerLinks
                            basePath="/dashboard/bots"
                            param="bp"
                            page={botPage}
                            totalPages={botPages}
                            params={{ range: rangeParam, rp: recentPage > 1 ? recentPage : undefined }}
                            anchor="#bots-detail"
                        />
                    </>
                ) : (
                    <p className="an-card-note">Im gewählten Zeitraum wurden noch keine Bot-Zugriffe erfasst.</p>
                )}
            </section>

            {/* Am häufigsten gecrawlte Seiten */}
            {topPaths.length ? (
                <section className="an-card an-full">
                    <h2>Am häufigsten gecrawlte Seiten</h2>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Seite</th><th>Zugriffe</th></tr></thead>
                            <tbody>
                                {topPaths.map((p) => (
                                    <tr key={p.path}><td>{p.path}</td><td>{formatNumber(p.hits)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {/* Jüngste Zugriffe */}
            {recent.length ? (
                <section className="an-card an-full" id="bots-recent">
                    <h2>Jüngste Zugriffe{recentTotal ? ` · ${formatNumber(recentTotal)}` : ''}</h2>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Zeit</th><th>Bot</th><th>Kategorie</th><th>Seite</th></tr></thead>
                            <tbody>
                                {recent.map((r, i) => (
                                    <tr key={`${r.ts}-${i}`}>
                                        <td>{formatBerlinDateTime(r.ts, { withSeconds: true })}</td>
                                        <td>{r.name}</td>
                                        <td><span className="an-badge">{BOT_CATEGORIES[r.category] || r.category}</span></td>
                                        <td>{r.path || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PagerLinks
                        basePath="/dashboard/bots"
                        param="rp"
                        page={recentPage}
                        totalPages={recentPages}
                        params={{ range: rangeParam, bp: botPage > 1 ? botPage : undefined }}
                        anchor="#bots-recent"
                    />
                </section>
            ) : null}

            {/* Datenverwaltung: Bot-Log sichern / zurücksetzen */}
            <DataResetCard
                title="Bot-Log verwalten"
                description={`Serverseitiges Crawler-Log (${formatNumber(botAllTime)} Einträge insgesamt). Lade bei Bedarf ein Backup herunter und setze das Log für einen sauberen Neustart zurück. Die Besucher-Analytics bleiben davon unberührt.`}
                count={botAllTime}
                backupHref="/api/admin/analytics-backup?scope=bots"
                action={resetBotLogAction}
            />
        </div>
    );
}
