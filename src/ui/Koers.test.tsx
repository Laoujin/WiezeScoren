// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { START_COMMENTAAR } from '../domein/commentaar'
import type { Punten } from '../domein/score'
import { Koers } from './Koers'

const totalen: Punten = { 0: 12, 1: -6, 2: 0, 3: 3 }

function toon(over: Partial<Parameters<typeof Koers>[0]> = {}) {
  const props = {
    spelers: ['An', 'Bo', 'Cis', 'Dirk'],
    totalen,
    voorbeeld: null,
    pot: 8,
    deler: 2 as const,
    selectie: [],
    rit: 4,
    laatsteRit: null,
    praat: START_COMMENTAAR,
    vertraging: 0,
    onSelecteer: vi.fn(),
    onDeler: vi.fn(),
    onHernoem: vi.fn(),
    ...over,
  }
  render(<Koers {...props} />)
  return props
}

function baanVan(speler: number): HTMLElement {
  const knop = document.querySelector(`[data-zetel="${speler}"]`)
  if (!(knop instanceof HTMLElement)) throw new Error(`geen baan voor speler ${speler}`)
  return knop
}

afterEach(cleanup)

describe('Koers', () => {
  it('zet elke renner op zijn eigen baan met naam en totaal', () => {
    toon()
    expect(baanVan(0).textContent).toContain('An')
    expect(baanVan(0).textContent).toContain('12')
    expect(baanVan(1).textContent).toContain('-6')
  })

  it('geeft de leider de gele trui en de laatste de rode lantaarn', () => {
    toon()
    expect(screen.getByTitle('Gele trui').closest('[data-zetel]')).toBe(baanVan(0))
    expect(screen.getByTitle('Rode lantaarn').closest('[data-zetel]')).toBe(baanVan(1))
  })

  it('zet de renners naar hun plaats in het veld', () => {
    toon()
    const posities = [0, 1, 2, 3].map((s) => {
      const renner = baanVan(s).parentElement?.querySelector('.renner-schuif')
      return Number.parseFloat((renner as HTMLElement).style.left)
    })
    expect(posities[0]).toBeGreaterThan(posities[3]!)
    expect(posities[3]).toBeGreaterThan(posities[2]!)
    expect(posities[2]).toBeGreaterThan(posities[1]!)
  })

  it('zet de delerfiche bij wie deelt', () => {
    toon()
    expect(screen.getByTitle(/Deelt deze ronde/).closest('[data-zetel]')).toBe(baanVan(2))
  })

  it('toont de premie', () => {
    toon()
    expect(screen.getByText('Premie').parentElement?.textContent).toContain('8')
  })

  it('toont het commentaar van de laatste rit', () => {
    toon({ praat: { emoji: '🚀', regel: 'Bo rijdt iedereen van de baan.' } })
    expect(screen.getByText('Bo rijdt iedereen van de baan.')).toBeTruthy()
  })

  it('zet een humeur bij elke renner na een gereden rit', () => {
    toon({ laatsteRit: { 0: 45, 1: -15, 2: -15, 3: -15 } })
    expect(screen.getAllByTitle('Na de vorige rit').map((e) => e.textContent)).toEqual([
      '🤩',
      '😬',
      '😬',
      '😬',
    ])
  })

  it('stempelt de uitschieter van de rit', () => {
    toon({ laatsteRit: { 0: 45, 1: -15, 2: -15, 3: -15 } })
    expect(screen.getByText('Klapper').textContent).toContain('Klapper')
    expect(screen.getByText('+45')).toBeTruthy()
  })

  it('zwijgt over een gewone rit', () => {
    toon({ laatsteRit: { 0: 3, 1: -3, 2: 3, 3: -3 } })
    expect(screen.queryByText('Klapper')).toBeNull()
    expect(screen.queryByText('Smak')).toBeNull()
  })

  it('zet een spookrenner op de plek waar de ronde de speler brengt', () => {
    toon({ voorbeeld: { 0: -9, 1: 3, 2: 3, 3: 3 } })
    expect(document.querySelectorAll('.renner-schuif')).toHaveLength(4)
    expect(screen.getAllByText('-9')).not.toHaveLength(0)
    const spoken = document.querySelectorAll('[class*="opacity-35"]')
    expect(spoken).toHaveLength(4)
  })
})
