// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Tutorial } from './Tutorial'
import type { Stap } from './tutorial/stappen'

const STAPPEN: Stap[] = [
  { id: 'een', titel: 'Eerste stap', tekst: 'Kijk maar.' },
  {
    id: 'twee',
    titel: 'Tweede stap',
    doel: '[data-doel]',
    tekst: 'En nu klik ik.',
    acties: [{ soort: 'klik', doel: '[data-doel]' }],
  },
]

afterEach(cleanup)

function toon(onSluit = vi.fn()) {
  document.body.innerHTML = '<button data-doel>doel</button>'
  render(<Tutorial stappen={STAPPEN} tempo={0} onSluit={onSluit} />, {
    container: document.body.appendChild(document.createElement('div')),
  })
  return onSluit
}

function meet(selector: string, rect: { top: number; left: number; width: number; height: number }) {
  const element = document.querySelector<HTMLElement>(selector)!
  element.getBoundingClientRect = () =>
    ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
    }) as DOMRect
}

function schijnwerper(): HTMLElement {
  return document.querySelector<HTMLElement>('.ring-messing')!
}

describe('Tutorial', () => {
  it('begint bij de eerste stap', () => {
    toon()
    expect(screen.getByText('Eerste stap')).toBeTruthy()
    expect(screen.getByText('Rondleiding')).toBeTruthy()
  })

  it('voert de acties van een stap uit zodra die in beeld komt', async () => {
    toon()
    const klik = vi.fn()
    document.querySelector('[data-doel]')!.addEventListener('click', klik)

    fireEvent.click(screen.getByText('Volgende'))
    await waitFor(() => expect(klik).toHaveBeenCalledOnce())
  })

  it('speelt de acties niet opnieuw af bij een stap terug en weer vooruit', async () => {
    toon()
    const klik = vi.fn()
    document.querySelector('[data-doel]')!.addEventListener('click', klik)

    fireEvent.click(screen.getByText('Volgende'))
    await waitFor(() => expect(klik).toHaveBeenCalledOnce())
    fireEvent.click(screen.getByText('Vorige'))
    fireEvent.click(screen.getByText('Volgende'))

    await waitFor(() => expect(screen.getByText('Tweede stap')).toBeTruthy())
    expect(klik).toHaveBeenCalledOnce()
  })

  it('sluit af op de laatste stap', () => {
    const onSluit = toon()
    fireEvent.click(screen.getByText('Volgende'))
    fireEvent.click(screen.getByText('Klaar'))
    expect(onSluit).toHaveBeenCalledOnce()
  })

  it('sluit af met Escape', () => {
    const onSluit = toon()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onSluit).toHaveBeenCalledOnce()
  })

  it('spant de schijnwerper over alle doelen van een stap', () => {
    document.body.innerHTML = '<div data-een></div><div data-twee></div>'
    meet('[data-een]', { top: 10, left: 20, width: 100, height: 50 })
    meet('[data-twee]', { top: 200, left: 5, width: 40, height: 30 })
    render(
      <Tutorial
        stappen={[{ id: 'x', titel: 'Beide', tekst: 't', doel: ['[data-een]', '[data-twee]'] }]}
        tempo={0}
        onSluit={vi.fn()}
      />,
      { container: document.body.appendChild(document.createElement('div')) },
    )

    const kader = schijnwerper()
    expect([kader.style.top, kader.style.left, kader.style.width, kader.style.height]).toEqual([
      '2px',
      '-3px',
      '131px',
      '236px',
    ])
  })

  it('zet de uitlegkaart bovenaan wanneer de stap daarom vraagt', () => {
    document.body.innerHTML = ''
    render(
      <Tutorial
        stappen={[{ id: 'x', titel: 'Boven', tekst: 't', plaats: 'boven' }]}
        tempo={0}
        onSluit={vi.fn()}
      />,
      { container: document.body.appendChild(document.createElement('div')) },
    )

    const kaart = screen.getByText('Boven').closest('div.fixed')!
    expect(kaart.className).toContain('top-0')
    expect(kaart.className).not.toContain('bottom-0')
  })
})
