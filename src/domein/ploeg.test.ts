import { describe, expect, it } from 'vitest'
import {
  GEZINS_PLOEG,
  STANDAARD_PLOEG,
  hernoemInPloeg,
  initialen,
  maakGast,
  zetOpZetel,
  zetelnamen,
  type Ploeglid,
} from './ploeg'

const PLOEG: Ploeglid[] = [
  { id: 'a', naam: 'Wouter' },
  { id: 'b', naam: 'Gert' },
  { id: 'c', naam: 'Moe' },
]

describe('STANDAARD_PLOEG', () => {
  it('bevat de vijf verzonnen namen', () => {
    expect(STANDAARD_PLOEG.map((l) => l.naam)).toEqual(['Tom', 'Caro', 'Lies', 'Bert', 'Fien'])
  })

  it('geeft elk lid een icoon in plaats van een foto', () => {
    expect(STANDAARD_PLOEG.filter((l) => !l.icoon)).toEqual([])
    expect(STANDAARD_PLOEG.filter((l) => l.avatar)).toEqual([])
  })

  it('geeft elk lid een eigen id', () => {
    expect(new Set(STANDAARD_PLOEG.map((l) => l.id)).size).toBe(STANDAARD_PLOEG.length)
  })
})

describe('GEZINS_PLOEG', () => {
  it('bevat het gezin', () => {
    expect(GEZINS_PLOEG.map((l) => l.naam)).toEqual(['Wouter', 'Gert', 'Moe', 'Va', 'Zus'])
  })

  it('geeft elk lid een foto', () => {
    expect(GEZINS_PLOEG.filter((l) => !l.avatar)).toEqual([])
  })

  it('geeft elk lid een eigen id', () => {
    expect(new Set(GEZINS_PLOEG.map((l) => l.id)).size).toBe(GEZINS_PLOEG.length)
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

describe('maakGast', () => {
  it('nummert de eerste gast als 1', () => {
    expect(maakGast(PLOEG)).toEqual({ id: 'gast-1', naam: 'Gast 1' })
  })

  it('telt verder na de hoogste gast, ook als die hernoemd is', () => {
    const ploeg = [...PLOEG, { id: 'gast-1', naam: 'Gast 1' }, { id: 'gast-3', naam: 'Jef' }]
    expect(maakGast(ploeg)).toEqual({ id: 'gast-4', naam: 'Gast 4' })
  })
})

describe('zetelnamen', () => {
  it('geeft de bewaarde zetels terug', () => {
    const stand = { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] }
    expect(zetelnamen(stand)).toEqual(['Fien', 'Tom', 'Bert', 'Caro'])
  })

  it('valt terug op de eerste vier leden zonder bewaarde zetels', () => {
    expect(zetelnamen({ leden: STANDAARD_PLOEG, zetels: [] })).toEqual([
      'Tom',
      'Caro',
      'Lies',
      'Bert',
    ])
  })
})
