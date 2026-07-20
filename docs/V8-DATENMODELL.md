# BloxxStar V8 – Datenmodell und EOL-Regeln

## Grundsatz

Externe Daten werden nicht ungeprüft direkt auf der Website ausgespielt. Importer oder Crawler schreiben zunächst in eine Staging-Struktur. Erst nach Validierung werden Datensätze in den öffentlichen Set-Index übernommen.

## EOL-Felder

Jeder Set-Datensatz besitzt ein `eol`-Objekt:

- `state`: `not-announced`, `expected`, `confirmed`, `ended` oder `unknown`
- `date`: ISO-Datum oder `null`
- `precision`: `day`, `month`, `quarter`, `year` oder `unknown`
- `sourceType`: Art der Quelle
- `sourceUrl`: konkrete Quelle
- `verifiedAt`: Zeitpunkt der letzten Prüfung
- `notes`: redaktionelle Hinweise

## Veröffentlichungsregeln

1. `confirmed` nur bei belastbarer offizieller Quelle.
2. Händlerangaben werden grundsätzlich als `expected` geführt, sofern der Hersteller sie nicht bestätigt.
3. Abgelaufene, verifizierte Termine wechseln zu `ended`.
4. Fehlende oder widersprüchliche Daten bleiben `unknown`.
5. Jede automatisierte Änderung muss Quelle und Prüfzeitpunkt speichern.

## Automatische Listen

Die öffentliche EOL-Ansicht wird ausschließlich aus den strukturierten Setdaten erzeugt. Dadurch entstehen automatisch:

- demnächst EOL
- bestätigte EOL-Termine
- bereits EOL
- EOL noch unbekannt

Die gleiche Struktur kann später für Hersteller-, Jahres- und Kategorie-Listen sowie Benachrichtigungen verwendet werden.
