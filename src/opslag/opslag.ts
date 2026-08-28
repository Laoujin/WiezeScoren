import {
  SPEELBARE_CONTRACTEN,
  STANDAARD_CONFIG,
  type Config,
  type ContractConfig,
} from '../domein/contracten'
import { nieuwSpel, type Spel } from '../domein/spel'

const SLEUTELS = {
  spel: 'wiezen.spel',
  config: 'wiezen.config',
  archief: 'wiezen.archief',
} as const

function lees<T>(opslag: Storage, sleutel: string): T | undefined {
  const ruw = opslag.getItem(sleutel)
  if (ruw === null) return undefined
  try {
    return JSON.parse(ruw) as T
  } catch {
    return undefined
  }
}

function schrijf(opslag: Storage, sleutel: string, waarde: unknown): void {
  opslag.setItem(sleutel, JSON.stringify(waarde))
}

export function laadSpel(opslag: Storage): Spel {
  const spel = lees<Spel>(opslag, SLEUTELS.spel)
  return spel?.rondes ? spel : nieuwSpel()
}

export function bewaarSpel(opslag: Storage, spel: Spel): void {
  schrijf(opslag, SLEUTELS.spel, spel)
}

type BewaardeConfig = {
  madamWaarde?: number
  contracten?: Partial<Record<string, Partial<ContractConfig>>>
}

/** Bewaarde instellingen kunnen ouder zijn dan de contractdefinitie, dus veld per veld aanvullen. */
export function laadConfig(opslag: Storage): Config {
  const bewaard = lees<BewaardeConfig>(opslag, SLEUTELS.config)
  if (!bewaard) return STANDAARD_CONFIG
  return {
    madamWaarde: bewaard.madamWaarde ?? STANDAARD_CONFIG.madamWaarde,
    contracten: Object.fromEntries(
      SPEELBARE_CONTRACTEN.map((contract) => [
        contract,
        { ...STANDAARD_CONFIG.contracten[contract], ...bewaard.contracten?.[contract] },
      ]),
    ) as Config['contracten'],
  }
}

export function bewaarConfig(opslag: Storage, config: Config): void {
  schrijf(opslag, SLEUTELS.config, config)
}

export function laadArchief(opslag: Storage): Spel[] {
  return lees<Spel[]>(opslag, SLEUTELS.archief) ?? []
}

export function bewaarArchief(opslag: Storage, archief: Spel[]): void {
  schrijf(opslag, SLEUTELS.archief, archief)
}

export function archiveer(opslag: Storage, spel: Spel): Spel {
  if (spel.rondes.length > 0) bewaarArchief(opslag, [spel, ...laadArchief(opslag)])
  const vers = nieuwSpel(spel.spelers)
  bewaarSpel(opslag, vers)
  return vers
}

export function wisAlles(opslag: Storage): void {
  for (const sleutel of Object.values(SLEUTELS)) opslag.removeItem(sleutel)
}
