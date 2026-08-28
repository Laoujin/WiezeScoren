// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Rondestand } from '../domein/spel'
import { useMuntStroom } from './useMuntStroom'

function stand(id: string, punten: [number, number, number, number]): Rondestand {
  return {
    punten: { 0: punten[0], 1: punten[1], 2: punten[2], 3: punten[3] },
    potVoor: 0,
    potNa: 0,
    ronde: { id, deler: 0, contract: 'vragen', spelers: [0, 2], slagen: 8 },
  }
}

function Kijker({ rondes }: { rondes: Rondestand[] }) {
  const { vlucht, vertraging } = useMuntStroom(rondes)
  return (
    <span data-testid="stroom">
      {vlucht ? `${vlucht.id}:${vlucht.betalingen.length}:${vertraging}` : 'stil'}
    </span>
  )
}

function getoond(): string {
  return screen.getByTestId('stroom').textContent ?? ''
}

const EEN = stand('een', [2, -2, 2, -2])
const TWEE = stand('twee', [6, -2, -2, -2])

describe('useMuntStroom', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('begint stil', () => {
    render(<Kijker rondes={[EEN]} />)
    expect(getoond()).toBe('stil')
  })

  it('vliegt zodra er een ronde bijkomt en vertraagt de tellers', () => {
    const { rerender } = render(<Kijker rondes={[EEN]} />)
    rerender(<Kijker rondes={[EEN, TWEE]} />)
    expect(getoond()).toBe('twee:3:850')
  })

  it('landt en laat de tafel weer stil', () => {
    const { rerender } = render(<Kijker rondes={[]} />)
    rerender(<Kijker rondes={[EEN]} />)
    act(() => void vi.advanceTimersByTime(5000))
    expect(getoond()).toBe('stil')
  })

  it('blijft stil bij een ronde zonder geldstroom', () => {
    const { rerender } = render(<Kijker rondes={[]} />)
    rerender(<Kijker rondes={[stand('leeg', [0, 0, 0, 0])]} />)
    expect(getoond()).toBe('stil')
  })

  it('blijft stil wanneer een ronde verdwijnt', () => {
    const { rerender } = render(<Kijker rondes={[EEN, TWEE]} />)
    rerender(<Kijker rondes={[EEN]} />)
    expect(getoond()).toBe('stil')
  })

  it('blijft stil bij verminderde beweging', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { rerender } = render(<Kijker rondes={[]} />)
    rerender(<Kijker rondes={[EEN]} />)
    expect(getoond()).toBe('stil')
  })
})
