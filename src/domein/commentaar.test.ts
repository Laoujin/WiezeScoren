import { describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG, type ContractType, type SpelerId } from './contracten'
import { speelRonde } from './score'
import type { Rondestand } from './spel'
import { commentaar } from './commentaar'

const namen = ['An', 'Bo', 'Cis', 'Dirk']
const config = STANDAARD_CONFIG

function stand(
  contract: ContractType,
  spelers: SpelerId[],
  slagen: number,
  potVoor = 0,
  madams: Partial<Record<SpelerId, number>> = {},
  id = 'r1',
): Rondestand {
  const ronde = { id, deler: 0 as SpelerId, contract, spelers, slagen, madams }
  return { ...speelRonde(ronde, config, potVoor), ronde }
}

describe('commentaar', () => {
  it('noemt bij een geslaagd contract beide aanvallers', () => {
    const { emoji, regel } = commentaar(stand('vragen', [0, 2], 9), namen, config)
    expect(emoji).toBe('🚴')
    expect(regel).toContain('An')
    expect(regel).toContain('Cis')
  })

  it('roept bij alle dertien slagen het dubbele tarief uit', () => {
    expect(commentaar(stand('vragen', [0, 2], 13), namen, config).emoji).toBe('⚡')
  })

  it('viert een geslaagde solo slim en betreurt een mislukte', () => {
    expect(commentaar(stand('soloSlim', [1], 13), namen, config).emoji).toBe('🚀')
    expect(commentaar(stand('soloSlim', [1], 9), namen, config).emoji).toBe('💥')
  })

  it('scheidt een gehaalde miserie van een ontploffing', () => {
    expect(commentaar(stand('miserie', [3], 0), namen, config).emoji).toBe('🧊')
    expect(commentaar(stand('miserie', [3], 2), namen, config).emoji).toBe('🔥')
  })

  it('vermeldt de premie die de winnaar uit de pot meeneemt', () => {
    const { emoji, regel } = commentaar(stand('abondance', [2], 9, 12), namen, config)
    expect(emoji).toBe('🏆')
    expect(regel).toContain('12')
  })

  it('meldt bij een pasronde de nieuwe potstand', () => {
    const { emoji, regel } = commentaar(stand('passen', [], 0, 2, { 0: 2, 1: 2 }), namen, config)
    expect(emoji).toBe('🐢')
    expect(regel).toContain('14')
  })

  it('herkent een mislukt contract', () => {
    expect(commentaar(stand('vragen', [0, 1], 6), namen, config).emoji).toBe('🩹')
  })

  it('houdt een correctie bij de jury', () => {
    expect(commentaar(stand('correctie', [], 0), namen, config).emoji).toBe('📋')
  })

  it('geeft dezelfde ronde altijd dezelfde regel en wisselt per ronde', () => {
    const eerste = commentaar(stand('vragen', [0, 1], 9, 0, {}, 'aaa'), namen, config)
    expect(commentaar(stand('vragen', [0, 1], 9, 0, {}, 'aaa'), namen, config)).toEqual(eerste)
    const regels = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map(
        (id) => commentaar(stand('vragen', [0, 1], 9, 0, {}, id), namen, config).regel,
      ),
    )
    expect(regels.size).toBeGreaterThan(1)
  })
})
