import { getContentDb } from './db';
import { createShare } from './sharesStore';

// Bewerbungs- & Akquise-Radar (Phase 1): interne Listen potenzieller Arbeitgeber.
// Recherchieren/priorisieren ja – Versand immer von Hand. Fingerprinter (Phase 2)
// setzt später obendrauf.

export const COMPANY_TYPES = ['inhouse_shop', 'agentur', 'hersteller', 'dienstleister', 'unbekannt'];
export const OPP_TYPES = ['job_inhouse', 'job_agentur', 'initiativ', 'freelance'];
export const OPP_STATUS = ['neu', 'geprueft', 'shortlist', 'beworben', 'gespraech', 'angebot', 'absage', 'verworfen'];
export const PIPELINES = ['bewerbung', 'akquise'];
const BLOCK_MONTHS = 6; // „nicht billig machen": 6 Monate Sperre der anderen Pipeline

const csv = (s) => (s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
function normalizeDomain(input) {
    return (input || '').toString().trim().toLowerCase()
        .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
}

// ─── Firmen ───────────────────────────────────────────────────────────────

function companyFields(d) {
    const typ = COMPANY_TYPES.includes(d.typ) ? d.typ : 'unbekannt';
    const team = ['ja', 'nein', 'unklar'].includes(d.inhouse_team) ? d.inhouse_team : 'unklar';
    return {
        domain: normalizeDomain(d.domain),
        name: (d.name || '').trim(),
        rechtsform: (d.rechtsform || '').trim(),
        strasse: (d.strasse || '').trim(),
        plz: (d.plz || '').trim(),
        ort: (d.ort || '').trim(),
        region: (d.region || '').trim(),
        distanz_km: Math.max(0, parseInt(d.distanz_km, 10) || 0),
        typ,
        themengebiete: (d.themengebiete || '').trim(),
        inhouse_team: team,
        karriere_url: (d.karriere_url || '').trim(),
        linkedin_url: (d.linkedin_url || '').trim(),
        github_org: (d.github_org || '').trim(),
        notiz: (d.notiz || '').trim(),
        aktiv: d.aktiv ? 1 : 0,
        now: Date.now(),
    };
}

export function getCompanies({ q = '', typ = '', pipeline = '' } = {}) {
    const db = getContentDb();
    const where = ['1=1'];
    const p = {};
    if (q) { where.push('(c.name LIKE @q OR c.domain LIKE @q OR c.ort LIKE @q OR c.themengebiete LIKE @q)'); p.q = `%${q}%`; }
    if (typ) { where.push('c.typ = @typ'); p.typ = typ; }
    // Firmen-Filter „für Akquise/Bewerbung": nach Typ-Eignung + nicht gesperrt.
    const rows = db.prepare(`
        SELECT c.*,
            (SELECT COUNT(*) FROM radar_opportunities o WHERE o.company_id = c.id) AS opp_count,
            (SELECT plattform FROM radar_tech_snapshots s WHERE s.company_id = c.id ORDER BY erhoben_am DESC, id DESC LIMIT 1) AS plattform,
            (SELECT version FROM radar_tech_snapshots s WHERE s.company_id = c.id ORDER BY erhoben_am DESC, id DESC LIMIT 1) AS version,
            (SELECT version_eol FROM radar_tech_snapshots s WHERE s.company_id = c.id ORDER BY erhoben_am DESC, id DESC LIMIT 1) AS version_eol,
            (SELECT MAX(gesperrt_bis) FROM radar_outreach_blocks b WHERE b.company_id = c.id
                ${pipeline ? 'AND b.pipeline = @pipeline' : ''}) AS blocked_until
        FROM radar_companies c
        WHERE ${where.join(' AND ')}
        ORDER BY c.updated_at DESC, c.id DESC
    `).all(pipeline ? { ...p, pipeline } : p);
    const now = Date.now();
    return rows.map((r) => ({ ...r, blocked: !!(r.blocked_until && r.blocked_until > now) }));
}

export function getCompany(id) {
    const db = getContentDb();
    const c = db.prepare('SELECT * FROM radar_companies WHERE id = ?').get(Number(id));
    if (!c) return null;
    const opportunities = db.prepare('SELECT * FROM radar_opportunities WHERE company_id = ? ORDER BY created_at DESC, id DESC').all(c.id);
    const contacts = db.prepare('SELECT * FROM radar_contacts WHERE company_id = ? ORDER BY id').all(c.id);
    const blocks = db.prepare('SELECT * FROM radar_outreach_blocks WHERE company_id = ? ORDER BY gesperrt_bis DESC').all(c.id);
    return { ...c, opportunities, contacts, blocks };
}

export function createCompany(data) {
    const db = getContentDb();
    const f = companyFields(data);
    return db.prepare(`
        INSERT INTO radar_companies (domain, name, rechtsform, strasse, plz, ort, region, distanz_km, typ,
            themengebiete, inhouse_team, karriere_url, linkedin_url, github_org, notiz, aktiv, created_at, updated_at)
        VALUES (@domain, @name, @rechtsform, @strasse, @plz, @ort, @region, @distanz_km, @typ,
            @themengebiete, @inhouse_team, @karriere_url, @linkedin_url, @github_org, @notiz, @aktiv, @now, @now)
    `).run(f).lastInsertRowid;
}

export function updateCompany(id, data) {
    const f = companyFields(data);
    getContentDb().prepare(`
        UPDATE radar_companies SET domain=@domain, name=@name, rechtsform=@rechtsform, strasse=@strasse,
            plz=@plz, ort=@ort, region=@region, distanz_km=@distanz_km, typ=@typ, themengebiete=@themengebiete,
            inhouse_team=@inhouse_team, karriere_url=@karriere_url, linkedin_url=@linkedin_url,
            github_org=@github_org, notiz=@notiz, aktiv=@aktiv, updated_at=@now WHERE id=@id
    `).run({ id: Number(id), ...f });
}

export function deleteCompany(id) {
    const db = getContentDb();
    db.transaction(() => {
        db.prepare('DELETE FROM radar_opportunities WHERE company_id = ?').run(Number(id));
        db.prepare('DELETE FROM radar_contacts WHERE company_id = ?').run(Number(id));
        db.prepare('DELETE FROM radar_outreach_blocks WHERE company_id = ?').run(Number(id));
        db.prepare('DELETE FROM radar_companies WHERE id = ?').run(Number(id));
    })();
}

// ─── Chancen ────────────────────────────────────────────────────────────────

function oppFields(d) {
    const typ = OPP_TYPES.includes(d.typ) ? d.typ : 'initiativ';
    // Pipeline hängt NUR an der Art der Chance, nicht am Firmentyp: nur Freelance
    // ist Akquise. Eine Festanstellung bei einer Agentur ist eine Bewerbung.
    const pipeline = typ === 'freelance' ? 'akquise' : 'bewerbung';
    const status = OPP_STATUS.includes(d.status) ? d.status : 'neu';
    return {
        company_id: Number(d.company_id) || 0,
        typ,
        pipeline,
        titel: (d.titel || '').trim(),
        quell_url: (d.quell_url || '').trim(),
        quelle: (d.quelle || 'manuell').trim(),
        veroeffentlicht_am: (d.veroeffentlicht_am || '').trim(),
        frist: (d.frist || '').trim(),
        stunden_woche: (d.stunden_woche || '').trim(),
        remote_anteil: (d.remote_anteil || '').trim(),
        standort: (d.standort || '').trim(),
        gehalt_angabe: (d.gehalt_angabe || '').trim(),
        stack_erkannt: (d.stack_erkannt || '').trim(),
        status,
        verworfen_grund: (d.verworfen_grund || '').trim(),
        now: Date.now(),
    };
}

export function createOpportunity(data) {
    const db = getContentDb();
    const f = oppFields(data);
    return db.prepare(`
        INSERT INTO radar_opportunities (company_id, typ, pipeline, titel, quell_url, quelle, gefunden_am,
            veroeffentlicht_am, frist, stunden_woche, remote_anteil, standort, gehalt_angabe, stack_erkannt,
            status, verworfen_grund, created_at, updated_at)
        VALUES (@company_id, @typ, @pipeline, @titel, @quell_url, @quelle, @now,
            @veroeffentlicht_am, @frist, @stunden_woche, @remote_anteil, @standort, @gehalt_angabe, @stack_erkannt,
            @status, @verworfen_grund, @now, @now)
    `).run(f).lastInsertRowid;
}

export function getOpportunity(id) {
    return getContentDb().prepare('SELECT * FROM radar_opportunities WHERE id = ?').get(Number(id)) || null;
}

// Remote-Angabe der Chance → Freigabe-Arbeitsmodell.
function mapWorkModel(remote) {
    const s = (remote || '').toLowerCase();
    if (/remote/.test(s)) return 'remote';
    if (/hybrid/.test(s)) return 'hybrid';
    if (/vor ?ort|onsite|präsenz/.test(s)) return 'vor_ort';
    return '';
}

// One-Click: aus einer Chance eine vorbefüllte Freigabe (Anschreiben + Token-Link)
// erzeugen und mit der Chance verknüpfen. Idempotent — existiert bereits eine
// gültige Freigabe, wird deren ID zurückgegeben (kein Duplikat).
export function createShareFromOpportunity(oppId) {
    const db = getContentDb();
    const opp = getOpportunity(oppId);
    if (!opp) return null;

    // Bereits verknüpft und Freigabe existiert noch → wiederverwenden.
    if (opp.share_id) {
        const exists = db.prepare('SELECT id FROM shares WHERE id = ?').get(opp.share_id);
        if (exists) return { id: opp.share_id, existing: true };
    }

    const company = db.prepare('SELECT * FROM radar_companies WHERE id = ?').get(opp.company_id) || {};
    const contact = db.prepare("SELECT * FROM radar_contacts WHERE company_id = ? ORDER BY (name != '') DESC, ist_entscheider DESC, id LIMIT 1").get(opp.company_id) || {};

    const firma = company.name || company.domain || '';
    const purpose = opp.typ === 'initiativ' ? 'initiativ' : (opp.pipeline === 'akquise' ? 'sonstiges' : 'bewerbung');
    const title = [opp.titel, firma].filter(Boolean).join(' – ') || `Freigabe – ${firma || 'Unbenannt'}`;

    const { id, token } = createShare({
        title,
        purpose,
        company: firma,
        street: company.strasse || '',
        zip: company.plz || '',
        city: company.ort || '',
        contact: contact.name || '',
        position: opp.titel || '',
        work_model: mapWorkModel(opp.remote_anteil),
        skills: opp.stack_erkannt || '',
        website: company.domain ? `https://${company.domain}` : '',
        email: contact.email || '',
        job_ref: opp.quell_url || '',
        status: 'offen',
        is_active: 1,
    });

    db.prepare('UPDATE radar_opportunities SET share_id = ?, updated_at = ? WHERE id = ?').run(id, Date.now(), Number(oppId));
    return { id, token, existing: false };
}

export function setOpportunityStatus(id, status, grund = '') {
    if (!OPP_STATUS.includes(status)) return;
    getContentDb().prepare('UPDATE radar_opportunities SET status=?, verworfen_grund=?, updated_at=? WHERE id=?')
        .run(status, grund, Date.now(), Number(id));
}

export function deleteOpportunity(id) {
    getContentDb().prepare('DELETE FROM radar_opportunities WHERE id = ?').run(Number(id));
}

// Alle Chancen (für die Board-/Listenansicht), mit Firmenname.
export function getOpportunities({ pipeline = '', status = '' } = {}) {
    const where = ['1=1'];
    const p = {};
    if (pipeline) { where.push('o.pipeline = @pipeline'); p.pipeline = pipeline; }
    if (status) { where.push('o.status = @status'); p.status = status; }
    return getContentDb().prepare(`
        SELECT o.*, c.name AS firma, c.domain
        FROM radar_opportunities o JOIN radar_companies c ON c.id = o.company_id
        WHERE ${where.join(' AND ')}
        ORDER BY o.score_gesamt DESC, o.updated_at DESC
    `).all(p);
}

// ─── Kontakte ───────────────────────────────────────────────────────────────

export function addContact(data) {
    const now = Date.now();
    const loeschAm = now + 180 * 24 * 60 * 60 * 1000; // DSGVO: 6 Monate Löschfrist als Default
    return getContentDb().prepare(`
        INSERT INTO radar_contacts (company_id, name, rolle, email, telefon, linkedin_url, ist_entscheider,
            quelle, erhoben_am, loeschen_am, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(Number(data.company_id) || 0, (data.name || '').trim(), (data.rolle || '').trim(),
        (data.email || '').trim(), (data.telefon || '').trim(), (data.linkedin_url || '').trim(),
        data.ist_entscheider ? 1 : 0, (data.quelle || 'manuell').trim(), now, loeschAm, now).lastInsertRowid;
}

export function deleteContact(id) {
    getContentDb().prepare('DELETE FROM radar_contacts WHERE id = ?').run(Number(id));
}

// ─── Doppelansprache-Sperre ──────────────────────────────────────────────────

export function isBlocked(companyId, pipeline) {
    const row = getContentDb().prepare(
        'SELECT MAX(gesperrt_bis) AS b FROM radar_outreach_blocks WHERE company_id = ? AND pipeline = ?',
    ).get(Number(companyId), pipeline);
    return !!(row && row.b && row.b > Date.now());
}

// Sperre die JEWEILS ANDERE Pipeline für 6 Monate (Bewerbung ↔ Akquise).
export function addOutreachBlock(companyId, ownPipeline, grund = '') {
    const other = ownPipeline === 'akquise' ? 'bewerbung' : 'akquise';
    const bis = Date.now() + BLOCK_MONTHS * 30 * 24 * 60 * 60 * 1000;
    getContentDb().prepare(
        'INSERT INTO radar_outreach_blocks (company_id, pipeline, grund, gesperrt_bis, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(Number(companyId), other, grund || `Kontakt via ${ownPipeline}`, bis, Date.now());
}

// ─── Fingerprint speichern (Phase 2) ─────────────────────────────────────────

export function getCompanyByDomain(domain) {
    return getContentDb().prepare('SELECT * FROM radar_companies WHERE domain = ?').get((domain || '').toLowerCase()) || null;
}

export function getLatestSnapshot(companyId) {
    return getContentDb().prepare('SELECT * FROM radar_tech_snapshots WHERE company_id = ? ORDER BY erhoben_am DESC, id DESC LIMIT 1').get(Number(companyId)) || null;
}

export function getFindings(companyId) {
    return getContentDb().prepare('SELECT * FROM radar_findings WHERE company_id = ? ORDER BY id DESC').all(Number(companyId));
}

// Speichert ein Fingerprint-Ergebnis. `typ` = Nutzerwahl (inhouse_shop|agentur).
// Firma wird per Domain upgesertet; Snapshot + Findings werden versioniert
// hinzugefügt (alte Findings der Firma ersetzt).
export function saveFingerprint(result, typ) {
    const db = getContentDb();
    const now = Date.now();
    const r = result;
    const companyType = COMPANY_TYPES.includes(typ) ? typ : 'unbekannt';

    const save = db.transaction(() => {
        let company = getCompanyByDomain(r.company.domain);
        if (company) {
            // Auto-Felder ergänzen, ohne manuelle Angaben zu überschreiben.
            db.prepare(`UPDATE radar_companies SET
                name = CASE WHEN name='' THEN @name ELSE name END,
                rechtsform = CASE WHEN rechtsform='' THEN @rechtsform ELSE rechtsform END,
                plz = CASE WHEN plz='' THEN @plz ELSE plz END,
                ort = CASE WHEN ort='' THEN @ort ELSE ort END,
                typ = @typ, inhouse_team = @inhouse_team,
                karriere_url = CASE WHEN karriere_url='' THEN @karriere_url ELSE karriere_url END,
                linkedin_url = CASE WHEN linkedin_url='' THEN @linkedin_url ELSE linkedin_url END,
                github_org = CASE WHEN github_org='' THEN @github_org ELSE github_org END,
                updated_at=@now WHERE id=@id`).run({
                id: company.id, name: r.company.name || '', rechtsform: r.company.rechtsform || '',
                plz: r.company.plz || '', ort: r.company.ort || '', typ: companyType,
                inhouse_team: r.company.inhouse_team || 'unklar', karriere_url: r.company.karriere_url || '',
                linkedin_url: r.company.linkedin_url || '', github_org: r.company.github_org || '', now,
            });
        } else {
            const id = createCompany({ ...r.company, typ: companyType, aktiv: 1 });
            company = { id };
        }

        db.prepare(`INSERT INTO radar_tech_snapshots
            (company_id, erhoben_am, plattform, plattform_confidence, version, version_eol, frontend,
             theme_typ, agentur_credit, eigene_namespaces, server_header, security_header, belege)
            VALUES (@company_id, @now, @plattform, @conf, @version, @eol, @frontend, @theme, @credit, @ns, @server, @sec, @belege)`)
            .run({
                company_id: company.id, now, plattform: r.snapshot.plattform, conf: r.snapshot.plattform_confidence,
                version: r.snapshot.version, eol: r.snapshot.version_eol ? 1 : 0, frontend: r.snapshot.frontend,
                theme: r.snapshot.theme_typ, credit: r.snapshot.agentur_credit, ns: r.snapshot.eigene_namespaces,
                server: r.snapshot.server_header, sec: r.snapshot.security_header, belege: r.snapshot.belege,
            });
        const snapId = db.prepare('SELECT last_insert_rowid() AS id').get().id;

        db.prepare('DELETE FROM radar_findings WHERE company_id = ? AND quelle = ?').run(company.id, 'automatisch');
        const insF = db.prepare(`INSERT INTO radar_findings (company_id, snapshot_id, typ, schwere, titel, beschreibung, beleg_url, verwendbar_als, quelle, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatisch', ?)`);
        for (const f of (r.findings || [])) insF.run(company.id, snapId, f.typ, f.schwere, f.titel, f.beschreibung, f.beleg_url, f.verwendbar_als, now);

        if (r.contact && r.contact.email) {
            const exists = db.prepare('SELECT 1 FROM radar_contacts WHERE company_id = ? AND email = ?').get(company.id, r.contact.email);
            if (!exists) addContact({ company_id: company.id, email: r.contact.email, quelle: 'impressum' });
        }
        return company.id;
    });
    return save();
}

// ─── Scoring (regelbasiert, hinter stabiler Schnittstelle) ───────────────────
// Später austauschbar/ergänzbar durch ein LLM-API: gleiche Rückgabe-Struktur
// { score_gesamt, teilscores, begruendung }.

const MY_STACK = ['shopware', 'shopware 6', 'php', 'symfony', 'twig', 'javascript', 'typescript', 'react', 'next', 'next.js', 'vue', 'node', 'docker'];

export function scoreOpportunity(opp, company) {
    const stack = csv(opp.stack_erkannt).map((s) => s.toLowerCase());
    const treffer = stack.filter((s) => MY_STACK.some((m) => s.includes(m) || m.includes(s)));
    const luecken = stack.filter((s) => !treffer.includes(s));

    const fachlich = stack.length ? Math.round((treffer.length / stack.length) * 100) : (/shopware/i.test(company?.themengebiete || '') ? 60 : 40);
    const remote = /remote|hybrid/i.test(opp.remote_anteil || '') ? 100 : (opp.remote_anteil ? 40 : 50);
    const stundenNum = parseInt(opp.stunden_woche, 10) || 0;
    const stunden = stundenNum ? (stundenNum >= 20 && stundenNum <= 32 ? 100 : (stundenNum <= 40 ? 60 : 30)) : 50;
    const branche = /shopware|e-?commerce|shop/i.test(`${company?.themengebiete} ${opp.titel}`) ? 90 : 50;
    const entfernung = company?.distanz_km ? (company.distanz_km <= 80 ? 100 : company.distanz_km <= 150 ? 60 : 30) : 50;

    const teilscores = { fachlich, remote, stunden, branche, entfernung };
    const score_gesamt = Math.round((fachlich * 0.35 + branche * 0.25 + remote * 0.2 + stunden * 0.1 + entfernung * 0.1));
    const begruendung = `Stack-Passung ${fachlich}%${treffer.length ? ` (u. a. ${treffer.slice(0, 3).join(', ')})` : ''}; ${remote >= 100 ? 'remote/hybrid möglich' : 'Remote unklar'}; ${entfernung >= 60 ? 'pendelbar' : 'weit entfernt'}.`;

    return { score_gesamt, teilscores, treffer, luecken, begruendung };
}

// Score in die DB schreiben (nach Anlage/Änderung einer Chance aufrufbar).
export function rescoreOpportunity(id) {
    const db = getContentDb();
    const o = db.prepare('SELECT * FROM radar_opportunities WHERE id = ?').get(Number(id));
    if (!o) return;
    const c = db.prepare('SELECT * FROM radar_companies WHERE id = ?').get(o.company_id);
    const r = scoreOpportunity(o, c);
    db.prepare('UPDATE radar_opportunities SET score_gesamt=?, teilscores=?, match_treffer=?, match_luecken=?, begruendung=?, updated_at=? WHERE id=?')
        .run(r.score_gesamt, JSON.stringify(r.teilscores), r.treffer.join(', '), r.luecken.join(', '), r.begruendung, Date.now(), Number(id));
}
