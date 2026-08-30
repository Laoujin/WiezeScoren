// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { markeerTutorialGezien } from './opslag/opslag'

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
    markeerTutorialGezien(localStorage)
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

  it('zet op een smal scherm de contractkeuze boven het scorebord', () => {
    render(<App />)
    const volgorde = Array.from(document.querySelectorAll('main > *')).map((el) =>
      el.textContent?.includes('Om de punten')
        ? 'contracten'
        : el.textContent?.includes('Scorebord')
          ? 'scorebord'
          : 'tafel',
    )
    expect(volgorde).toEqual(['tafel', 'contracten', 'scorebord'])
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

  it('klapt de navigatie open en weer dicht met de menuknop', () => {
    render(<App />)
    const menu = screen.getByText('Menu').closest('button')!
    expect(menu.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(menu)
    expect(menu.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(knopMetTekst('Archief'))
    expect(menu.getAttribute('aria-expanded')).toBe('false')
  })

  it('zet de titel op een uithangbord met enkel het woord Wiezen', () => {
    render(<App />)
    const titel = document.querySelector('h1')!
    expect(titel.className).toContain('bord')
    expect(titel.textContent).toBe('Wiezen')
  })

  it('hangt het bord aan twee kettingen', () => {
    render(<App />)
    const uithang = document.querySelector('h1')!.closest('.uithang')!
    expect(uithang.querySelectorAll('.ketting')).toHaveLength(2)
  })

  it('houdt het bord buiten de header, zodat het geen rij inneemt', () => {
    render(<App />)
    expect(document.querySelector('h1')!.closest('header')).toBeNull()
  })

  it('linkt in de voettekst naar de repo', () => {
    render(<App />)
    const link = screen.getByTitle('Broncode op GitHub')
    expect(link.getAttribute('href')).toBe('https://github.com/Laoujin/WiezeScoren')
  })
})

describe('rondleiding', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('opent vanzelf bij een verse partij', () => {
    render(<App />)
    expect(screen.getByText('Wie zit er aan tafel')).toBeTruthy()
  })

  it('blijft weg zodra ze gesloten is', () => {
    render(<App />)
    fireEvent.click(knopMetTekst('Sluiten'))
    cleanup()

    render(<App />)
    expect(screen.queryByText('Wie zit er aan tafel')).toBeNull()
  })

  it('zet de partij terug zoals ze was', () => {
    markeerTutorialGezien(localStorage)
    render(<App />)
    const eersteNaam = document.querySelector('[data-naam="0"]')!.textContent

    fireEvent.click(knopMetTekst('Uitleg'))
    fireEvent.doubleClick(document.querySelector('[data-naam="0"]')!)
    const veld = document.querySelector('[data-naam-invoer]') as HTMLInputElement
    fireEvent.blur(veld, { target: { value: 'Nonkel Jef' } })
    expect(document.querySelector('[data-naam="0"]')!.textContent).toBe('Nonkel Jef')

    fireEvent.click(knopMetTekst('Sluiten'))
    expect(document.querySelector('[data-naam="0"]')!.textContent).toBe(eersteNaam)
  })
})
