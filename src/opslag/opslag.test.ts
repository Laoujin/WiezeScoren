import { beforeEach, describe, expect, it } from 'vitest'
import { STANDAARD_CONFIG } from '../domein/contracten'
import { maakRonde, nieuwSpel, voegRondeToe } from '../domein/spel'
import { GEZINS_PLOEG, STANDAARD_PLOEG } from '../domein/ploeg'
import {
  archiveer,
  heropen,
  bewaarVoorkeuren,
  bewaarPloegen,
  bewaarConfig,
  bewaarSpel,
  laadArchief,
  laadConfig,
  laadPloegen,
  laadSpel,
  laadVoorkeuren,
  magTutorialTonen,
  markeerTutorialGezien,
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

  it('zet de zetels van de actieve ploeg aan tafel', () => {
    expect(laadSpel(opslag).spelers).toEqual(['Tom', 'Caro', 'Lies', 'Bert'])
  })

  it('volgt de bewaarde zetels van de actieve ploeg', () => {
    bewaarPloegen(opslag, {
      actief: 'standaard',
      standaard: { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] },
      gezin: { leden: GEZINS_PLOEG, zetels: [] },
    })
    expect(laadSpel(opslag).spelers).toEqual(['Fien', 'Tom', 'Bert', 'Caro'])
  })

  it('herstelt naar een vers spel bij onleesbare data', () => {
    opslag.setItem('wiezen.spel', '{kapot')
    expect(laadSpel(opslag).rondes).toEqual([])
  })
})

describe('ploegen', () => {
  it('begint bij de standaardploeg wanneer er niets bewaard is', () => {
    const ploegen = laadPloegen(opslag)
    expect(ploegen.actief).toBe('standaard')
    expect(ploegen.standaard.leden).toEqual(STANDAARD_PLOEG)
    expect(ploegen.gezin.leden).toEqual(GEZINS_PLOEG)
  })

  it('leest een oude ploeglijst als het gezin en houdt dat gezin actief', () => {
    opslag.setItem('wiezen.ploeg', JSON.stringify([{ id: 'gert', naam: 'Gerrit' }]))
    const ploegen = laadPloegen(opslag)
    expect(ploegen.actief).toBe('gezin')
    expect(ploegen.gezin.leden).toEqual([{ id: 'gert', naam: 'Gerrit', avatar: 'gert.webp' }])
    expect(ploegen.standaard.leden).toEqual(STANDAARD_PLOEG)
  })

  it('laat een zelf gekozen avatar staan in een oude ploeglijst', () => {
    const eigen = [{ id: 'gert', naam: 'Gert', avatar: 'eigen.webp' }]
    opslag.setItem('wiezen.ploeg', JSON.stringify(eigen))
    expect(laadPloegen(opslag).gezin.leden).toEqual(eigen)
  })

  it('valt terug op de standaardploeg bij een lege oude lijst', () => {
    opslag.setItem('wiezen.ploeg', '[]')
    expect(laadPloegen(opslag).actief).toBe('standaard')
  })

  it('bewaart en herleest beide ploegen met hun zetels', () => {
    const ploegen = {
      actief: 'gezin' as const,
      standaard: { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] },
      gezin: { leden: GEZINS_PLOEG, zetels: ['Zus', 'Gert', 'Moe', 'Va'] },
    }
    bewaarPloegen(opslag, ploegen)
    expect(laadPloegen(opslag)).toEqual(ploegen)
  })

  it('vult een ontbrekende foto aan bij het gezin', () => {
    bewaarPloegen(opslag, {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: [{ id: 'gert', naam: 'Gert' }], zetels: [] },
    })
    expect(laadPloegen(opslag).gezin.leden).toEqual([
      { id: 'gert', naam: 'Gert', avatar: 'gert.webp' },
    ])
  })

  it('laat een gast zonder foto met rust', () => {
    bewaarPloegen(opslag, {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: [{ id: 'gast-1', naam: 'Jef' }], zetels: [] },
    })
    expect(laadPloegen(opslag).gezin.leden).toEqual([{ id: 'gast-1', naam: 'Jef' }])
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
  it('begint met een vierkante tafel', () => {
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('vierkant')
  })

  it('bewaart een gekozen tafelvorm', () => {
    bewaarVoorkeuren(opslag, { tafelvorm: 'rond' })
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('rond')
  })

  it('negeert een onbekende tafelvorm', () => {
    opslag.setItem('wiezen.voorkeuren', JSON.stringify({ tafelvorm: 'driehoek' }))
    expect(laadVoorkeuren(opslag).tafelvorm).toBe('vierkant')
  })
})

describe('tutorial', () => {
  it('toont de rondleiding bij een verse partij', () => {
    expect(magTutorialTonen(opslag)).toBe(true)
  })

  it('houdt de rondleiding weg zodra ze gezien is', () => {
    markeerTutorialGezien(opslag)
    expect(magTutorialTonen(opslag)).toBe(false)
  })

  it('valt een lopende partij niet lastig', () => {
    bewaarSpel(opslag, voegRondeToe(nieuwSpel(), maakRonde({ contract: 'vragen', spelers: [0, 1], slagen: 9 })))
    expect(magTutorialTonen(opslag)).toBe(false)
  })
})
