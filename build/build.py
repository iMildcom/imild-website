#!/usr/bin/env python3
"""Build script: stitches partials + page bodies into dist/*.html"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT.parent / "dist"
P = lambda name: (ROOT / "partials" / name).read_text(encoding="utf-8")
B = lambda name: (ROOT / "pages" / name).read_text(encoding="utf-8")

SPRITE = P("sprite.html")
HEADER = P("header.html")
FOOTER = P("footer.html")

# file, page-id, scene, corp-header?, <title>, meta description (DE)
PAGES = [
    ("index.html",    "home",    "dv-skyline",    True,  "iMild — Drei Produkte. Eine Vision.",
     "iMild ist die Dachmarke hinter con.ax, smejj und smyst — Technologie in 51 Sprachen für die ganze Welt."),
    ("about.html",    "about",   "dv-hills",      True,  "Über uns — iMild",
     "Die Mission von iMild: Technologie, die allen gehört. Global von Tag 1, Autopilot-Prinzip, radikale Transparenz."),
    ("brands.html",   "brands",  "dv-skyline",    True,  "Unsere Marken — iMild",
     "Drei eigenständige Produkte, ein Fundament: con.ax (Social + Karten), smejj (AI Coding OS), smyst (Digitale KI-Zwillinge)."),
    ("newsroom.html", "news",    "dv-bay",        True,  "Newsroom — iMild",
     "Presse und Neuigkeiten von iMild, con.ax, smejj und smyst."),
    ("careers.html",  "jobs",    "dv-hills",      True,  "Karriere — iMild",
     "Bau die Zukunft mit uns: offene Stellen bei iMild, con.ax, smejj und smyst. 100% Remote."),
    ("contact.html",  "contact", "dv-goldengate", True,  "Kontakt — iMild",
     "Kontakt zu iMild: Presse, Partnerschaften, Support. Antwort meist in unter 24 Stunden."),
    ("legal.html",    "legal",   "dv-skyline",    True,  "Legal — iMild",
     "Impressum, Datenschutz und AGB der iMild-Dienste con.ax, smejj.com und smyst.com."),
    ("conax.html",    "conax",   "dv-bay",        False, "con.ax — Die Welt ist deine Timeline",
     "con.ax verbindet Menschen über Orte: das soziale Netzwerk mit interaktiven Karten. Ein iMild-Produkt."),
    ("smejj.html",    "smejj",   "dv-skyline",    False, "smejj — Software, die sich selbst baut",
     "smejj ist das autonome AI-Coding-Betriebssystem mit eigenem Modell und Verification Pipeline. Ein iMild-Produkt."),
    ("smyst.html",    "smyst",   "dv-hills",      False, "smyst — Dein Wissen. Für immer.",
     "smyst erstellt deinen digitalen KI-Zwilling — für Familie, Team und Nachwelt. Ein iMild-Produkt."),
]

TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-page="{pid}">
{sprite}
<div class="scene" aria-hidden="true"><svg><use href="#{scene}"/></svg></div>
<div class="shade" aria-hidden="true"></div>
{header}<main>
{body}</main>
{footer}
<script src="assets/i18n.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
"""

def build():
    DIST.mkdir(exist_ok=True)
    for fname, pid, scene, corp, title, desc in PAGES:
        header = ""
        if corp:
            header = re.sub(r"\{cur:(\w+)\}", lambda m: "cur" if m.group(1) == pid else "", HEADER)
        html = TEMPLATE.format(title=title, desc=desc, pid=pid, scene=scene,
                               sprite=SPRITE, header=header, body=B(fname), footer=FOOTER)
        (DIST / fname).write_text(html, encoding="utf-8")
        print(f"built {fname}")

if __name__ == "__main__":
    build()
