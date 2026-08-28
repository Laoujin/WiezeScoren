// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Kader } from './Kader'

afterEach(cleanup)

describe('Kader', () => {
  it('zet de inhoud in een omlijste sectie', () => {
    render(<Kader>inhoud</Kader>)
    const sectie = screen.getByText('inhoud')
    expect(sectie.tagName).toBe('SECTION')
    expect(sectie.className).toContain('kader')
  })

  it('hangt een sierhoek in elke hoek', () => {
    render(<Kader>inhoud</Kader>)
    expect(document.querySelectorAll('[data-hoek]').length).toBe(4)
  })

  it('laat de sierhoeken weg wanneer erom gevraagd wordt', () => {
    render(<Kader sierhoeken={false}>inhoud</Kader>)
    expect(document.querySelectorAll('[data-hoek]').length).toBe(0)
  })

  it('kan als nav renderen', () => {
    render(<Kader as="nav">inhoud</Kader>)
    expect(screen.getByText('inhoud').tagName).toBe('NAV')
  })

  it('neemt extra klassen over', () => {
    render(<Kader className="p-5">inhoud</Kader>)
    expect(screen.getByText('inhoud').className).toContain('p-5')
  })
})
