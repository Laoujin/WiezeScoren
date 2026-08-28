// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

function zetel(speler: number): HTMLElement {
  const knop = document.querySelector(`[data-zetel="${speler}"]`)
  if (!(knop instanceof HTMLElement)) throw new Error(`geen zetel ${speler}`)
  return knop
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

function totalen(): string[] {
  return Array.from(document.querySelectorAll('tfoot tr:first-child td')).map((c) =>
    c.textContent!.trim(),
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('begint met een leeg scorebord en een lege pot', () => {
    render(<App />)
    expect(screen.getByText(/Nog geen rondes/)).toBeTruthy()
    expect(screen.getByText('Pot').nextElementSibling).toBeTruthy()
  })

  it('toont de punten van een ronde voor je ze opslaat', () => {
    render(<App />)
    fireEvent.click(zetel(0))
    fireEvent.click(zetel(2))
    fireEvent.click(knopMet('Vragen'))
    fireEvent.click(knopMetTekst('9'))
    expect(screen.getAllByText('+3').length).toBeGreaterThan(0)
  })

  it('legt een ronde vast in het scorebord', () => {
    render(<App />)
    fireEvent.click(zetel(0))
    fireEvent.click(zetel(2))
    fireEvent.click(knopMet('Vragen'))
    fireEvent.click(knopMetTekst('9'))
    fireEvent.click(knopMetTekst('Ronde opslaan'))

    expect(screen.getByText(/1\. Vragen/)).toBeTruthy()
    expect(totalen()).toEqual(['Totaal', '3', '-3', '3', '-3', '0', ''])
  })

  it('stopt de madams van een pasronde in de pot', () => {
    render(<App />)
    fireEvent.click(knopMet('Iedereen past'))
    const madamKnoppen = Array.from(
      document.querySelectorAll<HTMLElement>('.animatie-open button'),
    )
    fireEvent.click(madamKnoppen[4]!)
    fireEvent.click(knopMetTekst('Ronde opslaan'))
    expect(totalen()).toEqual(['Totaal', '-12', '0', '0', '0', '12', ''])
  })

  it('verzet de deler met een rechtsklik', () => {
    render(<App />)
    fireEvent.contextMenu(zetel(3))
    expect(JSON.parse(localStorage.getItem('wiezen.spel')!).deler).toBe(3)
  })

  it('opent een gearchiveerde partij opnieuw', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(zetel(0))
    fireEvent.click(zetel(2))
    fireEvent.click(knopMet('Vragen'))
    fireEvent.click(knopMetTekst('9'))
    fireEvent.click(knopMetTekst('Ronde opslaan'))
    fireEvent.click(knopMetTekst('Nieuw spel'))
    expect(screen.getByText(/Nog geen rondes/)).toBeTruthy()

    fireEvent.click(knopMetTekst('Archief'))
    fireEvent.click(knopMetTekst('Heropenen'))
    expect(screen.getByText(/1\. Vragen/)).toBeTruthy()
    expect(totalen()).toEqual(['Totaal', '3', '-3', '3', '-3', '0', ''])
  })

  it('zet het scorebord onder de tafel en de contractkeuze ernaast', () => {
    render(<App />)
    const kolom = document.querySelector('main > div')!
    expect(kolom.contains(screen.getByText('Scorebord'))).toBe(true)
    expect(kolom.contains(screen.getByText('Om de punten'))).toBe(false)
  })

  it('vraagt bij abondance enkel of het gehaald is', () => {
    render(<App />)
    fireEvent.click(zetel(0))
    fireEvent.click(knopMet('Abondance'))
    expect(knopMetTekst('Gehaald')).toBeTruthy()
    expect(knopMetTekst('Mislukt')).toBeTruthy()
    expect(screen.queryByText(/Slagen .* nodig/)).toBeNull()
  })

  it('wisselt vanuit de header van ronde naar vierkante tafel en bewaart dat', () => {
    render(<App />)
    const knop = screen.getByTitle('Vierkante tafel')
    expect(knop.closest('header')).toBeTruthy()
    fireEvent.click(knop)
    expect(JSON.parse(localStorage.getItem('wiezen.voorkeuren')!).tafelvorm).toBe('vierkant')
    expect(document.querySelector('.vilt')!.className).toContain('rounded-3xl')
  })

  it('omlijst zowel het scorebord als de contractkeuze', () => {
    render(<App />)
    const kaders = Array.from(document.querySelectorAll('main .kader'))
    expect(kaders.length).toBe(2)
    expect(kaders.some((k) => k.textContent?.includes('Scorebord'))).toBe(true)
    expect(kaders.some((k) => k.textContent?.includes('Om de punten'))).toBe(true)
  })

  it('laat de contractkeuze niet meerekken met de linkerkolom', () => {
    render(<App />)
    const contracten = screen.getByText('Om de punten').closest('.kader')!
    expect(contracten.className).toContain('self-start')
  })

  it('omlijst de navigatie, maar zonder sierhoeken in de smalle balk', () => {
    render(<App />)
    const nav = document.querySelector('header nav')!
    expect(nav.className).toContain('kader')
    expect(nav.querySelectorAll('[data-hoek]')).toHaveLength(0)
  })

  it('linkt in de voettekst naar de repo', () => {
    render(<App />)
    const link = screen.getByTitle('Broncode op GitHub')
    expect(link.getAttribute('href')).toBe('https://github.com/Laoujin/WiezeScoren')
  })
})
