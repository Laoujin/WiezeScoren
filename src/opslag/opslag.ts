import {
  SPEELBARE_CONTRACTEN,
  STANDAARD_CONFIG,
  type Config,
  type ContractConfig,
  type SpeelbaarContract,
} from '../domein/contracten'
import {
  GEZINS_PLOEG,
  STANDAARD_PLOEG,
  VERSE_PLOEGEN,
  zetelnamen,
  type Ploegen,
  type Ploeglid,
  type Ploegstand,
} from '../domein/ploeg'
import { nieuwSpel, type Spel } from '../domein/spel'
import { STANDAARD_VOORKEUREN, isTafelvorm, type Voorkeuren } from '../domein/voorkeuren'

const SLEUTELS = {
  spel: 'wiezen.spel',
  config: 'wiezen.config',
  archief: 'wiezen.archief',
  ploeg: 'wiezen.ploeg',
  voorkeuren: 'wiezen.voorkeuren',
  tutorial: 'wiezen.tutorial',
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

/** Een bewaarde ploeg kan ouder zijn dan de avatars, dus ontbrekende foto's per lid aanvullen. */
function vulAan(leden: Ploeglid[], standaard: Ploeglid[]): Ploeglid[] {
  return leden.map((lid) => {
    const bron = standaard.find((s) => s.id === lid.id)
    return lid.avatar || !bron?.avatar ? lid : { ...lid, avatar: bron.avatar }
  })
}

function standVan(bewaard: Ploegstand | undefined, standaard: Ploeglid[]): Ploegstand {
  if (!Array.isArray(bewaard?.leden) || bewaard.leden.length === 0)
    return { leden: standaard, zetels: [] }
  return { leden: vulAan(bewaard.leden, standaard), zetels: bewaard.zetels ?? [] }
}

/** Een array is de vorm van voor de standaardploeg: dat was toen het gezin, dus dat blijft actief. */
export function laadPloegen(opslag: Storage): Ploegen {
  const bewaard = lees<Ploegen | Ploeglid[]>(opslag, SLEUTELS.ploeg)
  if (Array.isArray(bewaard)) {
    if (bewaard.length === 0) return VERSE_PLOEGEN
    return {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: vulAan(bewaard, GEZINS_PLOEG), zetels: [] },
    }
  }
  if (!bewaard) return VERSE_PLOEGEN
  return {
    actief: bewaard.actief === 'gezin' ? 'gezin' : 'standaard',
    standaard: standVan(bewaard.standaard, STANDAARD_PLOEG),
    gezin: standVan(bewaard.gezin, GEZINS_PLOEG),
  }
}

export function bewaarPloegen(opslag: Storage, ploegen: Ploegen): void {
  schrijf(opslag, SLEUTELS.ploeg, ploegen)
}

/** Een verse partij zet de zetels van de actieve ploeg aan tafel. */
export function laadSpel(opslag: Storage): Spel {
  const spel = lees<Spel>(opslag, SLEUTELS.spel)
  if (spel?.rondes) return spel
  const ploegen = laadPloegen(opslag)
  return nieuwSpel(zetelnamen(ploegen[ploegen.actief]))
}

export function bewaarSpel(opslag: Storage, spel: Spel): void {
  schrijf(opslag, SLEUTELS.spel, spel)
}

type BewaardeConfig = {
  madamWaarde?: number
  contracten?: Partial<Record<string, Partial<ContractConfig>>>
}

/** Deze velden horen bij de spelregel zelf en zijn niet instelbaar; ze blijven dus standaard. */
const VASTE_VELDEN = ['naam', 'kampGroottes', 'hoogstens', 'geenSlagenteller'] as const

function vasteVelden(contract: SpeelbaarContract): Partial<ContractConfig> {
  return Object.fromEntries(
    VASTE_VELDEN.map((veld) => [veld, STANDAARD_CONFIG.contracten[contract][veld]]),
  )
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
        {
          ...STANDAARD_CONFIG.contracten[contract],
          ...bewaard.contracten?.[contract],
          ...vasteVelden(contract),
        },
      ]),
    ) as Config['contracten'],
  }
}

export function bewaarConfig(opslag: Storage, config: Config): void {
  schrijf(opslag, SLEUTELS.config, config)
}

export function laadVoorkeuren(opslag: Storage): Voorkeuren {
  const bewaard = lees<Partial<Voorkeuren>>(opslag, SLEUTELS.voorkeuren)
  return {
    tafelvorm: isTafelvorm(bewaard?.tafelvorm)
      ? bewaard.tafelvorm
      : STANDAARD_VOORKEUREN.tafelvorm,
  }
}

export function bewaarVoorkeuren(opslag: Storage, voorkeuren: Voorkeuren): void {
  schrijf(opslag, SLEUTELS.voorkeuren, voorkeuren)
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

/** Ruilt de lopende partij om met een gearchiveerde; een lege lopende partij verdwijnt gewoon. */
export function heropen(opslag: Storage, lopend: Spel, spelId: string): Spel {
  const archief = laadArchief(opslag)
  const gezocht = archief.find((s) => s.id === spelId)
  if (!gezocht) return lopend

  const rest = archief.filter((s) => s.id !== spelId)
  bewaarArchief(opslag, lopend.rondes.length > 0 ? [lopend, ...rest] : rest)
  bewaarSpel(opslag, gezocht)
  return gezocht
}

/** De rondleiding dringt zich enkel op aan wie ze nog nooit zag en nog niets gespeeld heeft. */
export function magTutorialTonen(opslag: Storage): boolean {
  if (lees<boolean>(opslag, SLEUTELS.tutorial) === true) return false
  return laadSpel(opslag).rondes.length === 0
}

export function markeerTutorialGezien(opslag: Storage): void {
  schrijf(opslag, SLEUTELS.tutorial, true)
}

export function wisAlles(opslag: Storage): void {
  for (const sleutel of Object.values(SLEUTELS)) opslag.removeItem(sleutel)
}
