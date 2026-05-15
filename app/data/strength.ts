/**
 * Quartalsweise Personalstärken und Panzerproduktion an der Ostfront.
 * Quellen: Müller-Hillebrand, Krivosheev, Glantz "Colossus Reborn", Overmans.
 * Werte sind Annäherungen; Quartalsgranularität bei der Produktion ±10 %.
 */

export interface StrengthSnapshot {
  /** ISO YYYY-MM-DD */
  date: string
  /** Personalstärke Feldtruppen Achse an der Ostfront, in Millionen */
  axisStrength: number
  /** Personalstärke Feldarmee UdSSR, in Millionen */
  sovietStrength: number
  /** Achsen-Panzer-/Sturmgeschütz-/Jagdpanzer-Produktion im Quartal (Stück) */
  axisTanks: number
  /** Sowjetische Panzer- + SAU-Produktion im Quartal (Stück) */
  sovietTanks: number
  /** Kurze Kontext-Anmerkung */
  note: string
}

export const STRENGTH_DATA: StrengthSnapshot[] = [
  { date: '1941-06-22', axisStrength: 3.8, sovietStrength: 2.7, axisTanks: 820, sovietTanks: 1300, note: 'Beginn Barbarossa' },
  { date: '1941-09-30', axisStrength: 3.4, sovietStrength: 3.33, axisTanks: 900, sovietTanks: 2400, note: 'Beginn Operation Taifun' },
  { date: '1941-12-22', axisStrength: 3.2, sovietStrength: 2.82, axisTanks: 1050, sovietTanks: 2050, note: 'Sowjetische Gegenoffensive vor Moskau' },
  { date: '1942-04-01', axisStrength: 3.1, sovietStrength: 4.19, axisTanks: 1150, sovietTanks: 5200, note: 'Vor Frühlings-Operationen, Front stabilisiert' },
  { date: '1942-06-28', axisStrength: 3.7, sovietStrength: 5.06, axisTanks: 1300, sovietTanks: 6300, note: 'Beginn Fall Blau' },
  { date: '1942-11-19', axisStrength: 3.1, sovietStrength: 6.34, axisTanks: 1600, sovietTanks: 6500, note: 'Beginn Uranus, Stalingrad eingeschlossen' },
  { date: '1943-02-15', axisStrength: 2.8, sovietStrength: 5.89, axisTanks: 2300, sovietTanks: 5800, note: 'Nach Stalingrad, Charkow zurückerobert' },
  { date: '1943-07-05', axisStrength: 3.1, sovietStrength: 6.46, axisTanks: 2700, sovietTanks: 5900, note: 'Beginn Zitadelle (Kursk)' },
  { date: '1943-11-06', axisStrength: 2.85, sovietStrength: 6.82, axisTanks: 3400, sovietTanks: 6200, note: 'Befreiung Kiews' },
  { date: '1944-01-27', axisStrength: 2.41, sovietStrength: 6.27, axisTanks: 4100, sovietTanks: 7200, note: 'Ende Leningrader Blockade' },
  { date: '1944-06-22', axisStrength: 2.4, sovietStrength: 6.45, axisTanks: 5000, sovietTanks: 7400, note: 'Beginn Bagration' },
  { date: '1944-10-01', axisStrength: 2.08, sovietStrength: 6.71, axisTanks: 5400, sovietTanks: 7300, note: 'Front an der Reichsgrenze' },
  { date: '1945-01-12', axisStrength: 2.3, sovietStrength: 6.46, axisTanks: 4400, sovietTanks: 7100, note: 'Beginn Weichsel-Oder-Operation' },
  { date: '1945-02-15', axisStrength: 2.0, sovietStrength: 6.5, axisTanks: 3000, sovietTanks: 6500, note: 'Front an der Oder, Schlesien' },
  { date: '1945-04-16', axisStrength: 1.7, sovietStrength: 6.4, axisTanks: 1400, sovietTanks: 5000, note: 'Beginn Berliner Operation' },
  { date: '1945-05-08', axisStrength: 1.0, sovietStrength: 6.3, axisTanks: 300, sovietTanks: 1500, note: 'Bedingungslose Kapitulation' },
]

export const STRENGTH_START = new Date(STRENGTH_DATA[0]!.date)
export const STRENGTH_END = new Date(STRENGTH_DATA[STRENGTH_DATA.length - 1]!.date)

export interface InterpolatedStrength {
  axisStrength: number
  sovietStrength: number
  axisTanks: number
  sovietTanks: number
}

export function interpolateStrengthAt(date: Date): InterpolatedStrength {
  const ts = date.getTime()
  const first = STRENGTH_DATA[0]!
  const last = STRENGTH_DATA[STRENGTH_DATA.length - 1]!
  if (ts <= new Date(first.date).getTime()) return pick(first)
  if (ts >= new Date(last.date).getTime()) return pick(last)
  for (let i = 0; i < STRENGTH_DATA.length - 1; i++) {
    const a = STRENGTH_DATA[i]!
    const b = STRENGTH_DATA[i + 1]!
    const ta = new Date(a.date).getTime()
    const tb = new Date(b.date).getTime()
    if (ts >= ta && ts <= tb) {
      const t = (ts - ta) / (tb - ta)
      return {
        axisStrength: lerp(a.axisStrength, b.axisStrength, t),
        sovietStrength: lerp(a.sovietStrength, b.sovietStrength, t),
        axisTanks: lerp(a.axisTanks, b.axisTanks, t),
        sovietTanks: lerp(a.sovietTanks, b.sovietTanks, t),
      }
    }
  }
  return pick(last)
}

function pick(s: StrengthSnapshot): InterpolatedStrength {
  return {
    axisStrength: s.axisStrength,
    sovietStrength: s.sovietStrength,
    axisTanks: s.axisTanks,
    sovietTanks: s.sovietTanks,
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
