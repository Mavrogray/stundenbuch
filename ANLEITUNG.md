# Wickeldaten – Anleitung

Offline-App fürs Tablet, aufgebaut wie das Stundenbuch.
Die Motordaten liegen **nur auf dem Gerät**. Im GitHub-Repository liegt nur der Programmcode.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die App |
| `sw.js` | Offline-Cache (Service Worker) |
| `manifest.json`, `icon-192.png`, `icon-512.png` | Installation als App |

## 1. Auf GitHub Pages stellen

1. Auf GitHub ein neues Repository `wickeldaten` anlegen.
2. „Add file → Upload files“ → alle Dateien aus der ZIP hochladen (nicht die ZIP selbst) → „Commit changes“.
3. Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ca. 1 Minute ist die App unter `https://DEINNAME.github.io/wickeldaten/` erreichbar.

Hinweis: GitHub Pages aus einem **privaten** Repository geht nur mit einem kostenpflichtigen Konto. Mach es so wie beim Stundenbuch. Ein öffentliches Repository ist unbedenklich, weil darin keine Motordaten liegen.

## 2. Auf dem Tablet

1. Die Adresse in **Chrome** öffnen.
2. Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
3. App einmal über das neue Symbol starten. Ab jetzt funktioniert sie ohne Netz.

**Ein Gerät ist das Original.** Jedes Tablet hat seinen eigenen Datenbestand, es wird nichts zwischen Geräten abgeglichen.
Wenn mehrere Kollegen eintragen, dann alle am selben Gerät.

## 3. Sicherung

- **Automatisch:** Beim ersten Speichern eines Tages legt die App `wickeldaten-backup-JJJJ-MM-TT.json` im Download-Ordner ab.
- **Fotos/PDFs** kommen bei jeder Sicherung als `wickeldaten-fotos-JJJJ-MM-TT-HHMM.zip` dazu – nur die seit der letzten Sicherung **neuen** Dateien. Alle ZIPs zusammen ergeben den kompletten Foto-Bestand, also keine davon löschen.
- **Manuell:** Gibt es danach weitere Änderungen, erscheint oben der Knopf **„⬇ Sichern“**. Außerdem: ⚙ Einstellungen → „Sicherung speichern“.
- Unter der Überschrift stehen der Zeitpunkt der letzten Sicherung und die Zahl der Änderungen seitdem.
- Mehrere Sicherungen am selben Tag legt Chrome als `…(1).json`, `…(2).json` ab. Die neueste ist die mit der höchsten Nummer.

### Syncthing (läuft schon fürs Stundenbuch)

Im Download-Ordner auf dem Tablet ist bereits ein Ignorier-Muster eingetragen. Es braucht **zwei zusätzliche Zeilen** vor dem `*`:

```
!/stundenbuch-backup-*.json
!/wickeldaten-backup-*.json
!/wickeldaten-fotos-*.zip
*
```

Syncthing-Fork → Ordner „Download“ → Ignorier-Muster bearbeiten → speichern.
Danach kommen die Wickeldaten-Sicherungen im selben Container auf betzendorf an und werden über den Proxmox-Backup-Job mitgesichert.

### Wiederherstellen

Neueste `wickeldaten-backup-….json` **und alle** `wickeldaten-fotos-….zip` aufs Tablet kopieren → App → ⚙ Einstellungen → „Sicherung laden“ (PIN) → alle Dateien auf einmal auswählen.
Vorhandene Motoren mit gleicher Kennung werden überschrieben, alle anderen bleiben erhalten.

Die JSON-Sicherung aus der Testversion auf claude.ai lässt sich genauso laden.

## 4. Update der App

1. Neue Dateien ins Repository hochladen.
2. Versionsnummer an **zwei Stellen** gleich hochzählen, z. B. 1.1 → 1.2:
   - `index.html`: `const APP_VERSION="1.1";`
   - `sw.js`: `const VERSION = "wickeldaten-1.1";`
   Ohne neue Nummer in `sw.js` bleibt die alte Version im Cache.
   Die Nummer steht unten in der App, so siehst du, ob das Update angekommen ist.
3. App auf dem Tablet mit Internet zweimal neu öffnen.

Die Daten bleiben bei einem Update erhalten. Sie gehen nur verloren, wenn in Chrome die Website-Daten gelöscht werden oder die App deinstalliert wird. Dafür gibt es die Sicherung.

## 5. PIN

⚙ Einstellungen → PIN (4–8 Ziffern) vergeben. Eine einzige PIN, sie schützt:
Motoren löschen, Fotos löschen, Einsätze entfernen, Sicherung laden.
Ohne PIN ist Löschen gesperrt. Nach der Eingabe bleibt die PIN 5 Minuten gültig.
**PIN vergessen:** Chrome → Website-Einstellungen → Daten der App löschen, App neu öffnen, letzte Sicherung laden.
Das ist ein Bedienschutz gegen Versehen, keine echte Sicherheit.

## 6. Darstellung

⚙ Einstellungen → Darstellung: Hell/Dunkel, Schriftgröße (Normal / Groß / Sehr groß, Standard: Groß) und Akzentfarbe (Schnellfarben oder eigene Farbe). Gilt jeweils nur für das Gerät.

## 7. Excel

⚙ Einstellungen → „Alle als CSV (Excel)“: Trennzeichen Semikolon, Umlaute korrekt, öffnet direkt in Excel.
