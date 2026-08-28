import { SPELER_IDS, type ContractType, type Config, type SpelerId } from './contracten'
import { GEEN_PUNTEN, somVan, speelRonde, type Punten, type RondeUitkomst } from './score'

export type Ronde = {
  id: string
  deler: SpelerId
  contract: ContractType
  spelers: SpelerId[]
  slagen: number
  /** Aantal madams per speler; enkel bij een pasronde. */
  madams?: Partial<Record<SpelerId, number>>
  overrides?: Partial<Record<SpelerId, number>>
}

export type RondeInvoer = {
  contract: ContractType
  spelers: SpelerId[]
  slagen: number
  madams?: Partial<Record<SpelerId, number>>
}

export type Spel = {
  id: string
  gestartOp: string
  spelers: string[]
  deler: SpelerId
  rondes: Ronde[]
}

export type Rondestand = RondeUitkomst & { ronde: Ronde }

export const STANDAARD_NAMEN = ['Speler 1', 'Speler 2', 'Speler 3', 'Speler 4']

export { somVan }

function nieuweId(): string {
  return crypto.randomUUID()
}

export function nieuwSpel(spelers: string[] = STANDAARD_NAMEN): Spel {
  return {
    id: nieuweId(),
    gestartOp: new Date().toISOString(),
    spelers: SPELER_IDS.map((i) => spelers[i] ?? STANDAARD_NAMEN[i]!),
    deler: 0,
    rondes: [],
  }
}

export function maakRonde(invoer: RondeInvoer, deler: SpelerId = 0): Ronde {
  return { id: nieuweId(), deler, ...invoer }
}

export function volgendeDeler(deler: SpelerId): SpelerId {
  return ((deler + 1) % 4) as SpelerId
}

export function vorigeDeler(deler: SpelerId): SpelerId {
  return ((deler + 3) % 4) as SpelerId
}

/** Een correctie is geen gespeelde ronde en laat de deler dus staan. */
function schuiftDeler(ronde: Ronde): boolean {
  return ronde.contract !== 'correctie'
}

export function voegRondeToe(spel: Spel, ronde: Ronde): Spel {
  const gespeeld = { ...ronde, deler: spel.deler }
  return {
    ...spel,
    deler: schuiftDeler(gespeeld) ? volgendeDeler(spel.deler) : spel.deler,
    rondes: [...spel.rondes, gespeeld],
  }
}

export function verwijderRonde(spel: Spel, rondeId: string): Spel {
  const ronde = spel.rondes.find((r) => r.id === rondeId)
  if (!ronde) return spel
  return {
    ...spel,
    deler: schuiftDeler(ronde) ? vorigeDeler(spel.deler) : spel.deler,
    rondes: spel.rondes.filter((r) => r.id !== rondeId),
  }
}

function pasRondeAan(spel: Spel, rondeId: string, aanpassing: (ronde: Ronde) => Ronde): Spel {
  return { ...spel, rondes: spel.rondes.map((r) => (r.id === rondeId ? aanpassing(r) : r)) }
}

export function zetOverride(spel: Spel, rondeId: string, speler: SpelerId, punten: number): Spel {
  return pasRondeAan(spel, rondeId, (r) => ({
    ...r,
    overrides: { ...r.overrides, [speler]: punten },
  }))
}

export function wisOverrides(spel: Spel, rondeId: string): Spel {
  return pasRondeAan(spel, rondeId, ({ overrides: _weg, ...rest }) => rest)
}

export function heeftOverrides(ronde: Ronde): boolean {
  return Object.keys(ronde.overrides ?? {}).length > 0
}

function metOverrides(ronde: Ronde, punten: Punten): Punten {
  if (!ronde.overrides) return punten
  const aangepast = { ...punten }
  for (const speler of SPELER_IDS) {
    const override = ronde.overrides[speler]
    if (override !== undefined) aangepast[speler] = override
  }
  return aangepast
}

/** Speelt de partij van voren af aan door, zodat elke ronde de pot van dat moment ziet. */
export function verloop(spel: Spel, config: Config): Rondestand[] {
  let pot = 0
  return spel.rondes.map((ronde) => {
    const uitkomst = speelRonde(ronde, config, pot)
    pot = uitkomst.potNa
    return { ...uitkomst, ronde, punten: metOverrides(ronde, uitkomst.punten) }
  })
}

export function potVan(spel: Spel, config: Config): number {
  return verloop(spel, config).at(-1)?.potNa ?? 0
}

/** Een ronde sluit wanneer de punten samen met de potbeweging op nul uitkomen. */
export function rondeSluit(stand: Rondestand): boolean {
  return somVan(stand.punten) + (stand.potNa - stand.potVoor) === 0
}

export function totalenVan(stand: Rondestand[]): Punten {
  return stand.reduce<Punten>(
    (totaal, { punten }) => ({
      0: totaal[0] + punten[0],
      1: totaal[1] + punten[1],
      2: totaal[2] + punten[2],
      3: totaal[3] + punten[3],
    }),
    { ...GEEN_PUNTEN },
  )
}

export function totalen(spel: Spel, config: Config): Punten {
  return totalenVan(verloop(spel, config))
}

export function hernoemSpeler(spel: Spel, speler: SpelerId, naam: string): Spel {
  const spelers = [...spel.spelers]
  spelers[speler] = naam.trim() || STANDAARD_NAMEN[speler]!
  return { ...spel, spelers }
}

export function zetDeler(spel: Spel, deler: SpelerId): Spel {
  return { ...spel, deler }
}
