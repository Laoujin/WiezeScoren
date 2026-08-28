import { SPELER_IDS, type Config } from '../domein/contracten'
import { totalen, type Spel } from '../domein/spel'
import { puntKleur } from './zetels'

const DATUM = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeStyle: 'short' })

type Props = {
  archief: Spel[]
  config: Config
  onHeropen: (spelId: string) => void
  onWis: (spelId: string) => void
}

export function Archief({ archief, config, onHeropen, onWis }: Props) {
  return (
    <section className="rounded-2xl border border-krijt/15 bg-vilt-diep/45 p-5 backdrop-blur-sm">
      <h2 className="font-display text-2xl font-black tracking-tight">Archief</h2>

      {archief.length === 0 ? (
        <p className="py-8 text-center text-sm text-krijt-dof">
          Afgesloten partijen komen hier terecht.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {archief.map((spel) => {
            const stand = totalen(spel, config)
            return (
              <li
                key={spel.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-krijt/10 bg-vilt-diep/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{DATUM.format(new Date(spel.gestartOp))}</p>
                  <p className="text-xs text-krijt-dof">{spel.rondes.length} rondes</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {SPELER_IDS.map((s) => (
                    <span key={s} className="text-sm">
                      <span className="text-krijt-dof">{spel.spelers[s]}</span>{' '}
                      <span className={`font-display font-black ${puntKleur(stand[s])}`}>
                        {stand[s]}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onHeropen(spel.id)}
                    className="rounded-lg border border-krijt/20 px-3 py-1.5 text-sm font-semibold text-krijt-dof transition-colors hover:border-messing hover:text-messing"
                    title="Deze partij weer aan tafel brengen"
                  >
                    Heropenen
                  </button>
                  <button
                    type="button"
                    onClick={() => onWis(spel.id)}
                    className="text-krijt-dof transition-colors hover:text-hart"
                    title="Uit het archief verwijderen"
                  >
                    &times;
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
