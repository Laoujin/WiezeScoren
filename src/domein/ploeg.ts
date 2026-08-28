import type { SpelerId } from './contracten'

export type Ploeglid = {
  id: string
  naam: string
  /** Pad naar de avatar onder `public/`; zonder foto valt de weergave terug op initialen. */
  avatar?: string
}

export const STANDAARD_PLOEG: Ploeglid[] = [
  { id: 'wouter', naam: 'Wouter' },
  { id: 'gert', naam: 'Gert' },
  { id: 'moe', naam: 'Moe' },
  { id: 'va', naam: 'Va' },
  { id: 'zus', naam: 'Zus' },
]

/** Zit de speler al aan tafel, dan ruilen de twee zetels van plaats. */
export function zetOpZetel(spelers: string[], zetel: SpelerId, naam: string): string[] {
  const vorige = spelers.indexOf(naam)
  const nieuw = [...spelers]
  if (vorige !== -1) nieuw[vorige] = spelers[zetel]!
  nieuw[zetel] = naam
  return nieuw
}

export function hernoemInPloeg(ploeg: Ploeglid[], oud: string, nieuw: string): Ploeglid[] {
  const naam = nieuw.trim()
  if (!naam) return ploeg
  return ploeg.map((lid) => (lid.naam === oud ? { ...lid, naam } : lid))
}

export function initialen(naam: string): string {
  const letters = naam
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((woord) => woord[0]!.toUpperCase())
  return letters.slice(0, 2).join('') || '?'
}
