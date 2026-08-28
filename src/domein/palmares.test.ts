import { describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG, type ContractType, type SpelerId } from './contracten'
import { speelRonde } from './score'
import type { Rondestand } from './spel'
import { palmares, partijFeiten } from './palmares'

const namen = ['An', 'Bo', 'Cis', 'Dirk']
const config = STANDAARD_CONFIG

function verloopVan(
  invoer: {
    contract: ContractType
    spelers: SpelerId[]
    slagen: number
    madams?: Partial<Record<SpelerId, number>>
    overrides?: Partial<Record<SpelerId, number>>
  }[],
): Rondestand[] {
  let pot = 0
  return invoer.map((r, i) => {
    const ronde = { id: `r${i}`, deler: 0 as SpelerId, ...r }
    const uitkomst = speelRonde(ronde, config, pot)
    pot = uitkomst.potNa
    return { ...uitkomst, ronde }
  })
}

const partij = verloopVan([
  { contract: 'vragen', spelers: [0, 1], slagen: 9 },
  { contract: 'passen', spelers: [], slagen: 0, madams: { 1: 2, 3: 2 } },
  { contract: 'miserie', spelers: [3], slagen: 0 },
  { contract: 'soloSlim', spelers: [1], slagen: 9 },
  { contract: 'miserie', spelers: [3], slagen: 1 },
  { contract: 'miserie', spelers: [3], slagen: 0 },
])

function award(titel: string) {
  return palmares(partij, namen, config).find((e) => e.titel === titel)
}

describe('palmares', () => {
  it('levert niets op voor een partij zonder rondes', () => {
    expect(palmares([], namen, config)).toEqual([])
  })

  it('kroont de leider en de hekkensluiter', () => {
    expect(award('Gele trui')?.winnaar).toBe('Dirk')
    expect(award('Rode lantaarn')?.winnaar).toBe('Bo')
  })

  it('vindt de grootste klapper en de zwaarste smak van één ronde', () => {
    const klapper = award('Grootste klapper')
    expect(klapper?.winnaar).toBe('Dirk')
    expect(klapper?.detail).toContain('Miserie')
    expect(award('Zwaarste smak')?.winnaar).toBe('Bo')
  })

  it('kroont wie het meest miserie speelde', () => {
    const koning = award('Miseriekoning')
    expect(koning?.winnaar).toBe('Dirk')
    expect(koning?.detail).toContain('3')
  })

  it('kroont wie het vaakst aanviel', () => {
    expect(award('Aanvaller')?.winnaar).toBe('Dirk')
  })

  it('kroont wie de meeste premies uit de pot haalde', () => {
    const graaier = award('Potgraaier')
    expect(graaier?.winnaar).toBe('Dirk')
    expect(graaier?.detail).toContain('12')
  })

  it('laat een award weg als niemand hem verdient', () => {
    const zonderMiserie = verloopVan([{ contract: 'vragen', spelers: [0, 1], slagen: 9 }])
    expect(palmares(zonderMiserie, namen, config).map((e) => e.titel)).not.toContain('Miseriekoning')
  })
})

describe('partijFeiten', () => {
  it('telt rondes, pasrondes, hoogste pot en handmatige ingrepen', () => {
    const feiten = partijFeiten(partij)
    expect(feiten.rondes).toBe(6)
    expect(feiten.pasrondes).toBe(1)
    expect(feiten.hoogstePot).toBe(12)
    expect(feiten.handmatig).toBe(0)
  })

  it('telt rondes met een overschreven punt', () => {
    const metHand = verloopVan([
      { contract: 'vragen', spelers: [0, 1], slagen: 9, overrides: { 0: 4 } },
    ])
    expect(partijFeiten(metHand).handmatig).toBe(1)
  })
})
