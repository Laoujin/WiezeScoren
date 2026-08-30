import { useCallback, useEffect, useRef, useState } from 'react'
import type { Config, SpelerId } from '../domein/contracten'
import {
  hernoemInPloeg,
  maakGast,
  wisselPloeg,
  zetelnamen,
  type Ploegen,
  type Ploeglid,
} from '../domein/ploeg'
import {
  hernoemSpeler,
  maakRonde,
  verwijderRonde,
  voegRondeToe,
  wisOverrides,
  zetDeler,
  zetZetel,
  zetOverride,
  zetPotOverride,
  type RondeInvoer,
  type Spel,
} from '../domein/spel'
import type { Tafelvorm } from '../domein/voorkeuren'
import {
  archiveer,
  bewaarVoorkeuren,
  laadVoorkeuren,
  bewaarArchief,
  bewaarConfig,
  bewaarPloegen,
  bewaarSpel,
  heropen,
  laadArchief,
  laadConfig,
  laadPloegen,
  laadSpel,
} from '../opslag/opslag'

type Moment = { spel: Spel; ploegen: Ploegen }

export function useSpel() {
  const [spel, zetSpel] = useState<Spel>(() => laadSpel(localStorage))
  const [config, zetConfig] = useState<Config>(() => laadConfig(localStorage))
  const [archief, zetArchief] = useState<Spel[]>(() => laadArchief(localStorage))
  const [tafelvorm, zetTafelvormState] = useState<Tafelvorm>(
    () => laadVoorkeuren(localStorage).tafelvorm,
  )
  const [ploegen, zetPloegen] = useState<Ploegen>(() => laadPloegen(localStorage))
  const ploeg = ploegen[ploegen.actief].leden

  // De rondleiding speelt op de echte tafel; deze twee refs zetten haar sporen achteraf terug.
  const huidig = useRef<Moment>({ spel, ploegen })
  const moment = useRef<Moment | null>(null)
  useEffect(() => {
    huidig.current = { spel, ploegen }
  }, [spel, ploegen])

  const bewaarMoment = useCallback(() => {
    moment.current = huidig.current
  }, [])

  const herstelMoment = useCallback(() => {
    const bewaard = moment.current
    moment.current = null
    if (!bewaard) return
    zetSpel(bewaard.spel)
    zetPloegen(bewaard.ploegen)
  }, [])

  useEffect(() => bewaarSpel(localStorage, spel), [spel])
  useEffect(() => bewaarConfig(localStorage, config), [config])
  useEffect(() => bewaarPloegen(localStorage, ploegen), [ploegen])

  const speelRonde = useCallback((invoer: RondeInvoer) => {
    zetSpel((huidig) => voegRondeToe(huidig, maakRonde(invoer)))
  }, [])

  const wisRonde = useCallback((rondeId: string) => {
    zetSpel((huidig) => verwijderRonde(huidig, rondeId))
  }, [])

  const pasPuntAan = useCallback((rondeId: string, speler: SpelerId, punten: number) => {
    zetSpel((huidig) => zetOverride(huidig, rondeId, speler, punten))
  }, [])

  const pasPotAan = useCallback((rondeId: string, pot: number) => {
    zetSpel((huidig) => zetPotOverride(huidig, rondeId, pot))
  }, [])

  const herstelPunten = useCallback((rondeId: string) => {
    zetSpel((huidig) => wisOverrides(huidig, rondeId))
  }, [])

  /** Alleen de actieve ploeg verandert; de andere houdt haar eigen namen en gasten. */
  const pasActieveLedenAan = useCallback((wijzig: (leden: Ploeglid[]) => Ploeglid[]) => {
    zetPloegen((huidig) => {
      const stand = { ...huidig[huidig.actief], leden: wijzig(huidig[huidig.actief].leden) }
      return huidig.actief === 'standaard'
        ? { ...huidig, standaard: stand }
        : { ...huidig, gezin: stand }
    })
  }, [])

  // Hernoemen volgt de persoon: de ploeg houdt zo dezelfde avatar bij de nieuwe naam.
  const hernoem = useCallback(
    (speler: SpelerId, naam: string) => {
      const oud = spel.spelers[speler] ?? ''
      pasActieveLedenAan((leden) => hernoemInPloeg(leden, oud, naam))
      zetSpel((huidig) => hernoemSpeler(huidig, speler, naam))
    },
    [spel.spelers, pasActieveLedenAan],
  )

  const kiesZetel = useCallback((zetel: SpelerId, naam: string) => {
    zetSpel((huidig) => zetZetel(huidig, zetel, naam))
  }, [])

  const voegGastToe = useCallback(
    (zetel: SpelerId) => {
      const gast = maakGast(ploeg)
      pasActieveLedenAan((leden) => [...leden, gast])
      zetSpel((huidig) => zetZetel(huidig, zetel, gast.naam))
    },
    [ploeg, pasActieveLedenAan],
  )

  const zetTafelvorm = useCallback((vorm: Tafelvorm) => {
    bewaarVoorkeuren(localStorage, { tafelvorm: vorm })
    zetTafelvormState(vorm)
  }, [])

  // De rondes verwijzen naar zetels en niet naar namen, dus de lopende partij blijft staan.
  const wisselPloegkeuze = useCallback(() => {
    const na = wisselPloeg(ploegen, spel.spelers)
    zetPloegen(na)
    zetSpel((huidig) => ({ ...huidig, spelers: zetelnamen(na[na.actief]) }))
  }, [ploegen, spel.spelers])

  const kiesDeler = useCallback((speler: SpelerId) => {
    zetSpel((huidig) => zetDeler(huidig, speler))
  }, [])

  // Archiveren schrijft naar localStorage en hoort dus buiten de state-updater te blijven.
  const startNieuwSpel = useCallback(() => {
    zetSpel(archiveer(localStorage, spel))
    zetArchief(laadArchief(localStorage))
  }, [spel])

  const heropenUitArchief = useCallback(
    (spelId: string) => {
      zetSpel(heropen(localStorage, spel, spelId))
      zetArchief(laadArchief(localStorage))
    },
    [spel],
  )

  const wisUitArchief = useCallback(
    (spelId: string) => {
      const rest = archief.filter((s) => s.id !== spelId)
      bewaarArchief(localStorage, rest)
      zetArchief(rest)
    },
    [archief],
  )

  return {
    spel,
    config,
    archief,
    ploeg,
    ploegkeuze: ploegen.actief,
    wisselPloegkeuze,
    tafelvorm,
    zetTafelvorm,
    zetConfig,
    speelRonde,
    wisRonde,
    pasPuntAan,
    pasPotAan,
    herstelPunten,
    hernoem,
    kiesZetel,
    voegGastToe,
    kiesDeler,
    bewaarMoment,
    herstelMoment,
    startNieuwSpel,
    heropenUitArchief,
    wisUitArchief,
  }
}
