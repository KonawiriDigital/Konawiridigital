# Konawiri Digital: Website

Statische Website (HTML, CSS, JS) ohne Framework, ohne Cookies, ohne Tracking, ohne externe Verbindungen.
Läuft auf jedem Webhosting (Apache mit PHP für das Kontaktformular).

## Vor dem Livegang ersetzen (Platzhalter)

| Was | Wo |
|---|---|
| Domain `https://www.konawiridigital.de` | `index.html`, `impressum/`, `datenschutz/`, `sitemap.xml`, `robots.txt`, `llms.txt`, `.htaccess` (Suchen & Ersetzen) |
| E-Mail `info@konawiridigital.de` | `index.html`, `kontakt.php`, `assets/js/main.js`, Rechtsseiten |
| Telefon `+49 172 5303645` | `index.html` (Kontakt + JSON-LD) |
| Adresse `Neue Straße 1B, 91096 Möhrendorf` | `index.html` (Footer, Kontakt, JSON-LD) |
| Rot markierte Felder | `impressum/index.html`, `datenschutz/index.html` |
| Absender-Adresse | `kontakt.php` (`ABSENDER` muss zur eigenen Domain gehören) |
| Demo-Projekte unter „Arbeiten“ | durch echte Referenzen ersetzen, sobald vorhanden |

Impressum und Datenschutzerklärung sind solide Vorlagen, ersetzen aber keine Rechtsberatung.

## Veröffentlichen

1. Alle Dateien (inkl. der versteckten `.htaccess`) in das Hauptverzeichnis des Webspace laden.
2. SSL-Zertifikat beim Hoster aktivieren.
3. Kontaktformular einmal testen.
4. In der Google Search Console die Domain bestätigen und `https://www.konawiridigital.de/sitemap.xml` einreichen (ebenso in den Bing Webmaster Tools).
5. Google-Unternehmensprofil anlegen (wichtig für lokale Suchen).

## Bereits eingebaut

- SEO: Title, Description, Canonical, Open Graph, strukturierte Daten (Organisation, Leistungen, FAQ, Breadcrumbs), Sitemap, robots.txt, llms.txt für KI-Suchen, semantische Überschriften, schnelle Ladezeit
- DSGVO: lokal gehostete Schriften, keine Cookies, kein Tracking, Formular mit Einwilligung und Honeypot statt CAPTCHA, Impressum, Datenschutz
- Technik: Sicherheits-Header, HTTPS- und www-Weiterleitung, Caching, Komprimierung, 404-Seite, Barrierefreiheit (Skip-Link, Tastaturbedienung, „reduzierte Bewegung“)

## Seitenstruktur

- `/` Startseite
- Leistungen: `/website-erstellen-lassen/`, `/website-abo/`, `/website-relaunch/`, `/website-betreuung/`
- Branchen: `/website-fuer-handwerksbetriebe/`, `/website-fuer-industrieunternehmen/`, `/website-fuer-dienstleister/`
- Region: `/webdesign-nuernberg/`, `/webdesign-fuerth/`, `/webdesign-erlangen/`
- Ratgeber: `/ratgeber/` mit 4 Artikeln
- Rechtliches: `/impressum/`, `/datenschutz/`

## Nächste Schritte für bessere Rankings

- Alle 2-4 Wochen einen neuen Ratgeber-Artikel
- Echte Referenzen und Kundenstimmen

Schriften: DM Sans und Inter (SIL Open Font License, siehe `assets/fonts/`).
