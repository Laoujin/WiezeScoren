import { SPELER_IDS, type ContractType, type Config, type SpelerId } from './contracten'
import { GEEN_PUNTEN, berekenPunten, type Punten } from './score'

export type Ronde = {
  id: string
  deler: SpelerId
  contract: ContractType
  spelers: SpelerId[]
  slagen: number
  overrides?: Partial<Record<SpelerId, number>>
}

export type RondeInvoer = {
  contract: ContractType
  spelers: SpelerId[]
  slagen: number
}

export type Spel = {
  id: string
  gestartOp: string
  spelers: string[]
  deler: SpelerId
  rondes: Ronde[]
}

export const STANDAARD_NAMEN = ['Speler 1', 'Speler 2', 'Speler 3', 'Speler 4']

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

export function zetOverride(
  spel: Spel,
  rondeId: string,
  speler: SpelerId,
  punten: number,
): Spel {
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

export function puntenVanRonde(ronde: Ronde, config: Config): Punten {
  const berekend = berekenPunten(ronde, config)
  if (!ronde.overrides) return berekend
  const punten = { ...berekend }
  for (const speler of SPELER_IDS) {
    const override = ronde.overrides[speler]
    if (override !== undefined) punten[speler] = override
  }
  return punten
}

export function somVan(punten: Punten): number {
  return SPELER_IDS.reduce<number>((totaal, speler) => totaal + punten[speler], 0)
}

export function rondeSluit(ronde: Ronde, config: Config): boolean {
  return somVan(puntenVanRonde(ronde, config)) === 0
}

export function totalen(spel: Spel, config: Config): Punten {
  return spel.rondes.reduce<Punten>((totaal, ronde) => {
    const punten = puntenVanRonde(ronde, config)
    return {
      0: totaal[0] + punten[0],
      1: totaal[1] + punten[1],
      2: totaal[2] + punten[2],
      3: totaal[3] + punten[3],
    }
  }, { ...GEEN_PUNTEN })
}

export function hernoemSpeler(spel: Spel, speler: SpelerId, naam: string): Spel {
  const spelers = [...spel.spelers]
  spelers[speler] = naam.trim() || STANDAARD_NAMEN[speler]!
  return { ...spel, spelers }
}

export function zetDeler(spel: Spel, deler: SpelerId): Spel {
  return { ...spel, deler }
}

export function leiders(spel: Spel, config: Config): SpelerId[] {
  if (spel.rondes.length === 0) return []
  const stand = totalen(spel, config)
  const hoogste = Math.max(...SPELER_IDS.map((s) => stand[s]))
  return SPELER_IDS.filter((s) => stand[s] === hoogste)
}
