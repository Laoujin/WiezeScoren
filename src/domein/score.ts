import { ALLE_SLAGEN, SPELER_IDS, isSpeelbaar, type Config, type SpelerId } from './contracten'
import type { Ronde } from './spel'

export type Punten = Record<SpelerId, number>

export type RondeUitkomst = {
  punten: Punten
  potVoor: number
  potNa: number
}

export const GEEN_PUNTEN: Punten = { 0: 0, 1: 0, 2: 0, 3: 0 }

export function somVan(punten: Punten): number {
  return SPELER_IDS.reduce<number>((totaal, speler) => totaal + punten[speler], 0)
}

/** Verdeelt een bedrag zo gelijk mogelijk; de rest gaat naar de eerste ontvangers. */
export function verdeel(bedrag: number, aantal: number): number[] {
  const basis = Math.trunc(bedrag / aantal)
  const rest = bedrag - basis * aantal
  const stap = Math.sign(rest)
  return Array.from({ length: aantal }, (_, i) => (i < Math.abs(rest) ? basis + stap : basis))
}

export function contractGehaald(ronde: Ronde, config: Config): boolean {
  if (!isSpeelbaar(ronde.contract)) return false
  const c = config.contracten[ronde.contract]
  return c.hoogstens ? ronde.slagen <= c.slagenNodig : ronde.slagen >= c.slagenNodig
}

/**
 * De inzet die elke tegenstander van het spelende kamp neerlegt. Het kamp verdeelt de volledige
 * inleg, waardoor een solist driemaal de inzet wint en een duo eenmaal.
 */
export function contractWaarde(ronde: Ronde, config: Config): number {
  if (!isSpeelbaar(ronde.contract)) return 0
  const c = config.contracten[ronde.contract]
  if (!contractGehaald(ronde, config)) {
    return c.puntenVerloren + (c.slagenNodig - ronde.slagen) * c.perSlagTekort
  }
  const waarde = c.puntenGehaald + (ronde.slagen - c.slagenNodig) * c.perExtraSlag
  return c.verdubbelBijAlleSlagen && ronde.slagen === ALLE_SLAGEN ? waarde * 2 : waarde
}

/** De punten van het contract zelf, zonder de pot. */
export function berekenPunten(ronde: Ronde, config: Config): Punten {
  if (!isSpeelbaar(ronde.contract) || ronde.spelers.length === 0) return { ...GEEN_PUNTEN }

  const kamp = ronde.spelers
  const aantalTegenstanders = SPELER_IDS.length - kamp.length
  const inleg = contractWaarde(ronde, config) * aantalTegenstanders
  const teken = contractGehaald(ronde, config) ? 1 : -1

  const punten = { ...GEEN_PUNTEN }
  for (const speler of SPELER_IDS) {
    punten[speler] = kamp.includes(speler)
      ? (teken * inleg) / kamp.length
      : (-teken * inleg) / aantalTegenstanders
  }
  return punten
}

/** Wat elke speler betaalt voor de madams die hij in een pasronde vasthoudt. */
export function madamPunten(ronde: Ronde, config: Config): Punten {
  const punten = { ...GEEN_PUNTEN }
  for (const speler of SPELER_IDS) {
    const madams = ronde.madams?.[speler] ?? 0
    if (madams > 0) punten[speler] = -(madams * config.madamWaarde)
  }
  return punten
}

export function speelRonde(ronde: Ronde, config: Config, potVoor: number): RondeUitkomst {
  if (ronde.contract === 'passen') {
    const punten = madamPunten(ronde, config)
    return { punten, potVoor, potNa: potVoor - somVan(punten) }
  }
  if (!isSpeelbaar(ronde.contract) || ronde.spelers.length === 0) {
    return { punten: { ...GEEN_PUNTEN }, potVoor, potNa: potVoor }
  }

  const punten = berekenPunten(ronde, config)
  if (!config.contracten[ronde.contract].wintDePot) return { punten, potVoor, potNa: potVoor }

  const gehaald = contractGehaald(ronde, config)
  const delen = verdeel(gehaald ? potVoor : -potVoor, ronde.spelers.length)
  ronde.spelers.forEach((speler, i) => {
    punten[speler] += delen[i] ?? 0
  })
  return { punten, potVoor, potNa: gehaald ? 0 : potVoor * 2 }
}
