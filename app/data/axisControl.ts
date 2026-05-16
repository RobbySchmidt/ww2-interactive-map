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

export interface AxisCountry {
  /** ADM0_A3 aus Natural Earth — robuster als ISO_A3 */
  adm0: string
  /** Deutscher Anzeigename (für Debug/Tooltip später) */
  name: string
  phases: AxisControlPhase[]
}

export const AXIS_COUNTRIES: AxisCountry[] = [
  // ---------- Reich-Kerngebiet (vor Barbarossa annektiert/besetzt) ----------
  { adm0: 'DEU', name: 'Deutsches Reich', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },
  { adm0: 'AUT', name: 'Österreich (Ostmark)', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },
  { adm0: 'CZE', name: 'Protektorat Böhmen-Mähren', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },

  // ---------- Polen (Generalgouvernement + annektierte Gebiete) ----------
  // Phase deckt die deutsche militärische Präsenz ab (NICHT nur die politische
  // Befreiung Warschaus am 17.01.1945). NE50m POL hat Nachkriegs-Grenzen bis zur
  // Oder; deutsche Truppen wurden in Schlesien/Pommern bis Mitte April vertrieben.
  // Wichtig damit POL während der Weichsel-Oder-Operation (12.01.–03.02.1945)
  // gegen die Front geclippt wird und das Rot prozentual schrumpft — statt mit
  // dem Tag der Warschau-Befreiung schlagartig zu verschwinden.
  { adm0: 'POL', name: 'Polen (besetzt)', phases: [{ start: '1941-06-21', end: '1945-04-15' }] },

  // ---------- Westeuropa besetzt ----------
  { adm0: 'NLD', name: 'Niederlande', phases: [{ start: '1941-06-21', end: '1945-05-05' }] },
  { adm0: 'BEL', name: 'Belgien', phases: [{ start: '1941-06-21', end: '1944-09-04' }] },
  { adm0: 'LUX', name: 'Luxemburg', phases: [{ start: '1941-06-21', end: '1944-09-10' }] },
  // Frankreich: bis D-Day + Paris-Befreiung 25.08.1944, dann schrittweise bis Sept.
  { adm0: 'FRA', name: 'Frankreich (besetzt)', phases: [{ start: '1941-06-21', end: '1944-09-15' }] },
  { adm0: 'DNK', name: 'Dänemark', phases: [{ start: '1941-06-21', end: '1945-05-05' }] },
  { adm0: 'NOR', name: 'Norwegen', phases: [{ start: '1941-06-21', end: '1945-05-08' }] },

  // ---------- Achsenpartner / Kerngebiete ----------
  // Italien: vereinfacht durchgehend bis Kriegsende. Historisch komplexer
  // (Süditalien ab Sept. 1943 alliiert, RSI im Norden bis Mai 1945) — für
  // Ostfront-Sicht aber unwichtig.
  { adm0: 'ITA', name: 'Italien', phases: [{ start: '1941-06-21', end: '1945-05-02' }] },
  { adm0: 'SVK', name: 'Slowakei (Achse)', phases: [{ start: '1941-06-21', end: '1945-04-04' }] },
  { adm0: 'HUN', name: 'Ungarn', phases: [{ start: '1941-06-21', end: '1945-04-04' }] },
  // Rumänien: Politischer Seitenwechsel 23.08.1944 (König-Michael-Coup), aber
  // deutsche Truppen wurden in den folgenden 3 Wochen aus Rumänien gedrängt
  // (Iași-Chișinău-Operation läuft, Bukarest 31.08., ungarisch-rumänische Grenze
  // Anfang September). Phase deckt die militärische Räumung ab — mit dem
  // 1944-09-15-Snapshot schrumpft das Rot automatisch progressiv.
  { adm0: 'ROU', name: 'Rumänien', phases: [{ start: '1941-06-21', end: '1944-09-15' }] },
  // Bulgarien: Sowjet-Erklärung 05.09.1944, Putsch 09.09.
  { adm0: 'BGR', name: 'Bulgarien', phases: [{ start: '1941-06-21', end: '1944-09-09' }] },
  // Finnland: Mitkriegführer ab 25.06.1941 (Kontinuationskrieg), Waffenstillstand 19.09.1944.
  { adm0: 'FIN', name: 'Finnland (Mitkriegführer)', phases: [{ start: '1941-06-25', end: '1944-09-19' }] },

  // ---------- Balkan (besetzt/annektiert) ----------
  // Albanien: italienisch seit April 1939, befreit Ende November 1944.
  { adm0: 'ALB', name: 'Albanien', phases: [{ start: '1941-06-21', end: '1944-11-29' }] },
  // Kroatien NDH: 10.04.1941–07.05.1945
  { adm0: 'HRV', name: 'Kroatien (NDH)', phases: [{ start: '1941-06-21', end: '1945-05-07' }] },
  // Serbien: Militärverwaltung 17.04.1941, Belgrad befreit 20.10.1944
  { adm0: 'SRB', name: 'Serbien', phases: [{ start: '1941-06-21', end: '1944-10-20' }] },
  // Bosnien-Herzegowina: Teil der NDH
  { adm0: 'BIH', name: 'Bosnien-Herzegowina (NDH)', phases: [{ start: '1941-06-21', end: '1945-04-06' }] },
  // Montenegro: italienisches Protektorat ab 1941, befreit Dezember 1944
  { adm0: 'MNE', name: 'Montenegro', phases: [{ start: '1941-06-21', end: '1944-12-15' }] },
  // Mazedonien: bulgarisch besetzt ab 1941, befreit November 1944
  { adm0: 'MKD', name: 'Mazedonien', phases: [{ start: '1941-06-21', end: '1944-11-13' }] },
  // Slowenien: geteilt zwischen Reich + Italien, Befreiung Mai 1945
  { adm0: 'SVN', name: 'Slowenien', phases: [{ start: '1941-06-21', end: '1945-05-09' }] },
  // Griechenland: besetzt ab 30.04.1941, Athen befreit 12.10.1944
  { adm0: 'GRC', name: 'Griechenland', phases: [{ start: '1941-06-21', end: '1944-10-12' }] },

  // ---------- Baltikum (im Sommer 1941 von der Wehrmacht erobert) ----------
  // Litauen: Vilnius fällt 24.06.1941. Befreiung Vilnius 13.07.1944, ganz LT bis Sep 1944.
  { adm0: 'LTU', name: 'Litauen (besetzt)', phases: [{ start: '1941-06-25', end: '1944-09-30' }] },
  // Lettland: Riga fällt 01.07.1941. Riga befreit 13.10.1944, aber Kurland-Kessel
  // (West-Lettland) blieb bis 08.05.1945 in deutscher Hand. Das Difference-Clipping
  // gegen die Frontlinie blendet automatisch den Ost-Teil ab Herbst 1944 aus.
  { adm0: 'LVA', name: 'Lettland (besetzt) / Kurland-Kessel', phases: [{ start: '1941-07-01', end: '1945-05-08' }] },
  // Estland: Tallinn fällt 28.08.1941. Tallinn befreit 22.09.1944.
  { adm0: 'EST', name: 'Estland (besetzt)', phases: [{ start: '1941-08-28', end: '1944-09-22' }] },

  // ---------- Sowjet-Republiken (Front-Bewegungsgebiet) ----------
  // Diese Länder werden ländergrenzentreu gerendert, aber gegen die Sowjet-Region
  // geclippt: rot zeigt nur den von der Achse erreichten Teil. Endet die Phase
  // mit der Befreiung der jeweils letzten Stadt — danach hat die Achse nichts
  // mehr im Land, und das difference-Ergebnis ist sowieso leer.
  // (Natural-Earth-Grenzen sind heutige Grenzen; das weicht von 1941 leicht ab,
  // ist für die Front-Visualisierung aber gut genug.)
  // Moldau: Chișinău fällt 26.07.1941, befreit 24.08.1944 (Iași-Chișinău-Op.).
  { adm0: 'MDA', name: 'Moldauische SSR', phases: [{ start: '1941-07-26', end: '1944-08-24' }] },
  // Ukraine: Vorstoß ab 22.06.1941, Lwiw befreit 27.07.1944, Karpaten-Vorland Okt. 1944.
  { adm0: 'UKR', name: 'Ukrainische SSR', phases: [{ start: '1941-06-22', end: '1944-10-28' }] },
  // Belarus: Vorstoß ab 22.06.1941, Brest befreit 28.07.1944 (Ende Bagration West).
  { adm0: 'BLR', name: 'Belorussische SSR', phases: [{ start: '1941-06-22', end: '1944-07-28' }] },
  // Russland (RSFSR): Vorstoß ab 22.06.1941, letzte russische Gebiete (Pskow) befreit
  // bis September 1944. Front-Clipping schneidet den europäischen Teil entsprechend zu.
  { adm0: 'RUS', name: 'Russische SFSR (besetzter Teil)', phases: [{ start: '1941-06-22', end: '1944-09-08' }] },
]

/**
 * Welche ADM0_A3-Codes waren zum gegebenen Datum unter Achsenkontrolle?
 * Verwendung: für MapLibre-Filter auf der Natural-Earth-Source.
 */
export function axisCountryCodesAt(date: Date): string[] {
  const ts = date.getTime()
  const out: string[] = []
  for (const c of AXIS_COUNTRIES) {
    for (const p of c.phases) {
      const s = new Date(p.start).getTime()
      // end inklusive = +1 Tag in ms
      const e = new Date(p.end).getTime() + 24 * 3600 * 1000
      if (ts >= s && ts <= e) {
        out.push(c.adm0)
        break
      }
    }
  }
  return out
}
