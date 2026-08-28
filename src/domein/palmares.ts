import { CONTRACT_NAMEN, SPELER_IDS, isSpeelbaar, type Config, type SpelerId } from './contracten'
import { contractGehaald } from './score'
import { heeftOverrides, type Rondestand } from './spel'

export type Ereplaats = {
  emoji: string
  titel: string
  winnaar: string
  detail: string
}

type Kandidaat = { speler: SpelerId; waarde: number; detail: string }

/** De hoogste kandidaat wint; bij een gelijke stand houdt de eerste speler de eer. */
function beste(kandidaten: Kandidaat[]): Kandidaat | null {
  return kandidaten.reduce<Kandidaat | null>(
    (top, k) => (top === null || k.waarde > top.waarde ? k : top),
    null,
  )
}

function ereplaats(
  emoji: string,
  titel: string,
  namen: string[],
  kandidaten: Kandidaat[],
  drempel = -Infinity,
): Ereplaats | null {
  const top = beste(kandidaten)
  if (!top || top.waarde <= drempel) return null
  return { emoji, titel, winnaar: namen[top.speler] ?? '', detail: top.detail }
}

function perSpeler(maak: (speler: SpelerId) => Kandidaat): Kandidaat[] {
  return SPELER_IDS.map(maak)
}

export function palmares(stand: Rondestand[], namen: string[], config: Config): Ereplaats[] {
  if (stand.length === 0) return []

  const totaal = (speler: SpelerId) => stand.reduce((som, s) => som + s.punten[speler], 0)

  const rondeUitschieter = (speler: SpelerId, richting: 1 | -1): Kandidaat => {
    const top = stand.reduce<Rondestand | null>(
      (beter, s) =>
        beter === null || richting * s.punten[speler] > richting * beter.punten[speler] ? s : beter,
      null,
    )
    const punten = top ? top.punten[speler] : 0
    return {
      speler,
      waarde: richting * punten,
      detail: top
        ? `${CONTRACT_NAMEN[top.ronde.contract]}, ${punten > 0 ? '+' : ''}${punten} in één ronde`
        : '',
    }
  }

  const aantalContracten = (speler: SpelerId, filter: (s: Rondestand) => boolean) =>
    stand.filter((s) => s.ronde.spelers.includes(speler) && filter(s)).length

  const potWinst = (speler: SpelerId) =>
    stand
      .filter(
        (s) =>
          s.ronde.spelers.includes(speler) &&
          isSpeelbaar(s.ronde.contract) &&
          config.contracten[s.ronde.contract].wintDePot &&
          contractGehaald(s.ronde, config),
      )
      .reduce((som, s) => som + Math.trunc(s.potVoor / s.ronde.spelers.length), 0)

  return [
    ereplaats(
      '🟡',
      'Gele trui',
      namen,
      perSpeler((speler) => ({
        speler,
        waarde: totaal(speler),
        detail: `${totaal(speler) > 0 ? '+' : ''}${totaal(speler)} punten aan de leiding`,
      })),
    ),
    ereplaats(
      '🔴',
      'Rode lantaarn',
      namen,
      perSpeler((speler) => ({
        speler,
        waarde: -totaal(speler),
        detail: `${totaal(speler)} punten, en toch blijven glimlachen`,
      })),
    ),
    ereplaats(
      '💥',
      'Grootste klapper',
      namen,
      perSpeler((speler) => rondeUitschieter(speler, 1)),
      0,
    ),
    ereplaats(
      '🩹',
      'Zwaarste smak',
      namen,
      perSpeler((speler) => rondeUitschieter(speler, -1)),
      0,
    ),
    ereplaats(
      '🧊',
      'Miseriekoning',
      namen,
      perSpeler((speler) => {
        const aantal = aantalContracten(speler, (s) =>
          ['miserie', 'miserieOpTafel'].includes(s.ronde.contract),
        )
        return { speler, waarde: aantal, detail: `${aantal} keer miserie aangekondigd` }
      }),
      0,
    ),
    ereplaats(
      '⚔️',
      'Aanvaller',
      namen,
      perSpeler((speler) => {
        const aantal = aantalContracten(speler, () => true)
        return {
          speler,
          waarde: aantal,
          detail: `${aantal} contract${aantal === 1 ? '' : 'en'} gespeeld`,
        }
      }),
      0,
    ),
    ereplaats(
      '🏆',
      'Potgraaier',
      namen,
      perSpeler((speler) => ({
        speler,
        waarde: potWinst(speler),
        detail: `${potWinst(speler)} punten premie opgehaald`,
      })),
      0,
    ),
  ].filter((e): e is Ereplaats => e !== null)
}

export type PartijFeiten = {
  rondes: number
  pasrondes: number
  hoogstePot: number
  handmatig: number
}

export function partijFeiten(stand: Rondestand[]): PartijFeiten {
  return {
    rondes: stand.length,
    pasrondes: stand.filter((s) => s.ronde.contract === 'passen').length,
    hoogstePot: stand.reduce((hoog, s) => Math.max(hoog, s.potVoor, s.potNa), 0),
    handmatig: stand.filter((s) => heeftOverrides(s.ronde)).length,
  }
}
