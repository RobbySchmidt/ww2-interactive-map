/**
 * Welche Länder waren wann unter Achsenkontrolle?
 *
 * Wird zusammen mit Natural-Earth-Admin-0-Grenzen (geladen aus
 * `public/data/ne_50m_admin_0_countries.json`) verwendet, um die unter
 * Achsenkontrolle stehenden Länder ländergrenzentreu rot einzufärben.
 *
 * Zwei Kategorien:
 *  - "solid": Land ist während der Phase voll unter Achsenkontrolle. Bei Front-
 *    Berührung (z.B. Polen/Reich 1945) wird gegen die Sowjet-Region geclippt
 *    (difference), sodass nur die Achsen-Seite rot bleibt.
 *  - "frontline": Sowjet-Republik, die zeitweise von der Achse erobert war.
 *    Die rote Fläche ergibt sich aus Country − Sowjet-Region: bei Vormarsch
 *    wächst der rote Anteil, bei Rückzug schrumpft er. Wenn die Front das Land
 *    komplett überquert hat, bleibt 0 rot — das Land verschwindet aus dem Layer.
 *
 * Identifier: `ADM0_A3` aus Natural Earth (3-Letter-Code). `ISO_A3` ist für
 * Frankreich und Norwegen `-99` und damit unbrauchbar; `ADM0_A3` ist immer
 * korrekt befüllt.
 *
 * Datumsspannen orientieren sich am Ostfront-Zeitfenster 1941-06-21 – 1945-05-08.
 * Befreiungs-/Kapitulationsdaten aus Standardliteratur.
 */

export interface AxisControlPhase {
  start: string // ISO YYYY-MM-DD inkl.
  end: string // ISO YYYY-MM-DD inkl.
}

/**
 * Tier teilt die Achsen-Länder visuell in zwei Klassen:
 *  - `eastern`: Ostfront-relevant — Operationsbasis (Reich + Achsenpartner, die
 *    Truppen an die Ostfront stellten) oder erobertes Sowjet-Gebiet. Wird kräftig
 *    rot eingefärbt und gegen die Sowjet-Region geclippt (Frontverlauf).
 *  - `rear`: Achsen-Hinterland ohne militärische Ostfront-Beteiligung
 *    (Westeuropa-Besatzung, Italien-Kerngebiet, Balkan, Bulgarien). Wird in
 *    dezenter Grauschattierung gezeichnet und NICHT geclippt — diese Länder
 *    spielten für den Frontverlauf keine Rolle.
 */
export type AxisTier = 'eastern' | 'rear'

export interface AxisCountry {
  /** ADM0_A3 aus Natural Earth — robuster als ISO_A3 */
  adm0: string
  /** Deutscher Anzeigename (für Debug/Tooltip später) */
  name: string
  tier: AxisTier
  phases: AxisControlPhase[]
}

export const AXIS_COUNTRIES: AxisCountry[] = [
  // ===========================================================================
  // EASTERN-TIER: Reich-Kerngebiet, Achsenpartner mit Ostfront-Truppen,
  // Mitkriegführer, eroberte Sowjet-Republiken. Diese Länder werden rot
  // gerendert und gegen die Sowjet-Region geclippt.
  // ===========================================================================

  // ---------- Reich-Kerngebiet (vor Barbarossa annektiert/besetzt) ----------
  { adm0: 'DEU', name: 'Deutsches Reich', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },
  { adm0: 'AUT', name: 'Österreich (Ostmark)', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },
  { adm0: 'CZE', name: 'Protektorat Böhmen-Mähren', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },

  // ---------- Polen (Generalgouvernement + annektierte Gebiete) ----------
  // Phase deckt die deutsche militärische Präsenz ab (NICHT nur die politische
  // Befreiung Warschaus am 17.01.1945). NE50m POL hat Nachkriegs-Grenzen bis zur
  // Oder; deutsche Truppen wurden in Schlesien/Pommern bis Mitte April vertrieben.
  // Wichtig damit POL während der Weichsel-Oder-Operation (12.01.–03.02.1945)
  // gegen die Front geclippt wird und das Rot prozentual schrumpft — statt mit
  // dem Tag der Warschau-Befreiung schlagartig zu verschwinden.
  { adm0: 'POL', name: 'Polen (besetzt)', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-04-15' }] },

  // ---------- Achsenpartner mit Ostfront-Truppen ----------
  { adm0: 'SVK', name: 'Slowakei (Achse)', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-04-04' }] },
  { adm0: 'HUN', name: 'Ungarn', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1945-04-04' }] },
  // Rumänien: Politischer Seitenwechsel 23.08.1944 (König-Michael-Coup), aber
  // deutsche Truppen wurden in den folgenden 3 Wochen aus Rumänien gedrängt
  // (Iași-Chișinău-Operation läuft, Bukarest 31.08., ungarisch-rumänische Grenze
  // Anfang September). Phase deckt die militärische Räumung ab — mit dem
  // 1944-09-15-Snapshot schrumpft das Rot automatisch progressiv.
  { adm0: 'ROU', name: 'Rumänien', tier: 'eastern', phases: [{ start: '1941-06-21', end: '1944-09-15' }] },
  // Finnland: Mitkriegführer ab 25.06.1941 (Kontinuationskrieg), Waffenstillstand 19.09.1944.
  { adm0: 'FIN', name: 'Finnland (Mitkriegführer)', tier: 'eastern', phases: [{ start: '1941-06-25', end: '1944-09-19' }] },

  // ---------- Baltikum (im Sommer 1941 von der Wehrmacht erobert) ----------
  // Litauen: Vilnius fällt 24.06.1941. Befreiung Vilnius 13.07.1944, ganz LT bis Sep 1944.
  { adm0: 'LTU', name: 'Litauen (besetzt)', tier: 'eastern', phases: [{ start: '1941-06-25', end: '1944-09-30' }] },
  // Lettland: Riga fällt 01.07.1941. Riga befreit 13.10.1944, aber Kurland-Kessel
  // (West-Lettland) blieb bis 08.05.1945 in deutscher Hand. Das Difference-Clipping
  // gegen die Frontlinie blendet automatisch den Ost-Teil ab Herbst 1944 aus.
  { adm0: 'LVA', name: 'Lettland (besetzt) / Kurland-Kessel', tier: 'eastern', phases: [{ start: '1941-07-01', end: '1945-05-08' }] },
  // Estland: Tallinn fällt 28.08.1941. Tallinn befreit 22.09.1944.
  { adm0: 'EST', name: 'Estland (besetzt)', tier: 'eastern', phases: [{ start: '1941-08-28', end: '1944-09-22' }] },

  // ---------- Sowjet-Republiken (Front-Bewegungsgebiet) ----------
  // Diese Länder werden ländergrenzentreu gerendert, aber gegen die Sowjet-Region
  // geclippt: rot zeigt nur den von der Achse erreichten Teil. Endet die Phase
  // mit der Befreiung der jeweils letzten Stadt — danach hat die Achse nichts
  // mehr im Land, und das difference-Ergebnis ist sowieso leer.
  // (Natural-Earth-Grenzen sind heutige Grenzen; das weicht von 1941 leicht ab,
  // ist für die Front-Visualisierung aber gut genug.)
  // Moldau: Chișinău fällt 26.07.1941, befreit 24.08.1944 (Iași-Chișinău-Op.).
  { adm0: 'MDA', name: 'Moldauische SSR', tier: 'eastern', phases: [{ start: '1941-07-26', end: '1944-08-24' }] },
  // Ukraine: Vorstoß ab 22.06.1941, Lwiw befreit 27.07.1944, Karpaten-Vorland Okt. 1944.
  { adm0: 'UKR', name: 'Ukrainische SSR', tier: 'eastern', phases: [{ start: '1941-06-22', end: '1944-10-28' }] },
  // Belarus: Vorstoß ab 22.06.1941, Brest befreit 28.07.1944 (Ende Bagration West).
  { adm0: 'BLR', name: 'Belorussische SSR', tier: 'eastern', phases: [{ start: '1941-06-22', end: '1944-07-28' }] },
  // Russland (RSFSR): Vorstoß ab 22.06.1941, letzte russische Gebiete (Pskow) befreit
  // bis September 1944. Front-Clipping schneidet den europäischen Teil entsprechend zu.
  { adm0: 'RUS', name: 'Russische SFSR (besetzter Teil)', tier: 'eastern', phases: [{ start: '1941-06-22', end: '1944-09-08' }] },

  // ===========================================================================
  // REAR-TIER: Achsen-Hinterland ohne militärische Ostfront-Beteiligung.
  // Wird dezent grau eingefärbt und NICHT gegen die Sowjet-Region geclippt —
  // diese Länder waren von der Ostfront geographisch und militärisch entkoppelt.
  // ===========================================================================

  // ---------- Westeuropa besetzt ----------
  { adm0: 'NLD', name: 'Niederlande', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-05' }] },
  { adm0: 'BEL', name: 'Belgien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-09-04' }] },
  { adm0: 'LUX', name: 'Luxemburg', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-09-10' }] },
  // Frankreich: bis D-Day + Paris-Befreiung 25.08.1944, dann schrittweise bis Sept.
  { adm0: 'FRA', name: 'Frankreich (besetzt)', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-09-15' }] },
  { adm0: 'DNK', name: 'Dänemark', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-05' }] },
  { adm0: 'NOR', name: 'Norwegen', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },

  // ---------- Italien-Kerngebiet ----------
  // Italien: vereinfacht durchgehend bis Kriegsende. Historisch komplexer
  // (Süditalien ab Sept. 1943 alliiert, RSI im Norden bis Mai 1945) — für
  // Ostfront-Sicht aber unwichtig.
  { adm0: 'ITA', name: 'Italien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-02' }] },

  // ---------- Bulgarien (Achsenpartner ohne Ostfront-Einsatz) ----------
  // Bulgarien war Mitglied des Dreierpaktes, hat aber nie den Sowjets den Krieg
  // erklärt und keine Truppen an die Ostfront geschickt. Sowjet-Kriegserklärung
  // 05.09.1944, dann Putsch 09.09. → Seitenwechsel.
  { adm0: 'BGR', name: 'Bulgarien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-09-09' }] },

  // ---------- Balkan (besetzt/annektiert, Kämpfe gegen Partisanen/Briten) ----------
  // Albanien: italienisch seit April 1939, befreit Ende November 1944.
  { adm0: 'ALB', name: 'Albanien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-11-29' }] },
  // Kroatien NDH: 10.04.1941–07.05.1945
  { adm0: 'HRV', name: 'Kroatien (NDH)', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-07' }] },
  // Serbien: Militärverwaltung 17.04.1941, Belgrad befreit 20.10.1944
  { adm0: 'SRB', name: 'Serbien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-10-20' }] },
  // Bosnien-Herzegowina: Teil der NDH
  { adm0: 'BIH', name: 'Bosnien-Herzegowina (NDH)', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-04-06' }] },
  // Montenegro: italienisches Protektorat ab 1941, befreit Dezember 1944
  { adm0: 'MNE', name: 'Montenegro', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-12-15' }] },
  // Mazedonien: bulgarisch besetzt ab 1941, befreit November 1944
  { adm0: 'MKD', name: 'Mazedonien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-11-13' }] },
  // Slowenien: geteilt zwischen Reich + Italien, Befreiung Mai 1945
  { adm0: 'SVN', name: 'Slowenien', tier: 'rear', phases: [{ start: '1941-06-21', end: '1945-05-09' }] },
  // Griechenland: besetzt ab 30.04.1941, Athen befreit 12.10.1944
  { adm0: 'GRC', name: 'Griechenland', tier: 'rear', phases: [{ start: '1941-06-21', end: '1944-10-12' }] },
]

function isActive(c: AxisCountry, ts: number): boolean {
  for (const p of c.phases) {
    const s = new Date(p.start).getTime()
    // end inklusive = +1 Tag in ms
    const e = new Date(p.end).getTime() + 24 * 3600 * 1000
    if (ts >= s && ts <= e) return true
  }
  return false
}

/**
 * Welche ADM0_A3-Codes waren zum gegebenen Datum unter Achsenkontrolle?
 * Ohne Tier-Information — beibehalten für Abwärtskompatibilität.
 */
export function axisCountryCodesAt(date: Date): string[] {
  const ts = date.getTime()
  return AXIS_COUNTRIES.filter((c) => isActive(c, ts)).map((c) => c.adm0)
}

/**
 * Welche Länder waren zum gegebenen Datum unter Achsenkontrolle — getrennt
 * nach Tier (eastern/rear), für getrennte Render-Layer in der Karte.
 */
export function axisCountriesByTierAt(date: Date): { eastern: string[]; rear: string[] } {
  const ts = date.getTime()
  const eastern: string[] = []
  const rear: string[] = []
  for (const c of AXIS_COUNTRIES) {
    if (!isActive(c, ts)) continue
    if (c.tier === 'eastern') eastern.push(c.adm0)
    else rear.push(c.adm0)
  }
  return { eastern, rear }
}
