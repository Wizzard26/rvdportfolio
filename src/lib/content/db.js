import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Content-Datenbank (redaktionelle Inhalte, z. B. Vita-Stationen).
//
// Bewusst getrennt von der Analytics-DB: Inhalte sind wertvoller (bearbeitet,
// nicht rekonstruierbar) und sollen unabhängig gesichert werden können.
//
// Pfad: CONTENT_DB_PATH, sonst im selben Verzeichnis wie die Analytics-DB
// (ANALYTICS_DB_PATH) — dadurch landet die Datei automatisch im bestehenden
// Server-Volume (/app/data), ohne neuen Env-Eintrag oder Volume-Schritt.
// Lokal fällt sie auf ./data/content.db zurück.
//
// Läuft nur in der Node-Runtime (Route-Handler, Server-Components, Server
// Actions) — nie im Proxy (Edge) oder Client.

let db;

function resolvePath() {
    if (process.env.CONTENT_DB_PATH) return process.env.CONTENT_DB_PATH;
    const analyticsPath = process.env.ANALYTICS_DB_PATH;
    if (analyticsPath) return join(dirname(analyticsPath), 'content.db');
    return './data/content.db';
}

// Fügt eine Spalte nur hinzu, wenn sie noch fehlt (idempotent). Für bereits
// bestehende Tabellen auf dem Server, die per früherem Deploy ohne die Spalte
// angelegt wurden. DEFAULT 1 sorgt dafür, dass vorhandene Zeilen sichtbar
// bleiben (nur neu Angelegtes startet als Entwurf).
function ensureColumn(database, table, column, definition) {
    const exists = database.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
    if (!exists) database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function migrate(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS vita_stations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            company     TEXT    NOT NULL,
            description TEXT    NOT NULL DEFAULT '',
            start       TEXT    NOT NULL,
            end         TEXT    NOT NULL DEFAULT '',
            is_current  INTEGER NOT NULL DEFAULT 0,
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_vita_sort ON vita_stations (sort_order);

        CREATE TABLE IF NOT EXISTS vita_areas (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            title         TEXT    NOT NULL DEFAULT '',
            show_headline INTEGER NOT NULL DEFAULT 1,
            sort_order    INTEGER NOT NULL DEFAULT 0,
            updated_at    INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_area_sort ON vita_areas (sort_order);

        CREATE TABLE IF NOT EXISTS vita_area_entries (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            area_id    INTEGER NOT NULL,
            text       TEXT    NOT NULL DEFAULT '',
            link       TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_entry_area ON vita_area_entries (area_id, sort_order);

        CREATE TABLE IF NOT EXISTS showcase_projects (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            category             TEXT    NOT NULL DEFAULT 'shopware',
            variant              TEXT    NOT NULL DEFAULT 'full',
            name                 TEXT    NOT NULL DEFAULT '',
            headline             TEXT    NOT NULL DEFAULT '',
            intro                TEXT    NOT NULL DEFAULT '',
            features             TEXT    NOT NULL DEFAULT '',
            tech                 TEXT    NOT NULL DEFAULT '',
            media_type           TEXT    NOT NULL DEFAULT 'none',
            media                TEXT    NOT NULL DEFAULT '',
            schema_type          TEXT    NOT NULL DEFAULT '',
            application_category TEXT    NOT NULL DEFAULT '',
            sandbox_html         TEXT    NOT NULL DEFAULT '',
            sandbox_css          TEXT    NOT NULL DEFAULT '',
            sandbox_js           TEXT    NOT NULL DEFAULT '',
            is_active            INTEGER NOT NULL DEFAULT 1,
            sort_order           INTEGER NOT NULL DEFAULT 0,
            updated_at           INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_project_cat ON showcase_projects (category, sort_order);

        CREATE TABLE IF NOT EXISTS gallery_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            gallery     TEXT    NOT NULL DEFAULT 'ecommerce',
            title       TEXT    NOT NULL DEFAULT '',
            description TEXT    NOT NULL DEFAULT '',
            technik     TEXT    NOT NULL DEFAULT '',
            image       TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_items (gallery, sort_order);

        -- Mehrere Bilder je Showcase-Projekt (für media_type 'gallery'/'slider').
        -- KI-Kennzeichnung pro Bild (ein Screenshot kann echt, ein anderer KI sein).
        CREATE TABLE IF NOT EXISTS showcase_images (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id  INTEGER NOT NULL,
            image       TEXT    NOT NULL DEFAULT '',
            ai_image    INTEGER NOT NULL DEFAULT 0,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_showcase_images_project ON showcase_images (project_id, sort_order);

        CREATE TABLE IF NOT EXISTS documents (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL DEFAULT '',
            slug        TEXT    NOT NULL DEFAULT '',
            file        TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_documents_sort ON documents (sort_order);
        CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents (slug);

        CREATE TABLE IF NOT EXISTS settings (
            skey   TEXT PRIMARY KEY,
            svalue TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS testimonials (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            author      TEXT    NOT NULL DEFAULT '',
            role        TEXT    NOT NULL DEFAULT '',
            company     TEXT    NOT NULL DEFAULT '',
            quote       TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            created_at  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials (sort_order);

        CREATE TABLE IF NOT EXISTS shares (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            token       TEXT    NOT NULL UNIQUE,
            title       TEXT    NOT NULL DEFAULT '',
            message     TEXT    NOT NULL DEFAULT '',
            purpose     TEXT    NOT NULL DEFAULT 'bewerbung',
            company     TEXT    NOT NULL DEFAULT '',
            street      TEXT    NOT NULL DEFAULT '',
            zip         TEXT    NOT NULL DEFAULT '',
            city        TEXT    NOT NULL DEFAULT '',
            contact     TEXT    NOT NULL DEFAULT '',
            position    TEXT    NOT NULL DEFAULT '',
            access_code TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_shares_token ON shares (token);

        CREATE TABLE IF NOT EXISTS share_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            share_id    INTEGER NOT NULL,
            document_id INTEGER NOT NULL,
            sort_order  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_share_items ON share_items (share_id, sort_order);

        CREATE TABLE IF NOT EXISTS share_testimonials (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            share_id       INTEGER NOT NULL,
            testimonial_id INTEGER NOT NULL,
            sort_order     INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_share_testimonials ON share_testimonials (share_id, sort_order);

        CREATE TABLE IF NOT EXISTS share_events (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            share_id INTEGER NOT NULL,
            kind     TEXT    NOT NULL DEFAULT '',
            detail   TEXT    NOT NULL DEFAULT '',
            at       INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_share_events ON share_events (share_id, at);

        -- „Umgekehrte Bewerbung": Angebote von Arbeitgebern an René.
        CREATE TABLE IF NOT EXISTS offers (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            company               TEXT    NOT NULL DEFAULT '',
            contact               TEXT    NOT NULL DEFAULT '',
            email                 TEXT    NOT NULL DEFAULT '',
            website               TEXT    NOT NULL DEFAULT '',
            position              TEXT    NOT NULL DEFAULT '',
            q_found               TEXT    NOT NULL DEFAULT '',
            q_profile             TEXT    NOT NULL DEFAULT '',
            q_tech                TEXT    NOT NULL DEFAULT '',
            q_ai                  TEXT    NOT NULL DEFAULT '',
            q_team                TEXT    NOT NULL DEFAULT '',
            q_reviews             TEXT    NOT NULL DEFAULT '',
            q_onboarding          TEXT    NOT NULL DEFAULT '',
            q_equipment           TEXT    NOT NULL DEFAULT '',
            q_growth              TEXT    NOT NULL DEFAULT '',
            q_benefits            TEXT    NOT NULL DEFAULT '',
            q_why                 TEXT    NOT NULL DEFAULT '',
            model                 TEXT    NOT NULL DEFAULT '',
            location              TEXT    NOT NULL DEFAULT '',
            homeoffice_pct        INTEGER NOT NULL DEFAULT 0,
            hours_per_week        INTEGER NOT NULL DEFAULT 0,
            vacation_days         INTEGER NOT NULL DEFAULT 0,
            start_date            TEXT    NOT NULL DEFAULT '',
            probation             TEXT    NOT NULL DEFAULT '',
            contract              TEXT    NOT NULL DEFAULT '',
            learning_budget       INTEGER NOT NULL DEFAULT 0,
            salary_min            INTEGER NOT NULL DEFAULT 0,
            salary_max            INTEGER NOT NULL DEFAULT 0,
            message               TEXT    NOT NULL DEFAULT '',
            status                TEXT    NOT NULL DEFAULT 'neu',
            notes                 TEXT    NOT NULL DEFAULT '',
            rating_seriositaet    INTEGER NOT NULL DEFAULT 0,
            rating_gehalt         INTEGER NOT NULL DEFAULT 0,
            rating_passung        INTEGER NOT NULL DEFAULT 0,
            rating_gesamteindruck INTEGER NOT NULL DEFAULT 0,
            rated_at              INTEGER NOT NULL DEFAULT 0,
            viewed_at             INTEGER NOT NULL DEFAULT 0,
            created_at            INTEGER NOT NULL DEFAULT 0,
            updated_at            INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_offers_created ON offers (created_at);

        CREATE TABLE IF NOT EXISTS offer_events (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            offer_id INTEGER NOT NULL,
            kind     TEXT    NOT NULL DEFAULT '',
            detail   TEXT    NOT NULL DEFAULT '',
            at       INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_offer_events ON offer_events (offer_id, at);

        -- Redaktionelle Beiträge: eine Engine, zwei Modi (type = 'blog' | 'doc').
        -- body ist Markdown; das Frontend rendert es je nach type im Blog- oder
        -- Doku-Layout. doc_group/parent_id bauen den Doku-Seitenbaum (Sidebar).
        CREATE TABLE IF NOT EXISTS content_posts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            type         TEXT    NOT NULL DEFAULT 'blog',
            slug         TEXT    NOT NULL DEFAULT '',
            title        TEXT    NOT NULL DEFAULT '',
            subline      TEXT    NOT NULL DEFAULT '',
            teaser       TEXT    NOT NULL DEFAULT '',
            body         TEXT    NOT NULL DEFAULT '',
            category     TEXT    NOT NULL DEFAULT '',
            author       TEXT    NOT NULL DEFAULT 'René van Dinter',
            image        TEXT    NOT NULL DEFAULT '',
            doc_group    TEXT    NOT NULL DEFAULT '',
            parent_id    INTEGER NOT NULL DEFAULT 0,
            published_at TEXT    NOT NULL DEFAULT '',
            is_active    INTEGER NOT NULL DEFAULT 1,
            sort_order   INTEGER NOT NULL DEFAULT 0,
            updated_at   INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_posts_type ON content_posts (type, sort_order, id);
        CREATE INDEX IF NOT EXISTS idx_posts_slug ON content_posts (type, slug);

        -- Blog-Kategorien (admin-verwaltet). Beiträge speichern die Namen als
        -- CSV in content_posts.category; diese Tabelle liefert die Auswahlliste.
        CREATE TABLE IF NOT EXISTS post_categories (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL UNIQUE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_categories_sort ON post_categories (sort_order);

        -- Doku-Bereiche (wie GitBook-Projekte): mehrere in sich geschlossene
        -- Dokus nebeneinander. Eine Doku-Seite (content_posts type='doc') gehört
        -- über space_id zu genau einem Bereich; ihr Baum (doc_group/parent_id)
        -- lebt innerhalb dieses Bereichs. Slugs sind je Bereich eindeutig.
        CREATE TABLE IF NOT EXISTS doc_spaces (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL DEFAULT '',
            slug        TEXT    NOT NULL UNIQUE,
            description TEXT    NOT NULL DEFAULT '',
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_spaces_sort ON doc_spaces (sort_order);

        -- Vertrauliche Referenzen: Arbeitsproben, die NICHT in den öffentlichen
        -- Showcase dürfen (Rechte am Produkt, nicht am Code; oder noch nicht
        -- öffentlich angekündigt). Bewusst eine EIGENE Tabelle statt eines Flags am
        -- Showcase, damit sie physisch nie über eine öffentliche Route ausgeliefert
        -- werden. Zuordnung pro Freigabe über share_private_refs.
        CREATE TABLE IF NOT EXISTS private_refs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL DEFAULT '',
            context     TEXT    NOT NULL DEFAULT '',   -- z. B. „bei TC-Innovations"
            description TEXT    NOT NULL DEFAULT '',
            tech        TEXT    NOT NULL DEFAULT '',    -- Komma/Zeilen → Chips
            status      TEXT    NOT NULL DEFAULT 'live',-- 'live' | 'in_entwicklung'
            link        TEXT    NOT NULL DEFAULT '',    -- optionaler Live-Link (Shop/Store/Website)
            link_label  TEXT    NOT NULL DEFAULT '',    -- Beschriftung des Links
            is_active   INTEGER NOT NULL DEFAULT 1,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            created_at  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_private_refs_sort ON private_refs (sort_order);

        -- Screenshots je vertraulicher Referenz (nur Bilder), inkl. KI-Kennzeichnung.
        CREATE TABLE IF NOT EXISTS private_ref_images (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ref_id      INTEGER NOT NULL,
            image       TEXT    NOT NULL DEFAULT '',
            ai_image    INTEGER NOT NULL DEFAULT 0,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            updated_at  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_private_ref_images_ref ON private_ref_images (ref_id, sort_order);

        -- Zuordnung vertraulicher Referenzen zu einer Freigabe (Reihenfolge = Anzeige).
        CREATE TABLE IF NOT EXISTS share_private_refs (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            share_id   INTEGER NOT NULL,
            ref_id     INTEGER NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_share_private_refs ON share_private_refs (share_id, sort_order);

        -- Einzeln gelesene Admin-Benachrichtigungen (Glocke). nkey ist der stabile
        -- Schlüssel eines Ereignisses ('e'<share_event.id>) bzw. Angebots ('o'<offer.id>).
        -- „Alles als gelesen" setzt zusätzlich einen Wasserzeichen-Zeitstempel in settings.
        CREATE TABLE IF NOT EXISTS notification_reads (
            nkey    TEXT PRIMARY KEY,
            read_at INTEGER NOT NULL DEFAULT 0
        );

        -- ── Bewerbungs- & Akquise-Radar (Phase 1) ─────────────────────────
        -- Interne Listen potenzieller Arbeitgeber (Shopware-Shops = Inhouse) und
        -- Agenturen (= Freelance-Akquise). Recherchieren/priorisieren ja, Versand
        -- immer von Hand. Fingerprint-/Findings-Tabellen kommen in Phase 2.
        CREATE TABLE IF NOT EXISTS radar_companies (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            domain         TEXT    NOT NULL DEFAULT '',   -- normalisiert, ohne www/Protokoll (Dedupe-Schlüssel)
            name           TEXT    NOT NULL DEFAULT '',
            rechtsform     TEXT    NOT NULL DEFAULT '',
            strasse        TEXT    NOT NULL DEFAULT '',
            plz            TEXT    NOT NULL DEFAULT '',
            ort            TEXT    NOT NULL DEFAULT '',
            region         TEXT    NOT NULL DEFAULT '',
            distanz_km     INTEGER NOT NULL DEFAULT 0,    -- ab Stade (Hybrid-Tauglichkeit)
            typ            TEXT    NOT NULL DEFAULT 'unbekannt', -- inhouse_shop|agentur|hersteller|dienstleister|unbekannt
            themengebiete  TEXT    NOT NULL DEFAULT '',   -- Komma/Zeilen (Branchen)
            inhouse_team   TEXT    NOT NULL DEFAULT 'unklar', -- ja|nein|unklar
            karriere_url   TEXT    NOT NULL DEFAULT '',
            linkedin_url   TEXT    NOT NULL DEFAULT '',
            github_org     TEXT    NOT NULL DEFAULT '',
            notiz          TEXT    NOT NULL DEFAULT '',
            aktiv          INTEGER NOT NULL DEFAULT 1,
            created_at     INTEGER NOT NULL DEFAULT 0,
            updated_at     INTEGER NOT NULL DEFAULT 0
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_radar_companies_domain ON radar_companies (domain);

        -- Ansprechpartner (DSGVO: Herkunft + Löschfrist sind Pflicht).
        CREATE TABLE IF NOT EXISTS radar_contacts (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id            INTEGER NOT NULL,
            name                  TEXT    NOT NULL DEFAULT '',
            rolle                 TEXT    NOT NULL DEFAULT '',
            email                 TEXT    NOT NULL DEFAULT '',
            telefon               TEXT    NOT NULL DEFAULT '',
            linkedin_url          TEXT    NOT NULL DEFAULT '',
            ist_entscheider       INTEGER NOT NULL DEFAULT 0,
            quelle                TEXT    NOT NULL DEFAULT 'manuell', -- impressum|stellenanzeige|website|manuell
            erhoben_am            INTEGER NOT NULL DEFAULT 0,
            loeschen_am           INTEGER NOT NULL DEFAULT 0,          -- automatische Löschfrist
            art14_info_gesendet_am INTEGER NOT NULL DEFAULT 0,
            created_at            INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_radar_contacts_company ON radar_contacts (company_id);

        -- Chancen (Stellen/Initiativ/Freelance). share_id koppelt an das bestehende
        -- Freigabe-System (Anschreiben + Token-Link + Aufruf-Tracking).
        CREATE TABLE IF NOT EXISTS radar_opportunities (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id       INTEGER NOT NULL,
            typ              TEXT    NOT NULL DEFAULT 'initiativ', -- job_inhouse|job_agentur|initiativ|freelance
            pipeline         TEXT    NOT NULL DEFAULT 'bewerbung', -- bewerbung|akquise (für Sperrlogik & Sicht)
            titel            TEXT    NOT NULL DEFAULT '',
            quell_url        TEXT    NOT NULL DEFAULT '',
            quelle           TEXT    NOT NULL DEFAULT 'manuell',
            gefunden_am      INTEGER NOT NULL DEFAULT 0,
            veroeffentlicht_am TEXT  NOT NULL DEFAULT '',
            frist            TEXT    NOT NULL DEFAULT '',
            stunden_woche    TEXT    NOT NULL DEFAULT '',
            remote_anteil    TEXT    NOT NULL DEFAULT '',
            standort         TEXT    NOT NULL DEFAULT '',
            gehalt_angabe    TEXT    NOT NULL DEFAULT '',
            stack_erkannt    TEXT    NOT NULL DEFAULT '',   -- csv
            match_treffer    TEXT    NOT NULL DEFAULT '',   -- csv (was du mitbringst)
            match_luecken    TEXT    NOT NULL DEFAULT '',   -- csv (was fehlt)
            score_gesamt     INTEGER NOT NULL DEFAULT 0,
            teilscores       TEXT    NOT NULL DEFAULT '',   -- json
            begruendung      TEXT    NOT NULL DEFAULT '',
            red_flags        TEXT    NOT NULL DEFAULT '',   -- csv
            status           TEXT    NOT NULL DEFAULT 'neu', -- neu|geprueft|shortlist|beworben|gespraech|angebot|absage|verworfen
            verworfen_grund  TEXT    NOT NULL DEFAULT '',
            rohtext_hash     TEXT    NOT NULL DEFAULT '',
            share_id         INTEGER NOT NULL DEFAULT 0,     -- Kopplung an shares (0 = keine)
            created_at       INTEGER NOT NULL DEFAULT 0,
            updated_at       INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_radar_opps_company ON radar_opportunities (company_id);
        CREATE INDEX IF NOT EXISTS idx_radar_opps_status ON radar_opportunities (status);

        -- Doppelansprache-Sperre: wer eine Bewerbung bekam, ist X Zeit für Akquise
        -- gesperrt (und umgekehrt) – „nicht billig machen".
        CREATE TABLE IF NOT EXISTS radar_outreach_blocks (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id   INTEGER NOT NULL,
            pipeline     TEXT    NOT NULL DEFAULT 'bewerbung', -- gesperrte Pipeline
            grund        TEXT    NOT NULL DEFAULT '',
            gesperrt_bis INTEGER NOT NULL DEFAULT 0,
            created_at   INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_radar_blocks_company ON radar_outreach_blocks (company_id);

        -- Scoring-Profile: konfigurierbar statt hartcodiert (im Admin editierbar).
        CREATE TABLE IF NOT EXISTS radar_scoring_profiles (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT    NOT NULL DEFAULT '',
            pipeline     TEXT    NOT NULL DEFAULT 'bewerbung',
            gewichte     TEXT    NOT NULL DEFAULT '',   -- json: {fachlich, remote, stunden, branche, arbeitgeber, entfernung}
            min_stunden  INTEGER NOT NULL DEFAULT 0,
            max_distanz  INTEGER NOT NULL DEFAULT 0,
            remote_min   INTEGER NOT NULL DEFAULT 0,
            ausschluss   TEXT    NOT NULL DEFAULT '',   -- csv (Zeitarbeit, Personalvermittler …)
            aktiv        INTEGER NOT NULL DEFAULT 1,
            updated_at   INTEGER NOT NULL DEFAULT 0
        );

        -- Technikprofil je Firma (Phase 2, aus dem Fingerprint der URL). Versioniert:
        -- die Veränderung ist das Signal (Migration = Budget bewegt sich).
        CREATE TABLE IF NOT EXISTS radar_tech_snapshots (
            id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id         INTEGER NOT NULL,
            erhoben_am         INTEGER NOT NULL DEFAULT 0,
            plattform          TEXT    NOT NULL DEFAULT 'unbekannt', -- shopware6|shopware5|shopify|woocommerce|oxid|custom|unbekannt
            plattform_confidence REAL  NOT NULL DEFAULT 0,
            version            TEXT    NOT NULL DEFAULT '',
            version_eol        INTEGER NOT NULL DEFAULT 0,
            frontend           TEXT    NOT NULL DEFAULT 'unklar',    -- twig_storefront|headless_next|headless_vue|unklar
            theme_typ          TEXT    NOT NULL DEFAULT '',          -- standard|custom|unklar
            agentur_credit     TEXT    NOT NULL DEFAULT '',
            eigene_namespaces  TEXT    NOT NULL DEFAULT '',
            server_header      TEXT    NOT NULL DEFAULT '',
            security_header    TEXT    NOT NULL DEFAULT '',          -- json {hsts,csp,xfo}
            belege             TEXT    NOT NULL DEFAULT ''           -- json [{signal,beleg}]
        );
        CREATE INDEX IF NOT EXISTS idx_radar_snap_company ON radar_tech_snapshots (company_id, erhoben_am);

        -- Fallstricke/Potenziale je Firma (Anschreiben-Aufhänger).
        CREATE TABLE IF NOT EXISTS radar_findings (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id     INTEGER NOT NULL,
            snapshot_id    INTEGER NOT NULL DEFAULT 0,
            typ            TEXT    NOT NULL DEFAULT '', -- eol_version|security|performance|barrierefreiheit|seo|veraltetes_plugin
            schwere        TEXT    NOT NULL DEFAULT 'info', -- info|mittel|hoch
            titel          TEXT    NOT NULL DEFAULT '',
            beschreibung   TEXT    NOT NULL DEFAULT '',
            beleg_url      TEXT    NOT NULL DEFAULT '',
            verwendbar_als TEXT    NOT NULL DEFAULT 'gespraechsthema', -- akquise_aufhaenger|gespraechsthema|intern_nur
            quelle         TEXT    NOT NULL DEFAULT 'automatisch',
            created_at     INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_radar_findings_company ON radar_findings (company_id);
    `);

    // Doku-Seiten einem Bereich zuordnen (Mehr-Doku-Fähigkeit nachgerüstet).
    ensureColumn(database, 'content_posts', 'space_id', 'INTEGER NOT NULL DEFAULT 0');
    // KI-Kennzeichnung: markiert ein mit KI erzeugtes Beitragsbild (Blog/Doku).
    ensureColumn(database, 'content_posts', 'ai_image', 'INTEGER NOT NULL DEFAULT 0');
    // Kategorien aktiv/inaktiv schalten (DEFAULT 1 → Bestand bleibt sichtbar).
    ensureColumn(database, 'post_categories', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

    // Veröffentlichungsdatum vom alten Anzeigeformat (TT/MM/JJJJ, aus dem Seed)
    // auf ISO (YYYY-MM-DD) normalisieren — für maschinenlesbares datePublished.
    // Das LIKE-Muster trifft ISO-Werte nicht, daher idempotent.
    const legacyDates = database.prepare(
        "SELECT id, published_at FROM content_posts WHERE published_at LIKE '__/__/____'",
    ).all();
    for (const row of legacyDates) {
        const m = row.published_at.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) {
            database.prepare('UPDATE content_posts SET published_at = ? WHERE id = ?')
                .run(`${m[3]}-${m[2]}-${m[1]}`, row.id);
        }
    }

    // Nachrüsten für bereits bestehende Tabellen (z. B. Vita auf dem Server).
    ensureColumn(database, 'vita_stations', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    ensureColumn(database, 'showcase_projects', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    // KI-Kennzeichnung: markiert ein mit KI erzeugtes Projektbild.
    ensureColumn(database, 'showcase_projects', 'ai_image', 'INTEGER NOT NULL DEFAULT 0');
    // Gemischte Galerien/Slider: ein Item ist Bild, hochgeladenes Video oder Embed.
    // 'image' | 'video' (MP4 im /media-Volume) | 'embed' (youtube:ID / vimeo:ID).
    // Die vorhandene image-Spalte hält jeweils die Quelle (Pfad bzw. Embed-Kennung).
    ensureColumn(database, 'showcase_images', 'kind', "TEXT NOT NULL DEFAULT 'image'");
    // Autoplay je Video-/Embed-Item (startet immer stumm; Ton erst bei aktivem Start).
    ensureColumn(database, 'showcase_images', 'autoplay', 'INTEGER NOT NULL DEFAULT 1');
    ensureColumn(database, 'gallery_items', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
    // Sandbox-Felder für den JavaScript-Tab (Phase B) nachrüsten.
    ensureColumn(database, 'showcase_projects', 'sandbox_html', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'showcase_projects', 'sandbox_css', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'showcase_projects', 'sandbox_js', "TEXT NOT NULL DEFAULT ''");
    // Firmendaten/Personalisierung für Freigaben nachrüsten.
    ensureColumn(database, 'shares', 'purpose', "TEXT NOT NULL DEFAULT 'bewerbung'");
    ensureColumn(database, 'shares', 'company', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'street', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'zip', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'city', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'contact', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'position', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'email', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'website', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'access_code', "TEXT NOT NULL DEFAULT ''");
    // Bewerbungs-Tracking (Datum, Ablauf, Status, Antwort-Details) nachrüsten.
    ensureColumn(database, 'shares', 'created_at', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'sent_at', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'expires_at', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'status', "TEXT NOT NULL DEFAULT 'offen'");
    ensureColumn(database, 'shares', 'interview_at', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'interview_contact', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'interview_people', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'decision_date', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'rejection_reason', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'followup_at', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'notes', "TEXT NOT NULL DEFAULT ''");
    // Reaktionen des Arbeitgebers (Terminvorschläge, Absage-Feedback).
    ensureColumn(database, 'shares', 'proposed_slots', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'feedback_reason', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'rating_quality', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'rating_fit', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'rating_overall', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'feedback_at', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'employer_closed', 'INTEGER NOT NULL DEFAULT 0');
    // Weitere Bewertungsfaktoren + Admin-Antwort + bestätigter Termin.
    ensureColumn(database, 'shares', 'rating_experience', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'rating_relevance', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'rating_manner', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'rating_culture', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'shares', 'owner_reply', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'confirmed_slot', "TEXT NOT NULL DEFAULT ''");
    // Zusatzangaben zum Terminvorschlag des Arbeitgebers.
    ensureColumn(database, 'shares', 'proposed_contact', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'proposed_people', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'shares', 'proposed_message', "TEXT NOT NULL DEFAULT ''");
    // „Wie wurde der Bewerbungsprozess wahrgenommen?" (ersetzt Team-/Kultur-Passung).
    ensureColumn(database, 'shares', 'rating_process', 'INTEGER NOT NULL DEFAULT 0');
    // Zeitpunkt einer (auch prozessunabhängig) abgegebenen Sternebewertung.
    ensureColumn(database, 'shares', 'rated_at', 'INTEGER NOT NULL DEFAULT 0');
    // Keyfacts + Anschreiben-Bausteine für die Freigabe-Seite (Bewerbung → Arbeitgeber).
    ensureColumn(database, 'shares', 'contact_gender', "TEXT NOT NULL DEFAULT ''");   // '', herr, frau, divers, team
    ensureColumn(database, 'shares', 'employment_type', "TEXT NOT NULL DEFAULT ''");  // '', vollzeit, teilzeit, beides
    ensureColumn(database, 'shares', 'hours_from', 'INTEGER NOT NULL DEFAULT 0');     // Teilzeit-Stunden von
    ensureColumn(database, 'shares', 'hours_to', 'INTEGER NOT NULL DEFAULT 0');       // Teilzeit-Stunden bis
    ensureColumn(database, 'shares', 'work_model', "TEXT NOT NULL DEFAULT ''");       // '', vor_ort, hybrid, remote, flexibel
    ensureColumn(database, 'shares', 'availability', "TEXT NOT NULL DEFAULT ''");     // Start: sofort / ab Datum / nach Absprache
    ensureColumn(database, 'shares', 'salary_amount', "TEXT NOT NULL DEFAULT ''");    // z. B. „55.000–60.000"
    ensureColumn(database, 'shares', 'salary_period', "TEXT NOT NULL DEFAULT ''");    // '', jahr, monat, stunde
    ensureColumn(database, 'shares', 'salary_hours', 'INTEGER NOT NULL DEFAULT 0');   // Bezug: Gehalt „bei X Std./Woche" (Teilzeit)
    ensureColumn(database, 'shares', 'salary_public', 'INTEGER NOT NULL DEFAULT 0');  // Gehalt auf der Seite zeigen?
    ensureColumn(database, 'shares', 'skills', "TEXT NOT NULL DEFAULT ''");           // Kern-Skills (Zeilen/Komma) → Chips
    ensureColumn(database, 'shares', 'highlights', "TEXT NOT NULL DEFAULT ''");       // Besonderheiten (Zeilen) → Bullets
    ensureColumn(database, 'shares', 'motivation', "TEXT NOT NULL DEFAULT ''");       // „Warum ihr" (1 Satz) → Fließtext
    ensureColumn(database, 'shares', 'mobility', "TEXT NOT NULL DEFAULT ''");         // Standort & Bereitschaft (optional)
    ensureColumn(database, 'shares', 'job_ref', "TEXT NOT NULL DEFAULT ''");          // Fundort/Referenz der Stelle (optional)
    // Optionale Zusatz-Elemente auf der Freigabe-Seite (je Freigabe an/aus).
    // Welche Stimmen erscheinen, wird pro Freigabe einzeln zugeordnet (Tabelle share_testimonials).
    ensureColumn(database, 'shares', 'show_showcase_cta', 'INTEGER NOT NULL DEFAULT 0');    // CTA zur Showcase zeigen
    // Bestehende Freigaben ohne Erstelldatum auf updated_at setzen (idempotent).
    database.prepare('UPDATE shares SET created_at = updated_at WHERE created_at = 0').run();

    // Optionaler Live-Link je vertraulicher Referenz (nachgerüstet für bestehende DBs).
    ensureColumn(database, 'private_refs', 'link', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'private_refs', 'link_label', "TEXT NOT NULL DEFAULT ''");

    // Radar: externe Import-Daten (BuiltWith) + Lead-Priorisierung + Re-Scan-Zustand.
    ensureColumn(database, 'radar_companies', 'quelle', "TEXT NOT NULL DEFAULT 'manuell'"); // manuell|scan|builtwith
    ensureColumn(database, 'radar_companies', 'umsatz_est', 'INTEGER NOT NULL DEFAULT 0'); // $/Monat, Schätzung extern
    ensureColumn(database, 'radar_companies', 'tech_spend_est', 'INTEGER NOT NULL DEFAULT 0'); // $/Monat, Schätzung extern
    ensureColumn(database, 'radar_companies', 'extern_gesehen', "TEXT NOT NULL DEFAULT ''"); // Last-Found aus der Quelle
    ensureColumn(database, 'radar_companies', 'prio_score', 'INTEGER NOT NULL DEFAULT 0'); // 0-100 „lohnt sich"
    ensureColumn(database, 'radar_companies', 'prio_grund', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'radar_companies', 'verworfen_grund', "TEXT NOT NULL DEFAULT ''"); // Karteileiche/weg-migriert
    ensureColumn(database, 'radar_companies', 'last_scan', 'INTEGER NOT NULL DEFAULT 0'); // letzter Re-Scan (Batch-Steuerung)
    ensureColumn(database, 'radar_companies', 'archiviert', 'INTEGER NOT NULL DEFAULT 0'); // manuell weggelegt (nicht loeschen)
    ensureColumn(database, 'radar_companies', 'archiviert_am', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(database, 'radar_companies', 'last_job_scan', 'INTEGER NOT NULL DEFAULT 0'); // letzter Karriereseiten-Job-Scan
    ensureColumn(database, 'radar_opportunities', 'ba_refnr', "TEXT NOT NULL DEFAULT ''"); // Bundesagentur-Referenz fuer Detailabruf
    ensureColumn(database, 'radar_opportunities', 'beschreibung', "TEXT NOT NULL DEFAULT ''"); // Stellenbeschreibung (BA-Detail)
    // Firmenidentität aus dem Impressum (§5 DDG öffentlich) + manuelle Arbeitgeber-Recherche (kununu etc.).
    // Rechtsträger-Name steckt bereits im vorhandenen Feld `rechtsform` (z. B. „TC-Innovations GmbH").
    ensureColumn(database, 'radar_companies', 'handelsregister', "TEXT NOT NULL DEFAULT ''"); // HRB/HRA + Amtsgericht
    ensureColumn(database, 'radar_companies', 'geschaeftsfuehrer', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(database, 'radar_companies', 'ust_id', "TEXT NOT NULL DEFAULT ''"); // USt-IdNr
    ensureColumn(database, 'radar_companies', 'kununu_url', "TEXT NOT NULL DEFAULT ''"); // manuell: gefundenes Profil
    ensureColumn(database, 'radar_companies', 'kununu_score', "TEXT NOT NULL DEFAULT ''"); // manuell: Gesamtbewertung
    ensureColumn(database, 'radar_companies', 'kununu_gehalt', "TEXT NOT NULL DEFAULT ''"); // manuell: Entwickler-Gehalt/Notiz
    // Domain nur einmal — aber PARTIELL: leere Domains (Firmen ohne Website, z. B.
    // Arbeitgeber aus Job-Anzeigen) müssen mehrfach erlaubt sein. Früher wurde hier
    // fälschlich ein voller Unique-Index angelegt → mehrere '' kollidierten. Reparieren.
    try {
        const existing = database.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_radar_companies_domain'").get();
        if (existing && !/where/i.test(existing.sql || '')) database.prepare('DROP INDEX idx_radar_companies_domain').run();
        database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_radar_companies_domain ON radar_companies(domain) WHERE domain != ''").run();
    } catch { /* bestehende Duplikate → createCompany-Dedupe schützt weiterhin */ }
}

export function getContentDb() {
    if (db) return db;

    const path = resolvePath();
    mkdirSync(dirname(path), { recursive: true });

    db = new Database(path);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    migrate(db);
    return db;
}
