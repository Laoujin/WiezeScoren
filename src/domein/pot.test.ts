import { describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG, type Config, type SpelerId } from './contracten'
import { somVan, speelRonde } from './score'
import type { Ronde } from './spel'

const config = STANDAARD_CONFIG

function ronde(over: Partial<Ronde>): Ronde {
  return { id: 'r', deler: 0, contract: 'passen', spelers: [], slagen: 0, ...over }
}

function sluit(uitkomst: { punten: Record<SpelerId, number>; potVoor: number; potNa: number }) {
  return somVan(uitkomst.punten) + (uitkomst.potNa - uitkomst.potVoor) === 0
}

describe('pasronde', () => {
  it('laat elke speler 3 punten per madam betalen en stopt die in de pot', () => {
    const uitkomst = speelRonde(ronde({ madams: { 0: 2, 1: 1, 3: 1 } }), config, 0)
    expect(uitkomst.punten).toEqual({ 0: -6, 1: -3, 2: 0, 3: -3 })
    expect(uitkomst.potNa).toBe(12)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('stapelt op een pot die al gevuld is', () => {
    expect(speelRonde(ronde({ madams: { 2: 4 } }), config, 12).potNa).toBe(24)
  })

  it('volgt de ingestelde madamwaarde', () => {
    const eigen: Config = { ...config, madamWaarde: 5 }
    const uitkomst = speelRonde(ronde({ madams: { 0: 4 } }), eigen, 0)
    expect(uitkomst.punten[0]).toBe(-20)
    expect(uitkomst.potNa).toBe(20)
  })

  it('doet niets zonder toegewezen madams', () => {
    const uitkomst = speelRonde(ronde({}), config, 12)
    expect(uitkomst.punten).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
    expect(uitkomst.potNa).toBe(12)
  })
})

describe('contracten die de pot winnen', () => {
  it('geeft de pot aan de solist bovenop zijn contractpunten', () => {
    const uitkomst = speelRonde(
      ronde({ contract: 'abondance', spelers: [1], slagen: 9 }),
      config,
      12,
    )
    expect(uitkomst.punten).toEqual({ 0: -15, 1: 57, 2: -15, 3: -15 })
    expect(uitkomst.potNa).toBe(0)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('laat de verliezer de pot verdubbelen uit eigen zak', () => {
    const uitkomst = speelRonde(
      ronde({ contract: 'abondance', spelers: [1], slagen: 8 }),
      config,
      12,
    )
    expect(uitkomst.punten).toEqual({ 0: 15, 1: -57, 2: 15, 3: 15 })
    expect(uitkomst.potNa).toBe(24)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('deelt de pot tussen twee miseriespelers', () => {
    const uitkomst = speelRonde(
      ronde({ contract: 'miserie', spelers: [0, 2], slagen: 0 }),
      config,
      12,
    )
    expect(uitkomst.punten).toEqual({ 0: 21, 1: -15, 2: 21, 3: -15 })
    expect(uitkomst.potNa).toBe(0)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('verdeelt een oneven pot zonder punten te laten verdwijnen', () => {
    const uitkomst = speelRonde(
      ronde({ contract: 'miserie', spelers: [0, 2], slagen: 0 }),
      config,
      9,
    )
    expect(uitkomst.punten[0] + uitkomst.punten[2]).toBe(15 + 15 + 9)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('laat een lege pot de uitkomst onveranderd', () => {
    const uitkomst = speelRonde(
      ronde({ contract: 'soloSlim', spelers: [0], slagen: 13 }),
      config,
      0,
    )
    expect(uitkomst.punten[0]).toBe(150)
    expect(uitkomst.potNa).toBe(0)
  })
})

describe('contracten die de pot niet raken', () => {
  it.each([
    ['vragen', [0, 1] as SpelerId[], 8],
    ['troel', [0, 1] as SpelerId[], 8],
    ['alleen', [2] as SpelerId[], 5],
  ] as const)('laat de pot staan bij %s', (contract, spelers, slagen) => {
    const uitkomst = speelRonde(ronde({ contract, spelers, slagen }), config, 12)
    expect(uitkomst.potNa).toBe(12)
    expect(sluit(uitkomst)).toBe(true)
  })

  it('laat de pot staan bij een correctie', () => {
    expect(speelRonde(ronde({ contract: 'correctie' }), config, 24).potNa).toBe(24)
  })
})
