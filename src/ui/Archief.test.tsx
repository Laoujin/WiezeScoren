// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG } from '../domein/contracten'
import type { Spel } from '../domein/spel'
import { Archief } from './Archief'

afterEach(cleanup)

const SPEL: Spel = {
  id: 'een',
  gestartOp: '2026-08-28T20:00:00.000Z',
  spelers: ['Gert', 'Guido', 'Lieve', 'Wouter'],
  deler: 0,
  rondes: [],
}

function beeld(): HTMLImageElement | null {
  return document.querySelector('img')
}

describe('Archief', () => {
  it('zet een sfeerbeeld bij de lege staat', () => {
    render(<Archief archief={[]} config={STANDAARD_CONFIG} onHeropen={() => {}} onWis={() => {}} />)
    expect(beeld()?.getAttribute('alt')).toBe('')
  })

  it('laat het sfeerbeeld weg zodra er partijen staan', () => {
    render(
      <Archief archief={[SPEL]} config={STANDAARD_CONFIG} onHeropen={() => {}} onWis={() => {}} />,
    )
    expect(beeld()).toBeNull()
  })
})
