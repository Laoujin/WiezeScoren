export type SpelerId = 0 | 1 | 2 | 3

export const SPELER_IDS: readonly SpelerId[] = [0, 1, 2, 3]

/** Alle slagen van een deal; boven dit aantal bestaat er niets. */
export const ALLE_SLAGEN = 13

export const AANTAL_MADAMS = 4

export const SPEELBARE_CONTRACTEN = [
  'vragen',
  'troel',
  'alleen',
  'abondance',
  'miserie',
  'miserieOpTafel',
  'soloSlim',
] as const

export type SpeelbaarContract = (typeof SPEELBARE_CONTRACTEN)[number]

export type ContractType = SpeelbaarContract | 'passen' | 'correctie'

export type ContractConfig = {
  naam: string
  slagenNodig: number
  puntenGehaald: number
  puntenVerloren: number
  perExtraSlag: number
  perSlagTekort: number
  /** Verdubbelt de inzet wanneer het kamp alle dertien slagen pakt. */
  verdubbelBijAlleSlagen: boolean
  /** Wint de pot bij een geslaagd contract en verdubbelt hem bij verlies. */
  wintDePot: boolean
  /** Toegelaten aantal spelers in het spelende kamp. */
  kampGroottes: number[]
  /** Geen slagenteller: het contract slaagt enkel op exact `slagenNodig`. */
  allesOfNiets: boolean
}

export type Config = {
  contracten: Record<SpeelbaarContract, ContractConfig>
  /** Wat elke madam in een pasronde kost aan de speler die haar vasthoudt. */
  madamWaarde: number
}

export const STANDAARD_CONFIG: Config = {
  madamWaarde: 3,
  contracten: {
    vragen: {
      naam: 'Vragen',
      slagenNodig: 8,
      puntenGehaald: 2,
      puntenVerloren: 3,
      perExtraSlag: 1,
      perSlagTekort: 1,
      verdubbelBijAlleSlagen: true,
      wintDePot: false,
      kampGroottes: [2],
      allesOfNiets: false,
    },
    troel: {
      naam: 'Troel',
      slagenNodig: 8,
      puntenGehaald: 4,
      puntenVerloren: 6,
      perExtraSlag: 2,
      perSlagTekort: 2,
      verdubbelBijAlleSlagen: true,
      wintDePot: false,
      kampGroottes: [2],
      allesOfNiets: false,
    },
    alleen: {
      naam: 'Alleen gaan',
      slagenNodig: 5,
      puntenGehaald: 2,
      puntenVerloren: 3,
      perExtraSlag: 1,
      perSlagTekort: 1,
      verdubbelBijAlleSlagen: true,
      wintDePot: false,
      kampGroottes: [1],
      allesOfNiets: false,
    },
    abondance: {
      naam: 'Abondance',
      slagenNodig: 9,
      puntenGehaald: 15,
      puntenVerloren: 15,
      perExtraSlag: 0,
      perSlagTekort: 0,
      verdubbelBijAlleSlagen: false,
      wintDePot: true,
      kampGroottes: [1],
      allesOfNiets: false,
    },
    miserie: {
      naam: 'Miserie',
      slagenNodig: 0,
      puntenGehaald: 15,
      puntenVerloren: 15,
      perExtraSlag: 0,
      perSlagTekort: 0,
      verdubbelBijAlleSlagen: false,
      wintDePot: true,
      kampGroottes: [1, 2],
      allesOfNiets: true,
    },
    miserieOpTafel: {
      naam: 'Miserie op tafel',
      slagenNodig: 0,
      puntenGehaald: 30,
      puntenVerloren: 30,
      perExtraSlag: 0,
      perSlagTekort: 0,
      verdubbelBijAlleSlagen: false,
      wintDePot: true,
      kampGroottes: [1, 2],
      allesOfNiets: true,
    },
    soloSlim: {
      naam: 'Solo slim',
      slagenNodig: 13,
      puntenGehaald: 50,
      puntenVerloren: 50,
      perExtraSlag: 0,
      perSlagTekort: 0,
      verdubbelBijAlleSlagen: false,
      wintDePot: true,
      kampGroottes: [1],
      allesOfNiets: true,
    },
  },
}

export const CONTRACT_NAMEN: Record<ContractType, string> = {
  ...(Object.fromEntries(
    SPEELBARE_CONTRACTEN.map((c) => [c, STANDAARD_CONFIG.contracten[c].naam]),
  ) as Record<SpeelbaarContract, string>),
  passen: 'Passen',
  correctie: 'Correctie',
}

export function telMadams(madams: Partial<Record<SpelerId, number>> = {}): number {
  return SPELER_IDS.reduce<number>((totaal, speler) => totaal + (madams[speler] ?? 0), 0)
}

export function isSpeelbaar(contract: ContractType): contract is SpeelbaarContract {
  return (SPEELBARE_CONTRACTEN as readonly string[]).includes(contract)
}
