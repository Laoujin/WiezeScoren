import type { CSSProperties } from 'react'
import { POT, type Knoop } from '../domein/betalingen'
import type { SpelerId } from '../domein/contracten'

/** Een plek op de tafel, in procent van de tafelbreedte en -hoogte. */
export type Plek = { x: number; y: number }

/**
 * Waar elke plaquette en de bijhorende delerfiche staan. De zetels liggen met de klok mee vanaf
 * onderaan.
 */
export const ZETELS: Record<SpelerId, { plaquette: Plek; deler: Plek }> = {
  0: { plaquette: { x: 50, y: 87 }, deler: { x: 50, y: 65 } },
  1: { plaquette: { x: 15, y: 50 }, deler: { x: 38, y: 50 } },
  2: { plaquette: { x: 50, y: 13 }, deler: { x: 50, y: 35 } },
  3: { plaquette: { x: 85, y: 50 }, deler: { x: 62, y: 50 } },
}

export const POT_PLEK: Plek = { x: 50, y: 50 }

export function plekVan(knoop: Knoop): Plek {
  return knoop === POT ? POT_PLEK : ZETELS[knoop].plaquette
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
