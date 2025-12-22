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
| `facebook` | Link zur Facebook-Gruppe (optional) | `https://facebook.com/groups/...` |
| `instagram` | Link zum Instagram-Account (optional) | `https://instagram.com/...` |
| `whatsapp` | Einladungslink zur WhatsApp-Gruppe (optional) | `https://chat.whatsapp.com/...` |
| `description` | Wann und wo ihr euch trefft | `Treffen jeden Sonntag, 11-14 Uhr` |

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
