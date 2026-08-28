import { SPELER_IDS, type SpelerId } from './contracten'
import type { Punten } from './score'

/** De baan loopt van start tot finish in procent, met marge voor de renner zelf. */
export const BAAN_START = 6
export const BAAN_FINISH = 94

export type Renner = {
  speler: SpelerId
  naam: string
  totaal: number
  positie: number
  plaats: number
  geleTrui: boolean
  rodeLantaarn: boolean
}

/**
 * Zet de vier totalen om in een veld renners. De baanorde blijft de spelersorde, zodat niemand
 * van rijstrook wisselt terwijl de cijfers veranderen.
 */
export function rennerVeld(totalen: Punten, namen: string[]): Renner[] {
  const waarden = SPELER_IDS.map((s) => totalen[s])
  const hoogste = Math.max(...waarden)
  const laagste = Math.min(...waarden)
  const spreiding = hoogste - laagste

  return SPELER_IDS.map((speler) => {
    const totaal = totalen[speler]
    return {
      speler,
      naam: namen[speler] ?? '',
      totaal,
      positie: spreiding
        ? BAAN_START + ((totaal - laagste) / spreiding) * (BAAN_FINISH - BAAN_START)
        : 50,
      plaats: 1 + waarden.filter((w) => w > totaal).length,
      geleTrui: spreiding > 0 && totaal === hoogste,
      rodeLantaarn: spreiding > 0 && totaal === laagste,
    }
  })
}

/** Hoe een renner erbij loopt na zijn laatste rit. */
export function stemming(punten: number): string {
  if (punten >= 25) return '🤩'
  if (punten > 0) return '😎'
  if (punten === 0) return '😐'
  if (punten > -25) return '😬'
  return '💀'
}

export const KLAPPER_DREMPEL = 15

/** De uitschieter van één rit, groot genoeg om er een stempel op te zetten. */
export function klapperVan(
  punten: Punten,
  namen: string[],
): { naam: string; punten: number } | null {
  const top = SPELER_IDS.reduce((beste, speler) =>
    Math.abs(punten[speler]) > Math.abs(punten[beste]) ? speler : beste,
  )
  if (Math.abs(punten[top]) < KLAPPER_DREMPEL) return null
  return { naam: namen[top] ?? '', punten: punten[top] }
}
