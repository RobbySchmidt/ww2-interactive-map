# Ostfront-Karte 1941–1945 — Projekt-Kontext

Stand: 2026-05-16 · Sprache der UI/Daten: Deutsch

## Was die App tut

Interaktive Web-Karte der Ostfront im Zweiten Weltkrieg. Per Zeitstrahl scrubbt der Nutzer durch den Zeitraum 21.06.1941 – 08.05.1945 und sieht:

- **Frontverlauf** als rote Polygonfläche (Achsenkontrolle) plus separate Kaukasus-Pocket-Polygone für 1942–43
- **Großschlachten** als Punkt-Marker (rot = Großschlacht, gelb = Gefecht), klickbar → Detail-Panel mit Truppenstärken / Verlusten / Verbänden
- **Operative Stoßrichtungs-Pfeile** (Bézier-Kurven) für 23 Großoperationen
- **Großverband-Labels** (HG, Armeen, Fronten) für 6 Schlüsselzeitpunkte mit Hover-Tooltip
- **Umkämpfte Städte** rot eingefärbt (OSM-Stadtgrenzen) während aktiver Schlachten
- **„An diesem Tag"-Feed** mit ~80 historischen Ereignissen ±N Tage um das aktuelle Datum
- **Verluste-Ticker** für die intensivste aktive Großschlacht
- **Kräfteverhältnis-Chart** (Personalstärke + Panzerproduktion) mit Now-Linie
- **Volltext-Suche** über alle Datenquellen (Cmd/Ctrl+K)
- **Klick-überall-Abfrage** (Rechtsklick): Seite, Frontentfernung, nächste Schlacht
- **Wetter/Rasputitsa-Layer**: saisonaler Tint über der Karte (Winter weiß, Frühjahrs-/Herbst-Schlammperiode braun, Sommer klar) — Toggle in der Timeline, Icon spiegelt aktuelle Saison
- **Eisenbahn-Layer**: 19 historische Hauptstrecken als grau gestrichelte Linien — erklärt umkämpfte Knotenpunkte
- **Wikipedia-Anreicherung** im Battle-Detail: Hero-Bild + Lead-Text + Link zum vollen Artikel (de.wiki)
- **Schlacht-Detail-Modus**: zoomt Karte + beschränkt Zeitstrahl + filtert Events auf den Schlacht-Zeitraum + zeigt eine Bildergalerie mit Lightbox
- **Operations-Detail-Panel**: Klick auf einen Pfeil öffnet ein Panel mit Wikipedia-Lead, Bild, Stoßrichtungs-Liste und Cross-Links zu Schlachten im Operations-Zeitraum
- **URL-State** für teilbare Links (`?d=…&b=…&op=…&e=…&layer=…&w=1&r=1&mode=battle`)

## Tech-Stack

| Komponente | Wahl |
|---|---|
| Framework | Nuxt 4 (^4.4.5), Vue 3.5, TypeScript 6 |
| Karte | MapLibre GL JS (frei, ohne API-Key) |
| Tiles | Straßenkarte: `tile.openstreetmap.de` (deutsche Exonyme) · Satellit: ESRI World Imagery |
| Styling | Tailwind CSS v4 + Custom-CSS, dark-mode-by-default |
| UI-Komponenten | shadcn-nuxt installiert aber nicht genutzt — alles handgemacht |
| Datenhaltung | **Statisch in `app/data/*.ts`-Dateien**, keine Datenbank |
| Live-Daten | Wikipedia REST API (de.wikipedia.org) für Battle-Lead-Text + Bildergalerie, LocalStorage-Cache 24h |
| Dev-Server | `npm run dev` (oder `yarn dev`) auf Port 3030 (`npx nuxt dev --port 3030`) |
| Installation | Node mit `NODE_OPTIONS=--use-system-ca` falls Cert-Probleme |

## Verzeichnisstruktur

```
app/
├── app.vue                     # Root (NuxtPage)
├── pages/
│   └── index.vue               # Haupt-Layout, State-Orchestrierung, URL-State, Battle-Mode
├── components/
│   ├── WarMap.client.vue       # MapLibre-Karte, alle Map-Layer, Tooltips
│   ├── Timeline.vue            # Zeitstrahl mit konfigurierbarem Range, Play/Pause, Layer-Toggles
│   ├── EventsFeed.vue          # Linke Sidebar: Ereignisse ±Window oder im Battle-Zeitraum
│   ├── BattleDetail.vue        # Rechtes Detail-Panel: Wiki-Lead, Galerie, Mode-Switch, Lightbox
│   ├── OperationDetail.vue     # Rechtes Detail-Panel für Operationen: Wiki-Lead, Stoßrichtungen, verknüpfte Schlachten
│   ├── SearchBar.vue           # Top-mitte, Cmd/Ctrl+K-Suchfeld
│   ├── CasualtyTicker.vue      # Bottom-mitte, Verluste live
│   ├── StrengthChart.vue       # Bottom-rechts, Kräfteverhältnis-Charts
│   └── DarkSelect.vue          # Custom Dropdown (statt native select)
├── data/
│   ├── easternFront.ts         # Frontlinien-Snapshots (17×12 Lons) + Polygon-Builder
│   ├── battles.ts              # 25 Schlachten mit Details + wikipediaSlug
│   ├── operations.ts           # 23 Operationen mit Bézier-Pfeilen
│   ├── divisions.ts            # ~40 Verband-Marker für 6 Snapshots
│   ├── cities.ts               # 15 OSM-Stadtgrenzen + Battle→City-Mapping
│   ├── events.ts               # ~80 historische Ereignisse + eventsInRange()
│   ├── strength.ts             # 16 Quartals-Snapshots Stärke/Produktion
│   ├── railways.ts             # 19 historische Eisenbahn-Hauptstrecken
│   ├── battle-pois.ts          # POI-Aggregator (Interface + Vite-Glob)
│   └── pois/                   # POI-JSON pro Schlacht (25 Dateien, ~432 POIs)
│       ├── stalingrad.json     #   17 POIs
│       ├── berlin.json         #   23 POIs
│       ├── ...                 #   (alle 25 Schlachten)
├── lib/
│   ├── geo.ts                  # Haversine, Point-in-Polygon, Distance-to-Line
│   ├── casualties.ts           # Casualty-Parser, Schätzung, Battle-Picker
│   ├── season.ts               # Saison-Klassifikation + Tint-Info (Wetter-Layer)
│   ├── wikipedia.ts            # de.wiki Summary + Galerie + LocalStorage-Cache
│   └── utils.ts                # shadcn-Utils (cn)
└── assets/css/tailwind.css     # Tailwind + CSS-Variablen
```

## Implementierte Features im Detail

### 1. Frontverlauf (`easternFront.ts`)
- 17 hand-kalibrierte Snapshots zwischen 21.06.1941 und 08.05.1945
- Jeder Snapshot: 12 Längengrade an festen Breitengraden (46° N → 60° N)
- Linear interpoliert für tagesgenaues Scrubbing
- Polygon-Rückseite topografisch (Ostsee → Reich-West → Alpen → Balkan → Schwarzes Meer)
- Dynamische Anpassung: Krim/Asow-Coast wenn Front weit östlich; Kompakt-Variante ab Spät-1944 (Rumänien wechselt Seiten)
- **Kaukasus-Pockets** als separate Polygon-Features für 1942-08-15, 1942-11-19, 1943-02-15

### 2. Schlachten (`battles.ts`)
25 Großschlachten mit jeweils:
- ISO-Start/Ende, Koordinaten, `major: boolean`
- 1–2 Sätze Zusammenfassung
- Pro Seite (axis/soviet): Befehlshaber, Truppen, Verbände, Panzer/Flugzeuge, Verluste
- Ausgang + optional `notableUnits`
- `wikipediaSlug` (de.wiki-Artikel-Slug, verifiziert via Recherche-Agent)

Marker werden als nativer MapLibre `circle`-Layer gerendert (kein HTML-DOM), damit sie frame-genau bei Pan/Zoom auf der Karte sitzen. Major-Schlachten haben zusätzlich einen weichen Glow-Ring.

### 3. Operationen (`operations.ts`)
23 Großoperationen als animierte Stoßrichtungs-Pfeile:
- Bézier-Kurven (Quadratic) mit optionalem Control-Point für Pincer/Curve
- Pfeil wächst linear von `start` bis `end` über die Operation-Dauer
- Chevron-Pfeilspitze als Teil der gleichen GeoJSON-Linie
- Größe der Spitze proportional zur Schaftlänge, mit Min/Max-Clamping
- Sub-Operationen sinnvoll terminiert (z.B. Barbarossa endet 26.09.1941, damit Taifun/Wjasma-Brjansk nicht überlagern)

### 4. Verbände (`divisions.ts`)
~40 Heeresgruppen/Armeen/Fronten-Labels an 6 Schlüsseldaten (Barbarossa, Moskau, Stalingrad, Kursk, Bagration, Berlin). Zeigt automatisch den **nächstgelegenen** Snapshot.

Rendering als MapLibre `symbol`-Layer (nativer WebGL-Text). Weißer Text mit dickem Halo (axis = dunkelrot, soviet = dunkelgelb), keine Pille-Hintergründe. Hover öffnet einen MapLibre-Popup mit Vollname und Befehlshaber.

### 5. Städte (`cities.ts`)
15 OSM-Stadtgrenzen (via Nominatim geholt, vereinfacht auf ~40 Vertices). Rot eingefärbt (55% Opacity) während zugehörige Schlachten aktiv sind.

### 6. Ereignisse + Feed (`events.ts`, `EventsFeed.vue`)
~80 Ereignisse (Politik, Diplomatie, Befehl, Technik, Partisan, Logistik, Symbol, Meilenstein) mit Kategoriefarben. Sidebar zeigt Ereignisse ±3/7/30 Tage.

**Pin-Verhalten:**
- Klick auf Ereignis-Card → Pin droppt auf Karte (Tropfenform, Kategorie-Farbe, Bounce-Animation), Timeline springt mit, Karte fliegt zur Stelle, Card wird als „active" markiert
- Klick auf Pin oder Label → Feed öffnet sich + scrollt zur Card + Karte zoomt zur Stelle + Datum wird gesetzt
- Klick auf X-Button oben rechts am Pin-Label → Pin schließen
- ESC-Taste → Pin schließen

EventsFeed exposed `scrollToEvent(id)` für externes Anspringen. Im Battle-Modus wird der Feed über `dateRange` + `rangeTitle` umgestaltet (zeigt alle Events im Schlacht-Zeitraum, Window-Buttons ausgeblendet).

### 7. Suche (`SearchBar.vue`)
Globale Volltextsuche über Städte, Schlachten, Operationen, Ereignisse, Verbände, **Personen** (Befehlshaber aus Battles/Divisions abgeleitet). Cmd/Ctrl+K als Shortcut. Sortierung: Wortanfang-Match > Substring-Titel > Type-Priorität > Alpha. Max 10 Treffer.

### 8. Verluste-Ticker (`CasualtyTicker.vue`)
Bei aktiver `major`-Schlacht: Floating-Panel bottom-mitte mit Tag X/Y, Σ Verluste, pro Tag. Wählt die **intensivste** (Verluste/Tag) aktive Großschlacht — vermeidet, dass Leningrad-Belagerung dauerhaft dominiert.

### 9. Kräfte-Charts (`StrengthChart.vue`)
Toggle-Panel bottom-rechts, zwei Mini-SVG-Liniendiagramme:
- Personalstärke (Mio) — Achse rot, Sowjet gelb
- Panzerproduktion (Stück/Quartal)
Vertikale Now-Linie, interpolierte Live-Werte in der Legende.

### 10. Klick-überall (Rechtsklick in `WarMap.client.vue`)
Popup mit:
- Koordinaten + Datum
- Seite (Achse/Sowjet) via Point-in-Polygon
- Distanz zur Frontlinie (Haversine)
- Aktive oder nächste Schlacht (klickbarer Link → öffnet BattleDetail)

### 11. URL-State (`pages/index.vue`)
- `?d=YYYY-MM-DD` — Datum
- `?b=battle-id` — geöffnetes Schlacht-Detail
- `?op=operation-id` — geöffnetes Operations-Detail
- `?e=event-id` — gepinnter Event
- `?layer=satellite` — Satellitenansicht
- `?w=1` — Wetter-Layer aktiviert
- `?r=1` — Eisenbahn-Layer aktiviert
- `?mode=battle` — Schlacht-Detail-Modus
- Reading on mount + nextTick-flyTo
- Writing via `history.replaceState` (kein History-Pollution)

### 12. Wetter/Rasputitsa-Layer (`lib/season.ts`, `WarMap.client.vue`)
- `seasonAt(date)` klassifiziert in vier Phasen mit Mitte-Monats-Schwellen:
  - Winter (1. Dez – 15. Mär): weißer Tint (`#dde6ef`, opacity 0.22)
  - Frühjahrs-Rasputitsa (16. Mär – 15. Mai): brauner Tint (`#8b6f4a`, opacity 0.24)
  - Sommer (16. Mai – 15. Okt): kein Overlay
  - Herbst-Rasputitsa (16. Okt – 30. Nov): dunkelbrauner Tint (`#7a5a3a`, opacity 0.24)
- Realisiert als `background`-Layer `weather-tint` über `desaturate-overlay`, unter allen Vektorlayern. Bei Toggle aus → opacity 0.
- Update beim Datum-Scrub: nur Check auf `map.getLayer('weather-tint')`, **nicht** `isStyleLoaded()` (gibt während Source-Updates kurz false zurück und würde Updates verschlucken).
- Timeline-Icon spiegelt aktuelle Saison (Sonne/Schnee/Schlamm-SVG-Pfad in `seasonInfo`)

### 13. Eisenbahn-Layer (`data/railways.ts`, `WarMap.client.vue`)
- 19 Hauptstrecken (13 `main`, 6 `secondary`), Polylines mit 6–14 Stützpunkten durch die historisch wichtigen Stationen
- Abgedeckt: HG-Mitte-Achse (Berlin–Moskau), HG-Süd (Berlin–Kiew), Achsen-Süd (Wien–Konstanza), Oktoberbahn (Leningrad–Moskau), Donezbecken, Wolga-Achsen, Kaukasus-Öl (Rostow–Baku), Baltikum, Murmansk-Versorgungsbahn, Ostpreußen, Industrie-Hinterland (Moskau–Kasan), u.a.
- Zwei Line-Layer: dunkler Halo + helle gestrichelte Linie (Schwellen-Andeutung). Breite je nach `importance`.
- Liegt zwischen Wetter-Tint und Frontverlauf — Frontpolygon bleibt darüber lesbar.

### 14. Wikipedia-Anreicherung Battle-Detail (`lib/wikipedia.ts`, `BattleDetail.vue`)
- `fetchWikiSummary(slug)` ruft `de.wikipedia.org/api/rest_v1/page/summary/{slug}` ab → Lead-Plaintext, Thumbnail, Original-Bild-URL, kanonische Artikel-URL
- LocalStorage-Cache mit 24h TTL (Key: `wiki:de:{slug}`); 404 und Disambiguation-Seiten werden als `null` gecached
- BattleDetail-Panel zeigt: Hero-Bild (180px hoch, Klick → Original in voller Auflösung), Wikipedia-Lead in eigener Box, „Vollständigen Artikel öffnen"-Link
- Race-Condition-Schutz: Battle-Wechsel während Fetch verwirft das alte Ergebnis
- 25 Schlachten haben verifizierte de.wiki-Slugs (Sonderfälle: Kursk → `Unternehmen_Zitadelle`, Brest → `Brester_Festung`, Sewastopol mit en-dash `1941–1942`)

### 16. POIs in der Schlacht (`data/battle-pois.ts`, `data/pois/*.json`, `WarMap.client.vue`)
- **432 POIs über alle 25 Schlachten**, ~17 pro Schlacht (16–23). 357 (83%) haben einen Wikipedia-Slug für Lead-Text/Fallback-Bild, **298 (69%) haben ein `customImage` mit zeitgenössischem Kriegsfoto (1939–1945)** aus Wikimedia Commons (Bundesarchiv, RIA Novosti, Fortepan, NAC, TASS); die restlichen 134 fallen auf das Wikipedia-Bild zurück (oft modernes Foto vom Ort heute).
- **Koordinaten-Refine-Pass** verbesserte 119 POIs um >500m. Verteilung der Quellen: 310 `wikipedia`, 7 `wikidata`, 21 `nominatim` (lokal-sprachig: russisch/ukrainisch/polnisch/usw), 94 `original` (Gebietspunkte wie Steppen/Flüsse/Stellungen — bewusst kein Punktstandort).
- Pro Schlacht liegt ein JSON unter `app/data/pois/{battleId}.json`. `battle-pois.ts` aggregiert sie via Vite-Glob-Import — neue Schlacht-POI-Dateien werden automatisch eingelesen.
- Daten wurden durch **25 parallele Recherche-Agents** + 1 Bilder-Agent + 1 Refine-Agent + 1 Pilot + 24 parallele Kriegsfoto-Agents erstellt:
  - Recherche-Agents: Wikipedia-Hauptartikel lesen, 12–20 Schauplätze identifizieren (Vorfeld/Hauptkampf/Hinterland/Symbolisches), Koordinaten verifizieren, 5 Kategorien (`building`/`industry`/`transport`/`terrain`/`symbolic`) einhalten
  - Bilder-Agent (initial): für 75 POIs ohne Wiki-Slug Commons-Suche, mit License + Credit + sourceUrl in `customImage`
  - Refine-Agent: Koordinaten-Hierarchie (Wikipedia → Wikidata → OSM-Overpass → Nominatim mit lokal-sprachigem Namen), max 20km-Plausibilitäts-Cap, `coordinatesSource`-Tracking
  - **Kriegsfoto-Refinement (2026-05-15)**: 25 parallele Agents (1 Pilot Kursk + 24 für die übrigen Schlachten) recherchierten für jeden POI ein zeitgenössisches Foto aus 1939–1945. Strikte Regeln: Aufnahme-Datum auf Commons-Dateibeschreibung verifizieren, bestehende Kriegsfotos behalten, Mahnmale/moderne Fotos ersetzen außer der POI IST das Mahnmal (Kategorie `symbolic`), Karten/Wappen/Operationsskizzen/Gräueltaten verwerfen. Holocaust/Babi-Jar-Ausschluss strikt eingehalten. Wenn nichts Passendes gefunden → kein customImage, Frontend fällt auf Wiki-Bild zurück.
- Werden **nur im Schlacht-Detail-Modus** angezeigt; Parent (`pages/index.vue`) berechnet `activePois` per `poisForBattle(activeBattle.id)`
- Rendering als native MapLibre `symbol`-Layer mit Kategorie-Icon + Text-Label rechts daneben:
  - Icons werden zur Laufzeit aus Inline-SVG erzeugt, per `URL.createObjectURL` als `Image` geladen und mit `map.addImage()` registriert (je Kategorie eigene Farbe: building=cyan, industry=orange, transport=lila, terrain=grün, symbolic=gelb)
  - Text mit dickem Halo, `text-anchor: left`, `text-offset: [1.4, 0]` damit Label seitlich vom Icon sitzt
- Klick auf POI öffnet ein styled MapLibre-Popup mit:
  - **Bild-Priorität: `customImage` (zeitgetreues Kriegsfoto) ZUERST, Wikipedia-Thumb (oft modern) nur als Fallback** — Logik in `WarMap.client.vue:259`
  - Hero-Bild (160px) lazy geladen
  - Kategorie-Badge in Icon-Farbe, Titel, 1–2-Sätze-Beschreibung, „Auf Wikipedia weiterlesen"-Link wenn Slug vorhanden
- Zoom-Verhalten im Battle-Mode ist POI-abhängig: bei vorhandenen POIs Zoom **12** (Stadt-Maßstab), sonst Zoom **7** (operativ)

#### Coverage zeitgenössischer Kriegsfotos pro Schlacht (Stand 2026-05-15)

| Coverage | Schlachten |
|---|---|
| 100% | Stalingrad, Jassy-Kishinev, Wjasma-Brjansk |
| 88–95% | Moskau 1941 (95%), Königsberg (94%), Kursk (94%), Rschew (94%), Smolensk 1941 (89%), Kharkov 3 (88%) |
| 60–85% | Kaukasus (83%), Brest (78%), Bagration (71%), Krim 1944 (72%), Uman (69%), Sewastopol 42 (69%), Budapest (63%), Leningrad-Blockade (61%) |
| 40–59% | Kharkov 2 (59%), Demjansk (53%), Berlin (43%) |
| < 40% | Korsun (35%), Vistula-Oder (35%), Kiev 1941 (31% — Babi-Jar-Ausschluss), Spring Awakening (29%), Lwow-Sandomierz (25%) |

Geringe Coverage typischerweise weil: kleine Dörfer/Brückenköpfe ohne Commons-Material, Flussabschnitte ohne ortsspezifische Fotos, später Krieg ohne dt. Pressefotografen mehr im Feld, Holocaust-Ausschluss (Kiev/Lwow).

### 15. Schlacht-Detail-Modus + Bildergalerie (`pages/index.vue`, `BattleDetail.vue`, `Timeline.vue`, `EventsFeed.vue`, `lib/wikipedia.ts`)
- Button im BattleDetail-Panel „In Schlacht-Detail wechseln" aktiviert `battleMode` (zentraler State in `pages/index.vue`)
- Im Modus:
  - Karte fliegt zur Battle-Koordinate mit Zoom 7
  - Timeline-`rangeMin`/`rangeMax` werden auf `battle.start`/`battle.end` gesetzt (Slider, sichtbare Snapshot-Ticks, Play-Loop respektieren das)
  - EventsFeed bekommt `dateRange` + `rangeTitle="Ereignisse der Schlacht"` und zeigt alle Events im Schlacht-Zeitraum
  - Header zeigt einen gelben Mode-Indikator mit Schlachtname + „Zurück zur Welt"-Button
  - Bildergalerie wird lazy aus `de.wikipedia.org/api/rest_v1/page/media-list/{slug}` geladen (cached 24h unter `wiki:de:gallery:v2:{slug}`)
- Galerie-Auto-Filter: SVG/GIF, Title-Keywords (`map`, `karte`, `wappen`, `coa`, `flag_of`, `flagge`, `badge`, `encirclement`, `icon`, …) werden ausgesondert; max 16 Bilder; 3-spaltiges Quadrat-Grid
- Thumbnail-URL aus dem `srcset` direkt benutzt (500px ist von Wikimedia garantiert verfügbar, größere thumbs liefern teilweise 400)
- Lightbox via `<Teleport to="body">`: Klick auf Tile öffnet Original in Vollbild-Overlay (`thumbToOriginal` entfernt den `/thumb/`-Pfadteil)
- Verlassen automatisch wenn `selectedBattle` null wird oder Schlacht ohne `wikipediaSlug`
- URL-Param `?mode=battle` macht die Ansicht teilbar

### 17. Operations-Detail-Panel (`OperationDetail.vue`, `WarMap.client.vue`, `pages/index.vue`)
- **Klick auf einen Pfeil** auf der Karte (sowohl Halo als auch Linie) öffnet ein Detail-Panel rechts. Cursor wird beim Hover auf den Pfeilen zu Pointer.
- **Inhalt**: Side-Badge (Achse rot / Sowjet gelb), Operations-Name, Zeitraum, eigene Zusammenfassung, Wikipedia-Lead-Text + Hero-Bild (de.wiki, 24h-LocalStorage-Cache via `fetchWikiSummary`), Wikipedia-Vollartikel-Link, Liste der Stoßrichtungen (mit Befehlshaber-/Verbands-Labels), Liste verknüpfter Schlachten (Zeitraum-Überlapp UND ≤ 400 km vom nächsten Thrust-Endpunkt) als klickbare Cross-Links.
- **22 von 23 Operationen haben einen verifizierten `wikipediaSlug`**. Slug-Verifikation erfolgte durch dedizierten Recherche-Agent gegen `de.wikipedia.org/api/rest_v1/page/summary/{slug}` (HTTP 200 + `type: standard`). Ausnahme: `moscow-counter` (sowjetische Winteroffensive 1941/42) hat keinen eigenen Artikel und wird im Sammelartikel `Schlacht_um_Moskau` behandelt — das Panel zeigt für diese Operation einfach keine Wiki-Box.
- **Mutuelle Exklusion mit BattleDetail**: Beide Panels belegen den gleichen rechten Slot. Öffnen einer Operation schließt eine offene Schlacht und umgekehrt.
- **URL-Param `?op=operation-id`** für teilbare Links. Beim Mount wird zur Operation geflogen (Mittelpunkt der Thrust-Endpunkte, Zoom 5), und das Datum wird auf die Operations-Mitte gesetzt, falls außerhalb.
- **ESC schließt** das Operations-Panel (nach Event-Pin, falls einer offen ist).
- **Cross-Link auf Schlacht** in der "Schlachten im Zeitraum"-Liste ruft `onBattleClick` auf, was die Operation schließt und das BattleDetail öffnet — der Nutzer kann nahtlos zwischen operativer und taktischer Sicht wechseln.

## Datenquellen + Recherche-Workflow

Alle Datenmodule wurden durch dedizierte Recherche-Agenten (general-purpose) erstellt:
- Frontlinien: kalibriert gegen Wikipedia, Glantz, USMA West Point Atlas
- Schlachten: Wikipedia (DE+EN cross-check), Glantz "When Titans Clashed"
- Operationen: Standardliteratur, Anker-Punkte vorgegeben
- Stadtgrenzen: OSM/Nominatim via WebFetch (mit Polygon-Simplification)
- Ereignisse: Wikipedia, Standardliteratur
- Stärke-Daten: Müller-Hillebrand, Krivosheev, Glantz "Colossus Reborn", Overmans, Jentz
- Eisenbahnstrecken: Wikipedia + heutige OSM-Linienführung (95 % deckungsgleich)
- Wikipedia-Slugs: per de.wiki REST API verifiziert (200 + type=standard)

**Wichtig**: Verlustzahlen variieren je nach Quelle stark, Werte sind mit `~` als Annäherungen gekennzeichnet.

## Wichtige Design-Entscheidungen

1. **Statische Daten statt DB**: Reine Frontend-App, alles in TS-Dateien. Supabase würde nur Sinn machen für User-Features (Bookmarks, Notizen).
2. **Hybrid Statik + Live-Wikipedia**: Skelett (IDs, Daten, Koordinaten, kuratierte Story) ist statisch und garantiert stabil. Lebendige Inhalte (Lead-Texte, Bilder) kommen lazy aus Wikipedia mit Cache. Best of both.
3. **Sub-Agenten für Recherche**: Jeder Datensatz von dediziertem Agent gefüllt, ~10–20 Min Wartezeit pro Agent. Wert ist Token-Effizienz im Hauptchat.
4. **Holocaust/Kriegsverbrechen-Layer explizit ausgeschlossen** (Wunsch des Nutzers, "anderes Thema, nicht direkt App-bezogen"). Wannsee, Vernichtungslager, Massenerschießungen kommen NICHT in `events.ts`.
5. **Front-Polygon mit dynamischer Rückseite**: Bei Front-Süden < 22°E wird COMPACT-Back genutzt (kein Balkan), sonst FULL. Verhindert Selbstdurchkreuzung im Spätkrieg. Kleiner visueller Sprung um Aug./Sep. 1944 — historisch beim Seitenwechsel Rumäniens nicht unpassend.
6. **Pfeilspitzen als Linien**: Chevron-Form im selben GeoJSON-Layer wie der Schaft, statt HTML-Marker. Vorteile: gleiche Farbe, skaliert mit Zoom, keine Rotations-Berechnung.
7. **Casualty-Ticker priorisiert nach Intensität (Verluste/Tag)**: Sonst dominiert Leningrad (872 Tage Belagerung) alle anderen Schlachten.
8. **Native `<select>` ersetzt durch `DarkSelect.vue`**: Native Selects können nicht cross-browser gestylt werden, weißes Dropdown im dunklen Theme war hässlich.
9. **Marker und Labels nativ in WebGL gerendert**: Schlachten als `circle`-Layer, Verbands-Labels als `symbol`-Layer mit Halo. HTML-DOM-Marker (frühere Variante) ruckelten beim Pan/Zoom, weil sie als CSS-Transform jedes Frame neu positioniert werden. WebGL-Geometrie ist frame-genau verankert. Verlust: keine CSS-Animationen (Pulse) und kein HTML-Tooltip; ersetzt durch MapLibre-Popup on hover.
10. **Event-Pin: zwei Aktionen, nicht eine**: Pin-Click öffnet Feed (statt zu schließen), separater X-Button schließt. Nutzer-Feedback: "ein Pin der sich nur durch Klick selbst zerstört ist unintuitiv".
11. **POI-Popup-Bild: `customImage` vor Wikipedia-Thumb**: Ursprünglich hatte das Wikipedia-Bild Vorrang — das lieferte oft eine moderne Stadt-Aufnahme (z.B. Bahnhof heute renoviert). Seit dem Kriegsfoto-Refinement vom 2026-05-15 gewinnt das `customImage` (zeitgenössisches Bundesarchiv-/Sowjet-Pressefoto 1939–1945); Wikipedia-Thumb nur Fallback wenn kein `customImage` gesetzt. Zeitgetreuer Look statt visuellem Bruch zwischen Karten-Marker und 2020er-Foto.
12. **Wikimedia-Thumb-Größen-Falle (gelernt im Pilot)**: `upload.wikimedia.org` antwortet mit HTTP 400 ("Use thumbnail sizes listed on..."), wenn die angeforderte Thumb-Größe nicht in der Whitelist ist oder das Originalbild kleiner als die Anforderung. Sichere Größen: `220`/`320`/`500`. **Bewährter Default für `customImage.url`**: Original-URL ohne `/thumb/`-Segment (`https://upload.wikimedia.org/wikipedia/commons/{h1}/{h2}/{filename}`) — funktioniert unabhängig von der Originalgröße und liefert das volle Bild. Browser-Layout skaliert es ohnehin via CSS auf 160px Popup-Höhe.

## Bekannte Trade-offs

- **Frontlinien sind Annäherungen** — kein historisch präziser Datensatz, sondern Schätzungen aus Standardwerken
- **Stadtgrenzen sind MODERN** (OSM 2026), nicht historisch — Wolgograd 2026 ist viel größer als Stalingrad 1942
- **Kaukasus-Pocket „springt"** beim Scrubben (zeigt sich nur am nächstgelegenen Snapshot)
- **Zeitstrahl-Bereich 21.06.1941 – 08.05.1945** — Ereignisse außerhalb (Hitler-Weisung Nr. 21 Dez 1940, Potsdam Juli 1945) werden geclamped beim Anzeigen
- **Stärke-Daten quartalsweise** — Quartalsgranularität der Panzerproduktion ist ±10 %
- **Verlustzahlen** stark quellenabhängig, Mittelwerte verwendet
- **Galerie-Auto-Filter ist heuristisch**: Filter über SVG-Endung + Title-Keywords funktioniert für die meisten Artikel, lässt aber gelegentlich Diagramme/Monumente durchrutschen (z.B. PNG-Karten ohne „map" im Dateinamen). Bei Bedarf pro Schlacht ein Override-Mechanismus nachrüstbar.

## Was noch offen ist

Aus der Brainstorm-Liste:

- Pfeil-Labels (Befehlshaber-Namen entlang der Bézier-Kurve mit MapLibre Symbol-Layer)
- Pfeil-Fade-Out am Ende einer Operation
- Mehr Verbands-Snapshots (aktuell nur 6)
- Westfront analog
- Persönliche Notizen / Bookmarks (würde Supabase rechtfertigen)
- Eisenbahn-Layer-Verfeinerungen: Hover-Tooltip mit Streckenname/Notes, evtl. importance-abhängige Sichtbarkeit pro Zoomstufe
- Wikipedia-Bilder auch außerhalb des Battle-Modus (z.B. kleines Thumb im normalen Detail-Panel — aktuell nur Hero-Bild)

## Wie weiterarbeiten

```bash
# Dev-Server starten
cd "c:\Users\WildC\OneDrive\Desktop\map"
NODE_OPTIONS=--use-system-ca npx nuxt dev --port 3030

# Im Browser
http://localhost:3030
```

### Häufige Edits

| Was | Wo |
|---|---|
| Neue Schlacht hinzufügen | `app/data/battles.ts` (Object einfügen, inkl. `wikipediaSlug`) |
| Frontlinie korrigieren | `app/data/easternFront.ts` (SNAPSHOTS-Array) |
| Neues Ereignis | `app/data/events.ts` |
| Neue Operation | `app/data/operations.ts` |
| Galerie-Filter feinjustieren | `SKIP_KEYWORDS` in `app/lib/wikipedia.ts` |
| POI-Kriegsfoto nachrüsten | `customImage`-Block in `app/data/pois/{battleId}.json` (alle 5 Felder Pflicht: url/source/license/credit/sourceUrl); URL ohne `/thumb/` bevorzugen |
| Wetter-Saison-Schwellen | `seasonAt()` in `app/lib/season.ts` |
| Map-Styling | `app/components/WarMap.client.vue` |
| Layout-Position eines Panels | `app/pages/index.vue` |

### Wenn ein Agent für Datenrecherche gebraucht wird

Pattern:
1. Klare Output-Struktur in TypeScript-Interfaces vorgeben
2. Anker-Daten (Koordinaten, Daten) im Prompt nennen
3. Exclusion-Liste: was nicht doppeln
4. Token-Budget angeben
5. Im Background laufen lassen (`run_in_background: true`), parallel weiterarbeiten

### Hot-Reload-Gotcha bei `.client.vue` + MapLibre

Änderungen an `WarMap.client.vue` werden manchmal nicht sauber per HMR übernommen, weil die Map-Instanz nicht neu initialisiert wird. Im Zweifel **F5 drücken**.

## Quick-Test-Stellen (URL-Links)

| URL-Suffix | Zeigt |
|---|---|
| `?d=1942-11-19&b=stalingrad` | Stalingrad am Tag von Uranus, Detail-Panel offen |
| `?d=1942-11-19&b=stalingrad&mode=battle` | Stalingrad im Detail-Modus mit Galerie + lokalem Zeitstrahl |
| `?d=1943-07-05&b=kursk&mode=battle` | Kursk-Detail (Wiki-Slug: Unternehmen Zitadelle) |
| `?d=1944-06-22&b=bagration&mode=battle` | Bagration-Detail |
| `?d=1945-04-16&b=berlin&mode=battle` | Berlin-Detail, drei konvergierende Pfeile |
| `?d=1942-11-19&b=stalingrad&mode=battle` (zoomt auf Stadt) | **POIs**: Bahnhof, Mamajew, Pawlow-Haus, Roter Oktober … |
| `?d=1944-06-30&op=bagration-op` | Bagration-Operations-Panel mit Wiki-Lead + 4 Stoßrichtungen + Schlachten-Cross-Links |
| `?d=1945-04-20&op=berlin-op` | Berliner Operation, drei konvergierende Pfeile + Schlacht-um-Berlin-Verknüpfung |
| `?d=1942-12-15&w=1&r=1` | Winter-Tint + Eisenbahn-Layer |
| `?d=1942-04-10&w=1` | Frühjahrs-Rasputitsa-Tint |

## Stand der Roadmap

Punkte 1–5 der ursprünglichen Ideen-Liste **+ Hybrid-Wikipedia-Integration + Battle-Detail-Modus** fertig:

1. ✅ Stoßrichtungs-Pfeile
2. ✅ „An diesem Tag"-Feed (+ Pin-Funktionalität, Active-State, Klick öffnet im Feed, X / ESC zum Schließen)
3. ✅ Klick-überall-Abfrage + Suche + URL-State
4. ✅ Verluste-Counter + Kräfte-Charts
5. ✅ Wetter/Rasputitsa-Layer + Eisenbahn-Hauptstrecken (Polish)
6. ✅ Native WebGL-Marker (Schlachten als circle-Layer, Verbands-Labels als symbol-Layer mit Halo + Hover-Popup)
7. ✅ Wikipedia-Hybrid: Lead-Text + Hero-Bild im Detail-Panel (de.wiki, 24h-Cache)
8. ✅ Schlacht-Detail-Modus: Welt → Schlacht-Switch mit zoomed Karte, lokalem Zeitstrahl, Battle-Events, Wikipedia-Bildergalerie, Lightbox, teilbare URL
9. ✅ POIs in der Schlacht — **432 POIs über alle 25 Schlachten** (83% mit Wiki-Bild, weitere 12% mit Commons-Bild); Kategorie-Icons + Labels via Symbol-Layer; Klick öffnet Popup mit Bild + Beschreibung + Lizenz-Credit
10. ✅ Autonomes Recherche-Pattern: 25 parallele Agents recherchieren pro Schlacht 12–20 Schauplätze
11. ✅ Commons-Bilder-Agent: 54 weitere POIs mit hand-recherchierten Wikimedia-Commons-Bildern (Bundesarchiv, CC-BY-SA), Lizenz-Credit im Popup
12. ✅ Koordinaten-Refine-Agent: 119 POIs um >500m verbessert, 4-stufige Quellenhierarchie (Wikipedia/Wikidata/OSM/Nominatim mit lokal-sprachigen Namen)
13. ✅ **Kriegsfoto-Refinement (2026-05-15)**: 25 parallele Agents (1 Pilot Kursk + 24 für die übrigen Schlachten) recherchierten zeitgenössische 1939–1945-Aufnahmen für jeden POI. **Ergebnis: 298 von 432 POIs (69%) mit `customImage`** — vorher waren es 54. Frontend-Logik in `WarMap.client.vue:259` umgedreht: `customImage` Vorrang vor Wikipedia-Thumb. Quellen: ~95 Bundesarchiv (CC-BY-SA 3.0 DE), ~150 Wikimedia Commons / RIA Novosti / Fortepan / NAC, Rest TASS und weitere Sowjet-Pressearchive. Lücken (134 POIs ohne `customImage`, fallen auf Wiki-Bild zurück) typischerweise: kleine Dörfer/Brückenköpfe ohne Commons-Material, Flussabschnitte ohne ortsspezifische Fotos, Holocaust-Ausschluss (Kiev/Lwow)
14. ✅ **Operations-Detail-Panel (2026-05-16)**: Klick auf einen Operations-Pfeil öffnet `OperationDetail.vue` mit Wiki-Lead, Stoßrichtungs-Liste und Cross-Links zu Schlachten im Zeitraum. Slugs durch Recherche-Agent gegen de.wiki API verifiziert (22 von 23 Operationen haben eigenen Artikel). Mutuell exklusiv mit BattleDetail; teilbar via `?op=`.
