# GitHub-Einrichtung

## Erster Import
1. Im Repository den Branch `develop` auswählen.
2. Den gesamten Inhalt dieses Pakets in das Repository-Stammverzeichnis hochladen.
3. Commit-Nachricht: `chore: import BloxxStar Tools 6.8.1 foundation`
4. Prüfen, ob die Action **Quality checks** erfolgreich ist.

## V6.8.1 nach main übernehmen
1. Pull Request `develop` → `main` erstellen.
2. Änderungen prüfen und mergen.
3. Unter **Settings → Pages** bei **Build and deployment** die Quelle **GitHub Actions** auswählen.
4. Die Action **Deploy GitHub Pages** abwarten.

## Eigene Domain
In GitHub Pages später `tools.bloxxstar.de` als Custom Domain eintragen. Vor einer DNS-Umstellung muss die GitHub-Pages-Testadresse vollständig geprüft werden.

## Nächster Entwicklungsbranch
Nach dem stabilen Import von `develop` aus erstellen:

`feature/multilanguage`
