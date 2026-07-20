# BloxxStar Backend – Einrichtung

## 1. Supabase-Projekt anlegen

Ein neues Supabase-Projekt erstellen und die Datenbank-Migrationen aus `supabase/migrations/` in Reihenfolge anwenden. Für dauerhafte Entwicklung und Deployment sollen Schemaänderungen ausschließlich als Migrationen im Repository gepflegt werden.

## 2. Admin-Benutzer anlegen

Im Supabase-Dashboard unter Authentication einen Benutzer mit E-Mail und Passwort anlegen. Danach die Backend-Rolle einmalig per SQL setzen:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'DEINE-EMAIL-ADRESSE';
```

Zulässige Rollen:

- `admin`
- `editor`
- `reviewer`

Nach einer Rollenänderung einmal ab- und wieder anmelden, damit das JWT die neuen App-Metadaten enthält.

## 3. Admin-Oberfläche verbinden

In `admin/config.js` die öffentliche Projekt-URL und den Publishable Key eintragen:

```js
window.BLOXXSTAR_SUPABASE = {
  url: "https://DEIN-PROJEKT.supabase.co",
  publishableKey: "DEIN-PUBLISHABLE-KEY"
};
```

Der Publishable Key darf im Browser verwendet werden. Niemals den `service_role`-Schlüssel in Website-Dateien, GitHub oder Browser-Code eintragen. Der tatsächliche Datenschutz wird über Row Level Security geregelt.

## 4. Zugriff

Die Oberfläche ist anschließend über `/admin/` erreichbar. Sie ist mit `noindex,nofollow` markiert, ersetzt aber keine Authentifizierung. Datenzugriffe werden serverseitig durch Supabase Auth und RLS geschützt.

## 5. Aktueller Funktionsumfang

- Login mit E-Mail und Passwort
- Rollenprüfung über `app_metadata.role`
- Dashboard-Kennzahlen
- Setliste
- Sets anlegen und bearbeiten
- Veröffentlichungsstatus
- EOL-Status, Datum, Genauigkeit, Bestätigung und redaktionelle Notiz
- EOL-Zentrale
- Watchdog-Warteschlange mit Akzeptieren, Zurückstellen und Verwerfen

Ein akzeptierter Watchdog-Fund wird in dieser ersten Stufe als redaktionell bestätigt markiert. Die automatische, feldgenaue Übernahme in den Set-Datensatz folgt mit dem eigentlichen Watchdog-Worker, damit externe Daten niemals ungeprüft oder über ein frei wählbares Feld geschrieben werden.

## 6. Sicherheitsregeln

- Keine geheimen Schlüssel im Frontend.
- Nur veröffentlichte Sets und Hersteller sind öffentlich lesbar.
- Entwürfe, Quellen und Watchdog-Funde sind nur für freigeschaltete Backend-Rollen sichtbar.
- Externe Änderungen werden niemals direkt veröffentlicht.
- Offizielle EOL-Bestätigung nur bei belastbarer Herstellerquelle.
- Jede spätere Crawler-Quelle erhält eigene Limits, Nutzungsbedingungen und Prüfregeln.
