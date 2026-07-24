// Liest die Aktivität eines GitLab-Accounts über die Events-API.
//
// Mit dem eigenen Token authentifiziert liefert `/events` die eigenen
// Aktivitäten INKLUSIVE privater — wir zählen nur pro Tag (created_at), ohne
// Projekt-/Repo-Bezug. Funktioniert für gitlab.com und self-hosted (base).
//
// Token: `read_api` (bzw. `read_user`).

export async function fetchGitlabCalendar({ user, token, base = 'https://gitlab.com' }, { from }) {
    if (!token) return null;
    const after = from.toISOString().slice(0, 10); // YYYY-MM-DD (Events NACH diesem Tag)
    const counts = {};
    try {
        // Paginieren, bis keine Events mehr kommen (Deckel als Sicherheitsnetz).
        for (let page = 1; page <= 30; page += 1) {
            const url = `${base}/api/v4/events?after=${after}&per_page=100&page=${page}`;
            const res = await fetch(url, { headers: { 'PRIVATE-TOKEN': token } });
            if (!res.ok) break;
            const events = await res.json();
            if (!Array.isArray(events) || events.length === 0) break;
            for (const ev of events) {
                const d = (ev.created_at || '').slice(0, 10);
                if (d) counts[d] = (counts[d] || 0) + 1;
            }
            if (events.length < 100) break;
        }
    } catch {
        return null;
    }
    const days = Object.entries(counts).map(([date, count]) => ({ date, count }));
    const total = days.reduce((sum, d) => sum + d.count, 0);
    return { label: `GitLab · ${user}`, days, total };
}
