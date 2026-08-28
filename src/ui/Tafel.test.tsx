// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

function toon(vlucht: typeof VLUCHT | null, vorm: Tafelvorm = 'rond') {
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

describe('ploegkiezer', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  function plaquette(speler: number): HTMLElement {
    return document.querySelector<HTMLElement>(`[data-plaquette="${speler}"]`)!
  }

  // Een echte muisklik stuurt eerst pointerdown; daar hangt het sluiten van een andere lijst aan.
  function open(speler: number) {
    const knop = plaquette(speler).querySelector('button[title$="vervangen"]')!
    fireEvent.pointerDown(knop)
    fireEvent.click(knop)
  }

  function kiezer(speler: number): HTMLElement | null {
    return plaquette(speler).querySelector<HTMLElement>('.animatie-open')
  }

  it('opent de kieslijst met de hele ploeg', () => {
    toon(null)
    open(0)
    expect([...kiezer(0)!.querySelectorAll('button')].map((b) => b.title)).toEqual(['Bo'])
  })

  it('tilt de zetel boven de delerfiche zolang de lijst openstaat', () => {
    toon(null)
    const deler = Number(
      screen.getByTitle('Deler').parentElement!.className.match(/z-(\d+)/)![1],
    )
    expect(plaquette(0).style.zIndex).toBe('')
    open(0)
    expect(Number(plaquette(0).style.zIndex)).toBeGreaterThan(deler)
  })

  it('sluit bij een klik buiten de lijst', () => {
    toon(null)
    open(0)
    fireEvent.pointerDown(document.body)
    expect(kiezer(0)).toBeNull()
  })

  it('blijft open bij een klik binnen de zetel', () => {
    toon(null)
    open(0)
    fireEvent.pointerDown(kiezer(0)!)
    expect(kiezer(0)).not.toBeNull()
  })

  it('sluit met Escape', () => {
    toon(null)
    open(0)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(kiezer(0)).toBeNull()
  })

  it('sluit de lijst van de ene zetel wanneer een andere opengaat', () => {
    toon(null)
    open(0)
    open(2)
    expect(kiezer(0)).toBeNull()
    expect(kiezer(2)).not.toBeNull()
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

  it('laat de munten de gekozen vorm volgen', () => {
    toon(VLUCHT, 'vierkant')
    const zetels = zetelsVan('vierkant')
    expect(banen()[0]!.style.left).toBe(`${zetels[1].plaquette.x}%`)
  })
})

describe('kluis en viering', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  function plaquette(speler: number): HTMLElement {
    return document.querySelector<HTMLElement>(`[data-plaquette="${speler}"]`)!
  }

  it('maakt van de avatar een kluis bij elke speler in de geldstroom', () => {
    toon(VLUCHT)
    expect(plaquette(0).querySelector('[data-kluis]')).toBeTruthy()
    expect(plaquette(1).querySelector('[data-kluis]')).toBeTruthy()
    expect(plaquette(2).querySelector('[data-kluis]')).toBeTruthy()
    expect(plaquette(3).querySelector('[data-kluis]')).toBeNull()
  })

  it('viert de ontvangers met confetti en beweent de betaler', () => {
    toon(VLUCHT)
    expect(plaquette(0).querySelector('[data-viering="confetti"]')).toBeTruthy()
    expect(plaquette(2).querySelector('[data-viering="confetti"]')).toBeTruthy()
    expect(plaquette(1).querySelector('[data-viering="traan"]')).toBeTruthy()
    expect(plaquette(3).querySelector('[data-viering]')).toBeNull()
  })

  it('laat kluis en viering weg zonder geldstroom', () => {
    toon(null)
    expect(document.querySelector('[data-kluis]')).toBeNull()
    expect(document.querySelector('[data-viering]')).toBeNull()
  })
})
