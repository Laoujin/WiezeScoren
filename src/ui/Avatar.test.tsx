// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

afterEach(cleanup)

function foto(): HTMLImageElement | null {
  return document.querySelector('img')
}

describe('Avatar', () => {
  it('valt terug op initialen zonder foto', () => {
    render(<Avatar naam="Lieve De Bodt" />)
    expect(screen.getByText('LD')).toBeTruthy()
    expect(foto()).toBeNull()
  })

  it('zoekt de foto onder de publicatiebasis', () => {
    render(<Avatar naam="Wouter" avatar="wouter.webp" />)
    expect(foto()?.getAttribute('src')).toBe(`${import.meta.env.BASE_URL}spelers/wouter.webp`)
  })

  it('valt terug op initialen wanneer de foto niet laadt', () => {
    render(<Avatar naam="Gert" avatar="weg.webp" />)
    fireEvent.error(foto()!)
    expect(screen.getByText('G')).toBeTruthy()
    expect(foto()).toBeNull()
  })

  it('tekent het icoon wanneer er geen foto is', () => {
    const { container } = render(<Avatar naam="Tom" icoon="vos" />)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.queryByText('T')).toBeNull()
  })

  it('laat de foto voorgaan op het icoon', () => {
    const { container } = render(<Avatar naam="Tom" avatar="wouter.webp" icoon="vos" />)
    expect(foto()).toBeTruthy()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('valt terug op het icoon wanneer de foto niet laadt', () => {
    const { container } = render(<Avatar naam="Tom" avatar="weg.webp" icoon="vos" />)
    fireEvent.error(foto()!)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
