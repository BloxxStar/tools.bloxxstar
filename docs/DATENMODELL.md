# BloxxStar CMS V9 – Datenmodell

## 1. Ziel

Das Datenmodell soll Sets unterschiedlicher Hersteller einheitlich verwalten und gleichzeitig herstellerspezifische Produktlinien und Subthemen abbilden können.

Beispiele:

```text
COBI > Historical Collection > WW2
LEGO > Star Wars > Ultimate Collector Series
BlueBrixx > Specials > Eisenbahn
```

Ein Set darf mehreren Kategorien, Tags und Wissensobjekten gleichzeitig zugeordnet sein.

## 2. Grundprinzipien

1. Veränderliche fachliche Listen werden in der Datenbank gepflegt.
2. Hierarchien werden über `parent_id` abgebildet.
3. Mehrfachzuordnungen werden über Relationstabellen abgebildet.
4. Hersteller, Produktlinie, Kategorie, Tag und Edition sind getrennte fachliche Konzepte.
5. Allgemeines Wissen wird nicht auf historische Inhalte beschränkt.
6. Öffentliche Inhalte besitzen einen Veröffentlichungsstatus.
7. Datensätze werden möglichst nicht physisch gelöscht, sondern archiviert.

## 3. Zentrale Entitäten

### manufacturers

Hersteller oder Marken von Sets.

Wichtige Felder:

- `id`
- `name`
- `slug`
- `description`
- `website_url`
- `country_code`
- `logo_media_id`
- `status`

### sets

Zentraler Produktdatensatz.

Wichtige Felder:

- `id`
- `manufacturer_id`
- `set_number`
- `name`
- `slug`
- `description`
- `piece_count`
- `minifigure_count`
- `release_date`
- `eol_date`
- `msrp_amount`
- `currency_code`
- `scale_text`
- `length_mm`
- `width_mm`
- `height_mm`
- `weight_g`
- `status`
- `published_at`

Die Kombination aus `manufacturer_id` und `set_number` soll eindeutig sein.

## 4. Produktlinien und Subthemen

### product_lines

Hierarchische Herstellerstruktur für Reihen und Subthemen.

Beispiel:

```text
Historical Collection
└── WW2
```

Wichtige Felder:

- `id`
- `manufacturer_id`
- `parent_id`
- `name`
- `slug`
- `description`
- `sort_order`
- `status`

`parent_id` verweist auf einen anderen Eintrag derselben Tabelle. Dadurch kann jede Zahl von Unterebenen aufgebaut werden.

### set_product_lines

Mehrfachzuordnung zwischen Sets und Produktlinien.

Ein Set kann beispielsweise gleichzeitig zu einer Hauptreihe und einer Edition gehören, sofern dies fachlich sinnvoll ist.

## 5. Kategorien

### categories

Herstellerunabhängige, hierarchische Sachkategorien.

Beispiele:

- Flugzeuge
- Schiffe
- Eisenbahn
- Gebäude
- Fahrzeuge
- Science-Fiction

Auch Kategorien dürfen Unterkategorien besitzen.

### set_categories

Mehrfachzuordnung zwischen Sets und Kategorien.

Beispiel für ein Set:

```text
Flugzeug
Militärfahrzeug
Displaymodell
```

## 6. Tags

### tags

Flexible, flache Schlagwörter für Suche und Filter.

Beispiele:

- WW2
- Executive Edition
- Großbritannien
- Rheinübung
- 1:32

### set_tags

Mehrfachzuordnung zwischen Sets und Tags.

Tags ersetzen keine strukturierten Felder, sondern ergänzen sie.

## 7. Flexible Eigenschaften

### attributes

Definiert zusätzliche Eigenschaften, die nicht für jedes Set gelten.

Beispiele:

- Edition
- Lizenz
- Epoche
- Nation
- Antriebsart
- Fernsteuerung enthalten

Datentypen:

- `text`
- `integer`
- `decimal`
- `boolean`
- `date`
- `option`
- `multi_option`

### attribute_options

Definiert auswählbare Werte für Eigenschaften des Typs `option` oder `multi_option`.

### set_attribute_values

Speichert den konkreten Wert einer Eigenschaft für ein Set.

Dadurch können neue Eigenschaften im CMS angelegt werden, ohne das Datenbankschema zu verändern.

## 8. Allgemeine Wissensdatenbank

### knowledge_entity_types

Typen von Wissensobjekten.

Beispiele:

- Fahrzeug
- Flugzeug
- Schiff
- Gebäude
- Person
- Unternehmen
- Organisation
- Ort
- Ereignis
- Technologie
- fiktionales Objekt

### knowledge_entities

Einzelne Wissensobjekte.

Beispiele:

- Fairey Swordfish
- Fleet Air Arm
- Operation Rheinübung
- X-Wing
- Deutsche Baureihe 01

### knowledge_relations

Beziehungen zwischen Wissensobjekten.

Beispiele:

```text
Fairey Swordfish -- eingesetzt von --> Fleet Air Arm
Fairey Swordfish -- beteiligt an --> Operation Rheinübung
X-Wing -- gehört zu --> Star Wars
```

### set_knowledge_entities

Verknüpft Sets mit Wissensobjekten.

## 9. Quellen

### sources

Verwaltet Quellen wie Herstellerseiten, Bücher, Videos, eigene Messungen oder Pressemitteilungen.

### source_links

Verknüpft eine Quelle mit einem beliebigen Datensatz und optional einem konkreten Feld.

Beispiele:

```text
Set 5769 / piece_count / COBI-Produktseite
Set 5769 / weight_g / selbst gewogen
Knowledge Entity Fairey Swordfish / description / Fachliteratur
```

## 10. Medien

### media

Zentraler Datensatz für Bilder, Logos, PDFs und weitere Dateien.

Medien werden über Relationstabellen oder Referenzfelder mit Herstellern, Sets, Shops und Wissensobjekten verknüpft.

## 11. Statuswerte

Empfohlene einheitliche Statuswerte:

- `draft`
- `review`
- `published`
- `archived`

Für technische oder nur intern verwendete Stammdaten kann zusätzlich `active` und `inactive` genutzt werden.

## 12. Beispiel COBI 5769

```text
Hersteller:       COBI
Setnummer:        5769
Name:             Fairey Swordfish
Produktlinie:     Historical Collection
Subthema:         WW2
Kategorie:        Flugzeug
Tags:             Executive Edition, Großbritannien, Rheinübung
Wissensobjekte:   Fairey Swordfish, Fleet Air Arm, Operation Rheinübung
```

Keine dieser Klassifizierungen muss im PHP- oder JavaScript-Code fest programmiert werden.

## 13. Nächste technische Schritte

1. SQL-Schema für die Kernentitäten erstellen.
2. Indizes und Eindeutigkeitsregeln definieren.
3. Fremdschlüssel und Löschregeln festlegen.
4. Seed-Daten für Rollen und Statuswerte anlegen.
5. API-Verträge für Hersteller, Produktlinien, Kategorien, Tags und Sets dokumentieren.
