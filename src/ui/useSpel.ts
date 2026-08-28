import { useCallback, useEffect, useState } from 'react'
import type { Config, SpelerId } from '../domein/contracten'
import {
  hernoemSpeler,
  maakRonde,
  verwijderRonde,
  voegRondeToe,
  wisOverrides,
  zetDeler,
  zetOverride,
  type RondeInvoer,
  type Spel,
} from '../domein/spel'
import {
  archiveer,
  bewaarArchief,
  bewaarConfig,
  bewaarSpel,
  laadArchief,
  laadConfig,
  laadSpel,
} from '../opslag/opslag'

export function useSpel() {
  const [spel, zetSpel] = useState<Spel>(() => laadSpel(localStorage))
  const [config, zetConfig] = useState<Config>(() => laadConfig(localStorage))
  const [archief, zetArchief] = useState<Spel[]>(() => laadArchief(localStorage))

  useEffect(() => bewaarSpel(localStorage, spel), [spel])
  useEffect(() => bewaarConfig(localStorage, config), [config])

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

  const hernoem = useCallback((speler: SpelerId, naam: string) => {
    zetSpel((huidig) => hernoemSpeler(huidig, speler, naam))
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
    zetConfig,
    speelRonde,
    wisRonde,
    pasPuntAan,
    herstelPunten,
    hernoem,
    kiesDeler,
    startNieuwSpel,
    wisUitArchief,
  }
}
