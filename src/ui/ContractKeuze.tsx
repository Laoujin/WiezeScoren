import {
  CONTRACT_NAMEN,
  SPEELBARE_CONTRACTEN,
  isSpeelbaar,
  type Config,
  type ContractType,
  type SpelerId,
} from '../domein/contracten'

const ALLE_SLAGEN = Array.from({ length: 14 }, (_, i) => i)

function toegestaan(contract: ContractType, config: Config, aantalSpelers: number): boolean {
  if (contract === 'passen') return aantalSpelers === 0
  if (!isSpeelbaar(contract)) return false
  return config[contract].kampGroottes.includes(aantalSpelers)
}

type Props = {
  config: Config
  selectie: SpelerId[]
  contract: ContractType | null
  slagen: number
  onContract: (contract: ContractType) => void
  onSlagen: (slagen: number) => void
  onOpslaan: () => void
  onWis: () => void
}

export function ContractKeuze({
  config,
  selectie,
  contract,
  slagen,
  onContract,
  onSlagen,
  onOpslaan,
  onWis,
}: Props) {
  const keuzes: ContractType[] = [...SPEELBARE_CONTRACTEN, 'passen']
  const gekozen = contract && isSpeelbaar(contract) ? config[contract] : null
  const gehaald = gekozen ? slagen === gekozen.slagenNodig : false

  return (
    <section className="mt-2 space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {keuzes.map((keuze) => {
          const kan = toegestaan(keuze, config, selectie.length)
          const actief = contract === keuze
          const naam = isSpeelbaar(keuze) ? config[keuze].naam : CONTRACT_NAMEN[keuze]
          return (
            <button
              key={keuze}
              type="button"
              disabled={!kan}
              onClick={() => onContract(keuze)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-semibold tracking-wide transition-all duration-150 ${
                actief
                  ? 'border-messing bg-messing text-vilt-diep shadow-[0_0_26px_-6px_var(--color-messing)]'
                  : kan
                    ? 'border-krijt/25 bg-vilt-diep/50 text-krijt hover:-translate-y-0.5 hover:border-messing/70'
                    : 'cursor-not-allowed border-krijt/10 bg-vilt-diep/25 text-krijt-dof/40'
              }`}
            >
              {naam}
            </button>
          )
        })}
      </div>

      {gekozen && (
        <div className="animatie-open rounded-2xl border border-krijt/15 bg-vilt-diep/45 p-4">
          {gekozen.allesOfNiets ? (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold ${gehaald ? 'bg-munt text-vilt-diep' : 'border border-krijt/25 text-krijt-dof hover:text-krijt'}`}
              >
                Gehaald
              </button>
              <button
                type="button"
                onClick={() => onSlagen(gekozen.slagenNodig === 0 ? 1 : gekozen.slagenNodig - 1)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold ${!gehaald ? 'bg-hart text-krijt' : 'border border-krijt/25 text-krijt-dof hover:text-krijt'}`}
              >
                Mislukt
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-center text-xs tracking-[0.2em] text-krijt-dof uppercase">
                Slagen &middot; {gekozen.slagenNodig} nodig
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {ALLE_SLAGEN.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSlagen(n)}
                    className={`h-9 w-9 rounded-lg text-sm font-bold transition-colors ${
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

      <div className="flex justify-center gap-3">
        <button
          type="button"
          disabled={!contract}
          onClick={onOpslaan}
          className="rounded-xl bg-messing px-6 py-2.5 font-display text-base font-black text-vilt-diep transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:bg-krijt/15 disabled:text-krijt-dof/50"
        >
          Ronde opslaan
        </button>
        {(contract || selectie.length > 0) && (
          <button
            type="button"
            onClick={onWis}
            className="rounded-xl border border-krijt/20 px-4 py-2.5 text-sm text-krijt-dof hover:text-krijt"
          >
            Wissen
          </button>
        )}
      </div>
    </section>
  )
}
