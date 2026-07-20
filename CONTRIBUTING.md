# Mitarbeit und Entwicklungsablauf

## Branches
- `main`: stabiler, veröffentlichter Stand
- `develop`: integrierter Entwicklungsstand
- `feature/<name>`: einzelne neue Funktionen
- `fix/<name>`: Fehlerkorrekturen

## Ablauf
1. Neuen Branch von `develop` erstellen.
2. Änderung lokal prüfen: `npm run check`.
3. Verständlichen Commit erstellen.
4. Pull Request nach `develop` öffnen.
5. Nach fachlicher Prüfung in `develop` mergen.
6. Eine Veröffentlichung erfolgt per Pull Request von `develop` nach `main`.

## Commit-Beispiele
- `feat: add multilingual navigation`
- `fix: correct scale calculation rounding`
- `docs: update deployment guide`
- `chore: prepare release 7.0`
