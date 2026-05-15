/**
 * Historische Ereignisse für den "An diesem Tag"-Feed.
 * Datenquelle: Wikipedia, Standardwerke, ergänzt zu den Schlachten in battles.ts.
 */

export type EventCategory =
  | 'politics'
  | 'diplomacy'
  | 'command'
  | 'technology'
  | 'partisan'
  | 'logistics'
  | 'symbolic'
  | 'milestone'

export interface HistEvent {
  id: string
  date: string
  title: string
  description: string
  category: EventCategory
  coordinates?: [number, number]
  relatedBattle?: string
}

export const EVENTS: HistEvent[] = [
  // ============ 1940 ============
  {
    id: 'directive-21-barbarossa',
    date: '1940-12-18',
    title: 'Hitler unterzeichnet Weisung Nr. 21 — Fall Barbarossa',
    description:
      'Hitler weist die Wehrmacht an, die Sowjetunion „in einem schnellen Feldzug niederzuwerfen". Die Vorbereitung soll bis 15. Mai 1941 abgeschlossen sein.',
    category: 'politics',
    coordinates: [13.405, 52.52],
  },

  // ============ 1941 ============
  {
    id: 'molotov-radio-1941',
    date: '1941-06-22',
    title: 'Molotow verkündet im Radio den deutschen Überfall',
    description:
      'Außenminister Molotow tritt mittags vors Mikrofon: „Unsere Sache ist gerecht, der Feind wird geschlagen werden, der Sieg wird unser sein." Stalin schweigt zunächst.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 't34-shock-1941',
    date: '1941-06-23',
    title: 'T-34 schockiert deutsche Panzertruppen',
    description:
      'Erste größere Begegnungsgefechte mit dem T-34 zeigen, dass Pak 35/36 und Panzer III ihm kaum gewachsen sind. Guderian fordert Gegenentwicklung — Vorläufer von Panther und Tiger.',
    category: 'technology',
    coordinates: [23.8345, 53.6884],
  },
  {
    id: 'stavka-formed-1941',
    date: '1941-06-23',
    title: 'Stawka des Hauptkommandos gebildet',
    description:
      'Die Sowjetunion gründet das oberste Hauptquartier der Streitkräfte unter Verteidigungskommissar Timoschenko. Sie wird zur zentralen Lenkungsinstanz aller Fronten.',
    category: 'milestone',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'evacuation-council-1941',
    date: '1941-06-24',
    title: 'Evakuierungsrat unter Kaganowitsch eingesetzt',
    description:
      'Zwei Tage nach dem Überfall beschließt das Politbüro die Verlagerung der Industrie hinter Wolga und Ural. Bis Dezember 1941 werden über 1.500 Rüstungsbetriebe und 12 Mio. Menschen ostwärts verlegt.',
    category: 'logistics',
    coordinates: [60.6122, 56.8389],
  },
  {
    id: 'gko-formed-1941',
    date: '1941-06-30',
    title: 'Staatliches Verteidigungskomitee (GKO) gegründet',
    description:
      'Stalin bündelt im fünfköpfigen GKO die gesamte zivile und militärische Macht. Bis Kriegsende ergehen über 9.000 Beschlüsse — die effektivste Kriegsführungsinstanz der UdSSR.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'stalin-speech-1941',
    date: '1941-07-03',
    title: 'Stalin: „Brüder und Schwestern!" — erste Kriegsrede',
    description:
      'Elf Tage nach dem Überfall spricht Stalin erstmals zur Nation, ruft zum „Vaterländischen Krieg" und zur Politik der verbrannten Erde auf.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'katyusha-debut-1941',
    date: '1941-07-14',
    title: 'Erster Einsatz der Katjuscha bei Orscha',
    description:
      'Die Batterie Hauptmann Fljorow feuert 112 Raketen auf den Bahnhof Orscha. Die deutsche Seite ist von der Flächenwirkung erschüttert — die „Stalin-Orgel" ist geboren.',
    category: 'technology',
    coordinates: [30.4258, 54.5081],
  },
  {
    id: 'atlantic-charter-1941',
    date: '1941-08-14',
    title: 'Roosevelt und Churchill verkünden die Atlantik-Charta',
    description:
      'Im Treffen vor Neufundland legen beide Regierungschefs Nachkriegsprinzipien fest. Indirekte politische Rückendeckung für die später verbündete Sowjetunion.',
    category: 'diplomacy',
    coordinates: [-53.9667, 47.25],
  },
  {
    id: 'order-270-1941',
    date: '1941-08-16',
    title: 'Stalin: Befehl Nr. 270 gegen Gefangennahme',
    description:
      'Wer sich ergibt, gilt als „böswilliger Deserteur"; Familien werden verhaftet. Die brutale Härte soll die Auflösung der Front nach Kesselschlachten stoppen.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'iran-corridor-1941',
    date: '1941-08-25',
    title: 'Britisch-sowjetische Besetzung Irans beginnt',
    description:
      'Operation Countenance öffnet den Persischen Korridor — bis Kriegsende werden hier rund 30 % aller Lend-Lease-Lieferungen an die UdSSR abgewickelt.',
    category: 'logistics',
    coordinates: [51.389, 35.6892],
  },
  {
    id: 'first-dervish-convoy-1941',
    date: '1941-08-31',
    title: 'Erster Arktis-Konvoi „Dervish" erreicht Archangelsk',
    description:
      'Sieben britische Frachter bringen Hurricane-Jäger, Wolle und Gummi. Beginn der Konvoi-Route nach Murmansk und Archangelsk, später unter Codes PQ/QP geführt.',
    category: 'logistics',
    coordinates: [40.5089, 64.54],
  },
  {
    id: 'zhukov-leningrad-1941',
    date: '1941-09-11',
    title: 'Schukow übernimmt die Leningrader Front',
    description:
      'Stalin schickt seinen besten Krisenkommandeur in die belagerte Stadt. Schukow ordnet sofortige Härte an und stabilisiert die Front bis Anfang Oktober.',
    category: 'command',
    coordinates: [30.3351, 59.9343],
    relatedBattle: 'leningrad-siege',
  },
  {
    id: 'lend-lease-protocol-1941',
    date: '1941-10-01',
    title: 'Erstes Moskauer Lend-Lease-Protokoll unterzeichnet',
    description:
      'Beaverbrook und Harriman einigen sich mit Stalin auf monatliche Lieferungen von Panzern, Flugzeugen und Material. Beginn einer der wirkungsmächtigsten Logistik-Operationen des Krieges.',
    category: 'logistics',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'state-of-siege-moscow-1941',
    date: '1941-10-19',
    title: 'Belagerungszustand über Moskau verhängt',
    description:
      'Panik in der Hauptstadt: Behörden evakuieren nach Kuibyschew, Stalin bleibt im Kreml. Plünderer werden vor Ort erschossen, die Front stabilisiert sich vor der Stadt.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
    relatedBattle: 'moscow-1941',
  },
  {
    id: 'red-square-parade-1941',
    date: '1941-11-07',
    title: 'Parade auf dem Roten Platz — Truppen marschieren direkt an die Front',
    description:
      'Trotz deutscher Truppen 80 km vor Moskau zelebriert Stalin den Jahrestag der Oktoberrevolution. Die Soldaten ziehen unmittelbar nach der Parade ins Gefecht.',
    category: 'symbolic',
    coordinates: [37.6213, 55.7539],
    relatedBattle: 'moscow-1941',
  },
  {
    id: 'us-lend-lease-soviet-1941',
    date: '1941-11-07',
    title: 'USA dehnen Lend-Lease offiziell auf die UdSSR aus',
    description:
      'Roosevelt unterzeichnet die Verfügung; die Sowjetunion erhält ein Kreditvolumen von zunächst einer Milliarde Dollar.',
    category: 'diplomacy',
    coordinates: [-77.0369, 38.9072],
  },
  {
    id: 'ice-road-ladoga-1941',
    date: '1941-11-22',
    title: 'Eis-Straße des Lebens über den Ladogasee eröffnet',
    description:
      'Die ersten LKW rollen über das gefrorene Wasser nach Leningrad. Bis April 1942 transportieren die Konvois rund 360.000 Tonnen Versorgungsgüter in die belagerte Stadt.',
    category: 'logistics',
    coordinates: [31.5, 60.0],
    relatedBattle: 'leningrad-siege',
  },
  {
    id: 'khimki-recon-1941',
    date: '1941-12-02',
    title: 'Deutsche Aufklärer erreichen Chimki vor Moskau',
    description:
      'Eine Stoßgruppe des XL. Panzerkorps dringt bis 8 km an die Stadtgrenze vor. Es bleibt der weiteste deutsche Vorstoß; tags darauf zwingen Frost und Nachschubmangel zum Halt.',
    category: 'symbolic',
    coordinates: [37.45, 55.8966],
    relatedBattle: 'moscow-1941',
  },
  {
    id: 'pearl-harbor-1941',
    date: '1941-12-07',
    title: 'Pearl Harbor — Japan greift die USA an',
    description:
      'Der Pazifikkrieg beginnt. Stalin kann nun sicher sein, dass Japan die Sowjetunion 1941/42 nicht angreift, und verlegt sibirische Divisionen nach Moskau.',
    category: 'diplomacy',
    coordinates: [-157.95, 21.35],
  },
  {
    id: 'germany-declares-war-usa-1941',
    date: '1941-12-11',
    title: 'Deutschland und Italien erklären den USA den Krieg',
    description:
      'Hitlers Reichstagsrede verbindet die europäischen und pazifischen Schauplätze. Lend-Lease an die UdSSR wird damit politisch konsolidiert.',
    category: 'politics',
    coordinates: [13.405, 52.52],
  },
  {
    id: 'hitler-takes-okh-1941',
    date: '1941-12-19',
    title: 'Hitler übernimmt persönlich das Oberkommando des Heeres',
    description:
      'Nach Brauchitschs Entlassung wird Hitler selbst Oberbefehlshaber des Heeres. Folge: zunehmend mikromanagende Eingriffe in Frontentscheidungen.',
    category: 'command',
    coordinates: [13.405, 52.52],
  },
  {
    id: 'guderian-dismissed-1941',
    date: '1941-12-26',
    title: 'Guderian wegen Rückzugs vor Moskau entlassen',
    description:
      'Der Panzerstratege wird auf Drängen Kluges von Hitler abgesetzt. Eine ganze Reihe weiterer Panzergeneräle folgt im „Winterkrise"-Säuberungsschub.',
    category: 'command',
    coordinates: [36.0833, 54.5333],
    relatedBattle: 'moscow-1941',
  },

  // ============ 1942 ============
  {
    id: 'un-declaration-1942',
    date: '1942-01-01',
    title: 'Erklärung der Vereinten Nationen unterzeichnet',
    description:
      '26 Staaten unter Führung der USA, UdSSR, Großbritannien und China verpflichten sich zum gemeinsamen Kampf bis zum Sieg. Politische Klammer der Anti-Hitler-Koalition.',
    category: 'diplomacy',
    coordinates: [-77.0369, 38.9072],
  },
  {
    id: 'lyuban-offensive-1942',
    date: '1942-01-07',
    title: 'Ljubaner Offensive zur Entsatzung Leningrads beginnt',
    description:
      'Die Wolchow-Front unter Merezkow startet die Großoffensive. Wlassows 2. Stoßarmee wird im Frühjahr eingekesselt, er selbst gerät später in Gefangenschaft.',
    category: 'milestone',
    coordinates: [31.2497, 59.3697],
    relatedBattle: 'leningrad-siege',
  },
  {
    id: 'speer-armaments-1942',
    date: '1942-02-08',
    title: 'Speer wird Rüstungsminister nach Todts Tod',
    description:
      'Albert Speer übernimmt nach dem Flugzeugabsturz Fritz Todts. In den Folgejahren steigert er die deutsche Rüstungsproduktion trotz Bombenkrieg auf Rekordniveau.',
    category: 'logistics',
    coordinates: [13.405, 52.52],
  },
  {
    id: 'vasilevsky-staff-1942',
    date: '1942-06-26',
    title: 'Wassilewski wird Generalstabschef der Roten Armee',
    description:
      'Schaposchnikow tritt krankheitsbedingt zurück. Wassilewski wird in den folgenden Jahren neben Schukow zum wichtigsten Stawka-Koordinator.',
    category: 'command',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'order-227-1942',
    date: '1942-07-28',
    title: 'Stalin: Befehl Nr. 227 — „Kein Schritt zurück!"',
    description:
      'Eingerichtet werden Strafbataillone und Sperrtruppen hinter der eigenen Front. Der Befehl markiert den moralischen Wendepunkt vor Stalingrad.',
    category: 'politics',
    coordinates: [37.6173, 55.7558],
    relatedBattle: 'stalingrad',
  },
  {
    id: 'churchill-moscow-1942',
    date: '1942-08-12',
    title: 'Churchill trifft Stalin erstmals in Moskau',
    description:
      'Erstes persönliches Treffen der beiden. Churchill erklärt, dass es 1942 keine zweite Front in Westeuropa geben wird — Stalin reagiert verbittert.',
    category: 'diplomacy',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'tiger-mga-debut-1942',
    date: '1942-09-16',
    title: 'Tiger I erstmals im Kampf — Mga südlich des Ladogasees',
    description:
      'Die schwere Panzerabteilung 502 setzt erstmals vier Tiger im Gefecht ein. Drei fallen technisch aus — ein ernüchterndes Debüt der neuen Waffe.',
    category: 'technology',
    coordinates: [31.0531, 59.7448],
    relatedBattle: 'leningrad-siege',
  },
  {
    id: 'halder-dismissed-1942',
    date: '1942-09-24',
    title: 'Halder als Generalstabschef entlassen — Zeitzler übernimmt',
    description:
      'Streit über die Kriegsführung im Kaukasus eskaliert. Hitler installiert den jüngeren Kurt Zeitzler — Symbol der wachsenden Distanz zwischen Führer und Generalität.',
    category: 'command',
    coordinates: [21.4961, 54.0794],
    relatedBattle: 'caucasus',
  },
  {
    id: 'hitler-no-breakout-1942',
    date: '1942-11-24',
    title: 'Hitler verbietet Ausbruch der 6. Armee aus Stalingrad',
    description:
      'Paulus erbittet „Handlungsfreiheit", doch Hitler erklärt Stalingrad zur „Festung". Göring sagt Luftversorgung zu, die nie funktioniert.',
    category: 'politics',
    coordinates: [44.5018, 48.708],
    relatedBattle: 'stalingrad',
  },
  {
    id: 'wintergewitter-1942',
    date: '1942-12-12',
    title: 'Unternehmen „Wintergewitter" — Entsatzversuch für Stalingrad',
    description:
      'Manstein lässt Hoths 4. Panzerarmee von Kotelnikowo aus auf den Kessel zustoßen. Am 23. Dezember stockt der Angriff 48 km vor der 6. Armee.',
    category: 'milestone',
    coordinates: [43.15, 47.6333],
    relatedBattle: 'stalingrad',
  },

  // ============ 1943 ============
  {
    id: 'casablanca-1943',
    date: '1943-01-14',
    title: 'Konferenz von Casablanca — Forderung nach bedingungsloser Kapitulation',
    description:
      'Bis 24. Januar. Roosevelt und Churchill (Stalin abwesend) beschließen, vom Reich nur die „unconditional surrender" anzunehmen. Politisch wirkungsmächtig bis ins Frühjahr 1945.',
    category: 'diplomacy',
    coordinates: [-7.5898, 33.5731],
  },
  {
    id: 'paulus-marshal-1943',
    date: '1943-01-30',
    title: 'Hitler befördert Paulus zum Generalfeldmarschall',
    description:
      'Der durchsichtige Wink: Kein deutscher Feldmarschall sei je in Gefangenschaft geraten. Paulus kapituliert am nächsten Tag dennoch.',
    category: 'command',
    coordinates: [44.5018, 48.708],
    relatedBattle: 'stalingrad',
  },
  {
    id: 'sportpalast-1943',
    date: '1943-02-18',
    title: 'Goebbels: Sportpalast-Rede vom „totalen Krieg"',
    description:
      'Reaktion auf Stalingrad: Mobilisierung aller Ressourcen, drastische Verschärfung der Heimatfront. „Wollt ihr den totalen Krieg?"',
    category: 'politics',
    coordinates: [13.3567, 52.4985],
  },
  {
    id: 'katyn-discovery-1943',
    date: '1943-04-13',
    title: 'Deutschland meldet Massengräber von Katyn',
    description:
      'Berliner Rundfunk verkündet den Fund von 4.000 ermordeten polnischen Offizieren. Stalin bricht daraufhin am 25. April die Beziehungen zur polnischen Exilregierung ab.',
    category: 'diplomacy',
    coordinates: [31.7833, 54.7833],
  },
  {
    id: 'panther-debut-kursk-1943',
    date: '1943-07-05',
    title: 'Panzer V Panther — Kampfdebüt zu Beginn von „Zitadelle"',
    description:
      'Etwa 200 Panther starten ihren ersten Großeinsatz im Kursker Bogen. Hohe Ausfallraten durch unausgereifte Mechanik prägen das Bild.',
    category: 'technology',
    coordinates: [36.1874, 51.7373],
    relatedBattle: 'kursk',
  },
  {
    id: 'mussolini-fall-1943',
    date: '1943-07-25',
    title: 'Sturz Mussolinis — die Achse beginnt zu bröckeln',
    description:
      'Der Große Faschistische Rat entmachtet Mussolini. Hitler muss Reserven nach Italien verlegen — direkte Entlastung für die Sowjets bei Kursk.',
    category: 'diplomacy',
    coordinates: [12.4964, 41.9028],
  },
  {
    id: 'rail-war-1943',
    date: '1943-08-03',
    title: 'Partisanenoperation „Schienenkrieg" beginnt',
    description:
      '167 Partisanenbrigaden mit rund 100.000 Mann sprengen in der Nacht zum 4. August Tausende Schienen in Belarus, Russland und Ukraine. Synchron zur Roten-Armee-Offensive nach Kursk.',
    category: 'partisan',
    coordinates: [27.5615, 53.9006],
  },
  {
    id: 'first-moscow-salute-1943',
    date: '1943-08-05',
    title: 'Erster Moskauer Salut — Befreiung von Orel und Belgorod',
    description:
      'Stalin ordnet das erste Artilleriesalut der Stadt an. Die Tradition wird zum festen Element der sowjetischen Siegesinszenierung bis Kriegsende.',
    category: 'symbolic',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'operation-concert-1943',
    date: '1943-09-19',
    title: 'Partisanenoperation „Konzert" — zweite große Welle',
    description:
      '193 Verbände mit 210.000 Kämpfern stören die deutsche Logistik vor dem Dnjepr. Die Bahnkapazität in den Rückgebieten sinkt um rund 40 %.',
    category: 'partisan',
    coordinates: [27.5615, 53.9006],
  },
  {
    id: 'kiev-liberated-1943',
    date: '1943-11-06',
    title: 'Rote Armee befreit Kiew',
    description:
      'Watutins 1. Ukrainische Front nimmt die ukrainische Hauptstadt — pünktlich zum Jahrestag der Oktoberrevolution. Strategisches und symbolisches Tor zum Westen.',
    category: 'symbolic',
    coordinates: [30.5234, 50.4501],
  },
  {
    id: 'tehran-conference-1943',
    date: '1943-11-28',
    title: 'Konferenz von Teheran — die „Großen Drei" treffen sich',
    description:
      'Bis 1. Dezember: Stalin, Roosevelt und Churchill stimmen sich erstmals persönlich ab. Festlegung auf Overlord für Mai/Juni 1944 und Polens Verschiebung nach Westen.',
    category: 'diplomacy',
    coordinates: [51.389, 35.6892],
  },

  // ============ 1944 ============
  {
    id: 'leningrad-blockade-end-1944',
    date: '1944-01-27',
    title: 'Leningrader Blockade vollständig aufgehoben',
    description:
      'Nach 872 Tagen Belagerung erklärt der Sowjet die Stadt freigekämpft — mit 24 Salven aus 324 Geschützen. Eine der längsten Belagerungen der Neuzeit endet.',
    category: 'symbolic',
    coordinates: [30.3351, 59.9343],
    relatedBattle: 'leningrad-siege',
  },
  {
    id: 'koniev-marshal-1944',
    date: '1944-02-20',
    title: 'Konjew zum Marschall der Sowjetunion ernannt',
    description:
      'Nach dem Korsuner Kessel-Erfolg wird der Frontkommandeur in den höchsten militärischen Rang erhoben. Konjew bleibt bis Kriegsende Schukows wichtigster Konkurrent.',
    category: 'command',
    coordinates: [37.6173, 55.7558],
    relatedBattle: 'korsun',
  },
  {
    id: 'manstein-dismissed-1944',
    date: '1944-03-30',
    title: 'Manstein und Kleist von Hitler entlassen',
    description:
      'Streit um den Kessel von Kamenez-Podolsk: Hitler entlässt Manstein, verleiht ihm zugleich die Schwerter zum Ritterkreuz. Model übernimmt die Heeresgruppe Süd.',
    category: 'command',
    coordinates: [26.5856, 48.675],
  },
  {
    id: 'vatutin-death-1944',
    date: '1944-04-15',
    title: 'General Watutin stirbt an Verwundung durch UPA',
    description:
      'Der Befehlshaber der 1. Ukrainischen Front war am 29. Februar von ukrainischen Nationalisten überfallen worden. Sein Tod ist ein schwerer Verlust für die Stawka.',
    category: 'command',
    coordinates: [30.5234, 50.4501],
  },
  {
    id: 'frantic-shuttle-1944',
    date: '1944-06-02',
    title: 'Operation Frantic — erste US-Pendelbombardierung von Poltawa',
    description:
      'B-17 Bomber starten von italienischen Basen, bombardieren Ziele und landen auf sowjetischem Boden. Symbol alliierter Kooperation — am 22. Juni zerstört die Luftwaffe in Poltawa 47 US-Maschinen am Boden.',
    category: 'logistics',
    coordinates: [34.5511, 49.5883],
  },
  {
    id: 'd-day-1944',
    date: '1944-06-06',
    title: 'D-Day — Westalliierte landen in der Normandie',
    description:
      'Die zweite Front, die Stalin seit 1942 forderte, ist eröffnet. Drei Wochen später startet die Rote Armee die abgestimmte Großoffensive Bagration.',
    category: 'diplomacy',
    coordinates: [-0.7167, 49.35],
  },
  {
    id: 'stauffenberg-1944',
    date: '1944-07-20',
    title: 'Attentat auf Hitler in der Wolfsschanze',
    description:
      'Stauffenbergs Bombe in Rastenburg detoniert, Hitler überlebt leicht verletzt. Folge: Säuberungswelle in der Wehrmachtsführung, weitere Schwächung der Ostfrontkommandos.',
    category: 'politics',
    coordinates: [21.4961, 54.0794],
  },
  {
    id: 'lublin-committee-1944',
    date: '1944-07-22',
    title: 'Lubliner Komitee verkündet — sowjetische Polenregierung in spe',
    description:
      'Das Polnische Komitee für nationale Befreiung wird in Moskau als Gegenregierung zur Londoner Exilregierung aufgestellt. Politische Weichenstellung für das Nachkriegspolen.',
    category: 'politics',
    coordinates: [22.5667, 51.25],
  },
  {
    id: 'warsaw-uprising-1944',
    date: '1944-08-01',
    title: 'Warschauer Aufstand beginnt',
    description:
      'Die polnische Heimatarmee (AK) erhebt sich gegen die deutsche Besatzung, als die Rote Armee die Weichsel erreicht. Stalin lässt die Front 63 Tage lang weitgehend untätig.',
    category: 'partisan',
    coordinates: [21.0122, 52.2297],
  },
  {
    id: 'panzerfaust-mass-1944',
    date: '1944-08-01',
    title: 'Panzerfaust 60 in der Massenproduktion',
    description:
      'Die billige Einwegwaffe wird zur Schlüsselantwort der Wehrmacht auf sowjetische Panzermassen. Allein 1944 werden mehrere Millionen ausgeliefert.',
    category: 'technology',
    coordinates: [11.0833, 49.45],
  },
  {
    id: 'romania-coup-1944',
    date: '1944-08-23',
    title: 'Rumänien wechselt die Seiten — König Michael stürzt Antonescu',
    description:
      'Putsch in Bukarest: Antonescu wird verhaftet, am 25. August erklärt Rumänien dem Reich den Krieg. Die deutsche Südflanke kollabiert binnen Tagen.',
    category: 'diplomacy',
    coordinates: [26.1025, 44.4268],
    relatedBattle: 'jassy-kishinev',
  },
  {
    id: 'slovak-uprising-1944',
    date: '1944-08-29',
    title: 'Slowakischer Nationalaufstand beginnt',
    description:
      'Teile der slowakischen Armee und Partisanen erheben sich gegen das Tiso-Regime und die Wehrmacht. Bis Ende Oktober niedergeschlagen, bindet die Kämpfe deutsche Kräfte.',
    category: 'partisan',
    coordinates: [19.1547, 48.7361],
  },
  {
    id: 'bulgaria-declaration-1944',
    date: '1944-09-05',
    title: 'UdSSR erklärt Bulgarien den Krieg',
    description:
      'Moskau übergibt die Note um 19 Uhr. Die Rote Armee marschiert ohne Widerstand ein; Bulgarien wechselt am 8. September auf alliierte Seite.',
    category: 'diplomacy',
    coordinates: [23.3219, 42.6977],
  },
  {
    id: 'finland-armistice-1944',
    date: '1944-09-19',
    title: 'Finnland unterzeichnet Waffenstillstand von Moskau',
    description:
      'Ende des Fortsetzungskriegs. Finnland tritt Karelien ab und muss bis Frühjahr 1945 deutsche Truppen aus Lappland vertreiben (Lapplandkrieg).',
    category: 'diplomacy',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'percentages-agreement-1944',
    date: '1944-10-09',
    title: '„Prozente-Abkommen" zwischen Churchill und Stalin',
    description:
      'Auf einer Serviette skizzieren beide die Einflussanteile in Südosteuropa: Rumänien 90 % UdSSR, Griechenland 90 % Großbritannien, Jugoslawien 50/50. Reale Vorwegnahme der Nachkriegsteilung.',
    category: 'diplomacy',
    coordinates: [37.6173, 55.7558],
  },
  {
    id: 'belgrade-liberated-1944',
    date: '1944-10-20',
    title: 'Belgrad befreit — Tito und Tolbuchin marschieren ein',
    description:
      'Gemeinsamer Vorstoß sowjetischer Truppen und Titos Partisanen. Die jugoslawische Hauptstadt fällt; deutsche Heeresgruppe E ist auf dem Rückzug aus Griechenland abgeschnitten.',
    category: 'symbolic',
    coordinates: [20.4489, 44.7866],
  },
  {
    id: 'konr-prague-1944',
    date: '1944-11-14',
    title: 'Wlassow gründet das Komitee zur Befreiung der Völker Russlands',
    description:
      'Im Prager Schloss verkündet General Wlassow das „Prager Manifest". Aufstellung der ROA-Divisionen aus sowjetischen Überläufern; Hitler hatte lange gezögert.',
    category: 'politics',
    coordinates: [14.4378, 50.0755],
  },

  // ============ 1945 ============
  {
    id: 'yalta-conference-1945',
    date: '1945-02-04',
    title: 'Konferenz von Jalta beginnt',
    description:
      'Bis 11. Februar verhandeln Roosevelt, Churchill und Stalin auf der Krim die Nachkriegsordnung: Besatzungszonen, Polens Grenzen, sowjetischer Kriegseintritt gegen Japan.',
    category: 'diplomacy',
    coordinates: [34.1667, 44.5],
  },
  {
    id: 'budapest-fall-1945',
    date: '1945-02-13',
    title: 'Budapest fällt nach 50 Tagen Kessel',
    description:
      'Die ungarische Hauptstadt wird genommen; der deutsche Ausbruchsversuch endet im Desaster. Wien und das letzte ungarisch-österreichische Industriezentrum rücken in Reichweite.',
    category: 'symbolic',
    coordinates: [19.0402, 47.4979],
    relatedBattle: 'budapest',
  },
  {
    id: 'chernyakhovsky-death-1945',
    date: '1945-02-18',
    title: 'Armeegeneral Tschernjachowski tödlich verwundet bei Mehlsack',
    description:
      'Mit 38 Jahren der jüngste Frontkommandeur der Roten Armee, fällt durch einen Granatsplitter in Ostpreußen. Wassilewski übernimmt die 3. Belorussische Front.',
    category: 'command',
    coordinates: [20.0833, 54.2167],
    relatedBattle: 'koenigsberg',
  },
  {
    id: 'nero-decree-1945',
    date: '1945-03-19',
    title: 'Hitlers „Nero-Befehl" — verbrannte Erde im Reich',
    description:
      'Befehl zur Zerstörung aller militärischen, industriellen und Versorgungsanlagen vor dem heranrückenden Feind. Rüstungsminister Speer setzt sich gegen die Ausführung ein.',
    category: 'politics',
    coordinates: [13.405, 52.52],
  },
  {
    id: 'koenigsberg-fall-1945',
    date: '1945-04-09',
    title: 'Königsberg kapituliert',
    description:
      'General Lasch übergibt die Festung an Wassilewski — gegen Hitlers Befehl. In Berlin wird Lasch in Abwesenheit zum Tode verurteilt.',
    category: 'symbolic',
    coordinates: [20.5086, 54.7104],
    relatedBattle: 'koenigsberg',
  },
  {
    id: 'roosevelt-death-1945',
    date: '1945-04-12',
    title: 'Tod Roosevelts — Truman übernimmt im Weißen Haus',
    description:
      'Hitler schöpft kurz Hoffnung auf das „Wunder von Brandenburg". Der politische Wechsel bleibt ohne Wirkung auf die militärische Lage.',
    category: 'command',
    coordinates: [-77.0369, 38.9072],
  },
  {
    id: 'vienna-liberated-1945',
    date: '1945-04-13',
    title: 'Wien von der Roten Armee genommen',
    description:
      'Tolbuchins 3. Ukrainische Front beendet die Wiener Operation. Die deutsche Heeresgruppe Süd weicht in die Alpen aus.',
    category: 'symbolic',
    coordinates: [16.3738, 48.2082],
  },
  {
    id: 'hitler-birthday-1945',
    date: '1945-04-20',
    title: 'Hitlers 56. Geburtstag im Führerbunker',
    description:
      'Letzte öffentliche Erscheinung Hitlers — Auszeichnung von Hitlerjungen im Garten der Reichskanzlei. Tags darauf Beginn des Endkampfs um Berlin.',
    category: 'symbolic',
    coordinates: [13.3811, 52.5128],
    relatedBattle: 'berlin',
  },
  {
    id: 'elbe-day-1945',
    date: '1945-04-25',
    title: 'Elbe Day — Rote Armee und US Army begegnen sich bei Torgau',
    description:
      'Patrouillen der 1. US-Armee und der 1. Ukrainischen Front treffen sich an der Elbe. Das Reich ist in zwei Teile zerschnitten.',
    category: 'symbolic',
    coordinates: [12.9939, 51.5614],
  },
  {
    id: 'mussolini-killed-1945',
    date: '1945-04-28',
    title: 'Mussolini von Partisanen erschossen',
    description:
      'Hitler reagiert mit endgültigem Entschluss zum Selbstmord. Die Nachricht erreicht den Führerbunker am Folgetag.',
    category: 'symbolic',
    coordinates: [9.3486, 46.0064],
  },
  {
    id: 'reichstag-flag-1945',
    date: '1945-04-30',
    title: 'Sowjetische Fahne auf dem Reichstag',
    description:
      'Soldaten der 150. Schützendivision hissen abends das Siegesbanner. Das Foto Jewgeni Chaldejs vom 2. Mai wird zur Ikone des sowjetischen Sieges.',
    category: 'symbolic',
    coordinates: [13.3761, 52.5186],
    relatedBattle: 'berlin',
  },
  {
    id: 'hitler-suicide-1945',
    date: '1945-04-30',
    title: 'Selbstmord Hitlers im Führerbunker',
    description:
      'Mit Eva Braun gemeinsam erschießt sich Hitler um 15:30 Uhr. Dönitz wird testamentarisch zum Reichspräsidenten bestimmt.',
    category: 'command',
    coordinates: [13.3811, 52.5128],
    relatedBattle: 'berlin',
  },
  {
    id: 'berlin-surrender-1945',
    date: '1945-05-02',
    title: 'Berliner Stadtkommandant Weidling kapituliert',
    description:
      'General Weidling übergibt die Reichshauptstadt an Tschuikow. Mit der Kapitulation Berlins ist der Ostfeldzug faktisch entschieden.',
    category: 'symbolic',
    coordinates: [13.405, 52.52],
    relatedBattle: 'berlin',
  },
  {
    id: 'reims-surrender-1945',
    date: '1945-05-07',
    title: 'Erste Gesamtkapitulation in Reims unterzeichnet',
    description:
      'Generaloberst Jodl unterzeichnet im SHAEF-Hauptquartier die bedingungslose Kapitulation. Stalin verlangt einen zweiten Akt in Berlin.',
    category: 'diplomacy',
    coordinates: [4.0317, 49.2583],
  },
  {
    id: 'karlshorst-surrender-1945',
    date: '1945-05-08',
    title: 'Kapitulationsurkunde in Berlin-Karlshorst unterzeichnet',
    description:
      'Keitel, Friedeburg und Stumpff unterzeichnen in der Nacht; in Moskau ist es bereits der 9. Mai — der „Tag des Sieges" der Sowjetunion.',
    category: 'diplomacy',
    coordinates: [13.5283, 52.4806],
  },
  {
    id: 'prague-liberated-1945',
    date: '1945-05-09',
    title: 'Prag befreit — letzte deutsche Truppen kapitulieren',
    description:
      'Die 1. Ukrainische Front Konjews erreicht die tschechoslowakische Hauptstadt einen Tag nach der Generalkapitulation. Letzte größere Kampfhandlungen in Europa.',
    category: 'symbolic',
    coordinates: [14.4378, 50.0755],
  },
  {
    id: 'moscow-victory-parade-1945',
    date: '1945-06-24',
    title: 'Siegesparade auf dem Roten Platz',
    description:
      'Schukow nimmt zu Pferd die Parade ab, Rokossowski führt sie. Erbeutete deutsche Standarten werden vor dem Mausoleum niedergeworfen.',
    category: 'symbolic',
    coordinates: [37.6213, 55.7539],
  },
  {
    id: 'potsdam-conference-1945',
    date: '1945-07-17',
    title: 'Potsdamer Konferenz beginnt',
    description:
      'Bis 2. August: Stalin, Truman und Churchill (ab 28.7. Attlee) regeln Besatzungspolitik, Reparationen, Oder-Neiße-Linie. Die Anti-Hitler-Koalition zerfällt bereits sichtbar.',
    category: 'diplomacy',
    coordinates: [13.0883, 52.4006],
  },
]

/** Liefert Ereignisse innerhalb von ±windowDays um das Datum, chronologisch sortiert. */
export function eventsAroundDate(date: Date, windowDays: number): HistEvent[] {
  const ts = date.getTime()
  const windowMs = windowDays * 24 * 60 * 60 * 1000
  return EVENTS.filter((e) => {
    const eventTs = new Date(e.date).getTime()
    return Math.abs(eventTs - ts) <= windowMs
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/** Alle Ereignisse zwischen zwei Daten (inklusive). */
export function eventsInRange(start: Date, end: Date): HistEvent[] {
  const s = start.getTime()
  const e = end.getTime()
  return EVENTS.filter((ev) => {
    const t = new Date(ev.date).getTime()
    return t >= s && t <= e
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/** Liefert ein menschenlesbares Delta ("heute", "vor 3 Tagen", "in 2 Tagen"). */
export function relativeDayLabel(eventDate: string, currentDate: Date): string {
  const eventTs = new Date(eventDate).getTime()
  const currentTs = currentDate.getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const diffDays = Math.round((eventTs - currentTs) / dayMs)
  if (diffDays === 0) return 'heute'
  if (diffDays === 1) return 'morgen'
  if (diffDays === -1) return 'gestern'
  if (diffDays > 0) return `in ${diffDays} Tagen`
  return `vor ${-diffDays} Tagen`
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  politics: 'Politik',
  diplomacy: 'Diplomatie',
  command: 'Befehl',
  technology: 'Technik',
  partisan: 'Partisan',
  logistics: 'Logistik',
  symbolic: 'Symbol',
  milestone: 'Meilenstein',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  politics: '#dc2626',
  diplomacy: '#2563eb',
  command: '#7c3aed',
  technology: '#0891b2',
  partisan: '#16a34a',
  logistics: '#ea580c',
  symbolic: '#f59e0b',
  milestone: '#737373',
}
