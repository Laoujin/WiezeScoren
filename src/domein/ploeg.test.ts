import { describe, expect, it } from 'vitest'
import { STANDAARD_PLOEG, hernoemInPloeg, initialen, zetOpZetel, type Ploeglid } from './ploeg'

const PLOEG: Ploeglid[] = [
  { id: 'a', naam: 'Wouter' },
  { id: 'b', naam: 'Gert' },
  { id: 'c', naam: 'Moe' },
]

describe('STANDAARD_PLOEG', () => {
  it('bevat de vijf vaste spelers', () => {
    expect(STANDAARD_PLOEG.map((l) => l.naam)).toEqual(['Wouter', 'Gert', 'Moe', 'Va', 'Zus'])
  })

  it('geeft elk lid een eigen id', () => {
    expect(new Set(STANDAARD_PLOEG.map((l) => l.id)).size).toBe(STANDAARD_PLOEG.length)
  })
})

describe('zetOpZetel', () => {
  it('zet iemand op een vrije zetel', () => {
    expect(zetOpZetel(['Wouter', 'Gert', 'Moe', 'Va'], 3, 'Zus')).toEqual([
      'Wouter',
      'Gert',
      'Moe',
      'Zus',
    ])
  })

  it('wisselt twee zetels wanneer de speler al aan tafel zit', () => {
    expect(zetOpZetel(['Wouter', 'Gert', 'Moe', 'Va'], 0, 'Moe')).toEqual([
      'Moe',
      'Gert',
      'Wouter',
      'Va',
    ])
  })

  it('laat de tafel ongemoeid wanneer de speler er al zit', () => {
    const tafel = ['Wouter', 'Gert', 'Moe', 'Va']
    expect(zetOpZetel(tafel, 1, 'Gert')).toEqual(tafel)
  })
})

describe('hernoemInPloeg', () => {
  it('hernoemt het lid met die naam', () => {
    expect(hernoemInPloeg(PLOEG, 'Gert', 'Gerrit')).toEqual([
      { id: 'a', naam: 'Wouter' },
      { id: 'b', naam: 'Gerrit' },
      { id: 'c', naam: 'Moe' },
    ])
  })

  it('laat de ploeg staan voor een naam die er niet in zit', () => {
    expect(hernoemInPloeg(PLOEG, 'Onbekend', 'Iets')).toEqual(PLOEG)
  })

  it('negeert een lege nieuwe naam', () => {
    expect(hernoemInPloeg(PLOEG, 'Gert', '  ')).toEqual(PLOEG)
  })
})

describe('initialen', () => {
  it('neemt de eerste letter van elk woord, hoogstens twee', () => {
    expect(initialen('Wouter')).toBe('W')
    expect(initialen('Jan Peter Klaas')).toBe('JP')
    expect(initialen('  moe ')).toBe('M')
  })

  it('geeft een vraagteken voor een lege naam', () => {
    expect(initialen('   ')).toBe('?')
  })
})
