# BloxxStar CMS V9 – Server-Einrichtung

## Voraussetzungen

- MariaDB 10.11.18
- PHP 8.4 oder neuer
- PDO MySQL
- Domain-Document-Root: `/var/www/vhosts/web126.jimbo.kundenserver42.de/bloxxstar.de`

## 1. Datenbank initialisieren

In phpMyAdmin die Zieldatenbank auswählen und anschließend `database/schema.sql` importieren.

Die Datenbank und alle Tabellen müssen `utf8mb4` verwenden. Das Schema setzt hierfür `utf8mb4_unicode_ci`.

## 2. Umgebungsdatei anlegen

Im Projektstamm auf dem Server `.env.example` nach `.env` kopieren und die echten Werte eintragen:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bloxxstar.de
APP_TIMEZONE=Europe/Berlin

DB_HOST=localhost
DB_PORT=3306
DB_SOCKET=/var/lib/mysql/mysql.sock
DB_NAME=DEINE_DATENBANK
DB_USER=bloxxstar_db_admin
DB_PASSWORD=DEIN_SICHERES_PASSWORT
DB_CHARSET=utf8mb4
```

Die Datei `.env` darf niemals in GitHub eingecheckt werden.

## 3. API-Verbindung testen

Nach dem Deployment aufrufen:

```text
https://bloxxstar.de/api/v1/health/
```

Erwartete Antwort:

```json
{
  "status": "ok",
  "service": "BloxxStar API",
  "version": "v1",
  "database": {
    "connected": true
  }
}
```

Der Endpunkt gibt keine Zugangsdaten aus.

## 4. Produktionssicherheit

- `APP_DEBUG=false` verwenden.
- `.env` vor direktem Webzugriff schützen.
- PHP-Fehler nicht im Browser anzeigen.
- HTTPS erzwingen.
- Datenbankbenutzer nur mit den tatsächlich benötigten Rechten ausstatten.
- Nach erfolgreicher Einrichtung die öffentlich erreichbare PHP-Info-Datei entfernen.

## 5. Nächster Entwicklungsschritt

Nach erfolgreichem Health-Check folgen:

1. Migrationstabelle und Seed-Daten
2. Benutzer- und Rollenverwaltung
3. Session-Login und CSRF-Schutz
4. erste CRUD-API für Hersteller
5. Umstellung des Adminbereichs von Supabase auf die PHP-API
