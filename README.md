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
| Garage, rechts neben der Tankstelle | Gemeinsame Zufahrt über den Service-Vorplatz. Tor öffnet bei Annäherung; vor dem Tor bei (29.5, 10) E drücken. Vier Fahrzeuge, Lackierung und Scheinwerferwahl. Auch über G im Campusplan erreichbar. |
| Tankstelle, rechts hinter dem Startplatz | Zwei Fahrspuren, vier Zapfseiten, Überdachung und Servicekiosk. Direkt neben einer Säule anhalten, E startet/beendet kostenloses Tanken. Anzeige mit Tankfüllstand und getankten Litern. |
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

Heller Beton, Asphalt, bepflanzte Inseln, kompakte grüne Baumkronen, LED-Masten, Sitzplätze, Pergola, EV-Ladesäulen und ein seitlicher Wasserkanal ersetzen die Wüstenumgebung. Garage mit Solarmodulen und Fassadenfenster; JetRacer-Werkstatt mit offener Überdachung, Hebebühne und Werkzeugwagen. Die Tankstelle hat kollidierbare Zapfsäulen und Stützen sowie nachts geschaltete Beleuchtung.

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

## Fahrzeuge, Materialien und Straßenbeleuchtung

Vier eigenständige Modelle stehen in der Garage: Brunos Offroader sowie Kenney Sportwagen, SUV und Rennwagen. SUV und Rennwagen stammen aus dem bestehenden CC0-Car-Kit in RaceTrack; alle Modell- und Texturdateien liegen lokal. Die Kenney-Modelle verwenden zentrierte Radachsen mit anhand der Modellgröße berechneten Rollradien. SUV und Rennwagen besitzen eigene Handlingprofile, Kollisionsmaße und Scheinwerferhöhen.

Straßen- und Streckenleuchten schalten ihre Lichtquellen **und** leuchtenden Linsen ausschließlich im Nachtmodus ein. Beim Wechsel zum Tag werden beide vollständig abgeschaltet. Die Leuchten sind über Campus und Rundkurs verteilt. Fahrzeug-Scheinwerfer bleiben unabhängig über L/Garage schaltbar.

Asphalt mit feiner Körnung und Oberflächenstruktur, maßstäbliche Pflasterfugen, schwache Umgebungsreflexionen, Entwässerungsrinnen, Fassadendetails und variierte Baumformen ergänzen die Szene. Reflexionen werden nachts reduziert. Oben links steht ausschließlich Çağrı Çatık ohne Monogramm.

## In die Karosserie integrierte Beleuchtung

Die Kenney-Lichtflächen werden direkt aus den nativen Karosseriedreiecken des jeweiligen Modells erzeugt: Sportwagen und SUV verwenden ihre vorhandenen Front- und Heckleuchten, der Rennwagen bündige Flächen am Frontflügel sowie eine zentrale Heckleuchte. Keine universellen schwebenden Leuchtwürfel. Die beiden Lichtkegel hängen am jeweiligen Karosserieobjekt, folgen dessen Neigung und werden nicht aus Kollisionsmaßen abgeleitet. Umlackieren erhält die nativen Lichtflächen. Beim Offroader sind die Lichtkegel an die vorhandene Scheinwerfergeometrie gebunden.

Rampe und Handling-Parcours wurden vollständig entfernt. Alle Fahrzeuge teilen einen 50-Liter-Tank innerhalb der Sitzung (Start 75 %). Verbrauch entsteht beim Fahren; Boost erhöht ihn. Tanken füllt 4 l/s auf. Losfahren, Springen, Dialoge, Übersicht, Fahrzeugwechsel und Reset brechen Tanken ab. Bei leerem Tank bleibt ein Notlauf mit 18 km/h verfügbar, damit das Portfolio zugänglich bleibt. Der Füllstand bleibt beim Fahrzeugwechsel und Reset erhalten.

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
| `facilities.js`, `project-areas.js`, `exhibition-areas.js` | Garage, Tankstelle und sieben unterschiedliche Projektorte |
| `scene-primitives.js` | Kleine gemeinsame Geometrie- und Beschriftungsfunktionen |
| `world.js`, `landscape.js` | Boden, Straßen und Umgebung |
| `camera.js`, `input.js`, `audio.js`, `effects.js` | Kamera und Browseradapter |
| `main.js` | Zusammenbau, Dialoge, Steuerungsfreigabe und Simulationsschleife |

Tests schützen unter anderem Beschleunigung, Boost, Bremsen, Kollisionen, Rampenflug, Landung, Modellprofile, Interaktionsabstand, frische Tastendrücke, Abbruch/Neustart der Vorschau und lokale Modellressourcen. Touchsteuerung muss zusätzlich auf einem echten Smartphone abgenommen werden.

## GitHub Pages

Unter **Settings → Pages → Source** ist **GitHub Actions** eingestellt. Pushes auf `main` lösen den Workflow `.github/workflows/deploy-pages.yml` aus: `npm ci`, Tests, Build, Veröffentlichung von `dist/`.

Vite verwendet `base: './'`, damit Modelle, Texturen, Schrift und JavaScript auch unter `/Drivefolio/` laden. Keine Tokens oder `.env`-Dateien im Website-Code nötig.

## Credits

- [Bruno Simon / folio-2025](https://github.com/brunosimon/folio-2025): Konzept, Offroader-Modell, Bankmodell und adaptierte Kameraparameter, MIT. Hinweis unter `public/licenses/bruno-simon-MIT.txt`.
- Kenney Car Kit und City Kit, CC0, aus [RaceTrack](https://github.com/CagriCatik/RaceTrack). Originalhinweise unter `public/licenses/`.
- Three.js: MIT. Rapier: Apache-2.0. Vite: MIT. Laufzeitlizenzen werden mit ausgeliefert.
- Die Namensskulptur zeigt **Çağrı Çatık** mit einem lokalen DejaVu-Sans-Bold-Subset einschließlich Ç, ğ und ı. Lizenz: `public/licenses/dejavu-fonts.txt`. Reproduzierbare Konvertierung mit FontTools: `python tools/build-name-font.py /path/to/DejaVuSans-Bold.ttf`. Die ursprüngliche Helvetiker-Datei bleibt mit ihren Lizenzhinweisen erhalten.
- Zusätzlicher Anwendungscode: MIT, siehe `LICENSE`.

## Interaktive Projekt-Erlebnisse

JetRacer, RadarTrackBench und Frenet öffnen mit E direkt das steuerbare 3D-Experiment. Die Projektkarte mit zusätzlichen 2D-Experimenten und Originalbelegen bleibt separat erreichbar. Alle Erlebnisse sind auch über die Projektliste ohne Fahren zugänglich, selbst wenn WebGL nicht verfügbar ist. Die bestehenden 3D-Welt-Demos bleiben separat erreichbar.

- JetRacer: Hindernis schalten, Roboter starten; eine Gitter-Breitensuche plant einen freien Weg. Das Lernmodell vereinfacht Fahrzeugkinematik und Sensorik.
- Radar: Messrauschen verändern, Messung pausieren, Sensor für vier Sekunden unterbrechen. Zwei lineare Kalman-Filter schätzen Position und Geschwindigkeit; RMSE bezieht sich ausschließlich auf synthetische Browserdaten.
- Frenet: Hindernisposition und Sicherheitsabstand verändern. 21 abgetastete Kandidaten werden gegen ein vergrößertes Hindernis geprüft, anschließend entscheidet eine einfache Kostenfunktion. Bei vollständig gesperrter Fahrbahn bleibt das Modell stehen. Kein Aufruf des originalen Python-Planers.

Alle sieben Karten erläutern Problem, Einsatzgebiet und technischen Schwerpunkt. Fachlich verbundene Projekte werden am Kartenende empfohlen. Ein lokaler Entdeckungsfortschritt unterscheidet geöffnete Projekte, ausprobierte Experimente und abgeschlossene Aufgaben. Er überträgt keine Besuchsdaten. Fehlender oder blockierter Browser-Speicher verhindert keine Funktionen. „Station im Campus finden“ markiert den Eingang im Plan und in der 3D-Welt und zeigt die Luftlinienentfernung. Es handelt sich nicht um ein Straßennavigationssystem.

## Engineering-Park und offene Werkstatt

Warme Pflasterwege folgen dem Campus-Straßennetz. Die Flächen werden geometrisch vereinigt und an Fahrbahnen, Projektflächen, Bauminseln und Tankstellenzufahrt ausgeschnitten. Neue Pflanzbeete mit instanzierten Sträuchern und Blüten strukturieren die Ränder; der westliche Wasserkanal hat einen durchgehenden Promenadenstreifen, Sitzbänke und niedrige Nachtleuchten. Wegweiser führen zu Robotics, Autonomy und Planning.

Die offene JetRacer-Werkstatt erhält niedrige Glasfelder, ein Eingangsportal, Teilelager, Werkzeugwand und eine Fertigungsbank mit animiertem Druckkopf. Der zentrale Roboter und seine LiDAR-Darstellung bleiben sichtbar. Arbeits- und Promenadenbeleuchtung schalten mit dem Nachtmodus; die zugehörigen Leuchtflächen sind tagsüber ausgeschaltet.

## Campus-Eingang, AI-Pavillon und Motorsport-Boxen

Ein offenes Eingangstor und ein Lageplan mit allen sieben Projekten markieren den Ankunftsbereich. Der AI-Pavillon rahmt die AgentSwarm-Station mit drei offenen Bögen und niedrigen Glasfeldern, ohne die Agentenknoten zu verdecken. Drei Boxen zeigen ausgestellte Fahrzeugmodelle, Mechanikerfiguren, Ausrüstung, Flaggen und eine dekorative READY-Tafel. Ihre teilweise verglasten Dächer lassen Einblicke zu. Die Tankstelle erhält einen kostenlosen FUEL-Totem, Bodenpfeile und einen dekorativen Serviceschrank.

Ein kleiner Lieferroboter fährt auf einer festen, von Fahrbahnen getrennten Service-Route an der westlichen Promenade. Er pausiert am Dock, hält in der Nähe des Besucherfahrzeugs und besitzt einen kinematischen Collider. Das ist eine regelbasierte Animation, keine autonome ROS-Navigation. Eingangs-, Boxen- und Pavillonbeleuchtung werden gemeinsam mit dem Nachtmodus geschaltet.

## Referenzbereich: Sitzplätze und Ankunft

Die früheren neun prozeduralen Einzelbänke wurden vollständig entfernt. Sechs Bänke verwenden nun das originale `static/benches/benches.glb` aus Bruno Simons folio-2025 (MIT, bestehender Lizenzhinweis unter `public/licenses/bruno-simon-MIT.txt`). Die eingebettete Palette bleibt erhalten; Original-Weltpositionen, Rotationen und Physikmarker werden nicht übernommen. Die visuelle Geometrie wird auf 2,15 m Breite, 1 m Höhe und 0,7 m Tiefe skaliert und mit dem tiefsten Punkt auf den Boden gesetzt.

Zwei Sitzplätze schauen auf den Brunnen, zwei zum Kanal, einer zur Robotics-Werkstatt und einer zur Namensskulptur. Sitznischen bekommen eigene Pflaster- beziehungsweise Holzflächen. Der Hauptweg am Kanal bleibt frei. Eine ausgeschnittene Platzfläche um den Brunnen, niedrige Pflanzrahmen, eine steinerne Brunnenabdeckung und dezente Kontaktschatten verbinden den Bereich. Die neue warme Sitzplatzbeleuchtung folgt dem Nachtmodus. Die Aufstellung und Prüfungen liegen in `src/seating-plan.js` und `tests/seating.test.js`.

## Gemeinsamer Servicebereich

Tankstelle und Garage liegen nebeneinander. Die Garage steht bei (29.5, 16), ihr Tor zeigt nach Norden zur Campus-Querstraße. Eine zusammenhängende, überschneidungsfrei erzeugte Asphaltfläche verbindet die Campus-Querstraße, die Tankstelle und den Garageneingang. Die Ladesäulen stehen an der westlichen Garagenwand; Serviceschrank und Van liegen an der östlichen Seite. Die Pergola und ein Baum aus dem neuen Garagenstandort wurden in den früheren westlichen Garagenbereich versetzt. Eingang, Modell, Kollisionen, Torsteuerung und Campusplan beziehen ihre Position aus `service-layout.js`.

## Prioritäten umgesetzt: Zufahrt → Gestaltung → Showroom → Projektergebnisse

Die Garage ist um 180 Grad gedreht. Ihre Front liegt bei z=11.5; von der Querstraße geht es gerade über den breiten Vorplatz zum E-Eingang bei (29.5, 10). Der Hintergrund des Gebäudes wird nicht mehr als Zufahrt verwendet.

Der gemeinsame Materialhelfer vereinheitlicht helle Mineralflächen und dunkles Metall. Vegetation verwendet gestaffelte, facettierte Kronen mit unterschiedlichen Wuchsformen und unregelmäßig verteilte Strauchgruppen statt gleichförmiger Kugelreihen.

Alle vier vorhandenen Fahrzeugmodelle sind im teilweise verglasten Showroom ausgestellt. „Garage → Fahrzeuge im 3D-Showroom auswählen“ fokussiert die Kamera. Fahrzeug anklicken, Schaltfläche verwenden oder 1–4 drücken; Escape kehrt zum Besucherfahrzeug zurück. Währenddessen pausiert die Fahrphysik.

JetRacer, Radar und Frenet lassen sich in einem separaten 3D-Experiment steuern. Es werden dieselben getesteten Browsermodelle wie für die 2D-Experimente verwendet. Der ursprüngliche Stationsaufbau wird vorübergehend ausgeblendet und beim Verlassen wiederhergestellt; die temporären Geometrien und Materialien werden freigegeben. Im Experiment führen separate Schaltflächen zu Projektbeschreibung und Originalergebnissen.

Die Radar-Vergleichsgrafik unter `public/results/radar-filter-scenarios.png` stammt unverändert aus CagriCatik/RadarTrackBench, `results/comparisons/filter_scenarios/filter_scenario_comparison.png`. Projektkarten verlinken außerdem die originale Frenet-Simulation und den JetRacer-Safety-Supervisor. Die synthetischen Browserdemos werden deutlich von diesen Repository-Artefakten unterschieden.

## Umgebung: Materialien, Vegetation, Bildwirkung und Klang

Version 0.19 konzentriert sich auf das Umfeld; Projektinhalte, Stationen und Experimente bleiben unverändert. Umweltmaterialien unter `environment-materials.js` verwenden lokal erzeugte Mineral- und Holztexturen sowie feine Reliefstruktur. Die Kontaktverschattung wird durch einen halb aufgelösten SSAO-Pass ergänzt; transparente Dächer und Schilder werden nicht zu künstlichen AO-Hindernissen. Bei anhaltend niedriger Bildrate schaltet sich dieser zusätzliche Pass ab. Dezente Farbabstimmung und Bloom reagieren auf Tag/Nacht. Tiefenunschärfe gilt ausschließlich für den Showroom; die Fahransicht bleibt scharf.

Die bestehenden Baumstandorte tragen nun instanzierte Blattgeometrien mit gemeinsamem Windshader und passenden bewegten Sonnenschatten. Gräser und Stauden bleiben innerhalb der vorhandenen Beete. Straßen, Zufahrten und Projektgrundrisse werden nicht verändert.

Das regelbasierte Rennstreckenfahrzeug verwendet den echten Kenney Sports Sedan aus der Garage, dieselbe Radaufhängung und geometrisch angepasste Lichtbindung. Es bleibt in seiner bisherigen Spur und bremst weiterhin vor dem Besucher. Seine Scheinwerfer folgen dem Nachtmodus; Bremslichter funktionieren auch am Tag.

Die Klanglandschaft entsteht vollständig lokal mit Web Audio: Brunnen, Kanal, Blätterrauschen, Garagentor, Tankvorgang und vorbeifahrendes Rennstreckenfahrzeug besitzen räumliche Quellen. Die Hörposition liegt am Besucherfahrzeug; die Orientierung folgt der festen diagonalen Kamera. Rollgeräusche unterscheiden Asphalt/Pflaster und die äußeren Grasflächen. Keine Audioaufnahme, kein externer Sounddownload und kein Start vor Nutzerinteraktion. Der Soundschalter schaltet die gesamte Mischung stumm; versteckte Tabs suspendieren den Audiokontext. Die Klangquellen illustrieren die Umgebung, nicht die verlinkten Projekte.

## Landschaft außerhalb der Leitplanken

Version 0.20 ergänzt einen äußeren Landschaftsgürtel mit 44 locker gruppierten Bäumen, Sträuchern, bewegten Wiesengräsern und Blüten. Ein durchgängiger, 2,2 m breiter Spazierweg liegt 16,5 m außerhalb der Rennstrecken-Mittellinie; Baumkronen und Wiesenpflanzung lassen ihn frei. Zwei Radfahrer, drei Spaziergänger und ein kleiner Vogelschwarm beleben den Bereich. Ein Teich mit Steinen und Schilf sowie flache Hügel hinter dem Baumgürtel geben den freien Flächen Struktur. Die Bodenfläche ist für die Landschaft erweitert; der Campus und die Rennstrecke behalten ihre Geometrie.

`exterior-plan.js` erzeugt alle Standorte deterministisch und hält die Außenleitplanken, die Lampenlinie, Tribüne und Schilder frei. Besucherfiguren sind dekorative Animationen auf dem äußeren Weg; bei pausierter Welt halten sie an. Bäume und Wiese verwenden Instancing, Blätter und Gräser bewegen sich im Windshader. Die Projektstationen bleiben unverändert.

## Aufenthaltsorte im Außenpark

Version 0.21 ergänzt einen Holzsteg am östlichen Teichufer mit zwei originalen Bruno-Bänken, Unterkonstruktion, einem Holztritt und einer Verbindung zum Spazierweg. Die neue Zuschauerterrasse liegt neben der bestehenden östlichen Tribüne, außerhalb der Fahrbahn und des umlaufenden Weges. Ein kleiner Kaffeestand, zwei Sonnenschirme, Tische und weitere Bänke bilden einen gemeinsamen Aufenthaltsort. Vier Zuschauer wenden sich vorbeifahrenden Fahrzeugen zu; einer hebt dabei seine Kamera.

Zwei Enten bewegen sich auf langsamen, geschwungenen Routen im freien Teichbereich. Ihre Routen halten Abstand zueinander und zum Steg; kleine Wasserringe laufen aus. Bodenvariationen, gemähte Randstreifen und dunklere Baumstandorte werden einmalig in eine lokale Bodentextur gebacken, ohne zusätzliche überlappende Bodenflächen. Die Pflanzplanung hält Terrasse, Steg und ihre Verbindungen frei.

Warme Poller markieren Spazierweg und Aufenthaltsorte. Vier tatsächliche Lichtquellen beleuchten Steg und Zuschauerterrasse; dezente additive Lichtflächen unter den übrigen Pollern vermeiden viele weitere Lichtquellen. Leuchtflächen, Lichtquellen und Lichtflächen schalten gemeinsam mit dem Nachtmodus und sind am Tag aus. Die Projektstationen und ihre Inhalte werden nicht verändert.

## Neon-Wahrzeichen am Start

Version 0.22 ersetzt die niedrige Namensskulptur durch ein erhöhtes, zur festen Kamera ausgerichtetes Schild bei (-8.7, 16.8). Der Schriftzug „Çağrı Çatık“ besteht aus dreidimensionalen Opalbuchstaben mit echten Neon-Rohrkonturen, einschließlich der türkischen Glyphen und ihrer Innenkonturen. Eine dunkle, gerundete Rückwand, ein warmer feiner Lichtrahmen und ein integrierter Sockel bilden das Wahrzeichen. Nachtmodus erhöht die Leuchtwirkung und schaltet Sockellicht und dezentes türkisfarbenes Streulicht ein; tagsüber bleiben die Buchstaben lesbar.

Die Startkamera rahmt Name und Besucherfahrzeug gemeinsam und gibt auf schmalen Bildschirmen mehr Abstand. Beim Losfahren kehrt sie weich zur normalen Fahransicht zurück. Der Gehweg bleibt frei; die Ankunftsbank und ihre Sitznische wurden passend versetzt und zum neuen Namen ausgerichtet. Ein Collider schützt das Schild vor Durchfahren. Projektbereiche, Inhalte und Experimente bleiben unverändert. Tests prüfen Geometrie, Schriftzeichen, Gehwegabstand und vollständige Bildabdeckung in Desktop- und Hochformatansichten.

Neon-Hoverfeedback verbindet die Bedienoberfläche mit dem Namensschild: Panelränder bekommen einen sanften, dem Mauszeiger folgenden Lichtschein; Links, Navigation, Projektlisten und Fahrzeugkarten erhalten dezente Hervorhebungen. Tabellenzeilen in Dialogen verwenden dieselbe Farbfamilie. Tastaturfokus bleibt sichtbar, Touchgeräte erhalten keine klebenden Hoverzustände, und reduzierte Bewegung unterbindet Übergänge und Versatz. Das 3D-Namensschild reagiert beim Darüberfahren mit dem Mauszeiger durch eine etwas stärkere Kontur und einen türkisen Rahmen; die Kamera bleibt dabei stabil.

## Einheitliche Neon-Infotafeln

Version 0.23 führt die sieben Projekt-Haupttafeln auf `createNeonBoard` zurück: gleiche Abmessungen, gerundete dunkle Rückwand, klare Titelzeile, Trennlinie und Unterzeile sowie ein dezenter türkisfarbener Rahmen. Garage, Tankstellenfassade, Boxenbeschriftungen, Lageplan, Timing-Anzeige und äußere Streckenschilder verwenden dieselbe Gestaltung in passenden Größen. Inhalte, Stationen und Experimente bleiben fachlich unverändert; Bodenmarkierungen und kleine Gerätebeschriftungen behalten ihre schlichte Darstellung.

Ein gemeinsamer Controller schaltet die Tages-/Nachtintensität aller Tafeln und hebt jeweils die Tafel unter dem Mauszeiger weich hervor. Unsichtbare Stationen, etwa während eines separaten Experiments, werden als Hoverziele ausgeschlossen. Bedienoberflächen verwenden ebenfalls gemeinsame Panel-, Schaltflächen- und Tabellenstile. Tastaturfokus, Touchbedienung und reduzierte Bewegung bleiben berücksichtigt.

## Deutlicher Farbwechsel statt kaum sichtbarem Hover

Version 0.24 verstärkt die Lichtkanten der 3D-Tafeln und ergänzt einen prozeduralen Halo. Beim Hover wechseln Rahmen und Schriftakzente von Cyan zu Pink/Violett; die Rückwand erhält eine violette Tönung. Das Namensschild verwendet denselben Farbwechsel. Die Effekte sind im Tag- und Nachtmodus sichtbar und verändern keine Stationsfunktionen.

Version 0.25 konzentriert sich auf die Tafeln in der 3D-Welt. Die Menü- und Projektlistenansicht wurde auf den vorherigen Stand zurückgesetzt. Die Trefferprüfung verwendet die tatsächlichen Canvas-Abmessungen und aktualisierte Kamera-/Objektmatrizen. Eine getroffene Tafel wechselt deutlich zu Pink/Violett, färbt ihre Fläche ein und vergrößert sich sanft um vier Prozent. Bei reduzierter Bewegung bleibt die Größe unverändert. Ein Funktionstest prüft Treffer, Farbwechsel und Rückkehr nach Verlassen der Tafel auch bei versetztem Canvas. Auf GitHub Pages wurden Vehicle Dynamics bei Nacht und Autonomy Field bei Tag mit sichtbarem Hover geprüft.

## Prominentes Hoverfeedback (0.26)

Die 3D-Tafeln erlauben 14 CSS-Pixel Spielraum an ihren projizierten Kanten. Beim Hover folgen ein kontrastreiches Neonlabel mit dem Tafelnamen am Mauszeiger, ein kräftiger pinker Flächenakzent, ein umlaufender Lichtakzent und zehn Prozent Vergrößerung. Das Namensschild verwendet dasselbe Label und stärkere Licht-/Farbreaktionen. Reduzierte Bewegung unterbindet Größenanimation und umlaufende Lichtbewegung. Das Label fängt keine Eingaben ab, verschwindet beim Verlassen des Canvas und bleibt am Viewportrand sichtbar. Projektinhalte und Fahrfunktionen bleiben unverändert.

## Automatischer Neonfarbverlauf (0.27)

Tafelrahmen, Flächenlicht und Namensschild durchlaufen automatisch einen gemeinsamen 24-Sekunden-Zyklus: Türkis → Blau → Violett → Pink → Türkis. Mausbewegungen beeinflussen weder Farbe noch Lichtintensität. Das Namenslabel und die Größenreaktion bleiben als Hoverfeedback erhalten. Der Lichtakzent läuft unabhängig vom Mauszeiger. Bei reduzierter Bewegung bleiben Farbe und Lichtbewegung statisch.

## Gelb und Dunkelblau, gedimmtes Neon (0.28)

Der automatische 24-Sekunden-Farbverlauf verwendet jetzt Gelb (#ffdf00) und Dunkelblau (#102b60), angelehnt an Fenerbahçe. Neonrahmen und Namensschrift leuchten etwa halb so stark, Halos und Flächenlicht sind zurückgenommen. Auch der Bloom-Effekt, die Lichtleiste unter dem Namensschild und die Garagen-Lichtstreifen sind gedimmt. Das Mauslabel passt mit dunkelblauer Fläche und gelber Kontur dazu. Die Farben bleiben zeitgesteuert und unabhängig vom Mauszeiger.
