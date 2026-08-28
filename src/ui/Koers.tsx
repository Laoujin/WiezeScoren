import { useState } from 'react'
import type { Commentaar } from '../domein/commentaar'
import { SPELER_IDS, type SpelerId } from '../domein/contracten'
import { klapperVan, rennerVeld, stemming, type Renner as Veldrenner } from '../domein/koers'
import type { Punten } from '../domein/score'
import { Renner } from './Renner'
import { TRUIEN } from './truien'
import { useTelling } from './useTelling'
import { puntKleur, tekenPunt } from './zetels'

const MAX_FICHES = 6
const PUNTEN_PER_FICHE = 6

function Premie({ pot, vertraging }: { pot: number; vertraging: number }) {
  const getoond = useTelling(pot, vertraging)
  const fiches = Math.min(MAX_FICHES, Math.ceil(pot / PUNTEN_PER_FICHE))

  return (
    <div className={`relative ${pot > 0 ? 'premie-slinger' : ''}`}>
      <div className="flex items-center gap-3 rounded-b-2xl border-x border-b border-messing/45 bg-vilt-diep/85 px-4 py-2 shadow-[0_10px_26px_-12px_#000]">
        <span className="text-[0.55rem] leading-none tracking-[0.3em] text-messing/70 uppercase">
          Premie
        </span>
        <span
          className={`gegraveerd font-display text-3xl leading-none font-black ${pot > 0 ? 'text-messing' : 'text-krijt/25'}`}
        >
          {getoond}
        </span>
        <span className="flex h-6 items-end gap-0.5">
          {Array.from({ length: fiches }, (_, i) => (
            <span
              key={i}
              className="premiefiche animatie-chip block"
              style={{
                animationDelay: `${vertraging + i * 50}ms`,
                ['--fiche' as string]: i % 2 ? 'var(--color-hart)' : 'var(--color-krijt)',
              }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

type BaanProps = {
  renner: Veldrenner
  spook: number | null
  voorbeeld: number | null
  humeur: string | null
  deelt: boolean
  gekozen: boolean
  vertraging: number
  onSelecteer: () => void
  onDeler: () => void
  onHernoem: (naam: string) => void
}

function Baan({
  renner,
  spook,
  voorbeeld,
  humeur,
  deelt,
  gekozen,
  vertraging,
  onSelecteer,
  onDeler,
  onHernoem,
}: BaanProps) {
  const [bewerkt, zetBewerkt] = useState(false)
  const getoondTotaal = useTelling(renner.totaal, vertraging)
  const trui = TRUIEN[renner.speler] ?? TRUIEN[0]

  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
      <button
        type="button"
        data-zetel={renner.speler}
        onClick={onSelecteer}
        onContextMenu={(e) => {
          e.preventDefault()
          onDeler()
        }}
        className={`group relative flex items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all duration-200 ${
          gekozen
            ? 'plaquette-actief border-messing'
            : 'plaquette border-krijt/12 hover:-translate-y-0.5 hover:border-krijt/35'
        }`}
      >
        <span
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ background: renner.geleTrui ? 'var(--color-messing)' : trui }}
        />
        <span className="min-w-0 flex-1">
          {bewerkt ? (
            <input
              autoFocus
              defaultValue={renner.naam}
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
              className="flex items-baseline gap-1"
            >
              <span className="truncate text-[0.66rem] font-bold tracking-[0.14em] text-krijt/60 uppercase">
                {renner.naam}
              </span>
              {renner.geleTrui && <span title="Gele trui">🟡</span>}
              {renner.rodeLantaarn && <span title="Rode lantaarn">🔴</span>}
              {humeur && (
                <span key={humeur} className="animatie-inslag" title="Na de vorige rit">
                  {humeur}
                </span>
              )}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span
              className={`gegraveerd font-display text-2xl leading-none font-black ${puntKleur(getoondTotaal)}`}
            >
              {getoondTotaal}
            </span>
            {voorbeeld !== null && (
              <span
                key={voorbeeld}
                className={`animatie-inslag rounded-md border border-current/25 px-1 text-[0.66rem] leading-tight font-bold ${puntKleur(voorbeeld)}`}
              >
                {tekenPunt(voorbeeld)}
              </span>
            )}
          </span>
        </span>
        {deelt && (
          <span
            className="animatie-chip absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-messing bg-gradient-to-b from-messing to-messing-diep text-[0.6rem] font-black text-vilt-diep shadow-[0_4px_10px_-3px_#000]"
            title="Deelt deze ronde — rechtsklik een andere renner om te verzetten"
          >
            D
          </span>
        )}
      </button>

      <div className="asfalt relative h-[4.25rem] overflow-hidden rounded-xl border border-krijt/10 sm:h-[4.75rem]">
        <span className="middenstreep absolute inset-x-2 top-1/2 h-px -translate-y-1/2" />
        <span className="absolute top-1/2 right-1.5 -translate-y-1/2 font-display text-[0.6rem] font-black text-krijt/20">
          {renner.plaats}e
        </span>

        {spook !== null && (
          <span
            className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35"
            style={{ left: `${spook}%` }}
          >
            <Renner
              trui="#f3eee2"
              geleTrui={false}
              className="h-8 w-11 [filter:grayscale(1)] sm:h-9 sm:w-12"
            />
          </span>
        )}

        <span
          className="renner-schuif absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${renner.positie}%`, transitionDelay: `${vertraging}ms` }}
        >
          <span className="trap block" style={{ animationDelay: `${renner.speler * 120}ms` }}>
            <Renner
              trui={trui}
              geleTrui={renner.geleTrui}
              className="h-9 w-12 drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)] sm:h-11 sm:w-14"
            />
          </span>
        </span>
      </div>
    </div>
  )
}

type KoersProps = {
  spelers: string[]
  totalen: Punten
  voorbeeld: Punten | null
  pot: number
  deler: SpelerId
  selectie: SpelerId[]
  rit: number
  laatsteRit: Punten | null
  praat: Commentaar
  vertraging: number
  onSelecteer: (speler: SpelerId) => void
  onDeler: (speler: SpelerId) => void
  onHernoem: (speler: SpelerId, naam: string) => void
}

export function Koers({
  spelers,
  totalen,
  voorbeeld,
  pot,
  deler,
  selectie,
  rit,
  laatsteRit,
  praat,
  vertraging,
  onSelecteer,
  onDeler,
  onHernoem,
}: KoersProps) {
  const veld = rennerVeld(totalen, spelers)
  const klapper = laatsteRit ? klapperVan(laatsteRit, spelers) : null
  const spookveld = voorbeeld
    ? rennerVeld(
        {
          0: totalen[0] + voorbeeld[0],
          1: totalen[1] + voorbeeld[1],
          2: totalen[2] + voorbeeld[2],
          3: totalen[3] + voorbeeld[3],
        },
        spelers,
      )
    : null

  return (
    <section className="relative overflow-hidden rounded-3xl border border-krijt/12 bg-vilt-diep/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_60px_-40px_#000]">
      <div className="lamplicht pointer-events-none absolute inset-x-0 top-[-30%] h-[70%]" />

      <div className="relative flex items-start gap-3 border-b border-krijt/10 px-4 pt-3 pb-3 sm:px-6">
        <span key={praat.regel} className="animatie-inslag text-2xl leading-none sm:text-3xl">
          {praat.emoji}
        </span>
        <p
          key={`${praat.regel}-tekst`}
          className="animatie-open min-w-0 flex-1 font-display text-[0.95rem] leading-snug text-krijt italic sm:text-lg"
        >
          {praat.regel}
        </p>
        {klapper ? (
          <span
            key={`${klapper.naam}${klapper.punten}`}
            className={`animatie-inslag shrink-0 -rotate-6 rounded-md border-2 px-2 py-1 text-center font-display text-[0.6rem] leading-tight font-black tracking-[0.1em] uppercase ${
              klapper.punten > 0 ? 'border-munt/70 text-munt' : 'border-hart/70 text-hart'
            }`}
          >
            {klapper.punten > 0 ? 'Klapper' : 'Smak'}
            <span className="block text-base">{tekenPunt(klapper.punten)}</span>
            <span className="block text-[0.55rem] font-bold tracking-normal normal-case opacity-80">
              {klapper.naam}
            </span>
          </span>
        ) : (
          <span className="hidden shrink-0 text-right text-[0.55rem] leading-tight tracking-[0.24em] text-krijt-dof uppercase sm:block">
            Rit {rit}
            <br />
            in aanbouw
          </span>
        )}
      </div>

      <div className="relative px-3 pt-0 pb-4 sm:px-6">
        <div className="mb-2 flex justify-end pr-6 sm:pr-10">
          <Premie pot={pot} vertraging={vertraging} />
        </div>

        <div className="relative">
          <span className="finishboog pointer-events-none absolute inset-y-0 right-0 w-2.5 rounded-r-xl sm:w-3.5" />
          <span className="pointer-events-none absolute -top-2 right-0 translate-x-1/3 -rotate-90 text-[0.5rem] tracking-[0.3em] text-krijt/45 uppercase">
            kop
          </span>
          <div className="flex flex-col gap-2 pr-4 sm:gap-2.5 sm:pr-6">
            {SPELER_IDS.map((speler) => (
              <Baan
                key={speler}
                renner={veld[speler]!}
                spook={spookveld ? spookveld[speler]!.positie : null}
                voorbeeld={voorbeeld ? voorbeeld[speler] : null}
                humeur={laatsteRit && !voorbeeld ? stemming(laatsteRit[speler]) : null}
                deelt={deler === speler}
                gekozen={selectie.includes(speler)}
                vertraging={vertraging}
                onSelecteer={() => onSelecteer(speler)}
                onDeler={() => onDeler(speler)}
                onHernoem={(naam) => onHernoem(speler, naam)}
              />
            ))}
          </div>
        </div>

        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.62rem] text-krijt-dof">
          <span>🚴 klik een renner om hem te laten aanvallen</span>
          <span>D rechtsklik verzet de deler</span>
          <span>✎ dubbelklik een naam</span>
          <span>👻 het grijze spook toont waar de rit je zet</span>
        </p>
      </div>
    </section>
  )
}
