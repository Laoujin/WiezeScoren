import { describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG } from './contracten'
import {
  heeftOverrides,
  hernoemSpeler,
  maakRonde,
  nieuwSpel,
  rondeSluit,
  totalen,
  verwijderRonde,
  verloop,
  voegRondeToe,
  wisOverrides,
  zetDeler,
  zetOverride,
  type Spel,
} from './spel'

const config = STANDAARD_CONFIG

function metRonde(spel: Spel, over: Parameters<typeof maakRonde>[0]): Spel {
  return voegRondeToe(spel, maakRonde(over))
}

describe('nieuwSpel', () => {
  it('start met vier standaardnamen, deler 0 en geen rondes', () => {
    const spel = nieuwSpel()
    expect(spel.spelers).toHaveLength(4)
    expect(spel.deler).toBe(0)
    expect(spel.rondes).toEqual([])
  })

  it('neemt opgegeven namen over', () => {
    expect(nieuwSpel(['An', 'Bo', 'Cis', 'Dirk']).spelers).toEqual(['An', 'Bo', 'Cis', 'Dirk'])
  })
})

describe('voegRondeToe', () => {
  it('legt de deler van dat moment vast in de ronde', () => {
    const spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    expect(spel.rondes[0]?.deler).toBe(0)
  })

  it('schuift de deler met de klok mee', () => {
    let spel = nieuwSpel()
    for (let i = 0; i < 5; i++) {
      spel = metRonde(spel, { contract: 'passen', spelers: [], slagen: 0 })
    }
    expect(spel.deler).toBe(1)
    expect(spel.rondes.map((r) => r.deler)).toEqual([0, 1, 2, 3, 0])
  })

  it('laat de deler staan bij een correctie', () => {
    const spel = metRonde(nieuwSpel(), { contract: 'correctie', spelers: [], slagen: 0 })
    expect(spel.deler).toBe(0)
  })
})

describe('verwijderRonde', () => {
  it('draait de deler terug', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'passen', spelers: [], slagen: 0 })
    const id = spel.rondes[0]!.id
    spel = verwijderRonde(spel, id)
    expect(spel.rondes).toEqual([])
    expect(spel.deler).toBe(0)
  })

  it('laat de deler staan bij het wissen van een correctie', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    spel = metRonde(spel, { contract: 'correctie', spelers: [], slagen: 0 })
    spel = verwijderRonde(spel, spel.rondes[1]!.id)
    expect(spel.deler).toBe(1)
  })
})

describe('totalen', () => {
  it('telt alle rondes op', () => {
    let spel = nieuwSpel()
    spel = metRonde(spel, { contract: 'vragen', spelers: [0, 1], slagen: 9 })
    spel = metRonde(spel, { contract: 'abondance', spelers: [2], slagen: 9 })
    expect(totalen(spel, config)).toEqual({ 0: -12, 1: -12, 2: 42, 3: -18 })
  })

  it('is nul voor een leeg spel', () => {
    expect(totalen(nieuwSpel(), config)).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
  })
})

describe('overrides', () => {
  it('vervangt de berekende punten van één speler', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    const id = spel.rondes[0]!.id
    spel = zetOverride(spel, id, 0, 7)
    expect(verloop(spel, config)[0]!.punten).toEqual({ 0: 7, 1: 2, 2: -2, 3: -2 })
    expect(totalen(spel, config)[0]).toBe(7)
  })

  it('markeert de ronde als handmatig aangepast', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    expect(heeftOverrides(spel.rondes[0]!)).toBe(false)
    spel = zetOverride(spel, spel.rondes[0]!.id, 0, 7)
    expect(heeftOverrides(spel.rondes[0]!)).toBe(true)
  })

  it('herstelt de berekening bij het wissen', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    const id = spel.rondes[0]!.id
    spel = wisOverrides(zetOverride(spel, id, 0, 7), id)
    expect(verloop(spel, config)[0]!.punten[0]).toBe(2)
    expect(heeftOverrides(spel.rondes[0]!)).toBe(false)
  })

  it('draagt de punten van een correctie volledig', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'correctie', spelers: [], slagen: 0 })
    const id = spel.rondes[0]!.id
    spel = zetOverride(zetOverride(spel, id, 0, 5), id, 3, -5)
    expect(totalen(spel, config)).toEqual({ 0: 5, 1: 0, 2: 0, 3: -5 })
  })
})

describe('rondeSluit', () => {
  it('is waar wanneer de punten optellen tot nul', () => {
    const spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    expect(rondeSluit(verloop(spel, config)[0]!)).toBe(true)
  })

  it('is onwaar zodra een override het evenwicht breekt', () => {
    let spel = metRonde(nieuwSpel(), { contract: 'vragen', spelers: [0, 1], slagen: 8 })
    spel = zetOverride(spel, spel.rondes[0]!.id, 0, 7)
    expect(rondeSluit(verloop(spel, config)[0]!)).toBe(false)
  })
})

describe('spelers', () => {
  it('hernoemt een speler', () => {
    expect(hernoemSpeler(nieuwSpel(), 2, 'Marleen').spelers[2]).toBe('Marleen')
  })

  it('valt terug op de standaardnaam bij een lege invoer', () => {
    const spel = hernoemSpeler(nieuwSpel(['An', 'Bo', 'Cis', 'Dirk']), 1, '   ')
    expect(spel.spelers[1]).toBe('Speler 2')
  })

  it('zet de deler', () => {
    expect(zetDeler(nieuwSpel(), 3).deler).toBe(3)
  })
})
