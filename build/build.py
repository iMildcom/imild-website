#!/usr/bin/env python3
"""Build script: stitches partials + page bodies into the site root (flat layout)."""
import re
from pathlib import Path

ROOT = Path(__file__).parent            # build/
DIST = ROOT.parent                      # site root (flat: index.html, assets/, ...)
BASE_URL = "https://imildcom.github.io/imild-website"

P = lambda name: (ROOT / "partials" / name).read_text(encoding="utf-8")
B = lambda name: (ROOT / "pages" / name).read_text(encoding="utf-8")

SPRITE = P("sprite.html")
HEADER = P("header.html")
FOOTER = P("footer.html")

# file, page-id, scene, corp-header?, <title>, meta description (DE)
PAGES = [
    ("index.html",    "home",    "dv-skyline",    True,  "iMild.com — Drei Produkte. Eine Vision.",
     "iMild.com ist die Dachmarke hinter con.ax, smejj und smyst — Technologie in 51 Sprachen für die ganze Welt."),
    ("about.html",    "about",   "dv-hills",      True,  "Über uns — iMild.com",
     "Die Mission von iMild.com: Technologie, die allen gehört. Global von Tag 1, Autopilot-Prinzip, radikale Transparenz."),
    ("brands.html",   "brands",  "dv-skyline",    True,  "Unsere Marken — iMild.com",
     "Drei eigenständige Produkte, ein Fundament: con.ax (Social + Karten), smejj (AI Coding OS), smyst (Digitale KI-Zwillinge)."),
    ("newsroom.html", "news",    "dv-bay",        True,  "Newsroom — iMild.com",
     "Presse und Neuigkeiten von iMild.com, con.ax, smejj und smyst."),
    ("careers.html",  "jobs",    "dv-hills",      True,  "Karriere — iMild.com",
     "Bau die Zukunft mit uns: offene Stellen bei iMild.com, con.ax, smejj und smyst. 100% Remote."),
    ("contact.html",  "contact", "dv-goldengate", True,  "Kontakt — iMild.com",
     "Kontakt zu iMild.com: Presse, Partnerschaften, Support. Antwort meist in unter 24 Stunden."),
    ("legal.html",    "legal",   "dv-skyline",    True,  "Legal — iMild.com",
     "Impressum, Datenschutz und AGB der iMild.com-Dienste con.ax, smejj.com und smyst.com."),
    ("conax.html",    "conax",   "dv-bay",        False, "con.ax — Die Welt ist deine Timeline",
     "con.ax verbindet Menschen über Orte: das soziale Netzwerk mit interaktiven Karten. Ein iMild.com-Produkt."),
    ("smejj.html",    "smejj",   "dv-skyline",    False, "smejj — Software, die sich selbst baut",
     "smejj ist das autonome AI-Coding-Betriebssystem mit eigenem Modell und Verification Pipeline. Ein iMild.com-Produkt."),
    ("smyst.html",    "smyst",   "dv-hills",      False, "smyst — Dein Wissen. Für immer.",
     "smyst erstellt deinen digitalen KI-Zwilling — für Familie, Team und Nachwelt. Ein iMild.com-Produkt."),
]

def url_for(fname):
    return BASE_URL + "/" if fname == "index.html" else BASE_URL + "/" + fname

# Pragmatic CSP for a static site. Full security headers (HSTS, frame-ancestors,
# X-Content-Type-Options) require the Cloudflare setup (roadmap 0.5/0.6) and are
# NOT settable on GitHub Pages.
CSP = ("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
       "script-src 'self'; connect-src 'self'; font-src 'self'; base-uri 'self'; "
       "form-action 'self' mailto:; object-src 'none'")

TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="{csp}">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#0F172A">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="iMild.com">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{base}/assets/og-image.png">
<meta property="og:locale" content="de_DE">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{base}/assets/og-image.png">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="apple-touch-icon" href="assets/icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-page="{pid}">
<a class="skip" href="#main" data-i18n="a11y.skip">Zum Inhalt springen</a>
{sprite}
<div class="scene" aria-hidden="true"><svg><use href="#{scene}"/></svg></div>
<div class="shade" aria-hidden="true"></div>
{header}<main id="main">
{body}</main>
{footer}
<script src="assets/i18n.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
"""

def build():
    for fname, pid, scene, corp, title, desc in PAGES:
        header = ""
        if corp:
            header = re.sub(r"\{cur:(\w+)\}", lambda m: "cur" if m.group(1) == pid else "", HEADER)
        html = TEMPLATE.format(title=title, desc=desc, pid=pid, scene=scene, base=BASE_URL,
                               canonical=url_for(fname), csp=CSP,
                               sprite=SPRITE, header=header, body=B(fname), footer=FOOTER)
        (DIST / fname).write_text(html, encoding="utf-8")
        print(f"built {fname}")

if __name__ == "__main__":
    build()
