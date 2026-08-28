import type { CSSProperties } from 'react'
import { POT, type Knoop } from '../domein/betalingen'
import type { SpelerId } from '../domein/contracten'
import type { Tafelvorm } from '../domein/voorkeuren'

/** Een plek op de tafel, in procent van de tafelbreedte en -hoogte. */
export type Plek = { x: number; y: number }

export type Zetel = { plaquette: Plek; deler: Plek }

/**
 * Waar elke plaquette en de bijhorende delerfiche staan. Beide vormen houden dezelfde
 * draairichting aan, zodat de deler bij het wisselen van vorm dezelfde kant op blijft schuiven.
 */
const ZETELS_PER_VORM: Record<Tafelvorm, Record<SpelerId, Zetel>> = {
  rond: {
    0: { plaquette: { x: 50, y: 87 }, deler: { x: 50, y: 65 } },
    1: { plaquette: { x: 15, y: 50 }, deler: { x: 38, y: 50 } },
    2: { plaquette: { x: 50, y: 13 }, deler: { x: 50, y: 35 } },
    3: { plaquette: { x: 85, y: 50 }, deler: { x: 62, y: 50 } },
  },
  vierkant: {
    0: { plaquette: { x: 26, y: 78 }, deler: { x: 36, y: 68 } },
    1: { plaquette: { x: 26, y: 22 }, deler: { x: 36, y: 32 } },
    2: { plaquette: { x: 74, y: 22 }, deler: { x: 64, y: 32 } },
    3: { plaquette: { x: 74, y: 78 }, deler: { x: 64, y: 68 } },
  },
}

export function zetelsVan(vorm: Tafelvorm): Record<SpelerId, Zetel> {
  return ZETELS_PER_VORM[vorm]
}

export const POT_PLEK: Plek = { x: 50, y: 50 }

export function plekVan(knoop: Knoop, vorm: Tafelvorm): Plek {
  return knoop === POT ? POT_PLEK : zetelsVan(vorm)[knoop].plaquette
}

export function plaats({ x, y }: Plek): CSSProperties {
  return { left: `${x}%`, top: `${y}%` }
}

export function tekenPunt(punten: number): string {
  return punten > 0 ? `+${punten}` : `${punten}`
}

export function puntKleur(punten: number): string {
  if (punten > 0) return 'text-munt'
  if (punten < 0) return 'text-hart'
  return 'text-krijt-dof'
}
