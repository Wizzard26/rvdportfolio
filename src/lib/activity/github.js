// Liest die Beitrags-Aktivität eines GitHub-Accounts über die GraphQL-API.
//
// Schlüssel für die Privatsphäre: Mit dem eigenen Token abgefragt, liefert
// `viewer.contributionsCollection` den Beitragskalender INKLUSIVE privater
// Beiträge — aber nur als Tages-Zahlen, ohne Repo-Namen oder Details. Wir fragen
// bewusst KEINE repo-bezogenen Felder ab; der Private-Status bleibt gewahrt.
//
// Token: klassischer PAT mit Scope `read:user` genügt (kein `repo` nötig).

const GQL = `query($from:DateTime!,$to:DateTime!){
  viewer {
    contributionsCollection(from:$from,to:$to){
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

export async function fetchGithubCalendar({ user, token }, { from, to }) {
    if (!token) return null;
    try {
        const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'rvdportfolio-activity',
            },
            body: JSON.stringify({ query: GQL, variables: { from: from.toISOString(), to: to.toISOString() } }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        const cal = json?.data?.viewer?.contributionsCollection?.contributionCalendar;
        if (!cal) return null;
        const days = cal.weeks.flatMap((w) =>
            w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
        );
        return { label: `GitHub · ${user}`, days, total: cal.totalContributions };
    } catch {
        return null; // Netzwerk-/Token-Fehler: Account still überspringen
    }
}
