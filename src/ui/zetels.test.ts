import { describe, expect, it } from 'vitest'
import { POT } from '../domein/betalingen'
import { SPELER_IDS, type SpelerId } from '../domein/contracten'
import { TAFELVORMEN, type Tafelvorm } from '../domein/voorkeuren'
import { plekVan, zetelsVan, type Plek } from './zetels'

/** Positief of negatief kruisproduct: draaien de zetels allemaal dezelfde kant op? */
function draairichting(a: Plek, b: Plek): number {
  const va = { x: a.x - 50, y: a.y - 50 }
  const vb = { x: b.x - 50, y: b.y - 50 }
  return Math.sign(va.x * vb.y - va.y * vb.x)
}

describe.each(TAFELVORMEN)('tafelvorm %s', (vorm: Tafelvorm) => {
  const zetels = zetelsVan(vorm)

  it('geeft elke speler een eigen plek', () => {
    const plekken = SPELER_IDS.map((s) => `${zetels[s].plaquette.x},${zetels[s].plaquette.y}`)
    expect(new Set(plekken).size).toBe(4)
  })

  it('houdt alles binnen de tafel', () => {
    for (const speler of SPELER_IDS) {
      for (const plek of [zetels[speler].plaquette, zetels[speler].deler]) {
        expect(plek.x).toBeGreaterThanOrEqual(4)
        expect(plek.x).toBeLessThanOrEqual(96)
        expect(plek.y).toBeGreaterThanOrEqual(4)
        expect(plek.y).toBeLessThanOrEqual(96)
      }
    }
  })

  it('zet de delerfiche dichter bij het midden dan de plaquette', () => {
    for (const speler of SPELER_IDS) {
      const afstand = (p: Plek) => Math.hypot(p.x - 50, p.y - 50)
      expect(afstand(zetels[speler].deler)).toBeLessThan(afstand(zetels[speler].plaquette))
    }
  })

  it('houdt de zetels met de klok mee', () => {
    const richtingen = SPELER_IDS.map((speler) =>
      draairichting(zetels[speler].plaquette, zetels[((speler + 1) % 4) as SpelerId].plaquette),
    )
    expect(new Set(richtingen)).toEqual(new Set([richtingen[0]]))
    expect(richtingen[0]).not.toBe(0)
  })

  it('legt de pot in het midden', () => {
    expect(plekVan(POT, vorm)).toEqual({ x: 50, y: 50 })
  })

  it('wijst een speler naar zijn eigen plaquette', () => {
    expect(plekVan(2, vorm)).toEqual(zetels[2].plaquette)
  })
})

describe('de twee vormen', () => {
  it('zetten de spelers ergens anders neer', () => {
    const rond = zetelsVan('rond')
    const vierkant = zetelsVan('vierkant')
    for (const speler of SPELER_IDS) {
      expect(vierkant[speler].plaquette).not.toEqual(rond[speler].plaquette)
    }
  })

  it('zet de ronde tafel op de vier zijden', () => {
    const rond = zetelsVan('rond')
    expect(rond[0].plaquette.x).toBe(50)
    expect(rond[2].plaquette.x).toBe(50)
    expect(rond[1].plaquette.y).toBe(50)
    expect(rond[3].plaquette.y).toBe(50)
  })

  it('zet de vierkante tafel in twee rijen van twee', () => {
    const vierkant = zetelsVan('vierkant')
    const kolommen = new Set(SPELER_IDS.map((s) => vierkant[s].plaquette.x))
    const rijen = new Set(SPELER_IDS.map((s) => vierkant[s].plaquette.y))
    expect(kolommen.size).toBe(2)
    expect(rijen.size).toBe(2)
  })
})
