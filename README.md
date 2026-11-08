# Drivefolio — Çağrı Çatık

Ein kleines, befahrbares 3D-Portfolio für **GitHub Pages**. Three.js rendert die Welt, Rapier übernimmt Kollisionen. Alle Laufzeitdateien, Modelle und Texturen werden lokal mit ausgeliefert. Es ist kein Backend erforderlich.

## Lokal starten

Node.js 22.12 oder neuer (GitHub Actions verwendet Node 22):

```sh
npm ci
npm run dev
```

Die im Terminal angezeigte URL öffnen. Ein Doppelklick auf `index.html` genügt wegen JavaScript-Modulen und Modell-Downloads nicht.

## GitHub Pages veröffentlichen

1. Ein eigenes GitHub-Repository anlegen oder ein leeres vorhandenes verwenden. Die Dateien aus diesem Ordner **einschließlich `.github/`** in das Repository-Stammverzeichnis übernehmen.
2. Unter **Settings → Pages → Build and deployment → Source** den Eintrag **GitHub Actions** wählen.
3. Auf den Branch `main` pushen. Der enthaltene Workflow führt Tests und Build aus und veröffentlicht `dist/`.
4. Die URL im erfolgreichen Deployment-Job öffnen. Bei einem Repository `Drivefolio` lautet sie üblicherweise `https://cagricatik.github.io/Drivefolio/`.

`vite.config.js` verwendet `base: './'`. Deshalb funktionieren Assets auch unter einem Repository-Unterpfad. Keine Tokens oder `.env`-Dateien nötig. Zielrepository: [CagriCatik/Drivefolio](https://github.com/CagriCatik/Drivefolio).

## Steuerung

| Eingabe | Aktion |
| --- | --- |
| WASD / Pfeiltasten | Fahren und lenken |
| Leertaste | Bremsen |
| Touch-Pfeile | Fahren auf Geräten mit Touchscreen |
| + / − | Kamerazoom |
| ↺ | Fahrzeug zum Start zurücksetzen |
| Escape | Dialog schließen |

In einer farbigen Parkfläche kurz stillstehen: Die zugehörige Projektkarte öffnet sich. Nach dem Schließen fährt man erst aus der Fläche heraus, bevor dieselbe Karte erneut automatisch geöffnet werden kann. GitHub öffnet sich ausschließlich über einen ausdrücklich angeklickten Link.

Die Projektliste funktioniert auch bei fehlendem WebGL. Ohne JavaScript sind direkte GitHub-Links hinterlegt.

## Inhalt ändern

Die drei Stationen werden in `src/projects.js` definiert: Titel, Kurzbeschreibung, Tags, GitHub-URL, Farbe und Position. Die Stationsdaten erzeugen sowohl die Weltstationen als auch die normale Projektliste. Das Profil steht in `index.html`.

## Struktur

| Modul | Verantwortung |
| --- | --- |
| `src/projects.js` | Projektinhalte und Stationspositionen |
| `src/parking.js` | Reine Parkerkennung, Haltezeit und Wiedereintritt |
| `src/input.js` | Tastatur/Touch und Freigabe der Steuerung |
| `src/vehicle.js` | Rapier-Welt und vereinfachtes Fahrzeugmodell |
| `src/camera.js` | Feste Kamerarichtung, Nachführung, Zoom |
| `src/world.js` | Modelle, Boden, Beschilderung, statische Kollisionen |
| `src/main.js` | Initialisierung, Dialoge und Simulationsschleife |

Das Fahrzeug ist ein vereinfachtes Arcade-Modell mit Starrkörperkollision, Schwerkraft und Sprungimpuls. Es ist kein vollständiges Fahrwerks- oder Reifenmodell. Die Kamera verwendet Brunos 25°-Perspektive mit festem Weltwinkel. Dies ist eine kleine eigenständige Umsetzung, kein unveränderter Fork seiner vollständigen Welt.

## Validierung

```sh
npm test
npm run build
npm run preview
```

Tests decken Parkerkennung, zu schnelles Durchfahren, einmaliges Öffnen, Wiedereintritt, ungültige Eingaben, Fahrzeugbewegung, Bremsen, Gebäudekollisionen, Reset, Kamerarichtung und lokale Modellressourcen ab.

**Status der ersten Version:** Tests und Produktions-Build geprüft. Projektliste, Projektkarte und GitHub-Link im Browser geprüft. Die erste Version wurde anschließend auf GitHub Pages auch visuell geladen. Die aktuelle Überarbeitung ergänzt Offroader, Vegetation, Bloom, Staub, Spuren und synthetischen Sound; Touchbedienung muss weiterhin auf einem echten Smartphone geprüft werden. Vor der finalen Freigabe im eigenen Browser auf der echten Pages-URL prüfen: Texturen, Blickwinkel, alle drei Parkflächen, Smartphone-Steuerung, Dialogpause und Reset.

## Credits und Lizenzen

- Inspiration und adaptierte Kameraparameter: [Bruno Simon / folio-2025](https://github.com/brunosimon/folio-2025), MIT. Copyright-Hinweis unter `public/licenses/bruno-simon-MIT.txt`.
- Kenney Car Kit und City Kit, CC0, aus [RaceTrack](https://github.com/CagriCatik/RaceTrack). Hinweise unter `public/licenses/`.
- Three.js: MIT. Rapier: Apache-2.0. Vite: MIT. Die jeweiligen Paketlizenzen liegen in den npm-Paketen; verwendete Laufzeitlizenzen werden im Build mit ausgeliefert.
- Zusätzlicher Anwendungscode: MIT, siehe `LICENSE`.

Keine Analytics und kein WebSocket-Server. Die Helvetiker-Schrift wird lokal als Typeface-JSON ausgeliefert; die ursprünglichen Font-Lizenzhinweise stehen innerhalb dieser Datei.

## Version 0.2 — Playground

- Originales Offroader-Modell aus folio-2025 (Bruno Simon, MIT), vier separat animierte Räder, sichtbare Lenkung und Karosserieneigung.
- 16 m/s Reisegeschwindigkeit, 26 m/s Boost, Handbremse/Drift, J für Sprünge und H für die Hupe.
- Kamera deutlich näher am Fahrzeug; keine Drehung mit der Fahrzeugrichtung.
- Instanzierte Vegetation mit Wind, 3D-Namensschrift, Bänke, Laternen, bewegliche Kisten und beleuchtete Stationen.
- Bloom, Staubpartikel, begrenzter Reifenspur-Pool und lokal erzeugte Motor-, Brems- und Hinweistöne.
- Separate Module `landscape.js`, `car-visual.js`, `effects.js` und `audio.js` halten Gestaltung, Fahrzeugdarstellung und Seiteneffekte aus der Parkerkennung heraus.

Diese Version adaptiert Fahrzeugmodell und Kamera aus der Referenz, aber nicht deren vollständiges Rendering-, Gelände- oder Fahrwerksystem.

## Version 0.3 — Garage, Rampe und Robotics-Labor

- **Garage** im Menü oder bei Weltposition (-17, 16), dort anhalten und E drücken. Das Tor öffnet bei Annäherung.
- **Zwei Fahrzeuge:** Brunos Offroader und Kenney Sports Sedan. Der Sportwagen hat eigene Beschleunigung, Höchstgeschwindigkeit und Kollisionsmaße. Fahrzeugwechsel bewahrt Position und Lackierung, stoppt aber die Bewegung.
- **Vier Lackierungen:** Rot, Orange, Weiß und Graphit. Beide Modelle werden vorgeladen; Wechsel erzeugt keine weiteren Modell-Downloads. Ausgetauschte Materialien werden freigegeben, gemeinsam verwendete Geometrien bleiben erhalten.
- **Physische Keilrampe** rechts hinter dem Startplatz bei (15, 14). Von Süden nach Norden anfahren. Der Collider erzeugt den Sprung; es gibt keinen versteckten Sprung-Trigger.
- **Robotics-Labor** ersetzt den Robotics-Parkplatz. Am Eingang (-15, 1.5) anhalten und E drücken. Die anderen zwei Projektparkplätze bleiben erhalten.
- Die sichtbare LiDAR-Demonstration benutzt 48 Raycasts gegen die Laboreinrichtung und aktualisiert diese mit 10 Hz. Der Demoroboter folgt einer vorgegebenen Kreisbahn. Dies ist eine illustrative Szene, keine eingebundene Instanz des Mobile-Robot-Autonomy-Projekts und kein SLAM-System.
- Neue Module: `vehicle-catalog.js` für Profile/Farben, `vehicle-visuals.js` für den Modellwechsel, `facilities.js` für die Weltobjekte und `interactions.js` für die frameworkfreie Interaktionslogik.
- Zusätzliche Tests schützen Fahrzeugprofile, Auswahlfehler, Eingabeflanken, Interaktionsabstand und Rampenflug mit anschließender Landung.
