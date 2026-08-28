// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Tafelvorm } from '../domein/voorkeuren'
import { Tafelvormkiezer } from './Tafelvormkiezer'

afterEach(cleanup)

describe('Tafelvormkiezer', () => {
  it('meldt de aangeklikte vorm', () => {
    const gekozen: Tafelvorm[] = []
    render(<Tafelvormkiezer vorm="rond" onVorm={(vorm) => gekozen.push(vorm)} />)
    screen.getByTitle('Vierkante tafel').click()
    expect(gekozen).toEqual(['vierkant'])
  })

  it('markeert de huidige vorm', () => {
    render(<Tafelvormkiezer vorm="vierkant" onVorm={() => {}} />)
    expect(screen.getByTitle('Vierkante tafel').className).toContain('bg-messing')
    expect(screen.getByTitle('Ronde tafel').className).not.toContain('bg-messing')
  })
})
