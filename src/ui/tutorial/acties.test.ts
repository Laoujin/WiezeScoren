// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { voerUit } from './acties'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('voerUit', () => {
  it('klikt het element achter de selector aan', () => {
    document.body.innerHTML = '<button data-knop></button>'
    const klik = vi.fn()
    document.querySelector('button')!.addEventListener('click', klik)

    expect(voerUit({ soort: 'klik', doel: '[data-knop]' })).toBe(true)
    expect(klik).toHaveBeenCalledOnce()
  })

  it('stuurt een dubbelklik die opborrelt', () => {
    document.body.innerHTML = '<div data-ouder><span data-naam></span></div>'
    const dubbel = vi.fn()
    document.querySelector('[data-ouder]')!.addEventListener('dblclick', dubbel)

    expect(voerUit({ soort: 'dubbelklik', doel: '[data-naam]' })).toBe(true)
    expect(dubbel).toHaveBeenCalledOnce()
  })

  it('typt in een veld en verlaat het weer', () => {
    document.body.innerHTML = '<input data-veld />'
    const veld = document.querySelector('input')!
    const verlaten = vi.fn()
    veld.addEventListener('focusout', verlaten)
    veld.focus()

    expect(voerUit({ soort: 'typ', doel: '[data-veld]', tekst: 'Nonkel Jef' })).toBe(true)
    expect(veld.value).toBe('Nonkel Jef')
    expect(verlaten).toHaveBeenCalledOnce()
  })

  it('meldt een ontbrekend doel in plaats van te struikelen', () => {
    expect(voerUit({ soort: 'klik', doel: '[data-weg]' })).toBe(false)
  })
})
