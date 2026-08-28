import type { Config } from '../domein/contracten'
import { palmares, partijFeiten } from '../domein/palmares'
import type { Rondestand } from '../domein/spel'

export function Palmares({
  stand,
  spelers,
  config,
}: {
  stand: Rondestand[]
  spelers: string[]
  config: Config
}) {
  const ereplaatsen = palmares(stand, spelers, config)
  const feiten = partijFeiten(stand)

  if (ereplaatsen.length === 0) {
    return (
      <section className="rounded-3xl border border-krijt/12 bg-vilt-diep/45 px-6 py-12 text-center">
        <p className="font-display text-2xl font-black text-krijt/70">Nog niets te vieren</p>
        <p className="mt-2 text-sm text-krijt-dof">
          Speel een rit en de prijzenkast vult zich vanzelf.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ereplaatsen.map((ere) => (
          <article
            key={ere.titel}
            className="animatie-open flex items-start gap-3 rounded-2xl border border-krijt/12 bg-vilt-diep/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <span className="text-3xl leading-none">{ere.emoji}</span>
            <div className="min-w-0">
              <p className="text-[0.55rem] tracking-[0.24em] text-krijt-dof uppercase">
                {ere.titel}
              </p>
              <p className="gegraveerd truncate font-display text-xl leading-tight font-black text-messing">
                {ere.winnaar}
              </p>
              <p className="text-xs text-krijt/70">{ere.detail}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-2xl border border-krijt/10 bg-vilt-diep/35 px-5 py-4">
        {[
          { label: 'Ritten gereden', waarde: feiten.rondes },
          { label: 'Keer niemand durfde', waarde: feiten.pasrondes },
          { label: 'Hoogste premie', waarde: feiten.hoogstePot },
          { label: 'Keer de jury ingreep', waarde: feiten.handmatig },
        ].map((feit) => (
          <div key={feit.label}>
            <p className="gegraveerd font-display text-2xl leading-none font-black text-krijt">
              {feit.waarde}
            </p>
            <p className="text-[0.55rem] tracking-[0.2em] text-krijt-dof uppercase">{feit.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
