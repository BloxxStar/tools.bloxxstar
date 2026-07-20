# BloxxStar CMS – Architektur V9

## 1. Zielbild

BloxxStar V9 wird die zentrale Plattform für Inhalte, Daten und Werkzeuge rund um BloxxStar.

- `bloxxstar.de` wird die öffentliche Hauptplattform.
- `bloxxstar.de/admin/` wird das BloxxStar CMS.
- `bloxxstar.de/api/` stellt die serverseitige PHP-API bereit.
- `tools.bloxxstar.de` bleibt der Bereich für Rechner und Spezialwerkzeuge.
- Die zentrale Datenhaltung erfolgt in einer eigenen MySQL-/MariaDB-Datenbank bei Joomla100.

## 2. Technische Grundarchitektur

```text
Browser
  |
  | HTTPS
  v
bloxxstar.de
  |
  +-- öffentliche Website
  +-- /admin/  -> CMS
  +-- /api/    -> PHP-REST-API
                 |
                 v
          MySQL / MariaDB
```

Der Browser greift niemals direkt auf die Datenbank zu. Sämtliche Schreib- und Lesezugriffe erfolgen über die PHP-API.

## 3. Geplante Repository-Struktur

```text
/
├── admin/                 # CMS-Oberfläche
├── api/                   # PHP-API
│   ├── auth/
│   ├── manufacturers/
│   ├── sets/
│   ├── media/
│   ├── shops/
│   ├── search/
│   └── system/
├── assets/                # gemeinsame CSS-, JS- und Bilddateien
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seed/
├── docs/                  # technische Dokumentation
├── public/                # öffentliche Website
├── tools/                 # Maßstabsrechner und weitere Tools
├── storage/               # serverseitige Uploads, nicht direkt versioniert
├── .env.example
├── .gitignore
└── README.md
```

## 4. URL-Struktur

```text
https://bloxxstar.de/
https://bloxxstar.de/sets/
https://bloxxstar.de/hersteller/
https://bloxxstar.de/geschichte/
https://bloxxstar.de/videos/
https://bloxxstar.de/shops/
https://bloxxstar.de/suche/
https://bloxxstar.de/admin/
https://bloxxstar.de/api/

https://tools.bloxxstar.de/
```

## 5. Datenbankmodule

### Kernmodule

- `users`
- `roles`
- `user_roles`
- `manufacturers`
- `sets`
- `categories`
- `themes`
- `tags`
- `set_tags`
- `media`
- `videos`
- `sources`

### Handels- und Affiliate-Module

- `shops`
- `discount_codes`
- `affiliate_links`
- `set_shop_links`
- `price_entries`

### Historische Wissensmodule

- `vehicles`
- `aircraft`
- `ships`
- `people`
- `operations`
- `wars`
- `units`
- Relationstabellen zwischen Sets und historischen Einträgen

### Systemmodule

- `audit_log`
- `settings`
- `watchdog_jobs`
- `watchdog_results`

## 6. Rollen und Rechte

Geplante Rollen:

- `admin`: vollständiger Zugriff
- `editor`: Inhalte erstellen und bearbeiten
- `reviewer`: Inhalte prüfen und freigeben
- `viewer`: nur interner Lesezugriff

Die Berechtigungen werden ausschließlich serverseitig geprüft.

## 7. Authentifizierung

- PHP-Session-basierter Login
- Passwörter ausschließlich mit `password_hash()` speichern
- sichere Cookies mit `HttpOnly`, `Secure` und `SameSite`
- CSRF-Schutz für alle schreibenden Aktionen
- Rate-Limiting für Login und sensible API-Endpunkte
- optional später Zwei-Faktor-Authentifizierung

## 8. API-Grundsätze

- JSON-basierte REST-API
- versionierte Endpunkte unter `/api/v1/`
- konsistente HTTP-Statuscodes
- serverseitige Validierung aller Eingaben
- vorbereitete SQL-Statements über PDO
- keine Datenbank-Zugangsdaten im Frontend oder Repository

Beispiele:

```text
GET    /api/v1/manufacturers
POST   /api/v1/manufacturers
GET    /api/v1/manufacturers/{id}
PUT    /api/v1/manufacturers/{id}
DELETE /api/v1/manufacturers/{id}

GET    /api/v1/sets
POST   /api/v1/sets
GET    /api/v1/sets/{id}
PUT    /api/v1/sets/{id}
DELETE /api/v1/sets/{id}
```

## 9. Medien und Uploads

- Uploads werden außerhalb des direkt ausführbaren PHP-Bereichs gespeichert.
- Dateityp, MIME-Type und Dateigröße werden serverseitig geprüft.
- Dateinamen werden zufällig erzeugt.
- Bilder werden bei Bedarf automatisch verkleinert.
- Metadaten werden in der Tabelle `media` gespeichert.

## 10. Sicherheitsanforderungen

- PDO mit Prepared Statements
- Ausgabe-Escaping gegen XSS
- CSRF-Tokens
- sichere Session-Konfiguration
- restriktive Datei-Uploads
- Rollenprüfung pro Endpunkt
- Audit-Log für kritische Änderungen
- `.env` niemals in GitHub einchecken
- regelmäßige Datenbank-Backups

## 11. Migration von Supabase

Supabase bleibt während der Entwicklung vorerst bestehen.

Geplanter Ablauf:

1. Datenmodell in MySQL/MariaDB abbilden.
2. PHP-API implementieren.
3. CMS auf die neue API umstellen.
4. Daten aus Supabase exportieren und importieren.
5. öffentliche Seiten umstellen.
6. Funktionstests durchführen.
7. Supabase erst nach erfolgreicher Abnahme entfernen.

## 12. Entwicklungsstrategie

- `main`: aktuell veröffentlichte stabile Version
- `develop`: Integrationsbranch, sofern weiterhin verwendet
- `feature/v9-cms`: Neuentwicklung von V9

V9 wird zunächst auf einer Testumgebung bereitgestellt, zum Beispiel:

```text
https://beta.bloxxstar.de/
```

Erst nach vollständiger Prüfung wird auf `bloxxstar.de` umgeschaltet.

## 13. Erste Umsetzungsschritte

1. Joomla100-Systemdaten erfassen: PHP-Version, Datenbanktyp, Document Root und Deployment-Möglichkeiten.
2. `.env.example` und sichere Konfigurationsstruktur erstellen.
3. erstes MySQL-/MariaDB-Schema für Benutzer, Rollen, Hersteller und Sets anlegen.
4. PHP-Basis und Datenbankverbindung mit PDO erstellen.
5. Login und Session-Sicherheit implementieren.
6. Herstellerverwaltung bauen.
7. Setverwaltung bauen.
8. öffentliche Set-Datenbank anbinden.

## 14. Leitprinzip

BloxxStar V9 wird modular, dokumentiert und migrationsfähig gebaut. Öffentliche Website, CMS, API und Tools bleiben technisch getrennt, verwenden jedoch dieselbe zentrale Datenbasis.
