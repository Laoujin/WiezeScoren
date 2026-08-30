// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DIERICONEN, Diericoon } from './diericonen'
import { STANDAARD_PLOEG } from '../domein/ploeg'

afterEach(cleanup)

describe('DIERICONEN', () => {
  it('heeft een icoon voor elk lid van de standaardploeg', () => {
    for (const lid of STANDAARD_PLOEG) expect(DIERICONEN[lid.icoon!]).toBeTruthy()
  })

  it('geeft elk dier een eigen tint', () => {
    const tinten = Object.values(DIERICONEN).map((d) => d.tint)
    expect(new Set(tinten).size).toBe(tinten.length)
  })
})

describe('Diericoon', () => {
  it('tekent het gevraagde dier', () => {
    const { container } = render(<Diericoon soort="vos" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('tekent niets voor een onbekend dier', () => {
    const { container } = render(<Diericoon soort="draak" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
