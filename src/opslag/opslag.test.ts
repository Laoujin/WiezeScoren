import { beforeEach, describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG } from '../domein/contracten'
import { maakRonde, nieuwSpel, voegRondeToe } from '../domein/spel'
import { STANDAARD_PLOEG } from '../domein/ploeg'
import {
  archiveer,
  heropen,
  bewaarVoorkeuren,
  bewaarPloeg,
  bewaarConfig,
  bewaarSpel,
  laadArchief,
  laadConfig,
  laadPloeg,
  laadSpel,
  laadVoorkeuren,
  wisAlles,
} from './opslag'

function nepOpslag(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  }
}

let opslag: Storage

beforeEach(() => {
  opslag = nepOpslag()
})

describe('spel', () => {
  it('geeft een vers spel terug wanneer er niets bewaard is', () => {
    expect(laadSpel(opslag).rondes).toEqual([])
  })

  it('bewaart en herleest een partij inclusief rondes', () => {
    const spel = voegRondeToe(
      nieuwSpel(['An', 'Bo', 'Cis', 'Dirk']),
      maakRonde({ contract: 'vragen', spelers: [0, 1], slagen: 9 }),
    )
    bewaarSpel(opslag, spel)
    expect(laadSpel(opslag)).toEqual(spel)
  })

  it('zet de eerste vier van de ploeg aan tafel', () => {
    expect(laadSpel(opslag).spelers).toEqual(['Wouter', 'Gert', 'Moe', 'Va'])
  })

  it('herstelt naar een vers spel bij onleesbare data', () => {
    opslag.setItem('wiezen.spel', '{kapot')
    expect(laadSpel(opslag).rondes).toEqual([])
  })
})

describe('ploeg', () => {
  it('geeft de standaardploeg terug wanneer er niets bewaard is', () => {
    expect(laadPloeg(opslag)).toEqual(STANDAARD_PLOEG)
  })

  it('bewaart en herleest een aangepaste ploeg', () => {
    const ploeg = [{ id: 'x', naam: 'Xavier', avatar: '/spelers/x.webp' }]
    bewaarPloeg(opslag, ploeg)
    expect(laadPloeg(opslag)).toEqual(ploeg)
  })

  it('valt terug op de standaardploeg bij een lege lijst', () => {
    opslag.setItem('wiezen.ploeg', '[]')
    expect(laadPloeg(opslag)).toEqual(STANDAARD_PLOEG)
  })
})

describe('config', () => {
  it('geeft de standaardwaarden terug wanneer er niets bewaard is', () => {
    expect(laadConfig(opslag)).toEqual(STANDAARD_CONFIG)
  })

  it('bewaart aangepaste waarden', () => {
    const config = {
      ...STANDAARD_CONFIG,
      madamWaarde: 5,
      contracten: {
        ...STANDAARD_CONFIG.contracten,
        vragen: { ...STANDAARD_CONFIG.contracten.vragen, puntenGehaald: 5 },
      },
    }
    bewaarConfig(opslag, config)
    expect(laadConfig(opslag).contracten.vragen.puntenGehaald).toBe(5)
    expect(laadConfig(opslag).madamWaarde).toBe(5)
  })

  it('vult ontbrekende velden aan met de standaardwaarde', () => {
    opslag.setItem('wiezen.config', JSON.stringify({ contracten: { vragen: { puntenGehaald: 9 } } }))
    const config = laadConfig(opslag)
    expect(config.contracten.vragen.puntenGehaald).toBe(9)
    expect(config.contracten.vragen.slagenNodig).toBe(STANDAARD_CONFIG.contracten.vragen.slagenNodig)
    expect(config.contracten.soloSlim).toEqual(STANDAARD_CONFIG.contracten.soloSlim)
    expect(config.madamWaarde).toBe(STANDAARD_CONFIG.madamWaarde)
  })

  it('houdt de vaste contracteigenschappen op de standaardwaarde', () => {
    opslag.setItem(
      'wiezen.config',
      JSON.stringify({
        contracten: { abondance: { geenSlagenteller: false, kampGroottes: [1, 2], naam: 'Oud' } },
      }),
    )
    expect(laadConfig(opslag).contracten.abondance).toEqual(STANDAARD_CONFIG.contracten.abondance)
  })
})

describe('archiveer', () => {
  it('verhuist de partij naar het archief en behoudt de namen', () => {
    const spel = voegRondeToe(
      nieuwSpel(['An', 'Bo', 'Cis', 'Dirk']),
      maakRonde({ contract: 'vragen', spelers: [0, 1], slagen: 9 }),
    )
    const vers = archiveer(opslag, spel)
    expect(laadArchief(opslag)).toEqual([spel])
    expect(vers.rondes).toEqual([])
    expect(vers.spelers).toEqual(['An', 'Bo', 'Cis', 'Dirk'])
    expect(laadSpel(opslag)).toEqual(vers)
  })

  it('archiveert een partij zonder rondes niet', () => {
    archiveer(opslag, nieuwSpel())
    expect(laadArchief(opslag)).toEqual([])
  })

  it('zet de nieuwste partij vooraan', () => {
    const eerste = voegRondeToe(nieuwSpel(), maakRonde({ contract: 'passen', spelers: [], slagen: 0 }))
    const tweede = voegRondeToe(nieuwSpel(), maakRonde({ contract: 'passen', spelers: [], slagen: 0 }))
    archiveer(opslag, eerste)
    archiveer(opslag, tweede)
    expect(laadArchief(opslag).map((s) => s.id)).toEqual([tweede.id, eerste.id])
  })
})

describe('heropen', () => {
  function metRonde(namen?: string[]) {
    return voegRondeToe(
      nieuwSpel(namen),
      maakRonde({ contract: 'vragen', spelers: [0, 1], slagen: 9 }),
    )
  }

  it('maakt de gearchiveerde partij weer de lopende', () => {
    const oud = metRonde(['An', 'Bo', 'Cis', 'Dirk'])
    const lopend = archiveer(opslag, oud)
    expect(heropen(opslag, lopend, oud.id)).toEqual(oud)
    expect(laadSpel(opslag)).toEqual(oud)
    expect(laadArchief(opslag)).toEqual([])
  })

  it('archiveert de lopende partij in ruil', () => {
    const oud = metRonde(['An', 'Bo', 'Cis', 'Dirk'])
    archiveer(opslag, oud)
    const lopend = metRonde()
    heropen(opslag, lopend, oud.id)
    expect(laadArchief(opslag)).toEqual([lopend])
  })

  it('laat een onbekende partij de lopende ongemoeid', () => {
    const lopend = metRonde()
    expect(heropen(opslag, lopend, 'onbekend')).toEqual(lopend)
    expect(laadArchief(opslag)).toEqual([])
  })
})

describe('wisAlles', () => {
  it('verwijdert partij, archief en instellingen', () => {
    bewaarSpel(opslag, nieuwSpel())
    bewaarConfig(opslag, STANDAARD_CONFIG)
    wisAlles(opslag)
    expect(opslag.length).toBe(0)
  })
})

describe('voorkeuren', () => {
  it('begint met een ronde tafel', () => {
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('rond')
  })

  it('bewaart een gekozen tafelvorm', () => {
    bewaarVoorkeuren(opslag, { tafelvorm: 'vierkant' })
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('vierkant')
  })

  it('negeert een onbekende tafelvorm', () => {
    opslag.setItem('wiezen.voorkeuren', JSON.stringify({ tafelvorm: 'driehoek' }))
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('rond')
  })
})
