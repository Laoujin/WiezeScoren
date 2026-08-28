// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GEEN_PUNTEN } from '../domein/score'
import { Tafel } from './Tafel'

const VLUCHT = {
  id: 'ronde-1',
  betalingen: [
    { van: 1 as const, naar: 0 as const, bedrag: 2 },
    { van: 'pot' as const, naar: 2 as const, bedrag: 5 },
  ],
}

function toon(vlucht: typeof VLUCHT | null) {
  render(
    <Tafel
      spelers={['Az', 'Bo', 'Cy', 'Di']}
      totalen={{ ...GEEN_PUNTEN }}
      voorbeeld={null}
      pot={0}
      deler={0}
      selectie={[]}
      vlucht={vlucht}
      vertraging={vlucht ? 850 : 0}
      onSelecteer={() => {}}
      onDeler={() => {}}
      onHernoem={() => {}}
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
    expect(screen.getByText('Bo').closest('div')?.style.left).toBe('15%')
  })
})
