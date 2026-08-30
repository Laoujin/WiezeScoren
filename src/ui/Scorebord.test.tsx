// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STANDAARD_CONFIG } from '../domein/contracten'
import type { Spel } from '../domein/spel'
import { Scorebord } from './Scorebord'

const SPEL: Spel = {
  id: 'spel-1',
  gestartOp: '2026-01-01T00:00:00.000Z',
  spelers: ['Az', 'Bo', 'Cy', 'Di'],
  deler: 0,
  rondes: [{ id: 'ronde-1', deler: 0, contract: 'correctie', spelers: [], slagen: 0 }],
}

function toon(onPasPuntAan = () => {}) {
  render(
    <Scorebord
      spel={SPEL}
      config={STANDAARD_CONFIG}
      onWisRonde={() => {}}
      onPasPuntAan={onPasPuntAan}
      onPasPotAan={() => {}}
      onHerstel={() => {}}
      onCorrectie={() => {}}
    />,
  )
}

// De rondleiding mikt op deze haken; ze horen dus bij het gedrag van het scorebord.
function bewerk(kolom: number): HTMLInputElement {
  fireEvent.click(document.querySelectorAll<HTMLElement>('[data-punt]')[kolom]!)
  return document.querySelector<HTMLInputElement>('[data-punt-invoer]')!
}

describe('Scorebord', () => {
  afterEach(cleanup)

  it('opent een nulwaarde als leeg veld', () => {
    toon()
    expect(bewerk(0).value).toBe('')
  })

  it('bewaart wat er getypt wordt', () => {
    const onPasPuntAan = vi.fn()
    toon(onPasPuntAan)
    const veld = bewerk(0)
    fireEvent.change(veld, { target: { value: '-100' } })
    fireEvent.blur(veld)
    expect(onPasPuntAan).toHaveBeenCalledWith('ronde-1', 0, -100)
  })
})
