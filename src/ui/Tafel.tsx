import { useEffect, useRef, useState } from 'react'
import { SPELER_IDS, type SpelerId } from '../domein/contracten'
import type { Punten } from '../domein/score'
import { useTelling } from './useTelling'
import { ZETELS, puntKleur, tekenPunt } from './zetels'

type ZetelProps = {
  speler: SpelerId
  naam: string
  totaal: number
  voorbeeld: number | null
  geselecteerd: boolean
  leider: boolean
  onSelecteer: () => void
  onDeler: () => void
  onHernoem: (naam: string) => void
}

function Zetel({
  speler,
  naam,
  totaal,
  voorbeeld,
  geselecteerd,
  leider,
  onSelecteer,
  onDeler,
  onHernoem,
}: ZetelProps) {
  const [bewerkt, zetBewerkt] = useState(false)
  const getoondTotaal = useTelling(totaal)
  const zetel = ZETELS[speler]

  return (
    <div
      className="absolute w-[32%] -translate-x-1/2 -translate-y-1/2"
      style={{ left: zetel.x, top: zetel.y }}
    >
      <button
        type="button"
        onClick={onSelecteer}
        onContextMenu={(e) => {
          e.preventDefault()
          onDeler()
        }}
        className={`w-full rounded-2xl border px-3 py-2 text-left backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 ${
          geselecteerd
            ? 'border-messing bg-messing/20 shadow-[0_0_28px_-8px_var(--color-messing)]'
            : 'border-krijt/15 bg-vilt-diep/55 hover:border-krijt/35'
        } ${leider ? 'animatie-gloed' : ''}`}
        title="Klik om te laten spelen, rechtsklik om deler te zetten"
      >
        <span className="flex items-baseline gap-2">
          <span className={`text-lg ${zetel.rood ? 'text-hart' : 'text-krijt-dof'}`}>
            {zetel.kleur}
          </span>
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
              className="w-full min-w-0 rounded bg-krijt/10 px-1 font-sans text-sm font-semibold outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation()
                zetBewerkt(true)
              }}
              className="truncate text-sm font-semibold tracking-wide"
            >
              {naam}
            </span>
          )}
        </span>
        <span className="mt-1 flex items-end justify-between gap-2">
          <span
            className={`font-display text-3xl leading-none font-black ${puntKleur(getoondTotaal)}`}
          >
            {getoondTotaal}
          </span>
          {voorbeeld !== null && (
            <span
              key={voorbeeld}
              className={`animatie-inslag rounded-full border border-current/30 px-2 py-0.5 text-xs font-bold ${puntKleur(voorbeeld)}`}
            >
              {tekenPunt(voorbeeld)}
            </span>
          )}
        </span>
      </button>
    </div>
  )
}

type TafelProps = {
  spelers: string[]
  totalen: Punten
  voorbeeld: Punten | null
  deler: SpelerId
  selectie: SpelerId[]
  leiders: SpelerId[]
  bericht: string
  onSelecteer: (speler: SpelerId) => void
  onDeler: (speler: SpelerId) => void
  onHernoem: (speler: SpelerId, naam: string) => void
}

export function Tafel({
  spelers,
  totalen,
  voorbeeld,
  deler,
  selectie,
  leiders,
  bericht,
  onSelecteer,
  onDeler,
  onHernoem,
}: TafelProps) {
  const chip = ZETELS[deler]
  const eersteRender = useRef(true)

  useEffect(() => {
    eersteRender.current = false
  }, [])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[40rem] sm:aspect-4/3">
      <div className="lamplicht pointer-events-none absolute inset-x-0 top-[-14%] h-[70%]" />

      <div className="vilt absolute top-1/2 left-1/2 h-[52%] w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-messing-diep/60 bg-vilt-licht shadow-[0_28px_60px_-20px_#000,inset_0_2px_30px_rgba(0,0,0,0.45)]">
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-display text-sm text-krijt/70 italic">
          {bericht}
        </p>
      </div>

      <div
        className="deler-schuif pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: chip.chipX, top: chip.chipY }}
      >
        <span
          key={deler}
          className="animatie-chip flex h-9 w-9 items-center justify-center rounded-full border-2 border-messing bg-gradient-to-b from-messing to-messing-diep font-display text-base font-black text-vilt-diep shadow-[0_6px_14px_-4px_#000]"
          title="Deler"
        >
          D
        </span>
      </div>

      {SPELER_IDS.map((speler) => (
        <Zetel
          key={speler}
          speler={speler}
          naam={spelers[speler] ?? ''}
          totaal={totalen[speler]}
          voorbeeld={voorbeeld ? voorbeeld[speler] : null}
          geselecteerd={selectie.includes(speler)}
          leider={leiders.includes(speler)}
          onSelecteer={() => onSelecteer(speler)}
          onDeler={() => onDeler(speler)}
          onHernoem={(naam) => onHernoem(speler, naam)}
        />
      ))}
    </div>
  )
}
