import { useState } from 'react'
import { START_COMMENTAAR, commentaar } from './domein/commentaar'
import {
  AANTAL_MADAMS,
  ALLE_SLAGEN,
  isSpeelbaar,
  telMadams,
  type ContractType,
  type SpelerId,
} from './domein/contracten'
import { somVan, speelRonde, type Punten } from './domein/score'
import { totalenVan, verloop } from './domein/spel'
import { Aanval } from './ui/Aanval'
import { Archief } from './ui/Archief'
import { ContractKeuze } from './ui/ContractKeuze'
import { Instellingen } from './ui/Instellingen'
import { Koers } from './ui/Koers'
import { Palmares } from './ui/Palmares'
import { Scorebord } from './ui/Scorebord'
import { Tafel } from './ui/Tafel'
import { useMuntStroom } from './ui/useMuntStroom'
import { useSpel } from './ui/useSpel'
import { tekenPunt } from './ui/zetels'

type Weergave = 'koers' | 'klassiek' | 'palmares' | 'instellingen' | 'archief'

const TABBLADEN: { sleutel: Weergave; label: string }[] = [
  { sleutel: 'koers', label: 'De koers' },
  { sleutel: 'palmares', label: 'Palmares' },
  { sleutel: 'archief', label: 'Archief' },
  { sleutel: 'instellingen', label: 'Instellingen' },
]

export function App() {
  const spelState = useSpel()
  const { spel, config } = spelState

  const [weergave, zetWeergave] = useState<Weergave>('koers')
  const [boekOpen, zetBoekOpen] = useState(false)
  const [selectie, zetSelectie] = useState<SpelerId[]>([])
  const [contract, zetContract] = useState<ContractType | null>(null)
  const [slagen, zetSlagen] = useState(0)
  const [madams, zetMadams] = useState<Partial<Record<SpelerId, number>>>({})

  const stand = verloop(spel, config)
  const totalen = totalenVan(stand)
  const pot = stand.at(-1)?.potNa ?? 0
  const eindsom = somVan(totalen) + pot
  const { vlucht, vertraging } = useMuntStroom(stand)

  const laatste = stand.at(-1)
  const praat = laatste ? commentaar(laatste, spel.spelers, config) : START_COMMENTAAR

  const wisKeuze = () => {
    zetSelectie([])
    zetContract(null)
    zetSlagen(0)
    zetMadams({})
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
    zetSlagen(isSpeelbaar(keuze) ? config.contracten[keuze].slagenNodig : 0)
  }

  const kanOpslaan =
    contract !== null && (contract !== 'passen' || telMadams(madams) === AANTAL_MADAMS)

  const voorbeeld: Punten | null = contract
    ? speelRonde(
        { id: 'voorbeeld', deler: spel.deler, contract, spelers: selectie, slagen, madams },
        config,
        pot,
      ).punten
    : null

  const bericht = (() => {
    if (contract === 'passen') return 'Verdeel de madams.'
    if (contract && isSpeelbaar(contract)) {
      const c = config.contracten[contract]
      if (c.allesOfNiets) return `${c.naam} — ${slagen === c.slagenNodig ? 'gehaald' : 'mislukt'}`
      if (c.verdubbelBijAlleSlagen && slagen === ALLE_SLAGEN)
        return `${c.naam} — alle slagen, dubbel!`
      return `${c.naam} — ${slagen} van de ${c.slagenNodig} slagen`
    }
    if (selectie.length === 2)
      return `${spel.spelers[selectie[0]!]} en ${spel.spelers[selectie[1]!]} samen op de vlucht`
    if (selectie.length === 1) return `${spel.spelers[selectie[0]!]} alleen tegen de rest`
    return ''
  })()

  const bewaarRonde = () => {
    if (!kanOpslaan || !contract) return
    spelState.speelRonde(
      contract === 'passen'
        ? { contract, spelers: [], slagen: 0, madams }
        : { contract, spelers: selectie, slagen },
    )
    wisKeuze()
  }

  const nieuwSpelStarten = () => {
    if (spel.rondes.length > 0 && !confirm('Partij afsluiten en naar het archief verplaatsen?'))
      return
    spelState.startNieuwSpel()
    wisKeuze()
    zetWeergave('koers')
  }

  const invoerProps = {
    config,
    spelers: spel.spelers,
    selectie,
    contract,
    slagen,
    madams,
    bericht,
    kanOpslaan,
    onContract: kiesContract,
    onSlagen: zetSlagen,
    onMadam: (speler: SpelerId, aantal: number) =>
      zetMadams((huidig) => ({ ...huidig, [speler]: aantal })),
    onOpslaan: bewaarRonde,
    onWis: wisKeuze,
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-3 pt-5 pb-10 sm:px-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Wiezen
          <span className="ml-2 align-middle font-sans text-[0.6rem] tracking-[0.28em] text-messing/80 uppercase">
            ronde van de tafel
          </span>
        </h1>
        <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-krijt/15 bg-vilt-diep/50 p-1">
          {TABBLADEN.map((tab) => (
            <button
              key={tab.sleutel}
              type="button"
              onClick={() => zetWeergave(tab.sleutel)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                weergave === tab.sleutel || (weergave === 'klassiek' && tab.sleutel === 'koers')
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

      {(weergave === 'koers' || weergave === 'klassiek') && (
        <main>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => zetBoekOpen(true)}
              className="rounded-xl border border-krijt/20 bg-vilt-diep/50 px-3 py-1.5 text-sm font-semibold text-krijt transition-colors hover:border-messing hover:text-messing"
            >
              📖 Rittenboek
              <span className="ml-1 text-krijt-dof">{spel.rondes.length}</span>
            </button>
            <button
              type="button"
              onClick={() => zetWeergave(weergave === 'koers' ? 'klassiek' : 'koers')}
              className="rounded-xl border border-krijt/15 px-3 py-1.5 text-sm text-krijt-dof transition-colors hover:text-krijt"
            >
              {weergave === 'koers' ? '♠ Klassieke tafel' : '🚴 Terug naar de koers'}
            </button>
            {eindsom !== 0 && (
              <span className="rounded-xl border border-hart/40 bg-hart/15 px-3 py-1.5 text-sm font-semibold text-hart">
                Jury: scores plus premie komen niet op nul uit ({tekenPunt(eindsom)})
              </span>
            )}
          </div>

          {weergave === 'koers' ? (
            <>
              <Koers
                spelers={spel.spelers}
                totalen={totalen}
                voorbeeld={voorbeeld}
                pot={pot}
                deler={spel.deler}
                selectie={selectie}
                rit={spel.rondes.length + 1}
                laatsteRit={laatste?.punten ?? null}
                praat={praat}
                vertraging={vertraging}
                onSelecteer={wisselSpeler}
                onDeler={spelState.kiesDeler}
                onHernoem={spelState.hernoem}
              />
              <Aanval {...invoerProps} />
            </>
          ) : (
            <div className="mx-auto max-w-2xl">
              <Tafel
                spelers={spel.spelers}
                totalen={totalen}
                voorbeeld={voorbeeld}
                pot={pot}
                deler={spel.deler}
                selectie={selectie}
                vlucht={vlucht}
                vertraging={vertraging}
                onSelecteer={wisselSpeler}
                onDeler={spelState.kiesDeler}
                onHernoem={spelState.hernoem}
              />
              <ContractKeuze {...invoerProps} />
            </div>
          )}
        </main>
      )}

      {weergave === 'palmares' && (
        <Palmares stand={stand} spelers={spel.spelers} config={config} />
      )}

      {weergave === 'instellingen' && (
        <Instellingen config={config} onWijzig={spelState.zetConfig} />
      )}

      {weergave === 'archief' && (
        <Archief archief={spelState.archief} config={config} onWis={spelState.wisUitArchief} />
      )}

      {boekOpen && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            type="button"
            aria-label="Rittenboek sluiten"
            onClick={() => zetBoekOpen(false)}
            className="absolute inset-0 bg-vilt-diep/75 backdrop-blur-sm"
          />
          <div className="animatie-open relative flex w-full max-w-lg flex-col overflow-y-auto border-l border-krijt/15 bg-vilt px-4 py-4 shadow-[-30px_0_60px_-30px_#000]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-xl font-black">Rittenboek</p>
              <button
                type="button"
                onClick={() => zetBoekOpen(false)}
                className="rounded-lg border border-krijt/20 px-3 py-1 text-sm text-krijt-dof hover:text-krijt"
              >
                Sluiten
              </button>
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
          </div>
        </div>
      )}
    </div>
  )
}
