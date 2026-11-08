# Drivefolio — Çağrı Çatık

Ein befahrbares 3D-Portfolio mit eigenen Projektorten. Läuft vollständig statisch auf **GitHub Pages**: kein Backend, keine Analytics, keine externen Laufzeit-CDNs.

**Website:** https://cagricatik.github.io/Drivefolio/

## Lokal starten und prüfen

Node.js 22.12 oder neuer:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Die im Terminal angezeigte URL öffnen. Ein Doppelklick auf die HTML-Datei funktioniert wegen der JavaScript-Module und Modell-Downloads nicht.

## Die Welt

| Ort | Inhalt und Interaktion |
| --- | --- |
| Garage, links hinter dem Startplatz | Tor öffnet bei Annäherung. Im Eingang bei (-17, 16) E drücken oder den Garage-Button verwenden. Offroader/Sportwagen und vier Lackierungen stehen bereit. |
| Rampe, rechts hinter dem Startplatz | Bei (15, 14) von Süden nach Norden anfahren. Ein echter Keil-Collider erzeugt den Sprung; kein versteckter Sprung-Trigger. |
| Robotics-Labor, links an der Querstraße | Ein Demoroboter fährt eine vorgegebene Kreisbahn. 48 LiDAR-Raycasts gegen die Laboreinrichtung werden mit 10 Hz aktualisiert. Am Eingang (-15, 1.5) öffnet E das Projekt. |
| Vehicle-Dynamics-Testgelände, rechts an der Querstraße | Zwei animierte Modelle zeigen Vorder- und Hinterachslenkung auf markierten Demonstrationsbahnen. Pylonen sind physisch beweglich. E am Terminal (15, 3) öffnet das Projekt. |
| SpecToTest-Station, am nördlichen Straßenende | E bei (0, -20.5) startet eine kurze Vorschau: Textspezifikation, Mapping und Python-Testcode. Danach öffnet sich die Projektkarte. Escape oder Abbrechen beendet die Vorschau vorzeitig. |

Alle Projekte sind außerdem direkt über die normale Projektliste erreichbar. Es gibt keine Projektparkplätze mehr.

Die Stationen **illustrieren** die GitHub-Projekte. Die 2WS/4WS-Demonstration ist eine animierte Modellansicht, kein berechneter Fahrdynamikvergleich. Die Compiler-Vorschau führt SpecToTest nicht aus. Die LiDAR-Szene führt kein SLAM aus und ist keine eingebundene Instanz von Mobile-Robot-Autonomy.

## Steuerung

| Eingabe | Aktion |
| --- | --- |
| WASD / Pfeiltasten | Fahren / Lenken |
| Leertaste | Handbremse / Drift |
| Shift | Boost |
| J | Springen |
| H | Hupe |
| E | Nahes Projektterminal oder Garage aktivieren; dabei anhalten |
| + / − | Kamera zoomen |
| ↺ | Fahrzeug, bewegliche Objekte und laufende Vorschau zurücksetzen |
| Escape | Dialog schließen / laufende Vorschau abbrechen |

Touchgeräte erhalten entsprechende Bildschirmtasten. Die Projektliste funktioniert auch ohne WebGL; ohne JavaScript sind direkte GitHub-Links hinterlegt.

## Fahrzeug und Grafik

- Brunos Offroader-Modell und Kenney Sports Sedan mit unterschiedlichen Profilen und Kollisionsmaßen.
- Lackierungen Rot, Orange, Weiß und Graphit. Fahrzeugwechsel bewahrt Position und Lackierung, stoppt aber die Bewegung. Modelle werden vorgeladen; ausgetauschte Materialien werden freigegeben.
- Vereinfachte Arcade-Fahrphysik mit Starrkörperkollisionen, Schwerkraft und Sprungimpuls; kein vollständiges Fahrwerks-/Reifenmodell.
- 25°-Perspektivkamera mit fester Weltrichtung, Nachführung und Zoom.
- Animierte Räder, Karosserieneigung, instanzierte Vegetation, Wind, 3D-Namensschrift, Laternen und bewegliche Kisten.
- Bloom, begrenzte Staub- und Reifenspur-Pools sowie lokal synthetisierte Motor-, Brems-, Hup- und Hinweistöne.

## Architektur

| Modul | Verantwortung |
| --- | --- |
| `projects.js` | Projekttexte und GitHub-Links |
| `vehicle-catalog.js` | Fahrzeugprofile und Lackierungen |
| `vehicle.js` | Rapier-Welt, Fahrzeug, dynamische Objekte und Rampen |
| `vehicle-visuals.js`, `car-visual.js` | Austausch und Animation der Fahrzeugmodelle |
| `interactions.js` | Reine Abstands-/Eingabelogik und Rampenhöhen |
| `test-sequence.js` | Frameworkfreier Ablauf der Compiler-Vorschau |
| `facilities.js`, `project-areas.js` | Garage, Rampe und unterschiedliche Projektorte |
| `scene-primitives.js` | Kleine gemeinsame Geometrie- und Beschriftungsfunktionen |
| `world.js`, `landscape.js` | Boden, Straßen und Umgebung |
| `camera.js`, `input.js`, `audio.js`, `effects.js` | Kamera und Browseradapter |
| `main.js` | Zusammenbau, Dialoge, Steuerungsfreigabe und Simulationsschleife |

Tests schützen unter anderem Beschleunigung, Boost, Bremsen, Kollisionen, Rampenflug, Landung, Modellprofile, Interaktionsabstand, frische Tastendrücke, Abbruch/Neustart der Vorschau und lokale Modellressourcen. Touchsteuerung muss zusätzlich auf einem echten Smartphone abgenommen werden.

## GitHub Pages

Unter **Settings → Pages → Source** ist **GitHub Actions** eingestellt. Pushes auf `main` lösen den Workflow `.github/workflows/deploy-pages.yml` aus: `npm ci`, Tests, Build, Veröffentlichung von `dist/`.

Vite verwendet `base: './'`, damit Modelle, Texturen, Schrift und JavaScript auch unter `/Drivefolio/` laden. Keine Tokens oder `.env`-Dateien im Website-Code nötig.

## Credits

- [Bruno Simon / folio-2025](https://github.com/brunosimon/folio-2025): Konzept, Offroader-Modell und adaptierte Kameraparameter, MIT. Hinweis unter `public/licenses/bruno-simon-MIT.txt`.
- Kenney Car Kit und City Kit, CC0, aus [RaceTrack](https://github.com/CagriCatik/RaceTrack). Originalhinweise unter `public/licenses/`.
- Three.js: MIT. Rapier: Apache-2.0. Vite: MIT. Laufzeitlizenzen werden mit ausgeliefert.
- Die Helvetiker-Schrift wird lokal als Typeface-JSON ausgeliefert; die ursprünglichen Font-Lizenzhinweise stehen innerhalb dieser Datei.
- Zusätzlicher Anwendungscode: MIT, siehe `LICENSE`.
