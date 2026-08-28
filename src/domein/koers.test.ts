import { describe, expect, it } from 'vitest'
import { BAAN_FINISH, BAAN_START, klapperVan, rennerVeld, stemming } from './koers'

const namen = ['An', 'Bo', 'Cis', 'Dirk']

describe('rennerVeld', () => {
  it('houdt de baanorde gelijk aan de spelersorde', () => {
    const veld = rennerVeld({ 0: 5, 1: -3, 2: 0, 3: 12 }, namen)
    expect(veld.map((r) => r.speler)).toEqual([0, 1, 2, 3])
    expect(veld.map((r) => r.naam)).toEqual(namen)
  })

  it('zet de leider op de finish en de laatste aan de start', () => {
    const veld = rennerVeld({ 0: 5, 1: -3, 2: 0, 3: 12 }, namen)
    expect(veld[3]!.positie).toBe(BAAN_FINISH)
    expect(veld[1]!.positie).toBe(BAAN_START)
    expect(veld[0]!.positie).toBeGreaterThan(veld[2]!.positie)
  })

  it('zet iedereen samen in het midden zolang alle totalen gelijk zijn', () => {
    const veld = rennerVeld({ 0: 0, 1: 0, 2: 0, 3: 0 }, namen)
    expect(veld.map((r) => r.positie)).toEqual([50, 50, 50, 50])
    expect(veld.some((r) => r.geleTrui)).toBe(false)
    expect(veld.some((r) => r.rodeLantaarn)).toBe(false)
  })

  it('geeft de trui aan de leider en de lantaarn aan de laatste', () => {
    const veld = rennerVeld({ 0: 5, 1: -3, 2: 0, 3: 12 }, namen)
    expect(veld.filter((r) => r.geleTrui).map((r) => r.speler)).toEqual([3])
    expect(veld.filter((r) => r.rodeLantaarn).map((r) => r.speler)).toEqual([1])
  })

  it('deelt trui en lantaarn bij gelijke stand', () => {
    const veld = rennerVeld({ 0: 7, 1: 7, 2: -2, 3: -2 }, namen)
    expect(veld.filter((r) => r.geleTrui).map((r) => r.speler)).toEqual([0, 1])
    expect(veld.filter((r) => r.rodeLantaarn).map((r) => r.speler)).toEqual([2, 3])
  })

  it('geeft gelijke totalen dezelfde plaats en slaat de volgende over', () => {
    const veld = rennerVeld({ 0: 7, 1: 7, 2: 1, 3: -2 }, namen)
    expect(veld.map((r) => r.plaats)).toEqual([1, 1, 3, 4])
  })
})

describe('stemming', () => {
  it('kijkt zuur bij verlies en zelfzeker bij winst', () => {
    expect(stemming(40)).toBe('🤩')
    expect(stemming(8)).toBe('😎')
    expect(stemming(0)).toBe('😐')
    expect(stemming(-8)).toBe('😬')
    expect(stemming(-40)).toBe('💀')
  })
})

describe('klapperVan', () => {
  it('meldt de grootste uitschieter van de rit', () => {
    expect(klapperVan({ 0: 45, 1: -15, 2: -15, 3: -15 }, namen)).toEqual({
      naam: 'An',
      punten: 45,
    })
  })

  it('kiest ook een dieptepunt als dat de grootste uitschieter is', () => {
    expect(klapperVan({ 0: 50, 1: -150, 2: 50, 3: 50 }, namen)).toEqual({
      naam: 'Bo',
      punten: -150,
    })
  })

  it('zwijgt bij een gewone rit', () => {
    expect(klapperVan({ 0: 3, 1: -3, 2: 3, 3: -3 }, namen)).toBeNull()
  })
})
