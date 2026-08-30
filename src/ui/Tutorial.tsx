import { useEffect, useRef, useState } from 'react'
import { Kader } from './Kader'
import { voerUit, zoek } from './tutorial/acties'
import { STAPPEN, type Stap } from './tutorial/stappen'

/** Milliseconden tussen twee voorgedane klikken, zodat je ze uit elkaar houdt. */
const TEMPO = 800

/** De schijnwerper hangt aan een element dat zelf beweegt, dus hij meet zichzelf bij. */
const MEETINTERVAL = 200

const RAND = 8

type Kaderplek = { top: number; left: number; breedte: number; hoogte: number }

/** Waar het handje staat, en of het net op dat punt tikt. */
type Handje = { x: number; y: number; tikt: boolean }

function midden(element: HTMLElement): { x: number; y: number } {
  const kader = element.getBoundingClientRect()
  return { x: kader.left + kader.width / 2, y: kader.top + kader.height / 2 }
}

function wacht(ms: number): Promise<void> {
  return new Promise((klaar) => setTimeout(klaar, ms))
}

function doelenVan(doel: string | string[] | undefined): HTMLElement[] {
  if (!doel) return []
  const selectors = Array.isArray(doel) ? doel : [doel]
  return selectors.map(zoek).filter((element) => element !== null)
}

/** Eén schijnwerper over alle doelen samen, zodat een stap die twee blokken gebruikt beide toont. */
function plekVan(doel: string | string[] | undefined): Kaderplek | null {
  const kaders = doelenVan(doel).map((element) => element.getBoundingClientRect())
  if (kaders.length === 0) return null
  const top = Math.min(...kaders.map((k) => k.top))
  const left = Math.min(...kaders.map((k) => k.left))
  return {
    top,
    left,
    breedte: Math.max(...kaders.map((k) => k.right)) - left,
    hoogte: Math.max(...kaders.map((k) => k.bottom)) - top,
  }
}

function zelfdePlek(a: Kaderplek | null, b: Kaderplek | null): boolean {
  if (a === null || b === null) return a === b
  return a.top === b.top && a.left === b.left && a.breedte === b.breedte && a.hoogte === b.hoogte
}

type Props = {
  stappen?: Stap[]
  tempo?: number
  onSluit: () => void
}

export function Tutorial({ stappen = STAPPEN, tempo = TEMPO, onSluit }: Props) {
  const [index, zetIndex] = useState(0)
  const [plek, zetPlek] = useState<Kaderplek | null>(null)
  const [hand, zetHand] = useState<Handje | null>(null)
  const gespeeld = useRef(-1)
  const stap = stappen[index]!
  const laatste = index === stappen.length - 1

  // Het handje schuift eerst naar het doel en tikt dan pas, anders zie je niet waar de klik valt.
  useEffect(() => {
    if (index <= gespeeld.current) return
    let gestopt = false

    const speel = async () => {
      // Pas afvinken zodra de reeks echt loopt: een afgebroken aanloop mag de stap niet opeten.
      await wacht(tempo / 4)
      if (gestopt) return
      gespeeld.current = index

      for (const actie of stap.acties ?? []) {
        const doel = zoek(actie.doel)
        if (!doel) continue
        zetHand({ ...midden(doel), tikt: false })
        await wacht(tempo)
        if (gestopt) return
        zetHand((huidig) => huidig && { ...huidig, tikt: true })
        voerUit(actie)
        await wacht(tempo / 3)
        if (gestopt) return
        zetHand((huidig) => huidig && { ...huidig, tikt: false })
        await wacht(tempo / 4)
        if (gestopt) return
      }
      await wacht(tempo / 2)
      if (!gestopt) zetHand(null)
    }
    void speel()

    return () => {
      gestopt = true
    }
  }, [index, stap, tempo])

  useEffect(() => {
    doelenVan(stap.doel)[0]?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    const meet = () => zetPlek((huidig) => {
      const nieuw = plekVan(stap.doel)
      return zelfdePlek(huidig, nieuw) ? huidig : nieuw
    })
    meet()
    const klok = setInterval(meet, MEETINTERVAL)
    return () => clearInterval(klok)
  }, [stap])

  useEffect(() => {
    const toets = (gebeurtenis: KeyboardEvent) => {
      if (gebeurtenis.key === 'Escape') onSluit()
    }
    document.addEventListener('keydown', toets)
    return () => document.removeEventListener('keydown', toets)
  }, [onSluit])

  return (
    <>
      {/* Vangt de klikken op: de rondleiding doet ze zelf, meeklikken loopt daar enkel door. */}
      <div className="fixed inset-0 z-40" />

      {plek ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 rounded-2xl ring-2 ring-messing transition-all duration-300"
          style={{
            top: plek.top - RAND,
            left: plek.left - RAND,
            width: plek.breedte + 2 * RAND,
            height: plek.hoogte + 2 * RAND,
            boxShadow: '0 0 0 100vmax rgba(3, 18, 13, 0.78)',
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 bg-vilt-diep/80" />
      )}

      {hand && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[70] transition-[left,top] duration-500 ease-out"
          style={{ left: hand.x, top: hand.y }}
        >
          <span
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-messing transition-all duration-200 ${
              hand.tikt ? 'h-14 w-14 opacity-0' : 'h-7 w-7 opacity-80'
            }`}
          />
          <span
            className={`absolute -translate-x-1/2 text-2xl transition-transform duration-150 ${
              hand.tikt ? 'translate-y-1 scale-90' : ''
            }`}
            style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.7))' }}
          >
            &#128070;
          </span>
        </div>
      )}

      <div
        className={`fixed inset-x-0 z-[60] flex justify-center p-3 sm:p-4 ${
          stap.plaats === 'boven' ? 'top-0' : 'bottom-0'
        }`}
      >
        <Kader className="w-full max-w-xl bg-vilt-diep/95 px-5 py-4 shadow-[0_20px_60px_-15px_#000]">
          <p className="text-[0.6rem] tracking-[0.24em] text-krijt-dof uppercase">Rondleiding</p>
          <h2 className="mt-1 font-display text-lg font-black">{stap.titel}</h2>
          <p className="mt-1 text-sm leading-relaxed text-krijt/80">{stap.tekst}</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSluit}
              className="rounded-lg px-2.5 py-2 text-sm text-krijt-dof transition-colors hover:text-krijt"
            >
              Sluiten
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => zetIndex((huidig) => huidig - 1)}
                className="h-11 rounded-xl border border-krijt/20 px-4 text-sm font-semibold text-krijt-dof transition-colors hover:text-krijt disabled:cursor-not-allowed disabled:opacity-30"
              >
                Vorige
              </button>
              <button
                type="button"
                onClick={() => (laatste ? onSluit() : zetIndex((huidig) => huidig + 1))}
                className="h-11 rounded-xl bg-messing px-5 font-display text-base font-black text-vilt-diep transition-transform hover:scale-[1.03]"
              >
                {laatste ? 'Klaar' : 'Volgende'}
              </button>
            </div>
          </div>
        </Kader>
      </div>
    </>
  )
}
