import { useState } from 'react'
import {
  AANTAL_MADAMS,
  ALLE_SLAGEN,
  isSpeelbaar,
  telMadams,
  type ContractType,
  type SpelerId,
} from './domein/contracten'
import { contractGehaald, speelRonde, type Punten } from './domein/score'
import { totalenVan, verloop, type Ronde } from './domein/spel'
import { Archief } from './ui/Archief'
import { ContractKeuze } from './ui/ContractKeuze'
import { Instellingen } from './ui/Instellingen'
import { Kader } from './ui/Kader'
import { Scorebord } from './ui/Scorebord'
import { Tafel } from './ui/Tafel'
import { Tafelvormkiezer } from './ui/Tafelvormkiezer'
import { useMuntStroom } from './ui/useMuntStroom'
import { useSpel } from './ui/useSpel'

const REPO = 'https://github.com/Laoujin/WiezeScoren'

type Weergave = 'tafel' | 'instellingen' | 'archief'

const TABBLADEN: { sleutel: Weergave; label: string }[] = [
  { sleutel: 'tafel', label: 'Tafel' },
  { sleutel: 'archief', label: 'Archief' },
  { sleutel: 'instellingen', label: 'Instellingen' },
]

export function App() {
  const spelState = useSpel()
  const { spel, config } = spelState

  const [weergave, zetWeergave] = useState<Weergave>('tafel')
  const [menuOpen, zetMenuOpen] = useState(false)
  const [selectie, zetSelectie] = useState<SpelerId[]>([])
  const [contract, zetContract] = useState<ContractType | null>(null)
  const [slagen, zetSlagen] = useState(0)
  const [madams, zetMadams] = useState<Partial<Record<SpelerId, number>>>({})

  const stand = verloop(spel, config)
  const totalen = totalenVan(stand)
  const pot = stand.at(-1)?.potNa ?? 0
  const { vlucht, vertraging } = useMuntStroom(stand)

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

  const proefronde: Ronde | null = contract
    ? { id: 'voorbeeld', deler: spel.deler, contract, spelers: selectie, slagen, madams }
    : null
  const voorbeeld: Punten | null = proefronde ? speelRonde(proefronde, config, pot).punten : null
  const gehaald = proefronde !== null && contractGehaald(proefronde, config)

  const bericht = (() => {
    if (contract === 'passen') return 'Verdeel de madams.'
    if (contract && isSpeelbaar(contract)) {
      const c = config.contracten[contract]
      if (c.geenSlagenteller) return `${c.naam} — ${gehaald ? 'gehaald' : 'mislukt'}`
      if (c.verdubbelBijAlleSlagen && slagen === ALLE_SLAGEN)
        return `${c.naam} — alle slagen, dubbel!`
      return `${c.naam} — ${slagen} van de ${c.slagenNodig} slagen`
    }
    if (selectie.length === 2)
      return `${spel.spelers[selectie[0]!]} en ${spel.spelers[selectie[1]!]} samen`
    if (selectie.length === 1) return `${spel.spelers[selectie[0]!]} alleen`
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

  const heropenPartij = (spelId: string) => {
    spelState.heropenUitArchief(spelId)
    wisKeuze()
    zetWeergave('tafel')
  }

  const kiesWeergave = (sleutel: Weergave) => {
    zetWeergave(sleutel)
    zetMenuOpen(false)
  }

  const nieuwSpelStarten = () => {
    zetMenuOpen(false)
    if (spel.rondes.length > 0 && !confirm('Partij afsluiten en naar het archief verplaatsen?'))
      return
    spelState.startNieuwSpel()
    wisKeuze()
    zetWeergave('tafel')
  }

  return (
    <div className="relative">
      <div className="uithang">
        <div className="kettingen">
          <span className="ketting" />
          <span className="ketting" />
        </div>
        <h1 className="bord font-display text-2xl font-black tracking-[0.08em] text-krijt uppercase sm:text-3xl">
          Wiezen
        </h1>
      </div>

      <div className="mx-auto min-h-screen max-w-6xl px-3 pt-5 pb-10 sm:px-4">
        <header className="relative mb-1 flex items-start justify-end gap-3 pl-36 sm:pl-40">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => zetMenuOpen((open) => !open)}
            className="kader flex h-11 w-11 items-center justify-center text-krijt-dof transition-colors hover:text-krijt sm:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-current">
              <rect x="3" y="5" width="14" height="2" rx="1" />
              <rect x="3" y="9" width="14" height="2" rx="1" />
              <rect x="3" y="13" width="14" height="2" rx="1" />
            </svg>
          </button>

          <Kader
            as="nav"
            sierhoeken={false}
            positie="absolute sm:static"
            className={`top-full right-0 z-40 mt-2 w-56 flex-col items-stretch gap-1 p-2 sm:mt-0 sm:w-auto sm:flex-row sm:items-center sm:justify-center lg:w-full lg:max-w-[26rem] ${
              menuOpen ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {TABBLADEN.map((tab) => (
              <button
                key={tab.sleutel}
                type="button"
                onClick={() => kiesWeergave(tab.sleutel)}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
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
              className="rounded-lg border border-krijt/20 px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-krijt-dof hover:border-hart hover:text-hart sm:ml-1"
            >
              Nieuw spel
            </button>
            <span className="my-1 h-px w-full bg-krijt/15 sm:mx-1 sm:my-0 sm:h-6 sm:w-px" />
            <Tafelvormkiezer vorm={spelState.tafelvorm} onVorm={spelState.zetTafelvorm} />
          </Kader>
        </header>

        {weergave === 'tafel' && (
          <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <Tafel
                spelers={spel.spelers}
                ploeg={spelState.ploeg}
                totalen={totalen}
                voorbeeld={voorbeeld}
                pot={pot}
                deler={spel.deler}
                selectie={selectie}
                vlucht={vlucht}
                vertraging={vertraging}
                vorm={spelState.tafelvorm}
                onSelecteer={wisselSpeler}
                onDeler={spelState.kiesDeler}
                onHernoem={spelState.hernoem}
                onKiesZetel={spelState.kiesZetel}
              />
            </div>

            <ContractKeuze
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
              config={config}
              spelers={spel.spelers}
              selectie={selectie}
              contract={contract}
              slagen={slagen}
              madams={madams}
              bericht={bericht}
              kanOpslaan={kanOpslaan}
              onContract={kiesContract}
              onSlagen={zetSlagen}
              onMadam={(speler, aantal) => zetMadams((huidig) => ({ ...huidig, [speler]: aantal }))}
              onOpslaan={bewaarRonde}
              onWis={wisKeuze}
            />

            <Scorebord
              className="lg:col-start-1 lg:row-start-2"
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
          <Archief
            archief={spelState.archief}
            config={config}
            onHeropen={heropenPartij}
            onWis={spelState.wisUitArchief}
          />
        )}

        <footer className="mt-10 flex flex-col items-center gap-3 border-t border-krijt/10 pt-4 text-center text-xs leading-relaxed text-krijt-dof">
          <p>
            Klik een zetel om die speler te laten spelen &middot; rechtsklik zet de deler &middot;
            dubbelklik een naam om te hernoemen &middot; klik een punt in het scorebord om het
            handmatig aan te passen
          </p>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            title="Broncode op GitHub"
            className="transition-colors hover:text-krijt"
          >
            <span className="sr-only">Broncode op GitHub</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-5 w-5 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  )
}
