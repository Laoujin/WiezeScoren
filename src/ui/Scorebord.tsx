import { useState } from 'react'
import { CONTRACT_NAMEN, SPELER_IDS, type Config, type SpelerId } from '../domein/contracten'
import {
  heeftOverrides,
  puntenVanRonde,
  rondeSluit,
  somVan,
  totalen,
  type Ronde,
  type Spel,
} from '../domein/spel'
import { useTelling } from './useTelling'
import { ZETELS, puntKleur, tekenPunt } from './zetels'

function omschrijf(ronde: Ronde, spelers: string[], config: Config): string {
  if (ronde.contract === 'passen') return 'Iedereen past'
  if (ronde.contract === 'correctie') return 'Handmatige correctie'
  const namen = ronde.spelers.map((s) => spelers[s]).join(' + ')
  const slagen = config[ronde.contract].allesOfNiets
    ? ronde.slagen === config[ronde.contract].slagenNodig
      ? 'gehaald'
      : 'mislukt'
    : `${ronde.slagen} slagen`
  return `${namen} · ${slagen}`
}

type CelProps = {
  punten: number
  aangepast: boolean
  onWijzig: (punten: number) => void
}

function PuntCel({ punten, aangepast, onWijzig }: CelProps) {
  const [bewerkt, zetBewerkt] = useState(false)

  if (bewerkt) {
    return (
      <td className="px-1 py-1 text-right">
        <input
          autoFocus
          type="number"
          defaultValue={punten}
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
        title="Klik om handmatig aan te passen"
        className={`w-full rounded px-2 py-0.5 text-right text-sm font-bold hover:bg-krijt/10 ${puntKleur(punten)} ${aangepast ? 'underline decoration-messing decoration-2 underline-offset-4' : ''}`}
      >
        {tekenPunt(punten)}
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
  spel: Spel
  config: Config
  onWisRonde: (rondeId: string) => void
  onPasPuntAan: (rondeId: string, speler: SpelerId, punten: number) => void
  onHerstel: (rondeId: string) => void
  onCorrectie: () => void
}

export function Scorebord({ spel, config, onWisRonde, onPasPuntAan, onHerstel, onCorrectie }: Props) {
  const stand = totalen(spel, config)
  const eindsom = somVan(stand)

  return (
    <section className="rounded-2xl border border-krijt/15 bg-vilt-diep/45 p-4 backdrop-blur-sm">
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

      {spel.rondes.length === 0 ? (
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
                    <span className={ZETELS[s].rood ? 'text-hart' : 'text-krijt-dof'}>
                      {ZETELS[s].kleur}
                    </span>{' '}
                    {spel.spelers[s]}
                  </th>
                ))}
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {spel.rondes.map((ronde, index) => {
                const punten = puntenVanRonde(ronde, config)
                const sluit = rondeSluit(ronde, config)
                return (
                  <tr
                    key={ronde.id}
                    className={`animatie-open border-t border-krijt/10 ${sluit ? '' : 'bg-hart/15'}`}
                  >
                    <td className="px-2 py-1.5">
                      <span className="block font-semibold">
                        {index + 1}. {CONTRACT_NAMEN[ronde.contract]}
                      </span>
                      <span className="block text-xs text-krijt-dof">
                        {omschrijf(ronde, spel.spelers, config)}
                        {heeftOverrides(ronde) && (
                          <button
                            type="button"
                            onClick={() => onHerstel(ronde.id)}
                            className="ml-2 text-messing hover:underline"
                          >
                            herstel
                          </button>
                        )}
                      </span>
                    </td>
                    {SPELER_IDS.map((s) => (
                      <PuntCel
                        key={s}
                        punten={punten[s]}
                        aangepast={ronde.overrides?.[s] !== undefined}
                        onWijzig={(waarde) => onPasPuntAan(ronde.id, s, waarde)}
                      />
                    ))}
                    <td className="px-1 text-right">
                      <button
                        type="button"
                        onClick={() => onWisRonde(ronde.id)}
                        title="Ronde verwijderen"
                        className="text-krijt-dof transition-colors hover:text-hart"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-messing/50">
                <td className="px-2 py-2 font-display text-sm tracking-wide">Totaal</td>
                {SPELER_IDS.map((s) => (
                  <TotaalCel key={s} waarde={stand[s]} />
                ))}
                <td />
              </tr>
              {eindsom !== 0 && (
                <tr>
                  <td colSpan={6} className="px-2 pt-1 text-right text-xs font-semibold text-hart">
                    De stand komt niet uit op nul: {tekenPunt(eindsom)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
