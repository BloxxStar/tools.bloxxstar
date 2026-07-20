# BloxxStar Tools

BloxxStar Tools ist eine Sammlung kostenloser Rechner, Bezugsquellen und Community-Ressourcen für LEGO®- und Klemmbaustein-Fans.

## Enthaltene Werkzeuge
- Steinepreis-Rechner
- Preis-pro-100-g-Rechner
- Maßstabsrechner
- Bezugsquellen und Rabattcodes
- Share-Landingpages und Social-Media-Metadaten
- Dark-/Light-Mode und responsive Navigation

## Aktueller Stand
**V6.8.1 – GitHub-Fundament**

Die bestehende V6.8 wurde funktional unverändert übernommen und um Versionsverwaltung, automatische Prüfungen, GitHub-Pages-Deployment und Projektdokumentation ergänzt.

## Lokale Prüfung
Voraussetzung: Node.js 20 oder neuer.

```bash
npm run check
```

Optionaler lokaler Webserver:

```bash
npm run serve
```

## Branch-Modell
- `main`: veröffentlichte Version
- `develop`: gemeinsamer Entwicklungsstand
- `feature/*`: neue Funktionen
- `fix/*`: Fehlerkorrekturen

Weitere Details: [CONTRIBUTING.md](CONTRIBUTING.md)

## Veröffentlichung
Die GitHub Action `Deploy GitHub Pages` veröffentlicht ausschließlich Änderungen aus `main`. Die Einrichtung ist unter [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) beschrieben.

## Roadmap
Die geplanten Ausbaustufen stehen in [ROADMAP.md](ROADMAP.md).

## Rechtlicher Hinweis
LEGO® ist eine Marke der LEGO Gruppe, durch die dieses Projekt weder gesponsert noch autorisiert oder unterstützt wird. Weitere Hersteller- und Markennamen gehören ihren jeweiligen Rechteinhabern.
