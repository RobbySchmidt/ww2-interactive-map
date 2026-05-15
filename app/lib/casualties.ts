/**
 * Verluste-Schätzungen pro Schlacht.
 * Parst die `casualties`-Strings aus battles.ts und interpoliert linear über die Schlachtendauer.
 */

import type { Battle } from '~/data/battles'

/** Extrahiert die erste numerische Größe aus einem String wie "~800.000 (~150.000 gefallen, …)". */
export function parseCasualtyTotal(s: string | undefined): number | null {
  if (!s) return null
  // Erste Sequenz aus Ziffern und Punkten (deutsche Tausendertrennung)
  const match = s.match(/(\d[\d.]*)/)
  if (!match) return null
  const cleaned = match[1]!.replace(/\./g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : null
}

export interface BattleCasualtyEstimate {
  battle: Battle
  daysElapsed: number
  totalDays: number
  progress: number // 0..1
  axisTotal: number | null
  sovietTotal: number | null
  axisCumulative: number
  sovietCumulative: number
  combinedCumulative: number
  combinedDaily: number
}

export function estimateCasualties(battle: Battle, currentDate: Date): BattleCasualtyEstimate {
  const start = new Date(battle.start).getTime()
  const end = new Date(battle.end).getTime()
  const now = currentDate.getTime()
  const day = 86400000
  const totalDays = Math.max(1, Math.round((end - start) / day))
  const daysElapsed = Math.max(0, Math.min(totalDays, Math.round((now - start) / day)))
  const progress = totalDays > 0 ? daysElapsed / totalDays : 0

  const axisTotal = parseCasualtyTotal(battle.forces.find((f) => f.side === 'axis')?.casualties)
  const sovietTotal = parseCasualtyTotal(battle.forces.find((f) => f.side === 'soviet')?.casualties)

  const axisCum = axisTotal !== null ? Math.round(axisTotal * progress) : 0
  const sovietCum = sovietTotal !== null ? Math.round(sovietTotal * progress) : 0
  const combinedTotal = (axisTotal ?? 0) + (sovietTotal ?? 0)
  const combinedCum = axisCum + sovietCum
  const combinedDaily = totalDays > 0 ? Math.round(combinedTotal / totalDays) : 0

  return {
    battle,
    daysElapsed,
    totalDays,
    progress,
    axisTotal,
    sovietTotal,
    axisCumulative: axisCum,
    sovietCumulative: sovietCum,
    combinedCumulative: combinedCum,
    combinedDaily,
  }
}

/**
 * Wählt die prominente aktive Großschlacht zum Datum (höchste Gesamt-Verluste).
 * Belagerungen wie Leningrad (872 Tage, > 2 Mio Verluste) würden alles dominieren,
 * daher Bonus für kürzere, intensivere Schlachten via Verluste/Tag.
 */
export function pickProminentBattle(battles: Battle[], currentDate: Date): Battle | null {
  const ts = currentDate.getTime()
  const active = battles.filter((b) => {
    if (!b.major) return false
    return new Date(b.start).getTime() <= ts && new Date(b.end).getTime() >= ts
  })
  if (active.length === 0) return null

  let best: Battle | null = null
  let bestScore = -Infinity
  for (const b of active) {
    const est = estimateCasualties(b, currentDate)
    // Score = Intensität (Verluste/Tag) — Stalingrad ~12k, Berlin ~50k, Leningrad ~2k
    const score = est.combinedDaily
    if (score > bestScore) {
      bestScore = score
      best = b
    }
  }
  return best
}
