# Stundenbuch – Einrichtung

## 1. App auf das Tablet bringen (einmalig, braucht Internet)

Die App muss einmal über **HTTPS** geladen werden, danach läuft sie offline.

**Weg A – GitHub Pages (kostenlos, ohne Git-Kenntnisse)**
1. Auf github.com ein Konto anlegen, dann ein neues Repository „stundenbuch“ (Public).
2. „Add file → Upload files“ → alle Dateien aus der ZIP hochladen (nicht die ZIP selbst) → „Commit changes“.
3. Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ca. 1 Minute ist die App unter `https://DEINNAME.github.io/stundenbuch/` erreichbar.

Im Repository liegt nur der Programmcode. Deine Zeiten bleiben ausschließlich auf dem Tablet.

**Auf dem Tablet**
1. Die Adresse in **Chrome** öffnen.
2. Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
3. App einmal über das neue Symbol starten. Ab jetzt funktioniert sie ohne Netz.
4. Unter „Daten“: Name, Sollstunden, Pausenlängen prüfen.

**Update der App:** neue Dateien hochladen, App auf dem Tablet zweimal neu öffnen (mit Internet).

## 2. Sicherung per Syncthing

Ablauf: Bei „Gehen“ legt die App `stundenbuch-backup-JJJJ-MM-TT.json` im Download-Ordner ab.
Syncthing schickt diese Dateien im Firmen- oder Heim-WLAN an deinen Proxmox.

### 2a. Proxmox: Container mit Syncthing
1. Neuen LXC anlegen: Debian 12, 1 Kern, 512 MB RAM, 4 GB Disk, unprivilegiert.
2. In der Konsole des Containers (Achtung: Debian hat schon einen System-Benutzer `sync`, daher heißt unserer `syncthing`):
   ```
   apt update && apt install -y --no-install-recommends syncthing
   useradd -m -s /bin/bash syncthing
   mkdir -p /etc/systemd/system/syncthing@syncthing.service.d
   printf '[Service]\nEnvironment=STGUIADDRESS=0.0.0.0:8384\n' > /etc/systemd/system/syncthing@syncthing.service.d/gui.conf
   systemctl daemon-reload && systemctl enable --now syncthing@syncthing
   ```
3. Von außen (nur Host per ZeroTier erreichbar) am Laptop: `ssh -L 8384:IP-DES-CONTAINERS:8384 root@ZEROTIER-IP-DES-HOSTS`, dann im Browser `http://localhost:8384`.
4. Im Browser `http://IP-DES-CONTAINERS:8384` (bzw. `http://localhost:8384`) öffnen → **sofort ein GUI-Passwort setzen** (Einstellungen → GUI).
5. Den Container in deinen Proxmox-Backup-Job aufnehmen (Datacenter → Backup).

### 2b. Tablet: Syncthing-Fork
1. „Syncthing-Fork“ aus F-Droid oder dem Play Store installieren.
2. Geräte gegenseitig verbinden: Auf dem Tablet „Gerät hinzufügen“ → QR-Code der Geräte-ID vom Container scannen (im Container: Aktionen → ID anzeigen). Auf dem Container die Anfrage bestätigen.
3. Ordner hinzufügen: den **Download**-Ordner, Ordnertyp **„Nur senden“**, für den Container freigeben.
4. Ignorier-Muster für diesen Ordner setzen, damit nur die Sicherungen übertragen werden:
   ```
   !/stundenbuch-backup-*.json
   *
   ```
5. Einstellungen → Ausführungsbedingungen: „Nur bei WLAN“ und „Nur in ausgewählten WLANs“ → Firmen-Gast-WLAN und Heim-WLAN wählen. Die App braucht dafür die Standort-Berechtigung, sonst sieht sie den WLAN-Namen nicht.
6. Akku-Optimierung für Syncthing-Fork ausschalten, sonst stoppt Android die Synchronisation.

### 2c. Container: Ordner annehmen
- Die Ordner-Anfrage vom Tablet annehmen, Ordnertyp **„Nur empfangen“**.
- Ordner-Einstellungen → Dateiversionierung „Einfach“, damit auch versehentlich gelöschte Sicherungen erhalten bleiben.

### Wiederherstellen
Neueste `stundenbuch-backup-….json` aufs Tablet kopieren → App → „Daten“ → „Sicherung laden“.

## 3. Stempeln per Link (für NFC-Tag oder QR-Code)

Die App führt Aktionen aus, wenn sie mit einem dieser Zusätze an der Adresse geöffnet wird:

| Zusatz       | Wirkung                                                        |
|--------------|----------------------------------------------------------------|
| `?a=stempel` | nicht eingestempelt → Kommen, sonst → Gehen                     |
| `?a=kommen`  | Kommen                                                         |
| `?a=gehen`   | Gehen (mit „Rückgängig“ und Auto-Sicherung)                    |
| `?a=pause`   | Pause starten (vor 11 Uhr Frühstück, danach Mittag) bzw. beenden |

Beispiel: `https://DEINNAME.github.io/stundenbuch/?a=stempel`

Diese Adresse kann auf einen NFC-Tag geschrieben werden (z. B. mit der App „NFC Tools“) oder als QR-Code gedruckt werden.

## 4. Datenschutz / Verschlüsselung

- **Tablet:** Bildschirmsperre mit PIN setzen (Android verschlüsselt den Speicher dann automatisch).
- **App:** Daten → „Passwort setzen“. Alle Sicherungsdateien (auch die automatische bei „Gehen“) werden mit AES-256-GCM verschlüsselt (Schlüssel per PBKDF2-SHA256, 310.000 Runden). **Passwort verloren = Sicherungen verloren.** Im Passwortmanager ablegen.
- **CSV-Export** ist nicht verschlüsselt – nur bei Bedarf nutzen und danach löschen.
- **Syncthing:** Beim Freigeben des Ordners auf dem Tablet für das Gerät „betzendorf“ ein **Verschlüsselungspasswort** eintragen → der Server speichert nur verschlüsselte Dateien („nicht vertrauenswürdiges Gerät“).
- **Proxmox Backup:** Speicher „pbs“ auf betzendorf → Edit → Reiter „Encryption“ → Schlüssel erzeugen → **Schlüssel herunterladen und sicher aufbewahren.**

## 5. Bedienung v1.0

- **Auftrag antippen** = Arbeit startet (die 3 zuletzt genutzten stehen oben, alles andere über die Suche).
- **🚗 Fahrt:** Ziel wählen → blauer Fahrtbalken → bei Ankunft „Angekommen“. Fertig beim Kunden: 🚗 → „Zurück in die Firma“, „Wie Hinfahrt“ oder nächster Kunde (Fahrzeit wird auf beide Kunden halbiert).
- **☕ Pause:** Frühstück/Mittag enden automatisch mit Ton. Danach läuft Betriebsarbeiten, die App fragt „Weiter mit Kunde?“.
- **🏖 Urlaubsplanung (☰):** Zeitraum von–bis eintragen (Urlaub, Krank, Bildungsurlaub, RV Fit, Gleittag – nur Werktage zählen). Der Brückentag-Finder zeigt die Zeiträume mit den meisten freien Tagen pro Urlaubstag, „Eintragen“ übernimmt sie. Im Ausdruck erscheinen Abwesenheiten als ein Block ohne Stunden.
- **☰ Menü:** Aufträge, Ausdruck, Tag bearbeiten (Urlaub, halber Urlaubstag, Krank, RV Fit, Bildungsurlaub, Gleittag), Sicherung, Einstellungen, Über/Hilfe (Version, Fehlerprotokoll).
- **Feiertage Niedersachsen** werden automatisch berücksichtigt, 24.12./31.12. sind halbe Tage.
- **Konten:** Unter Einstellungen einmal Überstunden- und Resturlaub-Startwert mit Datum eintragen. Am 1.1. kommen die Jahres-Urlaubstage dazu.
- **Ausdruck:** A6 mit 20 mm Lochrand (Heftstreifen), eine Zeile pro Auftrag.
