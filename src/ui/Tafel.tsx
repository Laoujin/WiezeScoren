import { useState } from 'react'
import { SPELER_IDS, type SpelerId } from '../domein/contracten'
import type { Punten } from '../domein/score'
import { Munt } from './Munt'
import { MuntStroom } from './MuntStroom'
import type { Vlucht } from './useMuntStroom'
import { useTelling } from './useTelling'
import { ZETELS, plaats, puntKleur, tekenPunt } from './zetels'

const MAX_FICHES = 8
const PUNTEN_PER_FICHE = 6

function Fichestapel({ pot, vertraging }: { pot: number; vertraging: number }) {
  const hoogte = Math.min(MAX_FICHES, Math.ceil(pot / PUNTEN_PER_FICHE))

  if (hoogte === 0) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-krijt/20" />
    )
  }

  return (
    <div className="relative h-11 w-11">
      {Array.from({ length: hoogte }, (_, i) => (
        <span
          key={i}
          className="fiche animatie-fiche absolute left-1/2"
          style={{
            bottom: `${i * 5}px`,
            zIndex: i,
            animationDelay: `${vertraging + i * 40}ms`,
            ['--fiche' as string]: i % 2 ? 'var(--color-hart)' : 'var(--color-krijt)',
          }}
        />
      ))}
    </div>
  )
}

type PlaquetteProps = {
  speler: SpelerId
  naam: string
  totaal: number
  voorbeeld: number | null
  geselecteerd: boolean
  vertraging: number
  onSelecteer: () => void
  onDeler: () => void
  onHernoem: (naam: string) => void
}

function Plaquette({
  speler,
  naam,
  totaal,
  voorbeeld,
  geselecteerd,
  vertraging,
  onSelecteer,
  onDeler,
  onHernoem,
}: PlaquetteProps) {
  const [bewerkt, zetBewerkt] = useState(false)
  const getoondTotaal = useTelling(totaal, vertraging)

  return (
    <div
      className="absolute w-[30%] -translate-x-1/2 -translate-y-1/2 sm:w-[24%]"
      style={plaats(ZETELS[speler].plaquette)}
    >
      <button
        type="button"
        data-zetel={speler}
        onClick={onSelecteer}
        onContextMenu={(e) => {
          e.preventDefault()
          onDeler()
        }}
        className={`flex w-full items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition-transform duration-200 hover:-translate-y-0.5 ${
          geselecteerd
            ? 'plaquette-actief border-messing'
            : 'plaquette border-krijt/12 hover:border-krijt/30'
        }`}
      >
        <Munt
          className={`h-5 w-5 shrink-0 ${geselecteerd ? 'text-messing' : 'text-messing-diep'}`}
        />
        <span className="min-w-0 flex-1">
          {bewerkt ? (
            <input
              autoFocus
              defaultValue={naam}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                onHernoem(e.target.value)
                zetBewerkt(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
                if (e.key === 'Escape') zetBewerkt(false)
              }}
              className="w-full min-w-0 rounded bg-krijt/10 px-1 text-xs font-semibold outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation()
                zetBewerkt(true)
              }}
              className="block truncate text-[0.62rem] font-bold tracking-[0.16em] text-krijt/55 uppercase"
            >
              {naam}
            </span>
          )}
          <span
            className={`gegraveerd block font-display text-2xl leading-none font-black ${puntKleur(getoondTotaal)}`}
          >
            {getoondTotaal}
          </span>
        </span>
        {voorbeeld !== null && (
          <span
            key={voorbeeld}
            className={`animatie-inslag shrink-0 rounded-md border border-current/25 px-1.5 py-0.5 text-[0.7rem] leading-none font-bold ${puntKleur(voorbeeld)}`}
          >
            {tekenPunt(voorbeeld)}
          </span>
        )}
      </button>
    </div>
  )
}

type TafelProps = {
  spelers: string[]
  totalen: Punten
  voorbeeld: Punten | null
  pot: number
  deler: SpelerId
  selectie: SpelerId[]
  vlucht: Vlucht | null
  vertraging: number
  onSelecteer: (speler: SpelerId) => void
  onDeler: (speler: SpelerId) => void
  onHernoem: (speler: SpelerId, naam: string) => void
}

export function Tafel({
  spelers,
  totalen,
  voorbeeld,
  pot,
  deler,
  selectie,
  vlucht,
  vertraging,
  onSelecteer,
  onDeler,
  onHernoem,
}: TafelProps) {
  const getoondePot = useTelling(pot, vertraging)

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[40rem] sm:aspect-4/3">
      <div className="lamplicht pointer-events-none absolute inset-x-0 top-[-14%] h-[70%]" />

      <div className="vilt absolute top-1/2 left-1/2 h-[44%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-messing-diep/60 bg-vilt-licht shadow-[0_28px_60px_-20px_#000,inset_0_2px_30px_rgba(0,0,0,0.45)] sm:h-[46%] sm:w-[48%]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-[0.58rem] tracking-[0.34em] text-krijt/45 uppercase">Pot</span>
          <Fichestapel key={pot} pot={pot} vertraging={vertraging} />
          <span
            className={`gegraveerd font-display text-3xl leading-none font-black ${getoondePot > 0 ? 'text-messing' : 'text-krijt/25'}`}
          >
            {getoondePot}
          </span>
        </div>
      </div>

      <div
        className="deler-schuif pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={plaats(ZETELS[deler].deler)}
      >
        <span
          key={deler}
          className="animatie-chip flex h-8 w-8 items-center justify-center rounded-full border-2 border-messing bg-gradient-to-b from-messing to-messing-diep font-display text-sm font-black text-vilt-diep shadow-[0_6px_14px_-4px_#000]"
          title="Deler"
        >
          D
        </span>
      </div>

      {SPELER_IDS.map((speler) => (
        <Plaquette
          key={speler}
          speler={speler}
          naam={spelers[speler] ?? ''}
          totaal={totalen[speler]}
          voorbeeld={voorbeeld ? voorbeeld[speler] : null}
          geselecteerd={selectie.includes(speler)}
          vertraging={vertraging}
          onSelecteer={() => onSelecteer(speler)}
          onDeler={() => onDeler(speler)}
          onHernoem={(naam) => onHernoem(speler, naam)}
        />
      ))}

      {vlucht && <MuntStroom key={vlucht.id} betalingen={vlucht.betalingen} />}
    </div>
  )
}
