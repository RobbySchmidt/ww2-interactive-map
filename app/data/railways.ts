/**
 * Historische Eisenbahn-Hauptstrecken im Ostfront-Theater 1941–1945.
 *
 * Erklärt, warum Knotenpunkte wie Smolensk, Brest, Charkow, Krakau oder
 * Rostow so umkämpft waren: Sie waren strategische Bahn-Knoten.
 * Streckenverläufe ~aktuelles Schienennetz (95 % deckungsgleich mit damals),
 * Koordinaten als Polyline durch die historisch wichtigsten Stationen.
 *
 * Format: [lng, lat] (MapLibre-Standard).
 */

export interface Railway {
  id: string
  name: string
  importance: 'main' | 'secondary'
  notes?: string
  coordinates: [number, number][]
}

export const RAILWAYS: Railway[] = [
  // ---------- HG-MITTE-ACHSE ----------
  {
    id: 'berlin-warschau-minsk-moskau',
    name: 'Berlin – Warschau – Brest – Minsk – Smolensk – Moskau',
    importance: 'main',
    notes:
      'Zentrale Versorgungsader der Heeresgruppe Mitte; Brest, Minsk und Smolensk waren die kriegsentscheidenden Umspur- und Knotenpunkte.',
    coordinates: [
      [13.405, 52.520], // Berlin
      [14.550, 52.405], // Frankfurt/Oder
      [17.030, 52.405], // Poznań/Posen
      [19.460, 52.250], // Łódź / Kutno
      [21.012, 52.230], // Warschau
      [22.250, 52.220], // Siedlce
      [23.736, 52.098], // Brest
      [25.330, 53.130], // Baranowitschi
      [27.567, 53.904], // Minsk
      [30.000, 54.500], // Orscha
      [32.045, 54.783], // Smolensk
      [34.330, 55.380], // Wjasma
      [35.910, 55.380], // Gschatsk / Mozhaisk
      [37.618, 55.752], // Moskau
    ],
  },

  // ---------- HG-SÜD-ACHSE ----------
  {
    id: 'berlin-breslau-krakau-lemberg-kiew',
    name: 'Berlin – Breslau – Krakau – Lemberg – Kiew',
    importance: 'main',
    notes:
      'Hauptversorgung der Heeresgruppe Süd; Krakau war Generalgouvernement-Drehscheibe, Lemberg der Sprung in die Ukraine.',
    coordinates: [
      [13.405, 52.520], // Berlin
      [15.430, 52.350], // Frankfurt/Oder – Süd-Schwenk
      [16.930, 51.110], // Breslau/Wrocław
      [18.660, 50.290], // Kattowitz
      [19.945, 50.064], // Krakau
      [21.990, 50.040], // Rzeszów
      [22.770, 49.700], // Przemyśl
      [24.030, 49.842], // Lemberg / Lwów
      [25.600, 49.870], // Brody
      [26.580, 50.620], // Riwne
      [28.660, 50.260], // Schytomyr
      [30.524, 50.450], // Kiew
    ],
  },

  // ---------- ACHSE-SÜD (Donau, Balkan, Schwarzes Meer) ----------
  {
    id: 'wien-budapest-bukarest-konstanza',
    name: 'Wien – Budapest – Bukarest – Konstanza',
    importance: 'main',
    notes:
      'Logistik-Rückgrat der Achsenmächte im Süden; verband Reichsraum mit rumänischem Erdöl und Schwarzmeer-Häfen.',
    coordinates: [
      [16.373, 48.208], // Wien
      [17.110, 48.150], // Bratislava
      [18.230, 47.760], // Komárno
      [19.040, 47.498], // Budapest
      [20.150, 46.250], // Szeged
      [21.310, 46.180], // Arad
      [22.910, 45.760], // Deva / Karlsburg
      [23.580, 46.770], // Klausenburg/Cluj
      [24.150, 45.800], // Sibiu / Hermannstadt
      [25.590, 45.650], // Kronstadt/Brașov
      [25.790, 44.780], // Ploiești (Ölfelder)
      [26.103, 44.426], // Bukarest
      [27.620, 44.180], // Cernavodă
      [28.658, 44.173], // Konstanza
    ],
  },
  {
    id: 'bukarest-odessa',
    name: 'Bukarest – Galați – Odessa',
    importance: 'secondary',
    notes:
      'Rumänische Anbindung an das eroberte Transnistrien; ab 1941 wichtigste Achsen-Zufuhr für die Südukraine.',
    coordinates: [
      [26.103, 44.426], // Bukarest
      [27.190, 44.430], // Urziceni / Buzău-Vorland
      [27.910, 45.430], // Galați
      [28.190, 45.870], // Reni
      [28.840, 46.840], // Bender / Tighina
      [29.870, 46.330], // Tiraspol
      [30.730, 46.485], // Odessa
    ],
  },

  // ---------- LENINGRAD–MOSKAU (Oktober/Nikolai-Bahn) ----------
  {
    id: 'leningrad-moskau',
    name: 'Leningrad – Bologoje – Twer – Moskau (Oktoberbahn)',
    importance: 'main',
    notes:
      'Nikolai-/Oktoberbahn, älteste russische Hauptbahn; sowjetische Nord-Süd-Lebensader, an Klin und Kalinin 1941 zeitweise gekappt.',
    coordinates: [
      [30.314, 59.939], // Leningrad
      [31.260, 59.560], // Tossno
      [31.260, 58.520], // Tschudowo
      [31.270, 58.520], // Malaja Wischera
      [33.260, 58.520], // Bologoje
      [34.260, 57.580], // Wyschni Wolotschok
      [35.900, 56.860], // Twer / Kalinin
      [36.730, 56.330], // Klin
      [37.618, 55.752], // Moskau
    ],
  },

  // ---------- MOSKAU-SÜD-ACHSE ----------
  {
    id: 'moskau-tula-kursk-charkow-rostow',
    name: 'Moskau – Tula – Orjol – Kursk – Charkow – Rostow',
    importance: 'main',
    notes:
      'Sowjetische Süd-Hauptachse; Tula 1941 Schlüssel gegen Guderian, Kursk 1943 Stalingrads strategische Fortsetzung, Charkow viermal umkämpft.',
    coordinates: [
      [37.618, 55.752], // Moskau
      [37.610, 54.190], // Tula
      [36.560, 53.000], // Mzensk
      [36.090, 52.970], // Orjol
      [36.190, 51.730], // Kursk
      [36.730, 50.600], // Belgorod
      [36.231, 49.994], // Charkow
      [37.530, 48.940], // Slawjansk
      [38.040, 47.940], // Debalzewe
      [39.720, 47.235], // Rostow am Don
    ],
  },

  // ---------- DONEZBECKEN ----------
  {
    id: 'charkow-stalino-rostow',
    name: 'Charkow – Stalino/Donezk – Taganrog – Rostow',
    importance: 'main',
    notes:
      'Industrieanschluss des Donezbeckens (Kohle, Stahl); 1942 zentrales Ziel des Vorstoßes zum Don, 1943 Mansteins Schlachtfeld.',
    coordinates: [
      [36.231, 49.994], // Charkow
      [36.770, 49.400], // Lozowa
      [37.530, 48.940], // Slawjansk
      [37.800, 48.000], // Stalino / Donezk
      [38.300, 47.800], // Makijiwka
      [38.940, 47.230], // Taganrog
      [39.720, 47.235], // Rostow
    ],
  },

  // ---------- WOLGA-ACHSE ----------
  {
    id: 'rostow-stalingrad-astrachan',
    name: 'Rostow – Salsk – Kotelnikowo – Stalingrad – Astrachan',
    importance: 'main',
    notes:
      'Süd-Wolga-Anbindung; 1942 Hauptachse der 4. Panzerarmee auf Stalingrad und Tor zum Kaspischen Meer.',
    coordinates: [
      [39.720, 47.235], // Rostow
      [41.520, 47.230], // Salsk-Vorland
      [41.530, 46.470], // Salsk
      [43.150, 47.620], // Kotelnikowo
      [44.514, 48.708], // Stalingrad
      [45.730, 48.040], // Tschernyschkowski / Wolga-Süd
      [46.350, 47.510], // Achtuba
      [48.034, 46.349], // Astrachan
    ],
  },
  {
    id: 'moskau-rjasan-saratow-stalingrad',
    name: 'Moskau – Rjasan – Pensa – Saratow – Stalingrad',
    importance: 'main',
    notes:
      'Sowjetische Wolga-Aufmarschachse; brachte 1942 die Reserven und Munition für die Verteidigung Stalingrads heran.',
    coordinates: [
      [37.618, 55.752], // Moskau
      [39.700, 54.620], // Rjasan
      [42.000, 54.230], // Sasowo
      [44.100, 54.180], // Ruzajewka
      [45.020, 53.200], // Pensa
      [46.040, 52.030], // Petrowsk
      [46.034, 51.533], // Saratow
      [45.420, 50.770], // Krasnoarmejsk
      [44.514, 48.708], // Stalingrad
    ],
  },

  // ---------- KAUKASUS-ÖL-ACHSE ----------
  {
    id: 'rostow-baku',
    name: 'Rostow – Tichorezk – Mineralnyje Wody – Grosny – Baku',
    importance: 'main',
    notes:
      'Einzige durchgehende Schienenanbindung an die Kaukasus-Ölfelder; Hauptziel des Falls Blau 1942 (Maikop, Grosny, Baku).',
    coordinates: [
      [39.720, 47.235], // Rostow
      [40.100, 46.730], // Bataisk
      [40.110, 45.860], // Tichorezk
      [41.520, 45.040], // Armawir
      [42.020, 44.640], // Newinnomyssk
      [43.140, 44.211], // Mineralnyje Wody
      [44.660, 44.040], // Mosdok
      [45.700, 43.320], // Grosny
      [47.500, 42.980], // Machatschkala
      [48.300, 41.700], // Derbent
      [49.892, 40.409], // Baku
    ],
  },

  // ---------- BALTIKUM ----------
  {
    id: 'riga-daugavpils-wilna-minsk',
    name: 'Riga – Daugavpils – Wilna – Minsk',
    importance: 'main',
    notes:
      'Vorstoßachse der Heeresgruppe Nord 1941; Düna-Übergang bei Daugavpils war Manstein-Coup.',
    coordinates: [
      [24.106, 56.946], // Riga
      [25.560, 56.510], // Bauska
      [26.530, 55.870], // Daugavpils / Dünaburg
      [26.530, 55.580], // Turmantas
      [25.279, 54.687], // Wilna
      [26.840, 54.310], // Maladsetschna
      [27.567, 53.904], // Minsk
    ],
  },

  // ---------- LENINGRAD-VERSORGUNG ----------
  {
    id: 'leningrad-wolchow-tichwin',
    name: 'Leningrad – Mga – Wolchow – Tichwin – Wologda',
    importance: 'main',
    notes:
      'Versorgung des belagerten Leningrad über den Wolchow-Knoten; Tichwin-Eroberung Nov. 1941 schnitt die Stadt zeitweise völlig ab.',
    coordinates: [
      [30.314, 59.939], // Leningrad
      [30.730, 59.750], // Mga
      [31.990, 59.660], // Kirischi
      [32.330, 59.920], // Wolchow
      [33.540, 59.640], // Tichwin
      [35.870, 59.560], // Tscherepowez
      [39.890, 59.220], // Wologda
    ],
  },
  {
    id: 'leningrad-murmansk',
    name: 'Leningrad – Petrosawodsk – Murmansk (Kirow-Bahn)',
    importance: 'main',
    notes:
      'Kirow-Bahn — einzige Schienenverbindung zum eisfreien Hafen Murmansk; Lend-Lease-Hauptader, ab 1941 Ziel deutsch-finnischer Angriffe.',
    coordinates: [
      [30.314, 59.939], // Leningrad
      [32.000, 60.700], // Lodejnoje Pole
      [34.350, 61.790], // Petrosawodsk
      [34.350, 64.560], // Belomorsk
      [33.640, 66.530], // Kandalakscha
      [33.080, 67.560], // Apatity
      [33.083, 68.970], // Murmansk
    ],
  },

  // ---------- OSTPREUSSEN ----------
  {
    id: 'koenigsberg-insterburg-kowno-wilna',
    name: 'Königsberg – Insterburg – Kowno – Wilna',
    importance: 'secondary',
    notes:
      'Ostpreußen-Anbindung ins Baltikum; Aufmarschstrecke der 3. Panzergruppe 1941 und Rückzugsachse 1944/45.',
    coordinates: [
      [20.510, 54.710], // Königsberg
      [21.480, 54.640], // Insterburg
      [22.430, 54.430], // Eydtkuhnen
      [23.350, 54.900], // Kaunas / Kowno
      [24.330, 54.880], // Jonava
      [25.279, 54.687], // Wilna
    ],
  },

  // ---------- REICHS-RÜCKGRAT ----------
  {
    id: 'berlin-stettin-koenigsberg',
    name: 'Berlin – Stettin – Danzig – Königsberg',
    importance: 'secondary',
    notes:
      'Reichs-Ostsee-Magistrale; Nachschub nach Ostpreußen und Evakuierungsachse 1944/45 (Operation Hannibal).',
    coordinates: [
      [13.405, 52.520], // Berlin
      [13.490, 53.560], // Prenzlau
      [14.553, 53.428], // Stettin
      [16.180, 54.190], // Köslin
      [18.640, 54.350], // Danzig
      [19.560, 54.430], // Elbing
      [20.510, 54.710], // Königsberg
    ],
  },

  // ---------- SOWJETISCHES INDUSTRIE-HINTERLAND ----------
  {
    id: 'moskau-gorki-kasan',
    name: 'Moskau – Wladimir – Gorki – Kasan',
    importance: 'main',
    notes:
      'Verband Moskau mit dem Rüstungsdreieck Gorki/Kasan; Panzer- und Munitionsstrom aus der Wolga-Industrie.',
    coordinates: [
      [37.618, 55.752], // Moskau
      [38.980, 55.760], // Orechowo-Sujewo
      [40.410, 56.130], // Wladimir
      [42.090, 56.300], // Murom-Vorland
      [43.970, 56.296], // Gorki / Nischni Nowgorod
      [46.040, 56.130], // Kosmodemjansk
      [48.030, 55.790], // Selenodolsk
      [49.106, 55.796], // Kasan
    ],
  },

  // ---------- UKRAINE-SÜD ----------
  {
    id: 'kiew-odessa',
    name: 'Kiew – Bila Zerkwa – Winnyzja – Odessa',
    importance: 'main',
    notes:
      'Süd-Versorgungsachse der Ukraine; 1941 Rückzugsweg der Südwestfront, 1944 von der 2. Ukrainischen Front zurückerobert.',
    coordinates: [
      [30.524, 50.450], // Kiew
      [30.110, 49.800], // Bila Zerkwa
      [29.490, 49.230], // Uman-Vorland
      [28.480, 49.233], // Winnyzja
      [29.270, 48.450], // Hajworon
      [30.230, 47.840], // Pervomajsk
      [30.730, 46.485], // Odessa
    ],
  },

  // ---------- TEILSTRECKE KARPATEN-VORLAND ----------
  {
    id: 'lemberg-tarnopol-winnyzja',
    name: 'Lemberg – Tarnopol – Schepetiwka – Winnyzja',
    importance: 'secondary',
    notes:
      'Aufmarschstrecke der Heeresgruppe Süd ins Wolyn-Podolien; 1944 zentrale Achse der Proskurow-Tschernowizer Operation.',
    coordinates: [
      [24.030, 49.842], // Lemberg
      [25.310, 49.860], // Solotschiw
      [25.610, 49.553], // Tarnopol
      [26.430, 49.910], // Schepetiwka
      [27.530, 49.430], // Chmelnyzkyj / Proskurow
      [28.480, 49.233], // Winnyzja
    ],
  },

  // ---------- REICHS-WEST-ANSCHLUSS ----------
  {
    id: 'berlin-hannover',
    name: 'Berlin – Magdeburg – Hannover',
    importance: 'secondary',
    notes:
      'Westliches Reichs-Rückgrat; verband Ruhr-Rüstungsraum mit der Ostfront-Logistik über Berlin.',
    coordinates: [
      [13.405, 52.520], // Berlin
      [12.470, 52.410], // Brandenburg/Havel
      [11.630, 52.130], // Magdeburg
      [11.030, 52.270], // Helmstedt
      [10.520, 52.270], // Braunschweig
      [9.732, 52.375],  // Hannover
    ],
  },
]
