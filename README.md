# Urban Sketchers Deutschland

Diese Website listet Urban Sketchers Gruppen in Deutschland mit ihren Treffpunkten und Kontaktmöglichkeiten.

## Für Beitragende

Du möchtest eine neue Gruppe hinzufügen oder bestehende Infos aktualisieren? Es gibt zwei Wege:

### Option 1: Issue erstellen (empfohlen)

Am einfachsten geht es über unsere Formulare:

- **[Neue Stadt hinzufügen](../../issues/new?template=add-city.yml)** — Füge eine neue Urban Sketchers Gruppe hinzu
- **[Bestehende Stadt aktualisieren](../../issues/new?template=update-city.yml)** — Aktualisiere Treffzeiten oder Links

Nach dem Absenden wird automatisch ein Pull Request erstellt, der von einem Maintainer geprüft und freigegeben wird.

### Option 2: CSV direkt bearbeiten

Alle Städte-Daten liegen in einer einfachen CSV-Datei:

📄 **[`data/cities.csv`](data/cities.csv)**

| Spalte | Beschreibung | Beispiel |
|--------|--------------|----------|
| `city` | Name der Stadt | `Bielefeld` |
| `lat` | Breitengrad für die Karte | `52.0302` |
| `lon` | Längengrad für die Karte | `8.5325` |
| `is_official` | Offizielles USk Chapter? (1 = ja, leer = nein) | `1` |
| `website` | URL zur eigenen Website (optional) | `www.example.de` |
| `email` | Kontakt-E-Mail (optional), auch mit Name: `Name <email>` | `kontakt@example.de` |
| `facebook` | Link zur Facebook-Gruppe (optional) | `https://facebook.com/groups/...` |
| `instagram` | Instagram-Handle ohne URL (optional) | `@usk_bielefeld` |
| `bluesky` | Bluesky-Handle (optional) | `@usk.bsky.social` |
| `whatsapp` | Einladungslink zur WhatsApp-Gruppe (optional) | `https://chat.whatsapp.com/...` |
| `description` | Wann und wo ihr euch trefft (optional) | `Treffen jeden Sonntag, 11-14 Uhr` |
| `founded` | Gründungsdatum der Gruppe (optional), Format: `YYYY` oder `YYYY-MM-DD` | `2015-06-04` |
| `chapter_date` | Datum der offiziellen Chapter-Anerkennung (optional), Format: `YYYY` oder `YYYY-MM-DD` | `2018` |

💡 **Koordinaten finden:** Gib deine Stadt auf [latlong.net](https://www.latlong.net/) ein — die Koordinaten werden direkt angezeigt und können kopiert werden.

#### So bearbeitest du die Datei auf GitHub:

1. Öffne [`data/cities.csv`](data/cities.csv)
2. Klicke auf das Stift-Symbol (✏️) oben rechts
3. Füge eine neue Zeile hinzu oder bearbeite eine bestehende
4. Scrolle nach unten und klicke "Propose changes"
5. Auf der nächsten Seite klicke "Create pull request"

**Wichtig bei der CSV-Bearbeitung:**
- Texte mit Kommas müssen in Anführungszeichen stehen: `"Treffen jeden 1. und 3. Sonntag, 11 Uhr"`
- Leere Felder einfach leer lassen (nicht `null` oder `-` schreiben)

## Technische Infos

Die Website wird mit [Nanoc](https://nanoc.app) generiert. Die CSV-Datei wird automatisch eingelesen und als HTML gerendert.

```bash
# Lokale Entwicklung
bundle install
bundle exec nanoc live    # Startet Server auf localhost:3000

# Einmalig kompilieren
bundle exec nanoc compile
```

## Lizenz

MIT
