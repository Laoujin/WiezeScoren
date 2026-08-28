// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GEEN_PUNTEN } from '../domein/score'
import type { Tafelvorm } from '../domein/voorkeuren'
import { Tafel } from './Tafel'
import { zetelsVan } from './zetels'

const VLUCHT = {
  id: 'ronde-1',
  betalingen: [
    { van: 1 as const, naar: 0 as const, bedrag: 2 },
    { van: 'pot' as const, naar: 2 as const, bedrag: 5 },
  ],
}

function toon(
  vlucht: typeof VLUCHT | null,
  vorm: Tafelvorm = 'rond',
  onVorm: (vorm: Tafelvorm) => void = () => {},
) {
  render(
    <Tafel
      spelers={['Az', 'Bo', 'Cy', 'Di']}
      ploeg={[{ id: 'bo', naam: 'Bo' }]}
      totalen={{ ...GEEN_PUNTEN }}
      voorbeeld={null}
      pot={0}
      deler={0}
      selectie={[]}
      vlucht={vlucht}
      vertraging={vlucht ? 850 : 0}
      vorm={vorm}
      onSelecteer={() => {}}
      onDeler={() => {}}
      onHernoem={() => {}}
      onKiesZetel={() => {}}
      onVorm={onVorm}
    />,
  )
}

function banen(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.munt-baan'))
}

function baan(el: HTMLElement) {
  return {
    van: [el.style.left, el.style.top],
    naar: [el.style.getPropertyValue('--naar-x'), el.style.getPropertyValue('--naar-y')],
  }
}

describe('Tafel', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('toont geen muntstroom zonder vlucht', () => {
    toon(null)
    expect(banen()).toHaveLength(0)
  })

  it('vertrekt vanaf de betaler en landt op de ontvanger', () => {
    toon(VLUCHT)
    expect(banen().map(baan)).toEqual([
      { van: ['15%', '50%'], naar: ['50%', '87%'] },
      { van: ['50%', '50%'], naar: ['50%', '13%'] },
    ])
  })

  it('schrijft het bedrag bij elke betaling', () => {
    toon(VLUCHT)
    const labels = banen().map((el) => el.querySelector('span > span:last-child')?.textContent)
    expect(labels).toEqual(['2', '5'])
  })

  it('stuurt elke betaling later weg dan de vorige', () => {
    toon(VLUCHT)
    expect(banen().map((el) => el.style.animationDelay)).toEqual(['0ms', '110ms'])
  })

  it('zet de deler en de zetels op hun plek', () => {
    toon(null)
    expect(screen.getByTitle('Deler').parentElement?.style.top).toBe('65%')
    expect(screen.getByText('Bo').closest('[data-plaquette]')?.getAttribute('style')).toContain('left: 15%')
  })
})

describe('tafelvorm', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('zet de zetels op de plek die bij de gekozen vorm hoort', () => {
    for (const vorm of ['rond', 'vierkant'] as const) {
      cleanup()
      toon(null, vorm)
      const zetels = zetelsVan(vorm)
      const plek = document
        .querySelector<HTMLElement>('button[data-zetel="1"]')!
        .closest<HTMLElement>('.absolute')!
      expect(plek.style.left).toBe(`${zetels[1].plaquette.x}%`)
      expect(plek.style.top).toBe(`${zetels[1].plaquette.y}%`)
    }
  })

  it('maakt de tafel rond of hoekig', () => {
    toon(null, 'rond')
    expect(document.querySelector('.vilt')!.className).toContain('rounded-[50%]')
    cleanup()
    toon(null, 'vierkant')
    expect(document.querySelector('.vilt')!.className).toContain('rounded-3xl')
  })

  it('laat de vorm omschakelen', () => {
    const gekozen: Tafelvorm[] = []
    toon(null, 'rond', (vorm) => gekozen.push(vorm))
    screen.getByTitle('Vierkante tafel').click()
    expect(gekozen).toEqual(['vierkant'])
  })

  it('laat de munten de gekozen vorm volgen', () => {
    toon(VLUCHT, 'vierkant')
    const zetels = zetelsVan('vierkant')
    expect(banen()[0]!.style.left).toBe(`${zetels[1].plaquette.x}%`)
  })
})
