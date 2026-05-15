/**
 * Großschlachten der Ostfront mit Detailangaben.
 * Quellen: Wikipedia, Glantz/House "When Titans Clashed", Frieser et al.
 * Verlustzahlen variieren stark zwischen Quellen — hier mittlere Werte.
 */

export interface Force {
  side: 'axis' | 'soviet'
  commander?: string
  troops?: string
  units?: string[]
  tanks?: string
  aircraft?: string
  casualties?: string
}

export interface Battle {
  id: string
  name: string
  start: string // ISO
  end: string // ISO
  coordinates: [number, number] // [lon, lat]
  /** Wenn true, wird ein dickerer Marker mit Pulse-Effekt angezeigt */
  major: boolean
  summary: string
  forces: Force[]
  outcome: string
  notableUnits?: string[]
  /**
   * de.wikipedia.org-URL-Slug (mit Unterstrichen), z.B. 'Schlacht_von_Stalingrad'.
   * Triggert im Detail-Panel das Nachladen von Lead-Text und Hauptbild.
   */
  wikipediaSlug?: string
}

export const BATTLES: Battle[] = [
  {
    id: 'brest',
    wikipediaSlug: 'Brester_Festung',
    name: 'Verteidigung der Festung Brest',
    start: '1941-06-22',
    end: '1941-07-30',
    coordinates: [23.7, 52.1],
    major: false,
    summary:
      'Die Festung wurde am ersten Tag von Barbarossa angegriffen. Trotz hoffnungsloser Lage hielten Reste der Garnison bis Ende Juli durch.',
    forces: [
      {
        side: 'axis',
        commander: 'Fritz Schlieper',
        troops: '~17.000',
        units: ['45. Infanterie-Division', 'XII. Armeekorps'],
        casualties: '~1.000 gefallen, ~2.500 verwundet',
      },
      {
        side: 'soviet',
        troops: '~9.000',
        units: ['6. Schützen-Division', '42. Schützen-Division', 'NKWD-Grenztruppen'],
        casualties: 'fast vollständig vernichtet, ~6.800 Gefangene',
      },
    ],
    outcome: 'Axis-Sieg, aber starker symbolischer Widerstand',
  },
  {
    id: 'smolensk-1941',
    wikipediaSlug: 'Kesselschlacht_bei_Smolensk',
    name: 'Schlacht von Smolensk',
    start: '1941-07-10',
    end: '1941-09-10',
    coordinates: [32.05, 54.78],
    major: true,
    summary:
      'Erste große Kesselschlacht der Heeresgruppe Mitte. Verzögerte den Vormarsch auf Moskau und führte zu erheblichen deutschen Verlusten — erste strategische Krise des Ostfeldzugs.',
    forces: [
      {
        side: 'axis',
        commander: 'Fedor von Bock',
        troops: '~430.000',
        units: ['2. Panzergruppe (Guderian)', '3. Panzergruppe (Hoth)', '9. Armee', '2. Armee'],
        tanks: '~1.040',
        casualties: '~100.000 (gefallen, verwundet, vermisst)',
      },
      {
        side: 'soviet',
        commander: 'Semjon Timoschenko',
        troops: '~580.000',
        units: ['Westfront', '16. Armee', '19. Armee', '20. Armee', '22. Armee'],
        tanks: '~1.250',
        casualties: '~480.000 (davon ~300.000 Gefangene)',
      },
    ],
    outcome: 'Operativer deutscher Sieg, strategisch teuer erkauft',
  },
  {
    id: 'kiev-1941',
    wikipediaSlug: 'Schlacht_um_Kiew_(1941)',
    name: 'Kiewer Kesselschlacht',
    start: '1941-08-23',
    end: '1941-09-26',
    coordinates: [30.5, 50.45],
    major: true,
    summary:
      'Größte Einkesselung der Militärgeschichte. Die gesamte sowjetische Südwestfront wurde vernichtet — ein operativer Triumph mit langfristig negativen Folgen für den Vormarsch auf Moskau.',
    forces: [
      {
        side: 'axis',
        commander: 'Gerd von Rundstedt',
        troops: '~500.000',
        units: ['1. Panzergruppe (Kleist)', '2. Panzergruppe (Guderian)', '6. Armee', '17. Armee'],
        casualties: '~45.000',
      },
      {
        side: 'soviet',
        commander: 'Michail Kirponos †',
        troops: '~627.000',
        units: ['5. Armee', '21. Armee', '26. Armee', '37. Armee', '38. Armee', '40. Armee'],
        casualties: '~700.000 (davon ~660.000 Gefangene) — größte Einkesselung der Geschichte',
      },
    ],
    outcome: 'Vernichtender deutscher Sieg',
  },
  {
    id: 'leningrad-siege',
    wikipediaSlug: 'Leningrader_Blockade',
    name: 'Belagerung Leningrads',
    start: '1941-09-08',
    end: '1944-01-27',
    coordinates: [30.31, 59.94],
    major: true,
    summary:
      '872 Tage Blockade — eine der längsten und verlustreichsten Belagerungen der Geschichte. Allein durch Hunger und Beschuss starben über eine Million Zivilisten.',
    forces: [
      {
        side: 'axis',
        commander: 'Wilhelm Ritter von Leeb / Georg von Küchler',
        troops: '~725.000 (Höchststand)',
        units: ['Heeresgruppe Nord', '18. Armee', '16. Armee', 'Finnische Karelische Armee'],
        casualties: '~580.000',
      },
      {
        side: 'soviet',
        commander: 'Markian Popow / Leonid Goworow',
        troops: '~930.000 + Stadtbevölkerung',
        units: ['Leningrader Front', 'Wolchow-Front', 'Baltische Flotte', 'Ladoga-Flottille'],
        casualties: '~1.000.000+ militärisch, ~1.000.000 Zivilisten',
      },
    ],
    outcome: 'Sowjetischer Sieg nach 872 Tagen',
  },
  {
    id: 'moscow-1941',
    wikipediaSlug: 'Schlacht_um_Moskau',
    name: 'Schlacht um Moskau',
    start: '1941-09-30',
    end: '1942-01-07',
    coordinates: [37.62, 55.75],
    major: true,
    summary:
      'Erste strategische Niederlage der Wehrmacht. Die deutsche Offensive (Unternehmen Taifun) erreichte die Moskauer Vororte, scheiterte aber an Wetter, Erschöpfung und sibirischen Reserven.',
    forces: [
      {
        side: 'axis',
        commander: 'Fedor von Bock',
        troops: '~1.000.000',
        units: ['Heeresgruppe Mitte', '2., 4., 9. Armee', '2., 3., 4. Panzergruppe'],
        tanks: '~1.700',
        casualties: '~250.000 (davon ~80.000 gefallen) + Erfrierungen',
      },
      {
        side: 'soviet',
        commander: 'Georgi Schukow',
        troops: '~1.250.000',
        units: ['Westfront', 'Kalininer Front', 'Südwestfront (Teile)'],
        tanks: '~1.000',
        casualties: '~650.000+',
      },
    ],
    outcome: 'Sowjetischer Sieg — erste strategische Niederlage der Wehrmacht',
  },
  {
    id: 'rzhev',
    wikipediaSlug: 'Schlacht_von_Rschew',
    name: 'Schlachten von Rschew',
    start: '1942-01-08',
    end: '1943-03-31',
    coordinates: [34.33, 56.26],
    major: false,
    summary:
      'Eine Reihe extrem verlustreicher sowjetischer Offensiven gegen den Rschew-Bogen. Lange aus der sowjetischen Geschichtsschreibung verdrängt ("Marsfleischwolf").',
    forces: [
      {
        side: 'axis',
        commander: 'Walter Model',
        units: ['9. Armee', 'Heeresgruppe Mitte'],
        casualties: '~330.000',
      },
      {
        side: 'soviet',
        commander: 'Georgi Schukow / Iwan Konew',
        units: ['Westfront', 'Kalininer Front'],
        casualties: '~1.000.000+ (Schätzungen variieren stark)',
      },
    ],
    outcome: 'Taktisches Patt, deutsche Räumung des Bogens März 1943',
  },
  {
    id: 'stalingrad',
    wikipediaSlug: 'Schlacht_von_Stalingrad',
    name: 'Schlacht von Stalingrad',
    start: '1942-08-23',
    end: '1943-02-02',
    coordinates: [44.52, 48.7],
    major: true,
    summary:
      'Wendepunkt des Krieges. Die deutsche 6. Armee wurde durch Operation Uranus eingekesselt und vernichtet. Erste großräumige Kapitulation einer kompletten deutschen Armee.',
    forces: [
      {
        side: 'axis',
        commander: 'Friedrich Paulus',
        troops: '~1.040.000 (mit Verbündeten)',
        units: [
          '6. Armee',
          '4. Panzerarmee',
          'Rumänische 3. & 4. Armee',
          'Italienische 8. Armee',
          'Ungarische 2. Armee',
        ],
        tanks: '~500',
        casualties: '~800.000 (~150.000 gefallen, ~91.000 Gefangene aus Kessel)',
      },
      {
        side: 'soviet',
        commander: 'Andrej Jerjomenko / Konstantin Rokossowski / Nikolai Watutin',
        troops: '~1.140.000',
        units: ['Stalingrader Front', 'Don-Front', 'Südwestfront', '62. Armee (Tschuikow)'],
        tanks: '~890',
        casualties: '~1.130.000 (~480.000 gefallen)',
      },
    ],
    outcome: 'Vernichtender sowjetischer Sieg — strategischer Wendepunkt',
    notableUnits: ['62. Armee (Tschuikow) — Häuserkampf', '13. Garde-Schützen-Division (Rodimzew)'],
  },
  {
    id: 'kursk',
    wikipediaSlug: 'Unternehmen_Zitadelle',
    name: 'Schlacht bei Kursk',
    start: '1943-07-05',
    end: '1943-08-23',
    coordinates: [36.19, 51.73],
    major: true,
    summary:
      'Größte Panzerschlacht der Geschichte. Letzte deutsche Großoffensive im Osten (Unternehmen Zitadelle) scheiterte. Danach behielt die Rote Armee dauerhaft die strategische Initiative.',
    forces: [
      {
        side: 'axis',
        commander: 'Erich von Manstein / Walter Model',
        troops: '~780.000',
        units: ['9. Armee', '4. Panzerarmee', 'Armeeabteilung Kempf'],
        tanks: '~2.900',
        aircraft: '~2.100',
        casualties: '~200.000 (~50.000 gefallen)',
      },
      {
        side: 'soviet',
        commander: 'Konstantin Rokossowski / Nikolai Watutin / Iwan Konew',
        troops: '~1.910.000',
        units: ['Zentralfront', 'Woronescher Front', 'Steppenfront (Reserve)'],
        tanks: '~5.100',
        aircraft: '~2.800',
        casualties: '~860.000',
      },
    ],
    outcome: 'Strategischer sowjetischer Sieg',
    notableUnits: ['SS-Panzerkorps (Hausser)', '5. Garde-Panzerarmee (Rotmistrow) — Prochorowka'],
  },
  {
    id: 'bagration',
    wikipediaSlug: 'Operation_Bagration',
    name: 'Operation Bagration',
    start: '1944-06-22',
    end: '1944-08-19',
    coordinates: [27.55, 53.9],
    major: true,
    summary:
      'Die wohl größte Niederlage der Wehrmacht. Auf den Tag genau drei Jahre nach Barbarossa zerschlug die Rote Armee die Heeresgruppe Mitte und stieß bis Warschau vor.',
    forces: [
      {
        side: 'axis',
        commander: 'Ernst Busch / Walter Model',
        troops: '~800.000',
        units: ['Heeresgruppe Mitte', '3. Panzerarmee', '4., 9. Armee', '2. Armee'],
        tanks: '~550',
        casualties: '~450.000 (~150.000 gefallen, ~160.000 Gefangene)',
      },
      {
        side: 'soviet',
        commander: 'Konstantin Rokossowski / Iwan Bagramjan / Georgi Sacharow',
        troops: '~1.700.000',
        units: ['1., 2., 3. Belorussische Front', '1. Baltische Front'],
        tanks: '~4.000',
        aircraft: '~6.300',
        casualties: '~765.000',
      },
    ],
    outcome: 'Strategischer sowjetischer Sieg — Heeresgruppe Mitte vernichtet',
  },
  {
    id: 'vistula-oder',
    wikipediaSlug: 'Weichsel-Oder-Operation',
    name: 'Weichsel-Oder-Operation',
    start: '1945-01-12',
    end: '1945-02-02',
    coordinates: [19.0, 51.5],
    major: true,
    summary:
      'Sowjetische Großoffensive durchstößt die deutsche Front auf 1.000 km Breite. In nur drei Wochen Vorstoß von der Weichsel bis 60 km vor Berlin.',
    forces: [
      {
        side: 'axis',
        commander: 'Josef Harpe / Ferdinand Schörner',
        troops: '~450.000',
        units: ['Heeresgruppe A (später Mitte)', '9. Armee', '4. Panzerarmee', '17. Armee'],
        tanks: '~1.150',
        casualties: '~295.000',
      },
      {
        side: 'soviet',
        commander: 'Georgi Schukow / Iwan Konew',
        troops: '~2.200.000',
        units: ['1. Belorussische Front', '1. Ukrainische Front'],
        tanks: '~4.500',
        casualties: '~190.000',
      },
    ],
    outcome: 'Vernichtender sowjetischer Sieg',
  },
  {
    id: 'uman',
    wikipediaSlug: 'Kesselschlacht_von_Uman',
    name: 'Schlacht um Uman',
    start: '1941-07-15',
    end: '1941-08-08',
    coordinates: [30.2167, 48.75],
    major: false,
    summary:
      'Die zweitgrößte Kesselschlacht des Sommers 1941: Verbände der deutschen Heeresgruppe Süd schlossen Teile der sowjetischen 6. und 12. Armee südwestlich von Kiew ein. Über 100.000 Rotarmisten gerieten in Gefangenschaft, darunter beide Armeeoberbefehlshaber, womit der Weg für den nachfolgenden Kessel von Kiew freigemacht wurde.',
    forces: [
      {
        side: 'axis',
        commander: 'Gerd von Rundstedt',
        troops: '~400.000',
        units: [
          'Heeresgruppe Süd',
          '1. Panzergruppe (von Kleist)',
          '17. Armee (Stülpnagel)',
          'Ungarisches Schnelles Korps',
        ],
        tanks: '~600',
        casualties: '~20.000 gefallen und verwundet',
      },
      {
        side: 'soviet',
        commander: 'Semjon Budjonny / Iwan Tjulenew',
        troops: '~300.000',
        units: [
          'Südwestfront (Kirponos)',
          'Südfront (Tjulenew)',
          '6. Armee (Musytschenko)',
          '12. Armee (Ponedelin)',
        ],
        tanks: '~300',
        casualties: '~103.000 Gefangene, ~100.000 gefallen oder verwundet',
      },
    ],
    outcome:
      'Vollständiger deutscher Erfolg; Zerschlagung zweier sowjetischer Armeen und Öffnung der rechten Flanke für den Vorstoß auf Kiew.',
  },
  {
    id: 'wjasma-brjansk',
    wikipediaSlug: 'Doppelschlacht_bei_Wjasma_und_Brjansk',
    name: 'Doppelschlacht von Wjasma und Brjansk',
    start: '1941-09-30',
    end: '1941-10-20',
    coordinates: [34.2964, 55.2089],
    major: true,
    summary:
      'Auftaktschlacht des Unternehmens Taifun: Die deutsche Heeresgruppe Mitte umschloss in zwei riesigen Kesseln drei sowjetische Fronten westlich von Moskau. Mit über einer halben Million Gefangener gilt sie als eine der größten militärischen Katastrophen der Roten Armee und öffnete kurzzeitig den Weg zur sowjetischen Hauptstadt.',
    forces: [
      {
        side: 'axis',
        commander: 'Fedor von Bock',
        troops: '~1.900.000',
        units: [
          'Heeresgruppe Mitte',
          '2. Armee (Weichs)',
          '4. Armee (Kluge)',
          '9. Armee (Strauß)',
          '2. Panzergruppe (Guderian)',
          '3. Panzergruppe (Hoth)',
          '4. Panzergruppe (Hoepner)',
        ],
        tanks: '~1.700',
        aircraft: '~1.000',
        casualties: '~50.000 gefallen und verwundet',
      },
      {
        side: 'soviet',
        commander: 'Iwan Konew / Semjon Budjonny / Andrei Jerjomenko',
        troops: '~1.250.000',
        units: [
          'Westfront (Konew)',
          'Reservefront (Budjonny)',
          'Brjansker Front (Jerjomenko)',
        ],
        tanks: '~1.000',
        casualties: '~514.000–673.000 Gefangene, ~1.242 Panzer und 5.412 Geschütze verloren',
      },
    ],
    outcome:
      'Vernichtender deutscher Sieg; größte Einkesselung des Krieges nach Gefangenenzahlen, doch der Sieg verzögerte den Vorstoß auf Moskau bis zum Wintereinbruch.',
  },
  {
    id: 'sevastopol-42',
    wikipediaSlug: 'Schlacht_um_Sewastopol_1941–1942',
    name: 'Belagerung von Sewastopol',
    start: '1941-10-30',
    end: '1942-07-04',
    coordinates: [33.5225, 44.6166],
    major: true,
    summary:
      'Über acht Monate belagerte Mansteins 11. Armee die sowjetische Hauptbasis der Schwarzmeerflotte mit dem schwersten Artillerieaufgebot des Krieges, einschließlich des 800-mm-Geschützes „Dora". Der Fall der Festung im Juli 1942 sicherte die deutsche Südflanke für den Vorstoß zum Kaukasus und brachte Manstein den Generalfeldmarschallrang ein.',
    forces: [
      {
        side: 'axis',
        commander: 'Erich von Manstein',
        troops: '~203.000',
        units: [
          '11. Armee',
          'XXX. Armeekorps',
          'LIV. Armeekorps',
          'Rumänisches Gebirgskorps',
          'Luftflotte 4 (von Richthofen)',
        ],
        aircraft: '~600',
        casualties: '~75.000 gefallen, verwundet und vermisst (davon ~8.500 Rumänen)',
      },
      {
        side: 'soviet',
        commander: 'Iwan Petrow / Filipp Oktjabrski',
        troops: '~106.000',
        units: [
          'Selbständige Küstenarmee',
          'Schwarzmeerflotte',
          'Sewastopoler Verteidigungsbezirk',
        ],
        casualties: '~156.800 gefallen und gefangen, ~53.600 verwundet',
      },
    ],
    outcome:
      'Deutscher Sieg nach erbittertem Festungskampf; Eroberung der Krim und Vernichtung der sowjetischen Küstenarmee.',
    notableUnits: ['Schwerstes Belagerungsgeschütz „Dora" (80 cm)', 'Karl-Mörser'],
  },
  {
    id: 'demyansk',
    wikipediaSlug: 'Kesselschlacht_von_Demjansk',
    name: 'Kesselschlacht von Demjansk',
    start: '1942-02-08',
    end: '1942-04-21',
    coordinates: [32.4647, 57.6486],
    major: false,
    summary:
      'Sowjetische Truppen der Nordwestfront schlossen im Februar 1942 sechs Divisionen des II. Armeekorps im Raum Demjansk ein. Die erste großmaßstäbliche Luftbrückenversorgung der Wehrmacht hielt den Kessel zweieinhalb Monate am Leben — ein Erfolg, der Hitler in der Folge zur fatalen Fehleinschätzung in Stalingrad verleitete.',
    forces: [
      {
        side: 'axis',
        commander: 'Ernst Busch / Walter Graf von Brockdorff-Ahlefeldt',
        troops: '~100.000',
        units: [
          '16. Armee',
          'II. Armeekorps',
          '3. SS-Division „Totenkopf"',
          'Luftflotte 1',
        ],
        aircraft: '~500 Transportflugzeuge',
        casualties: '~3.300 gefallen, ~10.000 verwundet; 265 Flugzeuge verloren',
      },
      {
        side: 'soviet',
        commander: 'Pawel Kurotschkin',
        troops: '~400.000',
        units: ['Nordwestfront', '11. Armee', '34. Armee', '1. Stoßarmee'],
        casualties: '~89.000 gefallen und vermisst, ~157.000 verwundet',
      },
    ],
    outcome:
      'Taktischer deutscher Erfolg durch Luftversorgung und Entsatzangriff; die Erfahrung wurde von Hitler später irrtümlich auf Stalingrad übertragen.',
  },
  {
    id: 'kharkov-2',
    wikipediaSlug: 'Schlacht_bei_Charkow_(1942)',
    name: 'Zweite Schlacht um Charkow',
    start: '1942-05-12',
    end: '1942-05-28',
    coordinates: [36.2304, 49.9935],
    major: true,
    summary:
      'Marschall Timoschenkos Mai-Offensive aus dem Brückenkopf Isjum endete in einer Katastrophe, als Bocks Heeresgruppe Süd mit Unternehmen Fridericus die sowjetischen Spitzen einkesselte. Mit rund 240.000 Gefangenen war es eine der schwersten Niederlagen der Roten Armee 1942 und ebnete den Weg für Fall Blau und Stalingrad.',
    forces: [
      {
        side: 'axis',
        commander: 'Fedor von Bock / Friedrich Paulus',
        troops: '~350.000',
        units: [
          'Heeresgruppe Süd',
          '6. Armee (Paulus)',
          '1. Panzerarmee (von Kleist)',
          '17. Armee (Hoth)',
        ],
        tanks: '~400',
        casualties: '~20.000 gefallen, verwundet und vermisst',
      },
      {
        side: 'soviet',
        commander: 'Semjon Timoschenko',
        troops: '~765.000',
        units: [
          'Südwestfront',
          'Südfront',
          '6. Armee',
          '9. Armee',
          '57. Armee',
          '28. Armee',
        ],
        tanks: '~1.200',
        aircraft: '~900',
        casualties: '~170.000 gefallen und vermisst, ~106.000 verwundet, ~239.000 Gefangene',
      },
    ],
    outcome:
      'Vernichtender deutscher Gegenschlag; sowjetische Sommerverteidigung im Süden zerschlagen, strategische Voraussetzung für Fall Blau geschaffen.',
  },
  {
    id: 'caucasus',
    wikipediaSlug: 'Schlacht_um_den_Kaukasus',
    name: 'Schlacht um den Kaukasus',
    start: '1942-07-25',
    end: '1943-10-09',
    coordinates: [42.9849, 43.9667],
    major: true,
    summary:
      'Im Rahmen des Falls Blau stieß die Heeresgruppe A in den Kaukasus vor, um die Ölfelder von Maikop, Grosny und Baku zu erreichen. Nach Anfangserfolgen verbiss sich die Offensive im Hochgebirge; nach der Niederlage bei Stalingrad mussten die deutschen Truppen den Kaukasus räumen, was den endgültigen Wendepunkt im Süden markierte.',
    forces: [
      {
        side: 'axis',
        commander: 'Wilhelm List / Ewald von Kleist',
        troops: '~170.000 (im Anfangsstadium)',
        units: [
          'Heeresgruppe A',
          '1. Panzerarmee (von Kleist)',
          '17. Armee (Ruoff)',
          '3. Rumänische Armee',
          'Luftflotte 4',
        ],
        tanks: '~1.130',
        casualties: '~280.000 gefallen, verwundet und vermisst',
      },
      {
        side: 'soviet',
        commander: 'Iwan Tjulenew / Iwan Petrow',
        troops: '~1.000.000 (Gesamtverlauf)',
        units: [
          'Transkaukasusfront',
          'Nordkaukasusfront',
          '37. Armee',
          '46. Armee',
          '47. Armee',
          'Schwarzmeergruppe',
        ],
        casualties: '~344.000 unwiederbringliche Verluste, ~605.000 Verwundete',
      },
    ],
    outcome:
      'Strategische sowjetische Verteidigungserfolg; die deutsche Ölofflensive scheiterte am Hauptkamm, der Rückzug rettete die 1. Panzerarmee vor der Einkesselung im Februar 1943.',
    notableUnits: ['Gebirgsjäger der 1. und 4. Gebirgs-Division (Flagge auf dem Elbrus)'],
  },
  {
    id: 'kharkov-3',
    wikipediaSlug: 'Schlacht_bei_Charkow_(1943)',
    name: 'Dritte Schlacht um Charkow',
    start: '1943-02-19',
    end: '1943-03-15',
    coordinates: [36.2304, 49.9935],
    major: true,
    summary:
      'Mansteins „Schlag aus der Nachhand" wendete die Lage nach Stalingrad: Die Heeresgruppe Süd schlug die überdehnten sowjetischen Spitzenverbände der Operation „Stern" vernichtend und eroberte Charkow zurück. Es war der letzte große operative Erfolg der Wehrmacht im Osten und stabilisierte die Front bis zum Kursker Bogen.',
    forces: [
      {
        side: 'axis',
        commander: 'Erich von Manstein',
        troops: '~350.000',
        units: [
          'Heeresgruppe Süd',
          '4. Panzerarmee (Hoth)',
          'Armeeabteilung Kempf',
          'SS-Panzerkorps (Hausser)',
          'Großdeutschland-Division',
        ],
        tanks: '~400',
        casualties: '~11.500 gefallen und verwundet',
      },
      {
        side: 'soviet',
        commander: 'Nikolai Watutin / Filipp Golikow',
        troops: '~500.000',
        units: [
          'Südwestfront (Watutin)',
          'Woronescher Front (Golikow)',
          '3. Panzerarmee',
          '6. Armee',
          '69. Armee',
          'Gruppe Popow',
        ],
        tanks: '~600',
        casualties: '~45.000 gefallen, ~41.000 verwundet, hohe Materialverluste',
      },
    ],
    outcome:
      'Operativer deutscher Sieg; Rückgewinn Charkows und Belgorods, Stabilisierung der Südfront und Schaffung des Kursker Frontbogens.',
    notableUnits: ['SS-Panzerkorps (Leibstandarte, Das Reich, Totenkopf)'],
  },
  {
    id: 'korsun',
    wikipediaSlug: 'Kesselschlacht_von_Tscherkassy',
    name: 'Kesselschlacht von Tscherkassy (Korsun)',
    start: '1944-01-24',
    end: '1944-02-17',
    coordinates: [31.2667, 49.4167],
    major: false,
    summary:
      'Die 1. und 2. Ukrainische Front unter Watutin und Konew schlossen am Dnjepr zwei deutsche Korps mit rund 60.000 Mann ein. Beim Ausbruch zur Heeresgruppe Süd am 16. Februar gingen schweres Gerät und die Hälfte der Eingeschlossenen verloren — ein „kleines Stalingrad" im Mittelteil der Ostfront.',
    forces: [
      {
        side: 'axis',
        commander: 'Erich von Manstein / Wilhelm Stemmermann',
        troops: '~60.000 (im Kessel)',
        units: [
          'Heeresgruppe Süd',
          '8. Armee (Wöhler)',
          'XI. Armeekorps',
          'XXXXII. Armeekorps',
          'SS-Division „Wiking"',
        ],
        tanks: '~120',
        casualties:
          '~19.000 gefallen oder gefangen, ~11.000 Verwundete ausgeflogen, fast gesamte schwere Bewaffnung',
      },
      {
        side: 'soviet',
        commander: 'Nikolai Watutin / Iwan Konew',
        troops: '~336.000',
        units: [
          '1. Ukrainische Front (Watutin)',
          '2. Ukrainische Front (Konew)',
          '5. Garde-Panzerarmee (Rotmistrow)',
          '6. Panzerarmee (Krawtschenko)',
        ],
        tanks: '~500',
        casualties: '~24.000 gefallen und vermisst, ~56.000 verwundet',
      },
    ],
    outcome:
      'Sowjetischer Sieg; trotz Ausbruch verlor die Heeresgruppe Süd zwei Korps als Kampfverbände und musste auf den Südlichen Bug zurückweichen.',
  },
  {
    id: 'crimea-44',
    wikipediaSlug: 'Schlacht_um_die_Krim',
    name: 'Krim-Offensive 1944',
    start: '1944-04-08',
    end: '1944-05-12',
    coordinates: [34.1, 45.0],
    major: false,
    summary:
      'Tolbuchins 4. Ukrainische Front und Jerjomenkos Selbständige Küstenarmee zerschlugen in nur fünf Wochen die im Herbst 1943 abgeschnittene deutsche 17. Armee auf der Krim. Sewastopol fiel nach 250 Tagen Belagerung 1941–42 nun binnen weniger Tage — ein bezeichnender Rollentausch.',
    forces: [
      {
        side: 'axis',
        commander: 'Erwin Jaenecke / Karl Allmendinger',
        troops: '~230.000',
        units: [
          '17. Armee',
          'V. Armeekorps',
          'XXXXIX. Gebirgskorps',
          'Rumänisches Kavalleriekorps',
        ],
        tanks: '~215',
        casualties:
          '~57.500 deutsche und ~31.600 rumänische Verluste; Verlust des Großteils der schweren Waffen',
      },
      {
        side: 'soviet',
        commander: 'Fjodor Tolbuchin / Andrei Jerjomenko',
        troops: '~462.000',
        units: [
          '4. Ukrainische Front (Tolbuchin)',
          '51. Armee',
          '2. Gardearmee',
          'Selbständige Küstenarmee',
          'Schwarzmeerflotte',
        ],
        tanks: '~560',
        aircraft: '~1.200',
        casualties: '~17.800 gefallen und vermisst, ~67.000 verwundet',
      },
    ],
    outcome:
      'Vollständiger sowjetischer Erfolg; Rückeroberung der Krim, Vernichtung der 17. Armee und schwerer Prestigeverlust für Hitlers Festungsstrategie.',
  },
  {
    id: 'lwow-sandomierz',
    wikipediaSlug: 'Lwiw-Sandomierz-Operation',
    name: 'Lwiw-Sandomierz-Operation',
    start: '1944-07-13',
    end: '1944-08-29',
    coordinates: [24.0316, 49.8419],
    major: false,
    summary:
      'Parallel zu Bagration entfesselte Konews 1. Ukrainische Front einen vernichtenden Schlag gegen die Heeresgruppe Nordukraine. Die Operation umschloss bei Brody acht Divisionen, befreite Lemberg und erreichte die Weichsel, wo der Brückenkopf von Sandomierz/Baranów für das Wintervorgehen 1945 entstand.',
    forces: [
      {
        side: 'axis',
        commander: 'Josef Harpe / Walter Nehring',
        troops: '~400.000',
        units: [
          'Heeresgruppe Nordukraine',
          '1. Panzerarmee (Raus)',
          '4. Panzerarmee (Balck)',
          'XIII. Armeekorps (bei Brody)',
          '14. Waffen-Grenadier-Division der SS (Galizien)',
        ],
        tanks: '~420',
        casualties:
          '~140.000 gefallen, ~32.000 Gefangene, ~1.900 Panzer und 690 Flugzeuge verloren',
      },
      {
        side: 'soviet',
        commander: 'Iwan Konew',
        troops: '~1.002.000',
        units: [
          '1. Ukrainische Front',
          '3. Garde-Panzerarmee (Rybalko)',
          '4. Panzerarmee (Lelluschenko)',
          '38. Armee',
          '60. Armee',
        ],
        tanks: '~2.050',
        casualties: '~65.000 gefallen, ~225.000 verwundet',
      },
    ],
    outcome:
      'Strategischer sowjetischer Erfolg; Befreiung Galiziens, Vernichtung der Brody-Gruppe und Bildung des Sandomierz-Brückenkopfs als Sprungbrett für die Weichsel-Oder-Operation.',
  },
  {
    id: 'jassy-kishinev',
    wikipediaSlug: 'Operation_Jassy-Kischinew',
    name: 'Jassy-Kischinjow-Operation',
    start: '1944-08-20',
    end: '1944-08-29',
    coordinates: [27.6014, 47.1585],
    major: true,
    summary:
      'Eine der erfolgreichsten Operationen der Roten Armee überhaupt: In nur neun Tagen zerschlugen Malinowski und Tolbuchin die Heeresgruppe Südukraine, die deutsche 6. Armee wurde zum zweiten Mal vernichtet. Die Operation löste den Staatsstreich König Michaels aus, Rumänien wechselte die Seiten und der Weg auf den Balkan war offen.',
    forces: [
      {
        side: 'axis',
        commander: 'Johannes Frießner / Petre Dumitrescu',
        troops: '~900.000',
        units: [
          'Heeresgruppe Südukraine',
          '6. Armee (Fretter-Pico)',
          '8. Armee (Wöhler)',
          '3. Rumänische Armee',
          '4. Rumänische Armee',
        ],
        tanks: '~400',
        casualties:
          '~150.000 gefallen, ~106.000 deutsche Gefangene, fast die gesamte 6. Armee vernichtet',
      },
      {
        side: 'soviet',
        commander: 'Rodion Malinowski / Fjodor Tolbuchin',
        troops: '~1.314.000',
        units: [
          '2. Ukrainische Front (Malinowski)',
          '3. Ukrainische Front (Tolbuchin)',
          '6. Panzerarmee',
          '27. Armee',
          '37. Armee',
        ],
        tanks: '~1.874',
        aircraft: '~2.200',
        casualties: '~13.000 gefallen, ~54.000 verwundet',
      },
    ],
    outcome:
      'Vernichtender sowjetischer Sieg; Bruch der gesamten Südflanke, Rumäniens Frontwechsel, Verlust der Ploiești-Ölfelder und Öffnung des Balkans und Ungarns.',
  },
  {
    id: 'budapest',
    wikipediaSlug: 'Schlacht_um_Budapest',
    name: 'Belagerung von Budapest',
    start: '1944-12-26',
    end: '1945-02-13',
    coordinates: [19.0402, 47.4979],
    major: true,
    summary:
      'Nach der Einschließung am 26. Dezember 1944 hielt sich die deutsch-ungarische Garnison fast sieben Wochen lang gegen die 2. und 3. Ukrainische Front. Hitlers Verbot der Räumung und drei gescheiterte Entsatzangriffe machten Budapest zum „Stalingrad an der Donau"; die Stadt fiel am 13. Februar 1945 mit der Gefangennahme der gesamten Verteidiger.',
    forces: [
      {
        side: 'axis',
        commander: 'Karl Pfeffer-Wildenbruch / Iván Hindy',
        troops: '~79.000 (Garnison)',
        units: [
          'IX. SS-Gebirgskorps',
          '8. SS-Kavalleriedivision „Florian Geyer"',
          '22. SS-Kavalleriedivision „Maria Theresia"',
          '13. Panzerdivision',
          'Panzergrenadierdivision „Feldherrnhalle"',
          '1. ungarische Panzerdivision',
        ],
        tanks: '~70 (in der Garnison)',
        casualties:
          'Gesamte Garnison vernichtet oder gefangen; einschließlich Entsatzkämpfe ~140.000 Achsen-Verluste',
      },
      {
        side: 'soviet',
        commander: 'Rodion Malinowski / Fjodor Tolbuchin',
        troops: '~177.000 (Belagerer)',
        units: [
          '2. Ukrainische Front',
          '3. Ukrainische Front',
          '46. Armee',
          '7. Gardearmee',
          'Rumänische 1. Armee',
        ],
        tanks: '~200',
        casualties: '~100.000–160.000 gefallen und verwundet (sowjetisch und rumänisch)',
      },
    ],
    outcome:
      'Sowjetischer Sieg nach erbittertem Häuserkampf; etwa 38.000 Zivilisten kamen ums Leben, die ungarische Achsen-Armee zerschlagen.',
    notableUnits: ['SS-Kavalleriedivisionen „Florian Geyer" und „Maria Theresia"'],
  },
  {
    id: 'koenigsberg',
    wikipediaSlug: 'Ostpreußische_Operation_(1945)',
    name: 'Ostpreußische Operation und Schlacht um Königsberg',
    start: '1945-01-13',
    end: '1945-04-25',
    coordinates: [20.5111, 54.7104],
    major: true,
    summary:
      'Mit der größten sowjetischen Operation gegen einen einzelnen deutschen Heimatraum zerschlugen die 2. und 3. Weißrussische Front die Heeresgruppe Mitte/Nord in Ostpreußen. Die viertägige Erstürmung der Festung Königsberg im April 1945 endete mit der Kapitulation Otto Laschs; die Operation löste die größte Massenflucht der deutschen Geschichte aus.',
    forces: [
      {
        side: 'axis',
        commander: 'Georg-Hans Reinhardt / Otto Lasch',
        troops: '~580.000',
        units: [
          'Heeresgruppe Mitte/Nord',
          '3. Panzerarmee',
          '4. Armee',
          '2. Armee',
          'Festung Königsberg',
        ],
        tanks: '~700',
        casualties:
          '~500.000 gefallen, verwundet und gefangen; Königsberg: ~42.000 gefallen, ~92.000 Gefangene',
      },
      {
        side: 'soviet',
        commander: 'Iwan Tschernjachowski / Alexander Wassilewski',
        troops: '~1.670.000',
        units: [
          '3. Weißrussische Front (Tschernjachowski/Wassilewski)',
          '2. Weißrussische Front (Rokossowski)',
          '11. Gardearmee',
          '43. Armee',
          'Baltische Flotte',
        ],
        tanks: '~3.300',
        aircraft: '~3.000',
        casualties: '~126.000 gefallen, ~458.000 verwundet',
      },
    ],
    outcome:
      'Vollständiger sowjetischer Sieg; Ostpreußen abgeschnitten und erobert, Tod Tschernjachowskis im Februar, Königsberg umbenannt zu Kaliningrad.',
  },
  {
    id: 'spring-awakening',
    wikipediaSlug: 'Plattenseeoffensive',
    name: 'Plattenseeoffensive (Unternehmen Frühlingserwachen)',
    start: '1945-03-06',
    end: '1945-03-16',
    coordinates: [18.05, 46.85],
    major: false,
    summary:
      'Hitlers letzte strategische Offensive im Osten: Die 6. SS-Panzerarmee Dietrichs sollte beidseits des Plattensees die ungarischen Ölfelder bei Nagykanizsa sichern. Nach minimalen Anfangsgewinnen brachen die Spitzen in Schlamm und sowjetischen Pakfronten zusammen; die Waffen-SS verlor ihre operative Schlagkraft endgültig.',
    forces: [
      {
        side: 'axis',
        commander: 'Otto Wöhler / Sepp Dietrich',
        troops: '~430.000',
        units: [
          'Heeresgruppe Süd',
          '6. SS-Panzerarmee (Dietrich)',
          '6. Armee (Balck)',
          '2. Panzerarmee',
          '1. SS-Panzerdivision LSSAH',
          '12. SS-Panzerdivision „Hitlerjugend"',
        ],
        tanks: '~870',
        casualties:
          '~40.000 gefallen und verwundet, ~250 Panzer und Sturmgeschütze verloren',
      },
      {
        side: 'soviet',
        commander: 'Fjodor Tolbuchin',
        troops: '~465.000',
        units: [
          '3. Ukrainische Front',
          '4. Gardearmee',
          '26. Armee',
          '27. Armee',
          '57. Armee',
          'Bulgarische 1. Armee',
        ],
        tanks: '~400',
        casualties: '~33.000 gefallen und verwundet',
      },
    ],
    outcome:
      'Vernichtende deutsche Niederlage; die 6. SS-Panzerarmee als operative Reserve verbraucht, Weg nach Wien offen.',
    notableUnits: ['I. SS-Panzerkorps', 'II. SS-Panzerkorps'],
  },
  {
    id: 'berlin',
    wikipediaSlug: 'Schlacht_um_Berlin',
    name: 'Schlacht um Berlin',
    start: '1945-04-16',
    end: '1945-05-02',
    coordinates: [13.4, 52.52],
    major: true,
    summary:
      'Finale Großoffensive in Europa. Eroberung der Reichshauptstadt und Selbstmord Hitlers am 30. April. Faktisches Ende des Krieges im Osten.',
    forces: [
      {
        side: 'axis',
        commander: 'Gotthard Heinrici / Helmuth Weidling',
        troops: '~1.000.000',
        units: ['Heeresgruppe Weichsel', 'Heeresgruppe Mitte', '9. Armee', '4. Panzerarmee'],
        tanks: '~1.500',
        casualties: '~450.000 (~100.000 gefallen, ~480.000 Gefangene gesamt)',
      },
      {
        side: 'soviet',
        commander: 'Georgi Schukow / Iwan Konew / Konstantin Rokossowski',
        troops: '~2.500.000',
        units: [
          '1. Belorussische Front',
          '1. Ukrainische Front',
          '2. Belorussische Front',
          'Polnische 1. & 2. Armee',
        ],
        tanks: '~6.250',
        aircraft: '~7.500',
        casualties: '~360.000',
      },
    ],
    outcome: 'Sowjetischer Sieg, Kapitulation des Deutschen Reiches',
  },
]

export function activeBattlesAt(date: Date): Battle[] {
  const ts = date.getTime()
  return BATTLES.filter(
    (b) => new Date(b.start).getTime() <= ts && new Date(b.end).getTime() >= ts,
  )
}
