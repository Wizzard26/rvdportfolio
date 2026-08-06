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

export function getCompanies({ q = '', typ = '', pipeline = '', sort = 'prio', status = 'aktiv' } = {}) {
    const db = getContentDb();
    const where = ['1=1'];
    const p = {};
    if (q) { where.push('(c.name LIKE @q OR c.domain LIKE @q OR c.ort LIKE @q OR c.themengebiete LIKE @q)'); p.q = `%${q}%`; }
    if (typ) { where.push('c.typ = @typ'); p.typ = typ; }
    if (status === 'aktiv') where.push('c.aktiv = 1');
    else if (status === 'verworfen') where.push("c.verworfen_grund != ''");
    const order = sort === 'prio' ? 'c.prio_score DESC, c.updated_at DESC' : 'c.updated_at DESC, c.id DESC';
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
        ORDER BY ${order}
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
    // Dedupe: gleiche Domain wird nie doppelt angelegt (egal ob manuell, Import,
    // Scan oder CC-Discovery) — bestehende Firma auffüllen und deren ID zurückgeben.
    if (f.domain) {
        const existing = getCompanyByDomain(f.domain);
        if (existing) {
            db.prepare(`UPDATE radar_companies SET
                name=CASE WHEN name='' THEN @name ELSE name END,
                rechtsform=CASE WHEN rechtsform='' THEN @rechtsform ELSE rechtsform END,
                strasse=CASE WHEN strasse='' THEN @strasse ELSE strasse END,
                plz=CASE WHEN plz='' THEN @plz ELSE plz END,
                ort=CASE WHEN ort='' THEN @ort ELSE ort END,
                region=CASE WHEN region='' THEN @region ELSE region END,
                themengebiete=CASE WHEN themengebiete='' THEN @themengebiete ELSE themengebiete END,
                karriere_url=CASE WHEN karriere_url='' THEN @karriere_url ELSE karriere_url END,
                linkedin_url=CASE WHEN linkedin_url='' THEN @linkedin_url ELSE linkedin_url END,
                github_org=CASE WHEN github_org='' THEN @github_org ELSE github_org END,
                notiz=CASE WHEN notiz='' THEN @notiz ELSE notiz END,
                updated_at=@now WHERE id=@id`).run({ id: existing.id, ...f });
            return existing.id;
        }
    }
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
    const cid = Number(id);
    db.transaction(() => {
        db.prepare('DELETE FROM radar_opportunities WHERE company_id = ?').run(cid);
        db.prepare('DELETE FROM radar_contacts WHERE company_id = ?').run(cid);
        db.prepare('DELETE FROM radar_outreach_blocks WHERE company_id = ?').run(cid);
        db.prepare('DELETE FROM radar_tech_snapshots WHERE company_id = ?').run(cid);
        db.prepare('DELETE FROM radar_findings WHERE company_id = ?').run(cid);
        db.prepare('DELETE FROM radar_companies WHERE id = ?').run(cid);
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

// Phase 3A: extrahierte Stellen einer Karriereseite als Chancen-Entwürfe anlegen.
// Dedupe gegen bestehende Titel derselben Firma; Typ folgt dem Firmentyp (Agentur
// → Agenturstelle, sonst Inhouse-Stelle) und ist danach je Chance änderbar.
export function importCareerJobs(companyId, jobs) {
    const db = getContentDb();
    const c = db.prepare('SELECT typ FROM radar_companies WHERE id = ?').get(Number(companyId));
    if (!c) return { added: 0, skipped: 0 };
    const typ = c.typ === 'agentur' ? 'job_agentur' : 'job_inhouse';
    const existing = new Set(
        db.prepare('SELECT titel FROM radar_opportunities WHERE company_id = ?').all(Number(companyId))
            .map((r) => (r.titel || '').toLowerCase().trim()),
    );
    let added = 0; let skipped = 0;
    for (const j of (jobs || [])) {
        const t = (j.titel || '').trim();
        if (!t) { skipped += 1; continue; }
        if (existing.has(t.toLowerCase())) { skipped += 1; continue; }
        existing.add(t.toLowerCase());
        const id = createOpportunity({
            company_id: companyId, typ, titel: t,
            quell_url: j.url || '', quelle: 'karriereseite', standort: j.standort || '',
        });
        rescoreOpportunity(id);
        added += 1;
    }
    return { added, skipped };
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

    // Akquise: einen technischen Aufhänger (z. B. EOL-Version) als Gesprächseinstieg
    // vorbefüllen. Bei Bewerbungen bewusst leer — der „Warum ihr"-Satz bleibt persönlich.
    let motivation = '';
    if (opp.pipeline === 'akquise') {
        const hook = db.prepare("SELECT beschreibung FROM radar_findings WHERE company_id = ? AND verwendbar_als = 'akquise_aufhaenger' ORDER BY CASE schwere WHEN 'hoch' THEN 0 WHEN 'mittel' THEN 1 ELSE 2 END, id DESC LIMIT 1").get(opp.company_id);
        if (hook && hook.beschreibung) {
            motivation = `Beim Blick auf ${firma || 'Ihren Shop'} ist mir aufgefallen: ${hook.beschreibung} Genau hier kann ich mit meiner Shopware-Erfahrung unterstützen.`;
        }
    }

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
        motivation,
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

// Art. 14 DSGVO: Informationspflicht beim Erstkontakt als erledigt/offen markieren.
export function markArt14Sent(id, sent) {
    getContentDb().prepare('UPDATE radar_contacts SET art14_info_gesendet_am = ? WHERE id = ?')
        .run(sent ? Date.now() : 0, Number(id));
}

// DSGVO-Löschfristen: Kontakte, deren Frist erreicht ist oder in `withinDays` fällt
// (inkl. Firmenname für die Übersicht). Ohne Cron im Projekt = manuelle Sichtliste.
export function getContactsDueForDeletion(withinDays = 14) {
    const grenze = Date.now() + withinDays * 24 * 60 * 60 * 1000;
    return getContentDb().prepare(`
        SELECT k.*, c.name AS company_name, c.domain AS company_domain
        FROM radar_contacts k JOIN radar_companies c ON c.id = k.company_id
        WHERE k.loeschen_am > 0 AND k.loeschen_am <= ?
        ORDER BY k.loeschen_am ASC
    `).all(grenze);
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
    return getContentDb().prepare('SELECT * FROM radar_companies WHERE domain = ?').get(normalizeDomain(domain)) || null;
}

export function getLatestSnapshot(companyId) {
    return getContentDb().prepare('SELECT * FROM radar_tech_snapshots WHERE company_id = ? ORDER BY erhoben_am DESC, id DESC LIMIT 1').get(Number(companyId)) || null;
}

export function getFindings(companyId) {
    return getContentDb().prepare('SELECT * FROM radar_findings WHERE company_id = ? ORDER BY id DESC').all(Number(companyId));
}

// Gemeinsame Persistenz-Helfer (von saveFingerprint, Import und Re-Scan genutzt).
function insertSnapshot(db, companyId, s, now) {
    db.prepare(`INSERT INTO radar_tech_snapshots
        (company_id, erhoben_am, plattform, plattform_confidence, version, version_eol, frontend,
         theme_typ, agentur_credit, eigene_namespaces, server_header, security_header, belege)
        VALUES (@company_id, @now, @plattform, @conf, @version, @eol, @frontend, @theme, @credit, @ns, @server, @sec, @belege)`)
        .run({
            company_id: companyId, now, plattform: s.plattform || 'unbekannt', conf: s.plattform_confidence || 0,
            version: s.version || '', eol: s.version_eol ? 1 : 0, frontend: s.frontend || 'unklar',
            theme: s.theme_typ || '', credit: s.agentur_credit || '', ns: s.eigene_namespaces || '',
            server: s.server_header || '', sec: s.security_header || '', belege: s.belege || '',
        });
    return db.prepare('SELECT last_insert_rowid() AS id').get().id;
}
function replaceAutoFindings(db, companyId, snapshotId, findings, now) {
    db.prepare('DELETE FROM radar_findings WHERE company_id = ? AND quelle = ?').run(companyId, 'automatisch');
    const insF = db.prepare(`INSERT INTO radar_findings (company_id, snapshot_id, typ, schwere, titel, beschreibung, beleg_url, verwendbar_als, quelle, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatisch', ?)`);
    for (const f of (findings || [])) insF.run(companyId, snapshotId, f.typ, f.schwere, f.titel, f.beschreibung, f.beleg_url || '', f.verwendbar_als || 'gespraechsthema', now);
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

        const snapId = insertSnapshot(db, company.id, r.snapshot, now);
        replaceAutoFindings(db, company.id, snapId, r.findings, now);

        if (r.contact && r.contact.email) {
            const exists = db.prepare('SELECT 1 FROM radar_contacts WHERE company_id = ? AND email = ?').get(company.id, r.contact.email);
            if (!exists) addContact({ company_id: company.id, email: r.contact.email, quelle: 'impressum' });
        }
        updateLeadScore(db, company.id);
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

// ─── Lead-Priorisierung („lohnt sich") ───────────────────────────────────────
// Firmen-Ebene, unabhängig vom Chancen-Scoring: wen zuerst angehen? SW5/EOL =
// größter Migrations-Aufhänger; Tech-Spend = Investitionsbereitschaft; Umsatz =
// Größe/Budget. Zahlen sind externe Schätzungen → nur grob, als Tier.
export function scoreCompanyLead(company, snapshot, hasContact = false) {
    const plat = (snapshot?.plattform || '').toLowerCase();
    const spend = Number(company?.tech_spend_est) || 0;
    const rev = Number(company?.umsatz_est) || 0;
    let score = 0; const g = [];
    if (plat === 'shopware5') { score += 40; g.push('SW5/EOL – Migrationschance'); }
    else if (plat === 'shopware6') { score += 25; g.push('Shopware 6'); }
    else if (plat.startsWith('shopware')) { score += 20; g.push('Shopware'); }
    else if (plat && plat !== 'unbekannt') { score += 5; g.push(`Fremdsystem (${plat})`); }
    else { score += 10; }
    if (spend >= 8000) { score += 25; g.push('hoher Tech-Spend'); }
    else if (spend >= 3000) { score += 15; g.push('mittlerer Tech-Spend'); }
    else if (spend > 0) { score += 8; }
    if (rev >= 50000) { score += 20; g.push('großer Shop'); }
    else if (rev >= 10000) { score += 12; }
    else if (rev > 0) { score += 6; }
    if (hasContact) { score += 8; g.push('Kontakt vorhanden'); }
    if (rev === 0 && spend < 1000) { score -= 15; g.push('Karteileiche-Verdacht'); }
    score = Math.max(0, Math.min(100, score));
    return { score, grund: g.join(' · ') };
}

// Prio je Firma neu berechnen und speichern (nach Import/Scan/Re-Scan).
function updateLeadScore(db, companyId) {
    const c = db.prepare('SELECT * FROM radar_companies WHERE id = ?').get(companyId);
    if (!c) return;
    const snap = db.prepare('SELECT * FROM radar_tech_snapshots WHERE company_id = ? ORDER BY erhoben_am DESC, id DESC LIMIT 1').get(companyId);
    const contactCount = db.prepare('SELECT COUNT(*) n FROM radar_contacts WHERE company_id = ?').get(companyId).n;
    let { score, grund } = scoreCompanyLead(c, snap, contactCount > 0);
    if (!c.aktiv || (c.verworfen_grund || '').trim()) { score = 0; grund = c.verworfen_grund || 'inaktiv'; }
    db.prepare('UPDATE radar_companies SET prio_score = ?, prio_grund = ? WHERE id = ?').run(score, grund, companyId);
}

// ─── BuiltWith-CSV-Import ─────────────────────────────────────────────────────
// RFC-4180-toleranter Parser (gequotete Felder, „" als Escape, BOM, CRLF).
function parseCsv(text) {
    const s = (text || '').replace(/^﻿/, '');
    const rows = []; let row = []; let field = ''; let inQ = false; let i = 0;
    while (i < s.length) {
        const ch = s[i];
        if (inQ) {
            if (ch === '"') { if (s[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
            field += ch; i++; continue;
        }
        if (ch === '"') { inQ = true; i++; continue; }
        if (ch === ',') { row.push(field); field = ''; i++; continue; }
        if (ch === '\r') { i++; continue; }
        if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
        field += ch; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
}

export function parseBuiltWithCsv(text) {
    const rows = parseCsv(text).filter((r) => r.some((c) => (c || '').trim()));
    if (rows.length < 2) return [];
    const header = rows[0].map((h) => (h || '').trim());
    return rows.slice(1).map((cells) => {
        const o = {}; header.forEach((h, i) => { o[h] = (cells[i] || '').trim(); }); return o;
    });
}

const moneyToInt = (s) => { const n = parseInt((s || '').replace(/[^0-9]/g, ''), 10); return Number.isFinite(n) ? n : 0; };

function mapBuiltWith(o) {
    const domain = normalizeDomain(o['Root Domain'] || o['Primary Domain'] || '');
    const ecom = (o['eCommerce Platform'] || '').toLowerCase();
    const hasShopify = /shopify/.test(ecom);
    let plattform = 'unbekannt'; let version = ''; let eol = 0;
    if (/shopware 6/.test(ecom)) { plattform = 'shopware6'; version = '6'; }
    else if (/shopware 5/.test(ecom)) { plattform = 'shopware5'; version = '5'; eol = 1; }
    else if (/shopware/.test(ecom)) { plattform = 'shopware'; }
    // Stadt-Feld ist teils Impressum-Schrott (€, „:", lange Strings) → verwerfen.
    const cityRaw = (o['City'] || '').trim();
    const ort = (/[€:]|\d{3,}/.test(cityRaw) || cityRaw.length > 40) ? '' : cityRaw;
    const email = ((o['Emails'] || '').split(/[;,\s]+/).find((x) => /@/.test(x)) || '').trim();
    const phone = ((o['Telephones'] || '').split(/[;]+/)[0] || '').trim();
    const vert = (o['Vertical'] || '').trim();
    const themen = [vert && vert !== 'Unknown' ? vert : '', o['Payment Platforms'] ? `Payment: ${o['Payment Platforms']}` : '']
        .filter(Boolean).join(' · ');
    return {
        domain, name: (o['Company'] || '').trim(), ort, plz: (o['Zip'] || '').trim(), region: (o['State'] || '').trim(),
        linkedin_url: (o['LinkedIn'] || '').trim(), themengebiete: themen,
        umsatz_est: moneyToInt(o['Sales Revenue']), tech_spend_est: moneyToInt(o['Technology Spend']),
        extern_gesehen: (o['Last Found'] || '').trim(), email, phone,
        plattform, version, eol, hasShopify, ecomRaw: (o['eCommerce Platform'] || '').trim(),
    };
}

// Import einer BuiltWith-CSV: legt/aktualisiert Firmen (dedupe per Domain), setzt
// externe Kennzahlen, einen extern belegten Tech-Snapshot (+ EOL-/Shopify-Finding)
// und den Kontakt; berechnet je Firma die Lead-Prio. Kein Crawling.
export function importBuiltWith(rows) {
    const db = getContentDb();
    const now = Date.now();
    let created = 0; let updated = 0; let skipped = 0; let contactsAdded = 0; let sw5 = 0; let sw6 = 0; let shopify = 0;
    const run = db.transaction(() => {
        for (const raw of rows) {
            const m = mapBuiltWith(raw);
            if (!m.domain) { skipped += 1; continue; }
            let company = getCompanyByDomain(m.domain);
            if (company) {
                db.prepare(`UPDATE radar_companies SET
                    name = CASE WHEN name='' THEN @name ELSE name END,
                    plz = CASE WHEN plz='' THEN @plz ELSE plz END,
                    ort = CASE WHEN ort='' THEN @ort ELSE ort END,
                    region = CASE WHEN region='' THEN @region ELSE region END,
                    linkedin_url = CASE WHEN linkedin_url='' THEN @linkedin ELSE linkedin_url END,
                    themengebiete = CASE WHEN themengebiete='' THEN @themen ELSE themengebiete END,
                    umsatz_est=@umsatz, tech_spend_est=@spend, extern_gesehen=@seen,
                    quelle = CASE WHEN quelle='manuell' THEN 'builtwith' ELSE quelle END,
                    updated_at=@now WHERE id=@id`).run({
                    id: company.id, name: m.name, plz: m.plz, ort: m.ort, region: m.region, linkedin: m.linkedin_url,
                    themen: m.themengebiete, umsatz: m.umsatz_est, spend: m.tech_spend_est, seen: m.extern_gesehen, now,
                });
                updated += 1;
            } else {
                const id = createCompany({
                    domain: m.domain, name: m.name, plz: m.plz, ort: m.ort, region: m.region,
                    linkedin_url: m.linkedin_url, themengebiete: m.themengebiete, typ: 'inhouse_shop', aktiv: 1,
                });
                db.prepare('UPDATE radar_companies SET quelle=?, umsatz_est=?, tech_spend_est=?, extern_gesehen=? WHERE id=?')
                    .run('builtwith', m.umsatz_est, m.tech_spend_est, m.extern_gesehen, id);
                company = { id };
                created += 1;
            }
            const belege = JSON.stringify([{ signal: 'BuiltWith-Import', beleg: m.ecomRaw }]);
            const snapId = insertSnapshot(db, company.id, {
                plattform: m.plattform, plattform_confidence: 0.4, version: m.version, version_eol: m.eol,
                frontend: 'unklar', belege,
            }, now);
            const findings = [];
            if (m.eol) findings.push({ typ: 'eol_version', schwere: 'hoch', titel: 'Shopware 5 (EOL)', beschreibung: 'Laut Datenquelle Shopware 5 — ohne Sicherheitsupdates. Migrations-Aufhänger; per Re-Scan live verifizieren.', beleg_url: `https://${m.domain}`, verwendbar_als: 'akquise_aufhaenger' });
            if (m.hasShopify) findings.push({ typ: 'plattformwechsel', schwere: 'mittel', titel: 'Shopify im Tech-Stack', beschreibung: 'Datenquelle sieht auch Shopify — evtl. von Shopware weg-migriert. Live-Plattform per Re-Scan prüfen.', beleg_url: `https://${m.domain}`, verwendbar_als: 'intern_nur' });
            replaceAutoFindings(db, company.id, snapId, findings, now);
            if (m.eol) sw5 += 1;
            if (m.plattform === 'shopware6') sw6 += 1;
            if (m.hasShopify) shopify += 1;
            if (m.email) {
                const exists = db.prepare('SELECT 1 FROM radar_contacts WHERE company_id = ? AND email = ?').get(company.id, m.email);
                if (!exists) { addContact({ company_id: company.id, email: m.email, telefon: m.phone, quelle: 'builtwith' }); contactsAdded += 1; }
            }
            updateLeadScore(db, company.id);
        }
    });
    run();
    return { created, updated, skipped, contactsAdded, sw5, sw6, shopify, total: created + updated };
}

// ─── Discovery-Treffer speichern (Common Crawl u. Ä.) ────────────────────────
// Legt/aktualisiert eine Firma (dedupe per Domain), schreibt einen quellenbelegten
// Snapshot + Findings und berechnet die Lead-Prio. Kein Live-Request nötig.
export function saveDiscovery(domain, snapshot, findings = [], source = 'commoncrawl') {
    const dom = normalizeDomain(domain);
    if (!dom) return null;
    const db = getContentDb();
    const now = Date.now();
    return db.transaction(() => {
        let company = getCompanyByDomain(dom);
        let id;
        if (company) {
            id = company.id;
            db.prepare("UPDATE radar_companies SET quelle = CASE WHEN quelle='manuell' THEN ? ELSE quelle END, updated_at=? WHERE id=?").run(source, now, id);
        } else {
            id = createCompany({ domain: dom, typ: 'inhouse_shop', aktiv: 1 });
            db.prepare('UPDATE radar_companies SET quelle=? WHERE id=?').run(source, id);
        }
        const snapId = insertSnapshot(db, id, {
            plattform: snapshot.plattform, plattform_confidence: snapshot.plattform_confidence || 0.6,
            version: snapshot.version || '', version_eol: snapshot.version_eol || 0,
            frontend: snapshot.frontend || 'unklar', belege: snapshot.belege || '',
        }, now);
        replaceAutoFindings(db, id, snapId, findings, now);
        updateLeadScore(db, id);
        return id;
    })();
}

// ─── Domain-/URL-Listen-Import (z. B. PublicWWW-Marker-Export) ────────────────
// Robust: extrahiert Domain-Token aus beliebigem Text (CSV/Zeilen/Paste), egal ob
// volle URLs, mit Header oder Kommas. Normalisiert + dedupliziert.
export function parseDomainList(text) {
    const out = [];
    for (const tok of (text || '').split(/[\s,;"'<>()[\]]+/)) {
        const dom = normalizeDomain(tok);
        if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(dom)) out.push(dom);
    }
    return [...new Set(out)];
}

// Legt aus einer Domainliste Firmen an (dedupe per Domain). Optionaler Plattform-
// Hinweis (aus dem gesuchten Marker: SW6 = /bundles/storefront/, SW5 = engine/
// Shopware) → schwacher Snapshot (Confidence 0.3), den der Re-Scan verifiziert.
export function importDomainList(domains, { plattformHint = '', source = 'liste' } = {}) {
    const db = getContentDb();
    const now = Date.now();
    const plat = ['shopware6', 'shopware5', 'shopify'].includes(plattformHint) ? plattformHint : '';
    let created = 0; let updated = 0; let skipped = 0;
    const seen = new Set();
    const run = db.transaction(() => {
        for (const raw of domains) {
            const dom = normalizeDomain(raw);
            if (!dom || seen.has(dom)) { skipped += 1; continue; }
            seen.add(dom);
            const before = getCompanyByDomain(dom);
            let id;
            if (before) {
                id = before.id;
                db.prepare("UPDATE radar_companies SET quelle = CASE WHEN quelle='manuell' THEN ? ELSE quelle END, updated_at=? WHERE id=?").run(source, now, id);
                updated += 1;
            } else {
                id = createCompany({ domain: dom, typ: 'inhouse_shop', aktiv: 1 });
                db.prepare('UPDATE radar_companies SET quelle=? WHERE id=?').run(source, id);
                created += 1;
            }
            if (plat) {
                const belege = JSON.stringify([{ signal: 'Marker-Liste', beleg: source }]);
                const snapId = insertSnapshot(db, id, {
                    plattform: plat, plattform_confidence: 0.3,
                    version: plat === 'shopware6' ? '6' : plat === 'shopware5' ? '5' : '',
                    version_eol: plat === 'shopware5' ? 1 : 0, frontend: 'unklar', belege,
                }, now);
                const findings = plat === 'shopware5'
                    ? [{ typ: 'eol_version', schwere: 'hoch', titel: 'Shopware 5 (EOL)', beschreibung: 'Aus Marker-Liste als Shopware 5 gelistet — per Re-Scan live verifizieren; Migrations-Aufhänger.', beleg_url: `https://${dom}`, verwendbar_als: 'akquise_aufhaenger' }]
                    : [];
                replaceAutoFindings(db, id, snapId, findings, now);
            }
            updateLeadScore(db, id);
        }
    });
    run();
    return { created, updated, skipped, total: created + updated };
}

// ─── Batch-Re-Scan ───────────────────────────────────────────────────────────
export function getCompaniesToRescan({ limit = 5, mode = 'unscanned' } = {}) {
    const db = getContentDb();
    const where = ["domain != ''"];
    if (mode === 'unscanned') where.push('last_scan = 0');
    return db.prepare(`SELECT id, domain FROM radar_companies WHERE ${where.join(' AND ')} ORDER BY last_scan ASC, prio_score DESC, id ASC LIMIT ?`).all(Math.max(1, Number(limit) || 5));
}
export function countCompaniesToRescan(mode = 'unscanned') {
    const db = getContentDb();
    const where = ["domain != ''"];
    if (mode === 'unscanned') where.push('last_scan = 0');
    return db.prepare(`SELECT COUNT(*) n FROM radar_companies WHERE ${where.join(' AND ')}`).get().n;
}

// Ergebnis eines Live-Fingerprints (aus radarFingerprint.fingerprintUrl) auf eine
// bereits vorhandene Firma anwenden: Snapshot/Findings aktualisieren, Realität
// korrigieren (nicht erreichbar → Karteileiche; Fremdsystem → weg-migriert;
// Shopware bestätigt → Felder anreichern) und Prio neu berechnen.
export function applyRescan(companyId, result) {
    const db = getContentDb();
    const now = Date.now();
    const cid = Number(companyId);
    const run = db.transaction(() => {
        db.prepare('UPDATE radar_companies SET last_scan=@now, updated_at=@now WHERE id=@id').run({ now, id: cid });
        if (!result || !result.ok) {
            if (result && result.blocked) { updateLeadScore(db, cid); return { outcome: 'blocked' }; }
            db.prepare("UPDATE radar_companies SET aktiv=0, verworfen_grund='nicht erreichbar (Re-Scan)' WHERE id=?").run(cid);
            updateLeadScore(db, cid);
            return { outcome: 'unreachable' };
        }
        const r = result;
        const snapId = insertSnapshot(db, cid, r.snapshot, now);
        replaceAutoFindings(db, cid, snapId, r.findings, now);
        const plat = (r.snapshot.plattform || '').toLowerCase();
        const shopwareish = plat.startsWith('shopware');
        if (!shopwareish) {
            db.prepare('UPDATE radar_companies SET aktiv=0, verworfen_grund=@g WHERE id=@id')
                .run({ g: `weg-migriert (${plat || 'kein Shopware'})`, id: cid });
        } else {
            db.prepare(`UPDATE radar_companies SET aktiv=1, verworfen_grund='',
                name = CASE WHEN name='' THEN @name ELSE name END,
                plz = CASE WHEN plz='' THEN @plz ELSE plz END,
                ort = CASE WHEN ort='' THEN @ort ELSE ort END,
                karriere_url = CASE WHEN karriere_url='' THEN @karriere ELSE karriere_url END,
                linkedin_url = CASE WHEN linkedin_url='' THEN @linkedin ELSE linkedin_url END,
                inhouse_team = CASE WHEN inhouse_team='unklar' THEN @team ELSE inhouse_team END
                WHERE id=@id`).run({
                name: r.company.name || '', plz: r.company.plz || '', ort: r.company.ort || '',
                karriere: r.company.karriere_url || '', linkedin: r.company.linkedin_url || '',
                team: r.company.inhouse_team || 'unklar', id: cid,
            });
        }
        if (r.contact && r.contact.email) {
            const exists = db.prepare('SELECT 1 FROM radar_contacts WHERE company_id = ? AND email = ?').get(cid, r.contact.email);
            if (!exists) addContact({ company_id: cid, email: r.contact.email, quelle: 'impressum' });
        }
        updateLeadScore(db, cid);
        return { outcome: shopwareish ? 'shopware' : 'migrated', plattform: plat, version: r.snapshot.version || '' };
    });
    return run();
}
