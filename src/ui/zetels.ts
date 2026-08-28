import type { SpelerId } from '../domein/contracten'

/** Vaste zetelkenmerken: de stoelen liggen met de klok mee vanaf onderaan. */
export const ZETELS: Record<SpelerId, { kleur: string; rood: boolean; x: string; y: string; chipX: string; chipY: string }> = {
  0: { kleur: '♠', rood: false, x: '50%', y: '88%', chipX: '50%', chipY: '70%' },
  1: { kleur: '♥', rood: true, x: '16%', y: '50%', chipX: '40%', chipY: '50%' },
  2: { kleur: '♦', rood: true, x: '50%', y: '12%', chipX: '50%', chipY: '30%' },
  3: { kleur: '♣', rood: false, x: '84%', y: '50%', chipX: '60%', chipY: '50%' },
}

export function tekenPunt(punten: number): string {
  return punten > 0 ? `+${punten}` : `${punten}`
}

export function puntKleur(punten: number): string {
  if (punten > 0) return 'text-munt'
  if (punten < 0) return 'text-hart'
  return 'text-krijt-dof'
}
