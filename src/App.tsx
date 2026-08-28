import { useState } from 'react'
import { isSpeelbaar, type ContractType, type SpelerId } from './domein/contracten'
import { ALLE_SLAGEN, berekenPunten, type Punten } from './domein/score'
import { leiders, totalen } from './domein/spel'
import { Archief } from './ui/Archief'
import { ContractKeuze } from './ui/ContractKeuze'
import { Instellingen } from './ui/Instellingen'
import { Scorebord } from './ui/Scorebord'
import { Tafel } from './ui/Tafel'
import { useSpel } from './ui/useSpel'

type Weergave = 'tafel' | 'instellingen' | 'archief'

const TABBLADEN: { sleutel: Weergave; label: string }[] = [
  { sleutel: 'tafel', label: 'Tafel' },
  { sleutel: 'instellingen', label: 'Instellingen' },
  { sleutel: 'archief', label: 'Archief' },
]

export function App() {
  const spelState = useSpel()
  const { spel, config } = spelState

  const [weergave, zetWeergave] = useState<Weergave>('tafel')
  const [selectie, zetSelectie] = useState<SpelerId[]>([])
  const [contract, zetContract] = useState<ContractType | null>(null)
  const [slagen, zetSlagen] = useState(0)

  const wisKeuze = () => {
    zetSelectie([])
    zetContract(null)
    zetSlagen(0)
  }

  const wisselSpeler = (speler: SpelerId) => {
    zetContract(null)
    zetSelectie((huidig) =>
      huidig.includes(speler)
        ? huidig.filter((s) => s !== speler)
        : [...huidig, speler].slice(-2).sort(),
    )
  }

  const kiesContract = (keuze: ContractType) => {
    zetContract(keuze)
    zetSlagen(isSpeelbaar(keuze) ? config[keuze].slagenNodig : 0)
  }

  const voorbeeld: Punten | null = contract
    ? berekenPunten(
        { id: 'voorbeeld', deler: spel.deler, contract, spelers: selectie, slagen },
        config,
      )
    : null

  const bericht = (() => {
    if (contract && isSpeelbaar(contract)) {
      const c = config[contract]
      if (c.allesOfNiets) return `${c.naam} — ${slagen === c.slagenNodig ? 'gehaald' : 'mislukt'}`
      if (c.verdubbelBijAlleSlagen && slagen === ALLE_SLAGEN)
        return `${c.naam} — alle slagen, dubbel!`
      return `${c.naam} — ${slagen} van de ${c.slagenNodig} slagen`
    }
    if (contract === 'passen') return 'Iedereen past. Nieuwe deal.'
    if (selectie.length === 2)
      return `${spel.spelers[selectie[0]!]} en ${spel.spelers[selectie[1]!]} spelen samen.`
    if (selectie.length === 1) return `${spel.spelers[selectie[0]!]} speelt alleen. Of kies een partner.`
    return 'Klik wie speelt. Rechtsklik verzet de deler.'
  })()

  const bewaarRonde = () => {
    if (!contract) return
    spelState.speelRonde({ contract, spelers: selectie, slagen })
    wisKeuze()
  }

  const nieuwSpelStarten = () => {
    if (spel.rondes.length > 0 && !confirm('Partij afsluiten en naar het archief verplaatsen?')) return
    spelState.startNieuwSpel()
    wisKeuze()
    zetWeergave('tafel')
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pt-6 pb-16">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black tracking-tight">
          Wiezen
          <span className="ml-2 align-middle text-lg text-messing">♠♥♦♣</span>
        </h1>
        <nav className="flex items-center gap-1 rounded-xl border border-krijt/15 bg-vilt-diep/50 p-1">
          {TABBLADEN.map((tab) => (
            <button
              key={tab.sleutel}
              type="button"
              onClick={() => zetWeergave(tab.sleutel)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                weergave === tab.sleutel
                  ? 'bg-messing text-vilt-diep'
                  : 'text-krijt-dof hover:text-krijt'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={nieuwSpelStarten}
            className="ml-1 rounded-lg border border-krijt/20 px-3 py-1.5 text-sm font-semibold text-krijt-dof hover:border-hart hover:text-hart"
          >
            Nieuw spel
          </button>
        </nav>
      </header>

      {weergave === 'tafel' && (
        <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div>
            <Tafel
              spelers={spel.spelers}
              totalen={totalen(spel, config)}
              voorbeeld={voorbeeld}
              deler={spel.deler}
              selectie={selectie}
              leiders={leiders(spel, config)}
              bericht={bericht}
              onSelecteer={wisselSpeler}
              onDeler={spelState.kiesDeler}
              onHernoem={spelState.hernoem}
            />
            <ContractKeuze
              config={config}
              selectie={selectie}
              contract={contract}
              slagen={slagen}
              onContract={kiesContract}
              onSlagen={zetSlagen}
              onOpslaan={bewaarRonde}
              onWis={wisKeuze}
            />
          </div>

          <Scorebord
            spel={spel}
            config={config}
            onWisRonde={spelState.wisRonde}
            onPasPuntAan={spelState.pasPuntAan}
            onHerstel={spelState.herstelPunten}
            onCorrectie={() =>
              spelState.speelRonde({ contract: 'correctie', spelers: [], slagen: 0 })
            }
          />
        </main>
      )}

      {weergave === 'instellingen' && (
        <Instellingen config={config} onWijzig={spelState.zetConfig} />
      )}

      {weergave === 'archief' && (
        <Archief archief={spelState.archief} config={config} onWis={spelState.wisUitArchief} />
      )}
    </div>
  )
}
