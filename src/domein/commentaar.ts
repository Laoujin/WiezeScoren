import { ALLE_SLAGEN, isSpeelbaar, type Config, type SpelerId } from './contracten'
import { contractGehaald, contractWaarde } from './score'
import type { Rondestand } from './spel'

export type Commentaar = { emoji: string; regel: string }

export const START_COMMENTAAR: Commentaar = {
  emoji: '🚩',
  regel: 'Het veld staat aan de start. Wie deelt, deelt straks ook de klappen uit.',
}

/** Kiest per ronde altijd dezelfde variant, zodat het scorebord niet begint te babbelen. */
function kies(varianten: string[], zaad: string): string {
  let som = 0
  for (const teken of zaad) som += teken.charCodeAt(0)
  return varianten[som % varianten.length]!
}

function kampNamen(spelers: SpelerId[], namen: string[]): string {
  const gekozen = spelers.map((s) => namen[s] ?? '')
  return gekozen.length === 2 ? `${gekozen[0]} en ${gekozen[1]}` : (gekozen[0] ?? 'niemand')
}

export function commentaar(stand: Rondestand, namen: string[], config: Config): Commentaar {
  const { ronde, potVoor, potNa } = stand
  const kamp = kampNamen(ronde.spelers, namen)

  if (ronde.contract === 'correctie') {
    return {
      emoji: '📋',
      regel: kies(
        [
          'De jury grijpt in en zet de cijfers met de hand recht.',
          'Rekenfout hersteld. De jury heeft altijd gelijk, ook als ze het niet heeft.',
        ],
        ronde.id,
      ),
    }
  }

  if (ronde.contract === 'passen') {
    return {
      emoji: '🐢',
      regel: kies(
        [
          `Vier keer de kop naar de grond. Niemand durft en de premie dikt aan tot ${potNa}.`,
          `Passen, passen, passen, passen. De pot staat op ${potNa} en lacht met heel de tafel.`,
          `De madams blijven plakken en de premie klimt naar ${potNa}.`,
        ],
        ronde.id,
      ),
    }
  }

  if (!isSpeelbaar(ronde.contract) || ronde.spelers.length === 0) {
    return START_COMMENTAAR
  }

  const c = config.contracten[ronde.contract]
  const gehaald = contractGehaald(ronde, config)
  const waarde = contractWaarde(ronde, config)

  if (gehaald && c.verdubbelBijAlleSlagen && ronde.slagen === ALLE_SLAGEN) {
    return {
      emoji: '⚡',
      regel: kies(
        [
          `ALLE DERTIEN! ${kamp} laten geen kruimel liggen — dubbel tarief.`,
          `Dertien op dertien voor ${kamp}. Dat kost de rest dubbel en de eer helemaal.`,
        ],
        ronde.id,
      ),
    }
  }

  if (ronde.contract === 'soloSlim') {
    return gehaald
      ? {
          emoji: '🚀',
          regel: kies(
            [
              `SOLO SLIM! ${kamp} rijdt dertien slagen alleen naar huis. Dit vertellen we nog aan de kleinkinderen.`,
              `${kamp} solo weg en solo aan de finish: dertien uit dertien. Zet daar een standbeeld voor.`,
            ],
            ronde.id,
          ),
        }
      : {
          emoji: '💥',
          regel: kies(
            [
              `${kamp} kondigde solo slim aan en ligt nu in de gracht: ${waarde} punten per man.`,
              `De solo van ${kamp} strandt op ${ronde.slagen} slagen. Solo slim, solo verdriet.`,
            ],
            ronde.id,
          ),
        }
  }

  if (c.allesOfNiets) {
    return gehaald
      ? {
          emoji: '🧊',
          regel: kies(
            [
              `${kamp} raakt geen enkele slag aan — precies de bedoeling. IJskoud.`,
              `Niets pakken is ook een kunst: ${kamp} rijdt een propere ${c.naam.toLowerCase()}.`,
            ],
            ronde.id,
          ),
        }
      : {
          emoji: '🔥',
          regel: kies(
            [
              `${kamp} pakt ${ronde.slagen} slag te veel. Miserie is hier geen contract meer maar een toestand.`,
              `Eén slag te veel en de ${c.naam.toLowerCase()} van ${kamp} staat in brand.`,
            ],
            ronde.id,
          ),
        }
  }

  if (gehaald && c.wintDePot && potVoor > 0) {
    return {
      emoji: '🏆',
      regel: kies(
        [
          `${kamp} graait de premie van ${potVoor} mee. Kassa.`,
          `De pot van ${potVoor} verhuist naar ${kamp}, en de rest applaudisseert met tegenzin.`,
        ],
        ronde.id,
      ),
    }
  }

  if (gehaald) {
    return {
      emoji: '🚴',
      regel: kies(
        [
          `${kamp} rijden ${c.naam.toLowerCase()} binnen alsof het niets is: ${ronde.slagen} slagen.`,
          `Geen speld tussen te krijgen. ${kamp} pakken ${ronde.slagen} slagen.`,
          `${kamp} demarreren en de rest kijkt naar de kasseien.`,
        ],
        ronde.id,
      ),
    }
  }

  const tekort = c.slagenNodig - ronde.slagen
  return {
    emoji: '🩹',
    regel: kies(
      [
        `${kamp} komt ${tekort} slag te kort. Dat wordt ${waarde} punten op de rekening.`,
        `${kamp} ontploft op de laatste kasseistrook: ${ronde.slagen} van de ${c.slagenNodig} slagen.`,
        `Te weinig, te laat. ${kamp} strandt op ${ronde.slagen} slagen.`,
      ],
      ronde.id,
    ),
  }
}
