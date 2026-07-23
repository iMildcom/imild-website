# iMild.com — Dachmarken-Website (v1)

Umsetzung des Mockups „iMild — Dachmarke · 10 Seiten" als echte, statische Website.

## Seiten

| Datei | Seite |
|---|---|
| `index.html` | Startseite |
| `about.html` | Über uns |
| `brands.html` | Marken |
| `newsroom.html` | Newsroom |
| `careers.html` | Karriere |
| `contact.html` | Kontakt |
| `legal.html` | Legal |
| `conax.html` | con.ax — Landingpage |
| `smejj.html` | smejj — Landingpage |
| `smyst.html` | smyst — Landingpage |

## Features

- **Zweisprachig (DE/EN):** Umschalter oben rechts. Deutsch steht im HTML,
  Englisch in `assets/i18n.js` — weitere Sprachen = ein weiteres Wörterbuch.
  Die Sprache wird gemerkt; erste Wahl folgt der Browsersprache.
- **Responsive:** Desktop, Tablet, Handy (Hamburger-Menü unter 760 px).
- **Design wie im Mockup:** viereckig (kein Border-Radius), Frosted Glass,
  iMild-Farbverlauf (#1AB8FB → #1B5CF5 → #5235E5), Original-Logos als SVG.
- **RTL-vorbereitet:** ausschließlich CSS Logical Properties.
- **Barrierefreiheit:** aria-Labels, `prefers-reduced-motion` und
  `prefers-reduced-transparency` werden respektiert.
- **Kein Build nötig:** reines HTML/CSS/JS — einfach `index.html` öffnen.

## Veröffentlichen (Cloudflare Pages, 0 €)

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Upload assets**
2. Den kompletten Inhalt dieses Ordners hochladen (`index.html` usw. auf oberster Ebene).
3. Eigene Domain `imild.com` verbinden — fertig.

## Noch offen (bewusst v1)

- Kontaktformular öffnet derzeit das Mail-Programm (`mailto:` an s@imild.com) —
  später durch echten Endpoint ersetzen (z. B. Cloudflare Worker + Turnstile).
- Newsroom-Einträge und Jobs sind Platzhalter aus dem Mockup.
- Impressum nutzt die echten iMild-LLC-Daten (Oakland) aus `Project_Goals.md`
  statt „iMild Inc. Palo Alto" aus dem Mockup.

## Quelltext / Änderungen

Im Ordner `build/` (falls mitgeliefert): `partials/` (Header, Footer, Logos),
`pages/` (Seiteninhalte), `build.py` (setzt alles zu `dist/` zusammen).
