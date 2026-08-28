// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTelling } from './useTelling'

function Teller({ doel }: { doel: number }) {
  return <span data-testid="teller">{useTelling(doel)}</span>
}

function getoond(): number {
  return Number(screen.getByTestId('teller').textContent)
}

/** rAF vertaald naar timers, zodat de animatie stap voor stap vooruit te spoelen is. */
function stuurFrames() {
  let klok = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(klok), 16),
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  vi.stubGlobal('performance', { now: () => klok })
  return {
    spoel(ms: number) {
      const stappen = Math.ceil(ms / 16)
      for (let i = 0; i < stappen; i++) {
        klok += 16
        act(() => void vi.advanceTimersByTime(16))
      }
    },
  }
}

describe('useTelling', () => {
  let frames: ReturnType<typeof stuurFrames>

  beforeEach(() => {
    vi.useFakeTimers()
    window.matchMedia ??= (() => ({ matches: false })) as unknown as typeof window.matchMedia
    frames = stuurFrames()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('toont de beginwaarde meteen', () => {
    render(<Teller doel={12} />)
    expect(getoond()).toBe(12)
  })

  it('loopt naar de nieuwe waarde toe', () => {
    const { rerender } = render(<Teller doel={0} />)
    rerender(<Teller doel={100} />)
    frames.spoel(1000)
    expect(getoond()).toBe(100)
  })

  it('komt uit op het laatste doel wanneer de animatie onderbroken wordt', () => {
    const { rerender } = render(<Teller doel={-3} />)
    rerender(<Teller doel={-18} />)
    frames.spoel(100)
    rerender(<Teller doel={-3} />)
    frames.spoel(1000)
    expect(getoond()).toBe(-3)
  })

  it('keert terug naar een eerder getoonde waarde', () => {
    const { rerender } = render(<Teller doel={0} />)
    rerender(<Teller doel={50} />)
    frames.spoel(1000)
    rerender(<Teller doel={0} />)
    frames.spoel(1000)
    expect(getoond()).toBe(0)
  })
})
