import {
  SPEELBARE_CONTRACTEN,
  STANDAARD_CONFIG,
  type Config,
  type ContractConfig,
  type SpeelbaarContract,
} from '../domein/contracten'

const GETALVELDEN: { sleutel: keyof ContractConfig; label: string }[] = [
  { sleutel: 'slagenNodig', label: 'Slagen nodig' },
  { sleutel: 'puntenGehaald', label: 'Gehaald' },
  { sleutel: 'puntenVerloren', label: 'Verloren' },
  { sleutel: 'perExtraSlag', label: 'Per extra slag' },
  { sleutel: 'perSlagTekort', label: 'Per slag tekort' },
  { sleutel: 'bijAlleSlagen', label: 'Bij 13 slagen' },
]

const VINKVELDEN: { sleutel: keyof ContractConfig; label: string }[] = [
  { sleutel: 'wintDePot', label: 'Speelt om de pot' },
]

type Props = {
  config: Config
  onWijzig: (config: Config) => void
}

export function Instellingen({ config, onWijzig }: Props) {
  const zetVeld = (
    contract: SpeelbaarContract,
    veld: keyof ContractConfig,
    waarde: number | boolean,
  ) => {
    onWijzig({
      ...config,
      contracten: {
        ...config.contracten,
        [contract]: { ...config.contracten[contract], [veld]: waarde },
      },
    })
  }

  return (
    <section className="rounded-2xl border border-krijt/15 bg-vilt-diep/45 p-5 backdrop-blur-sm">
      <h2 className="font-display text-2xl font-black tracking-tight">Instellingen</h2>
      <p className="mt-1 mb-4 max-w-3xl text-sm text-krijt-dof">
        De waarde hieronder is de inzet die elke tegenstander neerlegt. Het spelende kamp verdeelt
        de hele inleg, dus een solist wint driemaal de inzet en een duo eenmaal. Haalt het kamp alle
        dertien slagen, dan telt de vaste waarde bij 13 slagen, tenzij die op nul staat. Wie om de
        pot speelt, wint hem bovenop zijn punten en verdubbelt hem bij verlies. Elke wijziging
        herrekent meteen de lopende partij.
      </p>

      <label className="mb-5 flex w-fit items-center gap-3 rounded-xl border border-krijt/15 bg-vilt-diep/50 px-4 py-2.5 text-sm">
        <span className="font-semibold">Een madam kost</span>
        <input
          type="number"
          value={config.madamWaarde}
          onChange={(e) => onWijzig({ ...config, madamWaarde: Number(e.target.value) || 0 })}
          className="w-16 rounded bg-krijt/10 px-2 py-1 text-right outline-none focus:bg-krijt/20"
        />
        <span className="text-krijt-dof">punten, betaald aan de pot bij een pasronde</span>
      </label>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs tracking-[0.15em] text-krijt-dof uppercase">
              <th className="px-2 py-1 text-left font-medium">Contract</th>
              {[...GETALVELDEN, ...VINKVELDEN].map((veld) => (
                <th key={veld.sleutel} className="px-2 py-1 text-right font-medium">
                  {veld.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEELBARE_CONTRACTEN.map((contract) => (
              <tr key={contract} className="border-t border-krijt/10">
                <td className="px-2 py-1.5 font-semibold">{config.contracten[contract].naam}</td>
                {GETALVELDEN.map((veld) => (
                  <td key={veld.sleutel} className="px-2 py-1.5 text-right">
                    <input
                      type="number"
                      value={config.contracten[contract][veld.sleutel] as number}
                      onChange={(e) => zetVeld(contract, veld.sleutel, Number(e.target.value) || 0)}
                      className="w-16 rounded bg-krijt/10 px-2 py-1 text-right outline-none focus:bg-krijt/20"
                    />
                  </td>
                ))}
                {VINKVELDEN.map((veld) => (
                  <td key={veld.sleutel} className="px-2 py-1.5 text-right">
                    <input
                      type="checkbox"
                      checked={config.contracten[contract][veld.sleutel] as boolean}
                      onChange={(e) => zetVeld(contract, veld.sleutel, e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-messing)]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => onWijzig(STANDAARD_CONFIG)}
        className="mt-4 rounded-lg border border-krijt/20 px-3 py-1.5 text-sm text-krijt-dof hover:text-krijt"
      >
        Terug naar de standaardwaarden
      </button>
    </section>
  )
}
