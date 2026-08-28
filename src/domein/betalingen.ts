import { SPELER_IDS, type SpelerId } from './contracten'
import type { RondeUitkomst } from './score'

export const POT = 'pot'

export type Knoop = SpelerId | typeof POT

export type Betaling = { van: Knoop; naar: Knoop; bedrag: number }

type Saldo = { knoop: Knoop; rest: number }

/**
 * Zet een ronde-uitkomst om in de betalingen die eronder liggen. De pot telt mee als vijfde
 * knoop, met zijn aangroei als saldo. De koppeling loopt op volgorde, wat bij een normale ronde
 * neerkomt op de echte contractstroom: elke tegenstander tegenover een spelend kamplid.
 */
export function betalingen({ punten, potVoor, potNa }: RondeUitkomst): Betaling[] {
  const saldi: Saldo[] = [
    ...SPELER_IDS.map((speler) => ({ knoop: speler as Knoop, rest: punten[speler] })),
    { knoop: POT, rest: potNa - potVoor },
  ]
  const betalers = saldi.filter((s) => s.rest < 0).map((s) => ({ ...s, rest: -s.rest }))
  const ontvangers = saldi.filter((s) => s.rest > 0).map((s) => ({ ...s }))

  const stroom: Betaling[] = []
  let i = 0
  let j = 0
  while (i < betalers.length && j < ontvangers.length) {
    const betaler = betalers[i]!
    const ontvanger = ontvangers[j]!
    const bedrag = Math.min(betaler.rest, ontvanger.rest)
    stroom.push({ van: betaler.knoop, naar: ontvanger.knoop, bedrag })
    betaler.rest -= bedrag
    ontvanger.rest -= bedrag
    if (betaler.rest === 0) i++
    if (ontvanger.rest === 0) j++
  }
  return stroom
}

/** Wat een knoop netto overhoudt aan een reeks betalingen. */
export function saldoVan(stroom: Betaling[], knoop: Knoop): number {
  return stroom.reduce(
    (totaal, b) => totaal + (b.naar === knoop ? b.bedrag : 0) - (b.van === knoop ? b.bedrag : 0),
    0,
  )
}
