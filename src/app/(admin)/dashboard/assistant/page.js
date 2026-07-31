import { getAssistantData } from '@/lib/analytics/queries';
import { formatNumber } from '@/lib/analytics/format';
import { resolveRange } from '@/lib/analytics/range';
import AnHead from '@/components/analytics/AnHead';
import StatTile from '@/components/analytics/StatTile';
import DataResetCard from '@/components/analytics/DataResetCard';
import { countAssistantEvents } from '@/lib/analytics/adminData';
import { resetAssistantLogAction } from '@/lib/analytics/analyticsAdminActions';

export const dynamic = 'force-dynamic';

// Anzeige-Label + Farbklasse je Trefferart.
const HIT_META = {
    grounded: { label: 'Treffer aus den Unterlagen', tone: 'ok' },
    soft: { label: 'Überblick-Thema (profil-nah)', tone: 'mid' },
    none: { label: 'Kein Treffer', tone: 'bad' },
};

export default async function AssistantPage({ searchParams }) {
    const { range, rangeKey, phrase } = await resolveRange(searchParams);
    const {
        opens, asks, openSessions,
        grounded, soft, none, answeredRate,
        topQuestions, misses,
    } = getAssistantData(range);

    // Für die Datenverwaltung zählt der gesamte Bestand (unabhängig vom Zeitraum).
    const allTime = countAssistantEvents();

    const hitRows = [
        { key: 'grounded', n: grounded },
        { key: 'soft', n: soft },
        { key: 'none', n: none },
    ];

    return (
        <div className="an-dashboard">
            <AnHead
                title="KI-Assistent"
                subtitle={`Nutzung des CV-Chatbots · ${formatNumber(asks)} Fragen · ${phrase}`}
                active={rangeKey}
                basePath="/dashboard/assistant"
            />

            <p className="an-card-note">
                Anonyme, cookiefreie Auswertung des KI-Assistenten: wie oft er geöffnet wird, welche Fragen
                gestellt werden und ob sie beantwortet werden konnten. Es werden keine Cookies gesetzt und keine
                IP-Adressen gespeichert – gleiche Anonymisierung wie beim übrigen Analytics.
            </p>

            {/* Kennzahlen */}
            <div className="an-tiles">
                <StatTile value={formatNumber(opens)} label="Geöffnet" hint={`${formatNumber(openSessions)} ${openSessions === 1 ? 'Sitzung' : 'Sitzungen'}`} />
                <StatTile value={formatNumber(asks)} label="Fragen gestellt" />
                <StatTile value={`${answeredRate}%`} label="Beantwortet" hint="Treffer oder Überblick" />
                <StatTile value={formatNumber(none)} label="Ohne Treffer" hint="Lücken in den Unterlagen" />
            </div>

            {/* Treffer-Verteilung */}
            <section className="an-card an-full">
                <h2>Antwortqualität</h2>
                {asks ? (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Art der Antwort</th><th>Fragen</th><th>Anteil</th></tr></thead>
                            <tbody>
                                {hitRows.map(({ key, n }) => (
                                    <tr key={key}>
                                        <td>{HIT_META[key].label}</td>
                                        <td>{formatNumber(n)}</td>
                                        <td>{asks ? Math.round((n / asks) * 100) : 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="an-card-note">Im gewählten Zeitraum wurden noch keine Fragen gestellt.</p>
                )}
            </section>

            {/* Fehlschüsse zuerst – das ist die Verbesserungsliste */}
            {misses.length ? (
                <section className="an-card an-full">
                    <h2>Fragen ohne Treffer · {formatNumber(misses.length)}</h2>
                    <p className="an-card-note">
                        Diese Fragen konnte der Assistent nicht aus den Unterlagen beantworten – Kandidaten für neue
                        Inhalte (Vita, Showcase, Blog) oder ein passendes Überblick-Thema.
                    </p>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Frage</th><th>Anzahl</th></tr></thead>
                            <tbody>
                                {misses.map((m, i) => (
                                    <tr key={`${m.q}-${i}`}><td>{m.q}</td><td>{formatNumber(m.n)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {/* Alle Fragen */}
            {topQuestions.length ? (
                <section className="an-card an-full">
                    <h2>Meistgestellte Fragen · {formatNumber(topQuestions.length)}</h2>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Frage</th><th>Ergebnis</th><th>Anzahl</th></tr></thead>
                            <tbody>
                                {topQuestions.map((q, i) => (
                                    <tr key={`${q.q}-${i}`}>
                                        <td>{q.q}</td>
                                        <td><span className="an-badge">{HIT_META[q.hit]?.label || q.hit}</span></td>
                                        <td>{formatNumber(q.n)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {/* Datenverwaltung: Assistent-Log sichern / zurücksetzen */}
            <DataResetCard
                title="Assistent-Log verwalten"
                description={`Nutzungs-Log des KI-Assistenten (${formatNumber(allTime)} Einträge insgesamt). Lade bei Bedarf ein Backup herunter und setze das Log für einen sauberen Neustart zurück. Die übrige Besucher-Analytics bleibt davon unberührt.`}
                count={allTime}
                backupHref="/api/admin/analytics-backup?scope=assistant"
                action={resetAssistantLogAction}
            />
        </div>
    );
}
