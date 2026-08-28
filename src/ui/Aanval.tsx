import {
  AANTAL_MADAMS,
  SPEELBARE_CONTRACTEN,
  SPELER_IDS,
  isSpeelbaar,
  telMadams,
  type Config,
  type ContractType,
  type SpelerId,
} from '../domein/contracten'

const ALLE_AANTALLEN = Array.from({ length: 14 }, (_, i) => i)

/** Wat een contract in de praktijk betekent, in de taal van de tafel. */
const BIJNAMEN: Record<ContractType, string> = {
  vragen: 'samen op de vlucht',
  troel: 'het lot kiest je partner',
  alleen: 'vijf slagen, nul hulp',
  abondance: 'negen pakken en de premie mee',
  miserie: 'geen enkele slag, alsjeblieft',
  miserieOpTafel: 'open kaart, open zenuwen',
  soloSlim: 'dertien. allemaal. alleen.',
  passen: 'iedereen kijkt naar de grond',
  correctie: 'de jury rekent na',
}

function toegestaan(contract: ContractType, config: Config, aantalSpelers: number): boolean {
  if (contract === 'passen') return aantalSpelers === 0
  if (!isSpeelbaar(contract)) return false
  return config.contracten[contract].kampGroottes.includes(aantalSpelers)
}

function eis(contract: ContractType, config: Config): string {
  if (contract === 'passen') return 'niemand'
  if (!isSpeelbaar(contract)) return ''
  const groottes = config.contracten[contract].kampGroottes
  return groottes.map((n) => `${n}`).join(' of ') + ` renner${groottes.includes(2) ? 's' : ''}`
}

type KaartProps = {
  naam: string
  bijnaam: string
  inzet: string
  eis: string
  actief: boolean
  bruikbaar: boolean
  onClick: () => void
}

function ContractKaart({ naam, bijnaam, inzet, eis, actief, bruikbaar, onClick }: KaartProps) {
  return (
    <button
      type="button"
      disabled={!bruikbaar}
      onClick={onClick}
      className={`group relative flex min-h-[4.5rem] flex-col justify-between rounded-2xl border p-2.5 text-left transition-all duration-150 ${
        actief
          ? 'border-messing bg-messing text-vilt-diep shadow-[0_0_30px_-6px_var(--color-messing)]'
          : bruikbaar
            ? 'border-krijt/18 bg-vilt-diep/60 text-krijt hover:-translate-y-0.5 hover:border-messing/70 hover:bg-vilt-licht/25'
            : 'cursor-not-allowed border-krijt/8 bg-vilt-diep/25 text-krijt-dof/35'
      }`}
    >
      <span className="font-display text-sm leading-tight font-black sm:text-base">{naam}</span>
      <span
        className={`text-[0.62rem] leading-tight italic ${actief ? 'text-vilt-diep/75' : 'text-krijt-dof'}`}
      >
        {bijnaam}
      </span>
      <span
        className={`mt-1 flex items-baseline justify-between gap-1 text-[0.55rem] tracking-[0.12em] uppercase ${actief ? 'text-vilt-diep/70' : 'text-krijt-dof/70'}`}
      >
        <span>{inzet}</span>
        <span>{eis}</span>
      </span>
    </button>
  )
}

type Props = {
  config: Config
  spelers: string[]
  selectie: SpelerId[]
  contract: ContractType | null
  slagen: number
  madams: Partial<Record<SpelerId, number>>
  bericht: string
  kanOpslaan: boolean
  onContract: (contract: ContractType) => void
  onSlagen: (slagen: number) => void
  onMadam: (speler: SpelerId, aantal: number) => void
  onOpslaan: () => void
  onWis: () => void
}

export function Aanval({
  config,
  spelers,
  selectie,
  contract,
  slagen,
  madams,
  bericht,
  kanOpslaan,
  onContract,
  onSlagen,
  onMadam,
  onOpslaan,
  onWis,
}: Props) {
  const gekozen = contract && isSpeelbaar(contract) ? config.contracten[contract] : null
  const gehaald = gekozen ? slagen === gekozen.slagenNodig : false
  const verdeeld = telMadams(madams)

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-krijt/12 bg-vilt-diep/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-krijt/10 px-4 py-2.5">
        <span className="text-[0.55rem] tracking-[0.28em] text-krijt-dof uppercase">
          Wie valt aan?
        </span>
        {selectie.length === 0 ? (
          <span className="text-xs text-krijt-dof italic">
            nog niemand — klik hierboven een renner, of laat iedereen passen
          </span>
        ) : (
          selectie.map((speler) => (
            <span
              key={speler}
              className="rounded-full border border-messing/60 bg-messing/15 px-2.5 py-0.5 text-xs font-bold text-messing"
            >
              {spelers[speler]}
            </span>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {SPEELBARE_CONTRACTEN.map((keuze) => (
          <ContractKaart
            key={keuze}
            naam={config.contracten[keuze].naam}
            bijnaam={BIJNAMEN[keuze]}
            inzet={`${config.contracten[keuze].puntenGehaald} p${config.contracten[keuze].wintDePot ? ' + premie' : ''}`}
            eis={eis(keuze, config)}
            actief={contract === keuze}
            bruikbaar={toegestaan(keuze, config, selectie.length)}
            onClick={() => onContract(keuze)}
          />
        ))}
        <div className="col-span-2 sm:col-span-4">
          <ContractKaart
            naam="Iedereen past"
            bijnaam={BIJNAMEN.passen}
            inzet="de premie dikt aan"
            eis={eis('passen', config)}
            actief={contract === 'passen'}
            bruikbaar={toegestaan('passen', config, selectie.length)}
            onClick={() => onContract('passen')}
          />
        </div>
      </div>

      {contract === 'passen' && (
        <div className="animatie-open border-t border-krijt/10 px-4 py-3">
          <p className="mb-2 text-[0.55rem] tracking-[0.24em] text-krijt-dof uppercase">
            Madams &middot; {verdeeld} van de {AANTAL_MADAMS} &middot; {config.madamWaarde} punten
            per stuk
          </p>
          <div className="space-y-1.5">
            {SPELER_IDS.map((speler) => {
              const aantal = madams[speler] ?? 0
              return (
                <div key={speler} className="grid grid-cols-[1fr_auto_2.5rem] items-center gap-3">
                  <span className="truncate text-sm">{spelers[speler]}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => onMadam(speler, n)}
                        disabled={n > aantal && verdeeld - aantal + n > AANTAL_MADAMS}
                        className={`h-9 w-9 rounded-lg text-sm font-bold transition-colors ${
                          n === aantal
                            ? 'bg-krijt text-vilt-diep'
                            : 'bg-vilt-diep/70 text-krijt-dof hover:text-krijt disabled:cursor-not-allowed disabled:opacity-30'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="text-right text-sm font-bold text-hart">
                    {aantal > 0 ? `-${aantal * config.madamWaarde}` : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {gekozen && (
        <div className="animatie-open border-t border-krijt/10 px-4 py-3">
          {gekozen.allesOfNiets ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig)}
                className={`h-12 rounded-xl font-display text-base font-black transition-colors ${gehaald ? 'bg-munt text-vilt-diep' : 'border border-krijt/20 text-krijt-dof hover:text-krijt'}`}
              >
                Gelukt 🧊
              </button>
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig === 0 ? 1 : gekozen.slagenNodig - 1)}
                className={`h-12 rounded-xl font-display text-base font-black transition-colors ${!gehaald ? 'bg-hart text-krijt' : 'border border-krijt/20 text-krijt-dof hover:text-krijt'}`}
              >
                Ontploft 🔥
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[0.55rem] tracking-[0.24em] text-krijt-dof uppercase">
                Slagen &middot; {gekozen.slagenNodig} nodig
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {ALLE_AANTALLEN.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSlagen(n)}
                    className={`h-10 rounded-lg text-sm font-bold transition-colors ${
                      n === slagen
                        ? 'bg-krijt text-vilt-diep'
                        : n >= gekozen.slagenNodig
                          ? 'bg-vilt-licht/70 text-krijt hover:bg-vilt-licht'
                          : 'bg-vilt-diep/70 text-krijt-dof hover:text-krijt'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-krijt/10 bg-vilt-diep/40 px-4 py-3">
        <p className="min-w-0 flex-1 truncate font-display text-sm text-krijt/70 italic">
          {bericht || 'Klik wie aanvalt.'}
        </p>
        <div className="flex gap-2">
          {(contract || selectie.length > 0) && (
            <button
              type="button"
              onClick={onWis}
              className="h-12 rounded-xl border border-krijt/20 px-4 text-sm text-krijt-dof transition-colors hover:text-krijt"
            >
              Wissen
            </button>
          )}
          <button
            type="button"
            disabled={!kanOpslaan}
            onClick={onOpslaan}
            className="h-12 rounded-xl bg-messing px-6 font-display text-base font-black text-vilt-diep transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:bg-krijt/12 disabled:text-krijt-dof/40"
          >
            🏁 Aankomst
          </button>
        </div>
      </div>
    </section>
  )
}
