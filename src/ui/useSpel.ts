import { useCallback, useEffect, useState } from 'react'
import type { Config, SpelerId } from '../domein/contracten'
import { hernoemInPloeg, type Ploeglid } from '../domein/ploeg'
import {
  hernoemSpeler,
  maakRonde,
  verwijderRonde,
  voegRondeToe,
  wisOverrides,
  zetDeler,
  zetZetel,
  zetOverride,
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
  bewaarPloeg,
  bewaarSpel,
  laadArchief,
  laadConfig,
  laadPloeg,
  laadSpel,
} from '../opslag/opslag'

export function useSpel() {
  const [spel, zetSpel] = useState<Spel>(() => laadSpel(localStorage))
  const [config, zetConfig] = useState<Config>(() => laadConfig(localStorage))
  const [archief, zetArchief] = useState<Spel[]>(() => laadArchief(localStorage))
  const [tafelvorm, zetTafelvormState] = useState<Tafelvorm>(
    () => laadVoorkeuren(localStorage).tafelvorm,
  )
  const [ploeg, zetPloeg] = useState<Ploeglid[]>(() => laadPloeg(localStorage))

  useEffect(() => bewaarSpel(localStorage, spel), [spel])
  useEffect(() => bewaarConfig(localStorage, config), [config])
  useEffect(() => bewaarPloeg(localStorage, ploeg), [ploeg])

  const speelRonde = useCallback((invoer: RondeInvoer) => {
    zetSpel((huidig) => voegRondeToe(huidig, maakRonde(invoer)))
  }, [])

  const wisRonde = useCallback((rondeId: string) => {
    zetSpel((huidig) => verwijderRonde(huidig, rondeId))
  }, [])

  const pasPuntAan = useCallback((rondeId: string, speler: SpelerId, punten: number) => {
    zetSpel((huidig) => zetOverride(huidig, rondeId, speler, punten))
  }, [])

  const herstelPunten = useCallback((rondeId: string) => {
    zetSpel((huidig) => wisOverrides(huidig, rondeId))
  }, [])

  // Hernoemen volgt de persoon: de ploeg houdt zo dezelfde avatar bij de nieuwe naam.
  const hernoem = useCallback(
    (speler: SpelerId, naam: string) => {
      const oud = spel.spelers[speler] ?? ''
      zetPloeg((huidig) => hernoemInPloeg(huidig, oud, naam))
      zetSpel((huidig) => hernoemSpeler(huidig, speler, naam))
    },
    [spel.spelers],
  )

  const kiesZetel = useCallback((zetel: SpelerId, naam: string) => {
    zetSpel((huidig) => zetZetel(huidig, zetel, naam))
  }, [])

  const zetTafelvorm = useCallback((vorm: Tafelvorm) => {
    bewaarVoorkeuren(localStorage, { tafelvorm: vorm })
    zetTafelvormState(vorm)
  }, [])

  const kiesDeler = useCallback((speler: SpelerId) => {
    zetSpel((huidig) => zetDeler(huidig, speler))
  }, [])

  // Archiveren schrijft naar localStorage en hoort dus buiten de state-updater te blijven.
  const startNieuwSpel = useCallback(() => {
    zetSpel(archiveer(localStorage, spel))
    zetArchief(laadArchief(localStorage))
  }, [spel])

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
    tafelvorm,
    zetTafelvorm,
    zetConfig,
    speelRonde,
    wisRonde,
    pasPuntAan,
    herstelPunten,
    hernoem,
    kiesZetel,
    kiesDeler,
    startNieuwSpel,
    wisUitArchief,
  }
}
