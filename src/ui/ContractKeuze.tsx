import {
  AANTAL_MADAMS,
  SPEELBARE_CONTRACTEN,
  SPELER_IDS,
  isSpeelbaar,
  telMadams,
  type Config,
  type ContractType,
  type SpeelbaarContract,
  type SpelerId,
} from '../domein/contracten'
import { Kader } from './Kader'

const ALLE_AANTALLEN = Array.from({ length: 14 }, (_, i) => i)

function toegestaan(contract: ContractType, config: Config, aantalSpelers: number): boolean {
  if (contract === 'passen') return aantalSpelers === 0
  if (!isSpeelbaar(contract)) return false
  return config.contracten[contract].kampGroottes.includes(aantalSpelers)
}

type KnopProps = {
  label: string
  actief: boolean
  bruikbaar: boolean
  onClick: () => void
}

function ContractKnop({ label, actief, bruikbaar, onClick }: KnopProps) {
  return (
    <button
      type="button"
      disabled={!bruikbaar}
      onClick={onClick}
      className={`h-11 rounded-xl border px-2 text-sm font-semibold tracking-wide transition-all duration-150 ${
        actief
          ? 'border-messing bg-messing text-vilt-diep shadow-[0_0_26px_-6px_var(--color-messing)]'
          : bruikbaar
            ? 'border-krijt/20 bg-vilt-diep/60 text-krijt hover:-translate-y-0.5 hover:border-messing/70'
            : 'cursor-not-allowed border-krijt/8 bg-vilt-diep/25 text-krijt-dof/35'
      }`}
    >
      {label}
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

export function ContractKeuze({
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

  const groepen: { titel: string; contracten: SpeelbaarContract[] }[] = [
    {
      titel: 'Om de punten',
      contracten: SPEELBARE_CONTRACTEN.filter((c) => !config.contracten[c].wintDePot),
    },
    {
      titel: 'Om de pot',
      contracten: SPEELBARE_CONTRACTEN.filter((c) => config.contracten[c].wintDePot),
    },
  ]

  return (
    <Kader className="self-start overflow-hidden p-1.5 backdrop-blur-sm">
      <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-1">
        {groepen.map((groep) => (
          <div key={groep.titel}>
            <p className="mb-2 text-[0.6rem] tracking-[0.24em] text-krijt-dof uppercase">
              {groep.titel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {groep.contracten.map((keuze) => (
                <ContractKnop
                  key={keuze}
                  label={config.contracten[keuze].naam}
                  actief={contract === keuze}
                  bruikbaar={toegestaan(keuze, config, selectie.length)}
                  onClick={() => onContract(keuze)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <ContractKnop
          label="Iedereen past"
          actief={contract === 'passen'}
          bruikbaar={toegestaan('passen', config, selectie.length)}
          onClick={() => onContract('passen')}
        />
      </div>

      {contract === 'passen' && (
        <div className="animatie-open border-t border-krijt/10 px-4 py-4">
          <p className="mb-3 text-[0.6rem] tracking-[0.24em] text-krijt-dof uppercase">
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
                        className={`h-8 w-8 rounded-lg text-sm font-bold transition-colors ${
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
        <div className="animatie-open border-t border-krijt/10 px-4 py-4">
          {gekozen.geenSlagenteller ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig)}
                className={`h-11 rounded-xl text-sm font-bold transition-colors ${gehaald ? 'bg-munt text-vilt-diep' : 'border border-krijt/20 text-krijt-dof hover:text-krijt'}`}
              >
                Gehaald
              </button>
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig === 0 ? 1 : gekozen.slagenNodig - 1)}
                className={`h-11 rounded-xl text-sm font-bold transition-colors ${!gehaald ? 'bg-hart text-krijt' : 'border border-krijt/20 text-krijt-dof hover:text-krijt'}`}
              >
                Mislukt
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[0.6rem] tracking-[0.24em] text-krijt-dof uppercase">
                Slagen &middot; {gekozen.slagenNodig} nodig
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {ALLE_AANTALLEN.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSlagen(n)}
                    className={`h-9 rounded-lg text-sm font-bold transition-colors ${
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
          {bericht || 'Klik wie speelt.'}
        </p>
        <div className="flex gap-2">
          {(contract || selectie.length > 0) && (
            <button
              type="button"
              onClick={onWis}
              className="h-11 rounded-xl border border-krijt/20 px-4 text-sm text-krijt-dof transition-colors hover:text-krijt"
            >
              Wissen
            </button>
          )}
          <button
            type="button"
            disabled={!kanOpslaan}
            onClick={onOpslaan}
            className="h-11 rounded-xl bg-messing px-6 font-display text-base font-black text-vilt-diep transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:bg-krijt/12 disabled:text-krijt-dof/40"
          >
            Ronde opslaan
          </button>
        </div>
      </div>
    </Kader>
  )
}
