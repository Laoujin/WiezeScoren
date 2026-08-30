import { useCallback, useRef, useState } from 'react'
import { SPELER_IDS, type SpelerId } from '../domein/contracten'
import type { Ploeglid } from '../domein/ploeg'
import type { Punten } from '../domein/score'
import type { Tafelvorm } from '../domein/voorkeuren'
import { saldoVan } from '../domein/betalingen'
import { Avatar } from './Avatar'
import { Kluis } from './Kluis'
import { Viering } from './Viering'
import { MuntStroom } from './MuntStroom'
import { Ploegkiezer } from './Ploegkiezer'
import type { Vlucht } from './useMuntStroom'
import { useTelling } from './useTelling'
import { plaats, puntKleur, tekenPunt, zetelsVan, type Zetel } from './zetels'

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
  zetel: Zetel
  naam: string
  lid: Ploeglid | undefined
  ploeg: Ploeglid[]
  totaal: number
  voorbeeld: number | null
  geselecteerd: boolean
  kiestDeler: boolean
  /** Wat deze zetel netto opstrijkt in de lopende geldstroom; nul als er niets beweegt. */
  saldo: number
  vertraging: number
  onSelecteer: () => void
  onDeler: () => void
  onHernoem: (naam: string) => void
  onKiesZetel: (naam: string) => void
  onGast: () => void
}

function Plaquette({
  speler,
  zetel,
  naam,
  lid,
  ploeg,
  totaal,
  voorbeeld,
  geselecteerd,
  kiestDeler,
  saldo,
  vertraging,
  onSelecteer,
  onDeler,
  onHernoem,
  onKiesZetel,
  onGast,
}: PlaquetteProps) {
  const [bewerkt, zetBewerkt] = useState(false)
  const [kiest, zetKiest] = useState(false)
  const anker = useRef<HTMLDivElement>(null)
  const sluit = useCallback(() => zetKiest(false), [])
  const getoondTotaal = useTelling(totaal, vertraging)

  return (
    <div
      ref={anker}
      data-plaquette={speler}
      className="absolute w-[34%] -translate-x-1/2 -translate-y-1/2 sm:w-[26%]"
      // De transform hierboven maakt een stacking context, dus de kieslijst raakt niet zelf boven
      // de delerfiche; de hele zetel moet omhoog zolang ze openstaat.
      style={kiest ? { ...plaats(zetel.plaquette), zIndex: 30 } : plaats(zetel.plaquette)}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault()
          onDeler()
        }}
        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-transform duration-200 hover:-translate-y-0.5 ${
          geselecteerd
            ? 'plaquette-actief border-messing'
            : 'plaquette border-krijt/12 hover:border-krijt/30'
        }`}
      >
        <span data-avatar className="relative shrink-0">
          <button
            type="button"
            data-avatar-knop={speler}
            title={`${naam} vervangen`}
            onClick={() => zetKiest((open) => !open)}
            className="block rounded-full transition-transform hover:scale-110"
          >
            <Avatar
              naam={naam}
              avatar={lid?.avatar}
              icoon={lid?.icoon}
              className={`h-9 w-9 text-lg ${geselecteerd ? 'border-messing' : ''}`}
            />
          </button>
          {saldo !== 0 && <Kluis vlucht={vertraging} />}
        </span>

        <button
          type="button"
          data-zetel={speler}
          onClick={onSelecteer}
          className="min-w-0 flex-1 text-left"
        >
          {bewerkt ? (
            <input
              autoFocus
              data-naam-invoer
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
              data-naam={speler}
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
        </button>

        {voorbeeld !== null && (
          <span
            key={voorbeeld}
            className={`animatie-inslag shrink-0 rounded-md border border-current/25 px-1.5 py-0.5 text-[0.7rem] leading-none font-bold ${puntKleur(voorbeeld)}`}
          >
            {tekenPunt(voorbeeld)}
          </span>
        )}
      </div>

      {saldo !== 0 && (
        <Viering soort={saldo > 0 ? 'confetti' : 'traan'} vertraging={vertraging} />
      )}

      {kiestDeler && (
        <button
          type="button"
          data-delerkeuze={speler}
          aria-label={`${naam} laten delen`}
          onClick={onDeler}
          className="absolute inset-0 z-20 rounded-xl ring-2 ring-messing ring-offset-2 ring-offset-vilt-diep"
        />
      )}

      {kiest && (
        <Ploegkiezer
          ploeg={ploeg}
          aanTafel={naam}
          omhoog={zetel.plaquette.y > 50}
          anker={anker}
          onKies={onKiesZetel}
          onGast={onGast}
          onSluit={sluit}
        />
      )}
    </div>
  )
}

type TafelProps = {
  spelers: string[]
  ploeg: Ploeglid[]
  totalen: Punten
  voorbeeld: Punten | null
  pot: number
  deler: SpelerId
  selectie: SpelerId[]
  vlucht: Vlucht | null
  vertraging: number
  vorm: Tafelvorm
  onSelecteer: (speler: SpelerId) => void
  onDeler: (speler: SpelerId) => void
  onHernoem: (speler: SpelerId, naam: string) => void
  onKiesZetel: (speler: SpelerId, naam: string) => void
  onGast: (speler: SpelerId) => void
}

export function Tafel({
  spelers,
  ploeg,
  totalen,
  voorbeeld,
  pot,
  deler,
  selectie,
  vlucht,
  vertraging,
  vorm,
  onSelecteer,
  onDeler,
  onHernoem,
  onKiesZetel,
  onGast,
}: TafelProps) {
  const getoondePot = useTelling(pot, vertraging)
  const zetels = zetelsVan(vorm)
  const [kiestDeler, zetKiestDeler] = useState(false)

  return (
    <div data-tafel className="relative mx-auto aspect-square w-full max-w-[40rem] sm:aspect-4/3">
      <div className="lamplicht pointer-events-none absolute inset-x-0 top-[-14%] h-[70%]" />

      <div
        className={`vilt absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-messing-diep/60 bg-vilt-licht shadow-[0_28px_60px_-20px_#000,inset_0_2px_30px_rgba(0,0,0,0.45)] ${
          vorm === 'rond'
            ? 'h-[44%] w-[36%] rounded-[50%] sm:h-[46%] sm:w-[42%]'
            : 'h-[88%] w-[88%] rounded-3xl'
        }`}
      >
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
        className="deler-schuif absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={plaats(zetels[deler].deler)}
      >
        <button
          key={deler}
          type="button"
          data-deler
          aria-pressed={kiestDeler}
          aria-label={kiestDeler ? 'Stop met de deler verzetten' : 'De deler verzetten'}
          onClick={() => zetKiestDeler((aan) => !aan)}
          title="Deler"
          className={`animatie-chip flex h-8 w-8 items-center justify-center rounded-full border-2 border-messing bg-gradient-to-b from-messing to-messing-diep font-display text-sm font-black text-vilt-diep shadow-[0_6px_14px_-4px_#000] ${
            kiestDeler ? 'ring-2 ring-krijt ring-offset-2 ring-offset-vilt-diep' : ''
          }`}
        >
          D
        </button>
      </div>

      {SPELER_IDS.map((speler) => {
        const naam = spelers[speler] ?? ''
        return (
          <Plaquette
            key={speler}
            speler={speler}
            zetel={zetels[speler]}
            naam={naam}
            lid={ploeg.find((l) => l.naam === naam)}
            ploeg={ploeg}
            totaal={totalen[speler]}
            voorbeeld={voorbeeld ? voorbeeld[speler] : null}
            geselecteerd={selectie.includes(speler)}
            kiestDeler={kiestDeler}
            saldo={vlucht ? saldoVan(vlucht.betalingen, speler) : 0}
            vertraging={vertraging}
            onSelecteer={() => onSelecteer(speler)}
            onDeler={() => {
              onDeler(speler)
              zetKiestDeler(false)
            }}
            onHernoem={(nieuw) => onHernoem(speler, nieuw)}
            onKiesZetel={(nieuw) => onKiesZetel(speler, nieuw)}
            onGast={() => onGast(speler)}
          />
        )
      })}

      {vlucht && <MuntStroom key={vlucht.id} betalingen={vlucht.betalingen} vorm={vorm} />}
    </div>
  )
}
