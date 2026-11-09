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
| JetRacer-Werkstatt, erste Querstraße links | RC-Modell mit Kamera/LiDAR, Jetson-Werkbank und ROS-2-Anzeige. 48 LiDAR-Raycasts mit 10 Hz. E bei (-15, 1.5). |
| Vehicle Dynamics, erste Querstraße rechts | Zwei Modelle illustrieren 2WS/4WS. Bewegliche Pylonen. E bei (15, 3). |
| RadarTrackBench, zweite Querstraße links | Rotierende Parabolantenne, bewegtes Ziel und Tracking-Tisch mit synthetischen verrauschten Messpunkten und glatter Zielspur. E bei (-15, -20). |
| Vehicle Autonomy Stack, zweite Querstraße rechts | RC-Modell auf vorgegebener Route, Hindernis-Raycasts und schrittweise aufgedecktes Raster. E bei (15, -20). |
| AgentSwarm, dritte Querstraße mittig | Coordinator, vier Spezialisten und MCP-Server. Violette Pakete illustrieren A2A-Nachrichten, grüne Pakete MCP-Werkzeugaufrufe. E bei (0, -41). |

| Frenet Trajectory Planner, dritte Querstraße links | Referenzlinie, mehrere Trajektorienkandidaten und ein animiertes Ausweichmanöver. E bei (-16, -41). |
| FMT-MPC, dritte Querstraße rechts | Hindernisfläche mit Sicherheitsrändern, illustrativer Suchbaum, feste geglättete Route und Vorschauhorizont. E bei (16, -41). |

Anhalten und E startet eine kurze, abbrechbare Welt-Demo. Die Kamera zeigt dabei den Ort; danach öffnet sich die jeweilige Projektkarte. Über **Projekte → Projekt → Welt-Demo ansehen** sind alle Vorschauen ohne Fahren erreichbar. Escape, Abbrechen oder Zurücksetzen beendet eine laufende Demo. Die normale Projektliste bleibt auch ohne WebGL verfügbar.

Die Stationen sind **illustrative JavaScript-Demos**, keine laufenden Instanzen der verlinkten Projekte: kein Python-Fahrdynamikvergleich, kein tatsächliches SLAM/RRT*/MPC, keine berechneten Kalman-Filter, Frenet-Optimierung, FMT-Suche oder MPC-Optimierung und keine Live-LLM-, MCP- oder A2A-Verbindung. Die Darstellung verwendet synthetische Daten, feste Routen und animierte Nachrichten. Der eigentliche Quellcode ist in jeder Karte verlinkt. Keine API-Schlüssel und kein Backend erforderlich.

## Moderner Engineering-Campus

Heller Beton, Asphalt, bepflanzte Inseln, kompakte grüne Baumkronen, LED-Masten, Sitzplätze, Pergola, EV-Ladesäulen und ein seitlicher Wasserkanal ersetzen die Wüstenumgebung. Garage mit Solarmodulen und Fassadenfenster; JetRacer-Werkstatt mit offener Überdachung, Hebebühne und Werkzeugwagen. Reifen und Pylonen am Sprungbereich sind bewegliche Rapier-Objekte.

Die Radarantenne richtet sich innerhalb von 18 Metern auf das Besucherfahrzeug aus. Das Display zeigt dabei verrauschte Positionsproben und eine einfache geglättete Spur. Außerhalb des Bereichs bleibt die synthetische Ziel-Demo aktiv. Kein echter Radar- oder Kalman-Filter-Backenddienst.

**Campusplan** zeigt alle sieben Projekte und die aktuelle Fahrzeugposition. Nummern öffnen direkt die Projektkarte. Beide Fahrzeuge besitzen Scheinwerfer (L bzw. Garage), Brems- und Rückfahrlichter. Reifenspuren entstehen beim Driften; Partikel sind auf Drift und hohe Geschwindigkeit begrenzt.

## Campus Circuit, Nachtmodus und Dark Mode

Ein 7,6 Meter breiter Rundkurs umschließt den Campus. Zufahrten an der ersten Querstraße führen nach Osten/Westen auf die Strecke; die südliche Hauptstraße mündet an Start/Ziel. Physische Leitplanken lassen die Zufahrten offen. Rot-weiße Curbs, Startampeln, Gridmarkierungen, Tribüne, Reifenwände und Streckenposten ergänzen den Kurs. Der Campusplan zeigt den Rundkurs und die erweiterten Fahrgrenzen.

An der Startlinie beginnt bei Bewegung die Rundenzeit. Vier geordnete Kontrollpunkte sind nötig; Abkürzen durch den Campus bricht den Versuch ab. Bestzeit gilt für die Sitzung. Fahrzeug-Reset beendet eine laufende Runde.

**Nachtmodus** verändert Himmel, Umgebungslicht und Strecken-/Campusleuchten. **Dark Mode** verändert unabhängig davon die Bedienoberfläche. Beide Einstellungen werden lokal gespeichert, sofern der Browser das erlaubt. Beide Fahrzeuge besitzen zwei symmetrische Spot-Scheinwerfer mit gemeinsamen Schalter (L/Garage). Beim Kenney-Fahrzeug trennen zentrierte Rad-Drehpunkte die vertikale Lenkachse von der rollenden Achse.

## Verbundene Strecke und autonomes Pace Car

Curbs und Leitplanken sind durchgehende Extrusionen mit gemeinsamen Eckpunkten, geschlossener Rundkursnaht und exakt ausgeschnittenen Zufahrten. Campus und Boxengasse enden am inneren Fahrbahnrand auf derselben Höhe. Äußere Leitplanken bleiben geschlossen. Physische Leitplankensegmente verwenden dieselbe Kurve wie die sichtbaren Schienen.

Ein regelbasiertes autonomes Pace Car folgt der äußeren Fahrspur. Es reduziert die Geschwindigkeit in Kurven und bremst für das Besucherfahrzeug in seinem Fahrkorridor. Es besitzt einen kinematischen Rapier-Collider, animierte Räder und Bremslichter. Die blaue Markierung im Campusplan zeigt seine Position. **Campusplan → Streckenübersicht** zeigt den gesamten Rundkurs; **Zurück ans Steuer** beendet die Übersicht.

Östlich des Campus verbindet eine Boxengasse drei Werkstattboxen, Campus-Servicezufahrt und zwei Streckenöffnungen. Hinzu kommen Werkzeugwagen, Reifenracks, eine überdachte Tribüne mit Zuschauern, Streckenwerbung, Servicefahrzeug, Fahrradständer, Solarfeld und ein Brunnen am Ankunftsplatz.

## Steuerung

| Eingabe | Aktion |
| --- | --- |
| WASD / Pfeiltasten | Fahren / Lenken |
| Leertaste | Handbremse / Drift |
| Shift | Boost |
| J | Springen |
| H | Hupe |
| L | Scheinwerfer umschalten |
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
| `demo-sequence.js` | Frameworkfreier Ablauf, Fortschritt und Abbruch der Projektvorschauen |
| `facilities.js`, `project-areas.js`, `exhibition-areas.js` | Garage, Rampe und sieben unterschiedliche Projektorte |
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
- Die Namensskulptur zeigt **Çağrı Çatık** mit einem lokalen DejaVu-Sans-Bold-Subset einschließlich Ç, ğ und ı. Lizenz: `public/licenses/dejavu-fonts.txt`. Reproduzierbare Konvertierung mit FontTools: `python tools/build-name-font.py /path/to/DejaVuSans-Bold.ttf`. Die ursprüngliche Helvetiker-Datei bleibt mit ihren Lizenzhinweisen erhalten.
- Zusätzlicher Anwendungscode: MIT, siehe `LICENSE`.
