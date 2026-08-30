// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Diericoon } from './diericonen'
import { STANDAARD_PLOEG } from '../domein/ploeg'

afterEach(cleanup)

function tintVan(soort: string): string | null {
  const { container } = render(<Diericoon soort={soort} />)
  return container.querySelector('polygon, circle, ellipse')?.getAttribute('fill') ?? null
}

describe('Diericoon', () => {
  it('tekent een icoon voor elk lid van de standaardploeg', () => {
    for (const lid of STANDAARD_PLOEG) {
      const { container } = render(<Diericoon soort={lid.icoon!} />)
      expect(container.querySelector('svg')).toBeTruthy()
    }
  })

  it('geeft elk dier een eigen tint', () => {
    const tinten = STANDAARD_PLOEG.map((lid) => tintVan(lid.icoon!))
    expect(tinten.filter(Boolean)).toHaveLength(STANDAARD_PLOEG.length)
    expect(new Set(tinten).size).toBe(tinten.length)
  })

  it('tekent niets voor een onbekend dier', () => {
    const { container } = render(<Diericoon soort="draak" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
