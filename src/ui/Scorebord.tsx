import { useState } from 'react'
import { CONTRACT_NAMEN, SPELER_IDS, type Config, type SpelerId } from '../domein/contracten'
import { contractGehaald, somVan } from '../domein/score'
import {
  heeftOverrides,
  potVan,
  rondeSluit,
  totalen,
  verloop,
  type Ronde,
  type Spel,
} from '../domein/spel'
import { Kader } from './Kader'
import { useTelling } from './useTelling'
import { puntKleur, tekenPunt } from './zetels'

function omschrijf(ronde: Ronde, spelers: string[], config: Config): string {
  if (ronde.contract === 'correctie') return 'Handmatige correctie'
  if (ronde.contract === 'passen') {
    const dragers = SPELER_IDS.filter((s) => (ronde.madams?.[s] ?? 0) > 0)
    if (dragers.length === 0) return 'Geen madams verdeeld'
    return dragers.map((s) => `${spelers[s]} ${ronde.madams?.[s]}`).join(' · ')
  }
  const namen = ronde.spelers.map((s) => spelers[s]).join(' + ')
  const contract = config.contracten[ronde.contract]
  const slagen = contract.geenSlagenteller
    ? contractGehaald(ronde, config)
      ? 'gehaald'
      : 'mislukt'
    : `${ronde.slagen} slagen`
  return `${namen} · ${slagen}`
}

type CelProps = {
  waarde: number
  aangepast: boolean
  toon: (waarde: number) => string
  klasse: string
  onWijzig: (waarde: number) => void
}

function BewerkbareCel({ waarde, aangepast, toon, klasse, onWijzig }: CelProps) {
  const [bewerkt, zetBewerkt] = useState(false)

  if (bewerkt) {
    return (
      <td className="px-1 py-1 text-right">
        <input
          autoFocus
          type="number"
          defaultValue={waarde === 0 ? '' : waarde}
          onBlur={(e) => {
            onWijzig(Number(e.target.value) || 0)
            zetBewerkt(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') zetBewerkt(false)
          }}
          className="w-16 rounded bg-krijt/15 px-1 py-0.5 text-right text-sm outline-none"
        />
      </td>
    )
  }

  return (
    <td className="px-1 py-1 text-right">
      <button
        type="button"
        onClick={() => zetBewerkt(true)}
        className={`w-full rounded px-2 py-0.5 text-right text-sm font-bold hover:bg-krijt/10 ${klasse} ${aangepast ? 'underline decoration-messing decoration-2 underline-offset-4' : ''}`}
      >
        {toon(waarde)}
      </button>
    </td>
  )
}

function TotaalCel({ waarde }: { waarde: number }) {
  const getoond = useTelling(waarde)
  return (
    <td className={`px-2 py-2 text-right font-display text-xl font-black ${puntKleur(getoond)}`}>
      {getoond}
    </td>
  )
}

type Props = {
  className?: string
  spel: Spel
  config: Config
  onWisRonde: (rondeId: string) => void
  onPasPuntAan: (rondeId: string, speler: SpelerId, punten: number) => void
  onPasPotAan: (rondeId: string, pot: number) => void
  onHerstel: (rondeId: string) => void
  onCorrectie: () => void
}

export function Scorebord({
  className = '',
  spel,
  config,
  onWisRonde,
  onPasPuntAan,
  onPasPotAan,
  onHerstel,
  onCorrectie,
}: Props) {
  const standen = verloop(spel, config)
  const stand = totalen(spel, config)
  const pot = potVan(spel, config)
  const eindsom = somVan(stand) + pot

  return (
    <Kader className={`min-w-0 p-5 backdrop-blur-sm ${className}`}>
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-black tracking-tight">Scorebord</h2>
        <button
          type="button"
          onClick={onCorrectie}
          className="rounded-lg border border-krijt/20 px-2.5 py-1 text-xs text-krijt-dof hover:text-krijt"
        >
          + Correctie
        </button>
      </header>

      {standen.length === 0 ? (
        <p className="py-8 text-center text-sm text-krijt-dof">
          Nog geen rondes. Kies wie speelt en welk contract.
        </p>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs tracking-[0.15em] text-krijt-dof uppercase">
                <th className="px-2 py-1 text-left font-medium">Ronde</th>
                {SPELER_IDS.map((s) => (
                  <th key={s} className="px-1 py-1 text-right font-medium">
                    {spel.spelers[s]}
                  </th>
                ))}
                <th className="px-1 py-1 text-right font-medium">Pot</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {standen.map((rij, index) => (
                <tr
                  key={rij.ronde.id}
                  className={`animatie-open border-t border-krijt/10 ${rondeSluit(rij) ? '' : 'bg-hart/15'}`}
                >
                  <td className="px-2 py-1.5">
                    <span className="block font-semibold">
                      {index + 1}. {CONTRACT_NAMEN[rij.ronde.contract]}
                    </span>
                    <span className="block text-xs text-krijt-dof">
                      {omschrijf(rij.ronde, spel.spelers, config)}
                      {heeftOverrides(rij.ronde) && (
                        <button
                          type="button"
                          onClick={() => onHerstel(rij.ronde.id)}
                          className="ml-2 text-messing hover:underline"
                        >
                          herstel
                        </button>
                      )}
                    </span>
                  </td>
                  {SPELER_IDS.map((s) => (
                    <BewerkbareCel
                      key={s}
                      waarde={rij.punten[s]}
                      aangepast={rij.ronde.overrides?.[s] !== undefined}
                      toon={tekenPunt}
                      klasse={puntKleur(rij.punten[s])}
                      onWijzig={(waarde) => onPasPuntAan(rij.ronde.id, s, waarde)}
                    />
                  ))}
                  <BewerkbareCel
                    waarde={rij.potNa}
                    aangepast={rij.ronde.potOverride !== undefined}
                    toon={String}
                    klasse={rij.potNa === rij.potVoor ? 'text-krijt-dof/50' : 'text-messing'}
                    onWijzig={(waarde) => onPasPotAan(rij.ronde.id, waarde)}
                  />
                  <td className="px-1 text-right">
                    <button
                      type="button"
                      onClick={() => onWisRonde(rij.ronde.id)}
                      title="Ronde verwijderen"
                      className="text-krijt-dof transition-colors hover:text-hart"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-messing/50">
                <td className="px-2 py-2 font-display text-sm tracking-wide">Totaal</td>
                {SPELER_IDS.map((s) => (
                  <TotaalCel key={s} waarde={stand[s]} />
                ))}
                <td className="px-2 py-2 text-right font-display text-xl font-black text-messing">
                  {pot}
                </td>
                <td />
              </tr>
              {eindsom !== 0 && (
                <tr>
                  <td colSpan={7} className="px-2 pt-1 text-right text-xs font-semibold text-hart">
                    Scores plus pot komen niet uit op nul: {tekenPunt(eindsom)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </Kader>
  )
}
