// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { BAAN_FINISH, BAAN_START } from './domein/koers'

function baanKnop(speler: number): HTMLElement {
  const knop = document.querySelector(`[data-zetel="${speler}"]`)
  if (!(knop instanceof HTMLElement)) throw new Error(`geen renner ${speler}`)
  return knop
}

function rennerPositie(speler: number): number {
  const renner = baanKnop(speler).parentElement?.querySelector<HTMLElement>('.renner-schuif')
  return Number.parseFloat(renner!.style.left)
}

function knopMetTekst(tekst: string): HTMLElement {
  const knop = Array.from(document.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === tekst,
  )
  if (!knop) throw new Error(`geen knop "${tekst}"`)
  return knop
}

function knopMet(deel: string): HTMLElement {
  const knop = Array.from(document.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(deel),
  )
  if (!knop) throw new Error(`geen knop met "${deel}"`)
  return knop
}

describe('App op de koers', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('zet het veld aan de start zolang er geen rit gereden is', () => {
    render(<App />)
    expect(screen.getByText(/Het veld staat aan de start/)).toBeTruthy()
    expect([0, 1, 2, 3].map(rennerPositie)).toEqual([50, 50, 50, 50])
  })

  it('legt een rit vast en verplaatst de renners', () => {
    render(<App />)

    fireEvent.click(baanKnop(0))
    fireEvent.click(baanKnop(2))
    fireEvent.click(knopMet('Vragen'))
    fireEvent.click(knopMetTekst('9'))

    expect(screen.getAllByText('+3').length).toBeGreaterThan(0)

    fireEvent.click(knopMetTekst('🏁 Aankomst'))

    expect(rennerPositie(0)).toBe(BAAN_FINISH)
    expect(rennerPositie(1)).toBe(BAAN_START)
    expect(screen.getByText(/Speler 1 en Speler 3/)).toBeTruthy()
    expect(knopMet('Rittenboek').textContent).toContain('1')
  })

  it('verzet de deler met een rechtsklik', () => {
    render(<App />)
    fireEvent.contextMenu(baanKnop(3))
    expect(screen.getByTitle(/Deelt deze ronde/).closest('[data-zetel]')).toBe(baanKnop(3))
  })

  it('opent het rittenboek achter een knop', () => {
    render(<App />)
    expect(screen.queryByText('Rittenboek')).toBeNull()
    fireEvent.click(knopMet('Rittenboek'))
    expect(screen.getByText('Rittenboek')).toBeTruthy()
  })

  it('wisselt naar de klassieke tafel en terug', () => {
    render(<App />)
    fireEvent.click(knopMet('Klassieke tafel'))
    expect(document.querySelector('.renner-schuif')).toBeNull()
    fireEvent.click(knopMet('Terug naar de koers'))
    expect(document.querySelector('.renner-schuif')).not.toBeNull()
  })
})
