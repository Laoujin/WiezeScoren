import { describe, expect, it } from 'vitest'
import { betalingen, saldoVan } from './betalingen'
import { GEEN_PUNTEN } from './score'

const geen = { ...GEEN_PUNTEN }

describe('betalingen', () => {
  it('koppelt bij vragen elke tegenstander aan een spelend kamplid', () => {
    expect(
      betalingen({ punten: { 0: 2, 1: -2, 2: 2, 3: -2 }, potVoor: 0, potNa: 0 }),
    ).toEqual([
      { van: 1, naar: 0, bedrag: 2 },
      { van: 3, naar: 2, bedrag: 2 },
    ])
  })

  it('laat bij alleen gaan de drie tegenstanders naar de solist betalen', () => {
    expect(
      betalingen({ punten: { 0: 6, 1: -2, 2: -2, 3: -2 }, potVoor: 0, potNa: 0 }),
    ).toEqual([
      { van: 1, naar: 0, bedrag: 2 },
      { van: 2, naar: 0, bedrag: 2 },
      { van: 3, naar: 0, bedrag: 2 },
    ])
  })

  it('stuurt de madams van een pasronde naar de pot', () => {
    expect(
      betalingen({ punten: { 0: -3, 1: -6, 2: -3, 3: 0 }, potVoor: 0, potNa: 12 }),
    ).toEqual([
      { van: 0, naar: 'pot', bedrag: 3 },
      { van: 1, naar: 'pot', bedrag: 6 },
      { van: 2, naar: 'pot', bedrag: 3 },
    ])
  })

  it('laat de pot meebetalen aan een gewonnen abondance', () => {
    expect(
      betalingen({ punten: { 0: 57, 1: -15, 2: -15, 3: -15 }, potVoor: 12, potNa: 0 }),
    ).toEqual([
      { van: 1, naar: 0, bedrag: 15 },
      { van: 2, naar: 0, bedrag: 15 },
      { van: 3, naar: 0, bedrag: 15 },
      { van: 'pot', naar: 0, bedrag: 12 },
    ])
  })

  it('laat de solist bij een verloren abondance ook de pot volstorten', () => {
    expect(
      betalingen({ punten: { 0: -57, 1: 15, 2: 15, 3: 15 }, potVoor: 12, potNa: 24 }),
    ).toEqual([
      { van: 0, naar: 1, bedrag: 15 },
      { van: 0, naar: 2, bedrag: 15 },
      { van: 0, naar: 3, bedrag: 15 },
      { van: 0, naar: 'pot', bedrag: 12 },
    ])
  })

  it('splitst een betaling wanneer de bedragen niet gelijk lopen', () => {
    expect(
      betalingen({ punten: { 0: 20, 1: 20, 2: -15, 3: -15 }, potVoor: 10, potNa: 0 }),
    ).toEqual([
      { van: 2, naar: 0, bedrag: 15 },
      { van: 3, naar: 0, bedrag: 5 },
      { van: 3, naar: 1, bedrag: 10 },
      { van: 'pot', naar: 1, bedrag: 10 },
    ])
  })

  it('geeft niets terug voor een ronde zonder beweging', () => {
    expect(betalingen({ punten: geen, potVoor: 7, potNa: 7 })).toEqual([])
  })

  it('negeert het overschot van een ronde die niet sluit', () => {
    expect(betalingen({ punten: { 0: 5, 1: -2, 2: 0, 3: 0 }, potVoor: 0, potNa: 0 })).toEqual([
      { van: 1, naar: 0, bedrag: 2 },
    ])
  })
})

describe('saldoVan', () => {
  const stroom = [
    { van: 1 as const, naar: 0 as const, bedrag: 2 },
    { van: 1 as const, naar: 2 as const, bedrag: 3 },
    { van: 'pot' as const, naar: 0 as const, bedrag: 5 },
  ]

  it('telt op wat een knoop ontvangt', () => {
    expect(saldoVan(stroom, 0)).toBe(7)
  })

  it('telt af wat een knoop betaalt', () => {
    expect(saldoVan(stroom, 1)).toBe(-5)
  })

  it('geeft nul voor wie buiten de stroom blijft', () => {
    expect(saldoVan(stroom, 3)).toBe(0)
  })

  it('rekent de pot mee als knoop', () => {
    expect(saldoVan(stroom, 'pot')).toBe(-5)
  })
})
