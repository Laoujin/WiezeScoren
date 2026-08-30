// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STANDAARD_CONFIG, type Config } from '../domein/contracten'
import { Instellingen } from './Instellingen'

function veld(contract: string, kolom: string): HTMLInputElement {
  const rij = screen.getByText(contract).closest('tr')!
  const kop = screen.getByRole('columnheader', { name: kolom })
  const index = [...kop.parentElement!.children].indexOf(kop)
  return rij.children[index]!.querySelector('input')!
}

describe('Instellingen', () => {
  afterEach(cleanup)

  it('toont de waarde bij dertien slagen als getalveld', () => {
    render(<Instellingen config={STANDAARD_CONFIG} onWijzig={() => {}} />)
    const invoer = veld('Vragen', 'Bij 13 slagen')
    expect(invoer.type).toBe('number')
    expect(invoer.value).toBe('15')
  })

  it('geeft een nieuwe waarde door', () => {
    const onWijzig = vi.fn<(config: Config) => void>()
    render(<Instellingen config={STANDAARD_CONFIG} onWijzig={onWijzig} />)
    fireEvent.change(veld('Troel', 'Bij 13 slagen'), { target: { value: '40' } })
    expect(onWijzig.mock.calls[0]![0].contracten.troel.bijAlleSlagen).toBe(40)
  })
})
