import { describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG, type Config, type SpelerId } from './contracten'
import { berekenPunten } from './score'
import type { Ronde } from './spel'

function ronde(over: Partial<Ronde>): Ronde {
  return { id: 'r', deler: 0, contract: 'vragen', spelers: [0, 1], slagen: 8, ...over }
}

function som(punten: Record<SpelerId, number>): number {
  return punten[0] + punten[1] + punten[2] + punten[3]
}

describe('berekenPunten', () => {
  describe('vragen', () => {
    it('geeft elk kamplid 2 bij precies 8 slagen', () => {
      expect(berekenPunten(ronde({ slagen: 8 }), STANDAARD_CONFIG)).toEqual({
        0: 2,
        1: 2,
        2: -2,
        3: -2,
      })
    })

    it('telt 1 punt per overslag', () => {
      expect(berekenPunten(ronde({ slagen: 11 }), STANDAARD_CONFIG)).toEqual({
        0: 5,
        1: 5,
        2: -5,
        3: -5,
      })
    })

    it('kost 3 bij verlies met 7 slagen', () => {
      expect(berekenPunten(ronde({ slagen: 7 }), STANDAARD_CONFIG)).toEqual({
        0: -4,
        1: -4,
        2: 4,
        3: 4,
      })
    })

    it('rekent 3 plus 1 per slag tekort', () => {
      expect(berekenPunten(ronde({ slagen: 5 }), STANDAARD_CONFIG)[0]).toBe(-6)
    })
  })

  describe('troel', () => {
    it('verdubbelt de waarden van vragen', () => {
      const punten = berekenPunten(ronde({ contract: 'troel', slagen: 9 }), STANDAARD_CONFIG)
      expect(punten).toEqual({ 0: 6, 1: 6, 2: -6, 3: -6 })
    })

    it('kost 6 plus 2 per slag tekort', () => {
      expect(
        berekenPunten(ronde({ contract: 'troel', slagen: 6 }), STANDAARD_CONFIG)[0],
      ).toBe(-10)
    })
  })

  describe('alleen gaan', () => {
    const alleen = (slagen: number) =>
      berekenPunten(ronde({ contract: 'alleen', spelers: [2], slagen }), STANDAARD_CONFIG)

    it('geeft de speler driemaal de waarde bij 5 slagen', () => {
      expect(alleen(5)).toEqual({ 0: -2, 1: -2, 2: 6, 3: -2 })
    })

    it('telt 1 punt per overslag voor elke tegenstander', () => {
      expect(alleen(7)).toEqual({ 0: -4, 1: -4, 2: 12, 3: -4 })
    })

    it('kost driemaal 3 plus de slagen tekort', () => {
      expect(alleen(3)).toEqual({ 0: 5, 1: 5, 2: -15, 3: 5 })
    })
  })

  describe('abondance', () => {
    it('levert 45 op bij 9 slagen', () => {
      expect(
        berekenPunten(ronde({ contract: 'abondance', spelers: [1], slagen: 9 }), STANDAARD_CONFIG),
      ).toEqual({ 0: -15, 1: 45, 2: -15, 3: -15 })
    })

    it('negeert overslagen', () => {
      expect(
        berekenPunten(ronde({ contract: 'abondance', spelers: [1], slagen: 12 }), STANDAARD_CONFIG)[1],
      ).toBe(45)
    })

    it('kost 45 bij 8 slagen', () => {
      expect(
        berekenPunten(ronde({ contract: 'abondance', spelers: [1], slagen: 8 }), STANDAARD_CONFIG),
      ).toEqual({ 0: 15, 1: -45, 2: 15, 3: 15 })
    })
  })

  describe('miserie', () => {
    it('levert de solist 45 op bij nul slagen', () => {
      expect(
        berekenPunten(ronde({ contract: 'miserie', spelers: [3], slagen: 0 }), STANDAARD_CONFIG),
      ).toEqual({ 0: -15, 1: -15, 2: -15, 3: 45 })
    })

    it('kost de solist 45 zodra hij een slag pakt', () => {
      expect(
        berekenPunten(ronde({ contract: 'miserie', spelers: [3], slagen: 1 }), STANDAARD_CONFIG)[3],
      ).toBe(-45)
    })

    it('rekent twee miseriespelers af als kamp van twee', () => {
      expect(
        berekenPunten(ronde({ contract: 'miserie', spelers: [0, 2], slagen: 0 }), STANDAARD_CONFIG),
      ).toEqual({ 0: 15, 1: -15, 2: 15, 3: -15 })
    })
  })

  describe('miserie op tafel', () => {
    it('betaalt het dubbele van een gewone miserie', () => {
      expect(
        berekenPunten(
          ronde({ contract: 'miserieOpTafel', spelers: [0], slagen: 0 }),
          STANDAARD_CONFIG,
        )[0],
      ).toBe(90)
    })
  })

  describe('solo slim', () => {
    it('vereist alle dertien slagen', () => {
      expect(
        berekenPunten(ronde({ contract: 'soloSlim', spelers: [0], slagen: 13 }), STANDAARD_CONFIG)[0],
      ).toBe(150)
      expect(
        berekenPunten(ronde({ contract: 'soloSlim', spelers: [0], slagen: 12 }), STANDAARD_CONFIG)[0],
      ).toBe(-150)
    })
  })

  describe('alle slagen', () => {
    it('verdubbelt vragen: 2 plus 5 overslagen, maal twee', () => {
      expect(berekenPunten(ronde({ slagen: 13 }), STANDAARD_CONFIG)).toEqual({
        0: 14,
        1: 14,
        2: -14,
        3: -14,
      })
    })

    it('verdubbelt troel: 4 plus 5 maal 2 overslagen, maal twee', () => {
      expect(
        berekenPunten(ronde({ contract: 'troel', slagen: 13 }), STANDAARD_CONFIG)[0],
      ).toBe(28)
    })

    it('verdubbelt alleen gaan', () => {
      expect(
        berekenPunten(ronde({ contract: 'alleen', spelers: [2], slagen: 13 }), STANDAARD_CONFIG),
      ).toEqual({ 0: -20, 1: -20, 2: 60, 3: -20 })
    })

    it('laat twaalf slagen ongemoeid', () => {
      expect(berekenPunten(ronde({ slagen: 12 }), STANDAARD_CONFIG)[0]).toBe(6)
    })

    it('verdubbelt abondance niet', () => {
      expect(
        berekenPunten(ronde({ contract: 'abondance', spelers: [1], slagen: 13 }), STANDAARD_CONFIG)[1],
      ).toBe(45)
    })

    it('verdubbelt solo slim niet', () => {
      expect(
        berekenPunten(ronde({ contract: 'soloSlim', spelers: [0], slagen: 13 }), STANDAARD_CONFIG)[0],
      ).toBe(150)
    })
  })

  describe('passen en correctie', () => {
    it('levert niemand punten op', () => {
      expect(
        berekenPunten(ronde({ contract: 'passen', spelers: [], slagen: 0 }), STANDAARD_CONFIG),
      ).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
      expect(
        berekenPunten(ronde({ contract: 'correctie', spelers: [], slagen: 0 }), STANDAARD_CONFIG),
      ).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
    })
  })

  describe('nulsom', () => {
    const gevallen: Ronde[] = [
      ronde({ slagen: 13 }),
      ronde({ slagen: 0 }),
      ronde({ contract: 'alleen', spelers: [1], slagen: 13 }),
      ronde({ contract: 'troel', slagen: 10 }),
      ronde({ contract: 'alleen', spelers: [1], slagen: 4 }),
      ronde({ contract: 'abondance', spelers: [1], slagen: 9 }),
      ronde({ contract: 'miserie', spelers: [1, 3], slagen: 2 }),
      ronde({ contract: 'soloSlim', spelers: [0], slagen: 13 }),
    ]

    it.each(gevallen)('komt uit op nul voor $contract met $slagen slagen', (r) => {
      expect(som(berekenPunten(r, STANDAARD_CONFIG))).toBe(0)
    })
  })

  describe('aangepaste configuratie', () => {
    it('gebruikt de ingestelde waarden', () => {
      const config: Config = {
        ...STANDAARD_CONFIG,
        abondance: { ...STANDAARD_CONFIG.abondance, puntenGehaald: 10 },
      }
      expect(
        berekenPunten(ronde({ contract: 'abondance', spelers: [1], slagen: 9 }), config),
      ).toEqual({ 0: -10, 1: 30, 2: -10, 3: -10 })
    })
  })
})
