import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { Betaling, Knoop } from '../domein/betalingen'
import { SPELER_IDS } from '../domein/contracten'
import type { Tafelvorm } from '../domein/voorkeuren'
import { Munt } from './Munt'
import { plaats, plekVan, type Plek } from './zetels'

/** Elke betaling vliegt als hetzelfde trosje, met het bedrag als label; enkel de baan verschilt. */
const TROS = [
  { dx: -9, dy: -2 },
  { dx: 0, dy: -9 },
  { dx: 9, dy: 0 },
]
const START_MS = 110

export const VLUCHT_MS = 850

type Plekken = Partial<Record<Knoop, Plek>>

/**
 * De munten vertrekken uit de kluis van de betaler en landen in die van de ontvanger. Waar zo'n
 * kluis staat hangt van de opmaak af en wordt dus gemeten; zonder layout valt de baan terug op
 * het midden van de plaquette.
 */
function kluisplekken(tafel: Element): Plekken {
  const kader = tafel.getBoundingClientRect()
  if (!kader.width || !kader.height) return {}

  const plekken: Plekken = {}
  for (const speler of SPELER_IDS) {
    const kluis = tafel.querySelector(`[data-plaquette="${speler}"] [data-avatar]`)
    const plek = kluis?.getBoundingClientRect()
    if (!plek?.width) continue
    plekken[speler] = {
      x: ((plek.left + plek.width / 2 - kader.left) / kader.width) * 100,
      y: ((plek.top + plek.height / 2 - kader.top) / kader.height) * 100,
    }
  }
  return plekken
}

function Betaalvlucht({
  betaling,
  rang,
  van,
  naar,
}: {
  betaling: Betaling
  rang: number
  van: Plek
  naar: Plek
}) {
  const vertrek = `${rang * START_MS}ms`
  const baan = {
    ...plaats(van),
    '--naar-x': `${naar.x}%`,
    '--naar-y': `${naar.y}%`,
    animationDelay: vertrek,
  } as CSSProperties

  return (
    <span className="munt-baan absolute -translate-x-1/2 -translate-y-1/2" style={baan}>
      <span className="munt-boog relative block" style={{ animationDelay: vertrek }}>
        {TROS.map(({ dx, dy }, i) => (
          <Munt
            key={i}
            className="absolute h-5 w-5 text-messing drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]"
            style={{ transform: `translate(${dx - 10}px, ${dy - 10}px)` }}
          />
        ))}
        <span className="absolute top-2.5 left-0 -translate-x-1/2 font-display text-sm font-black text-messing [text-shadow:0_1px_3px_#000]">
          {betaling.bedrag}
        </span>
      </span>
    </span>
  )
}

export function MuntStroom({ betalingen, vorm }: { betalingen: Betaling[]; vorm: Tafelvorm }) {
  const laag = useRef<HTMLDivElement>(null)
  const [kluizen, zetKluizen] = useState<Plekken>({})

  useLayoutEffect(() => {
    const tafel = laag.current?.parentElement
    if (tafel) zetKluizen(kluisplekken(tafel))
  }, [vorm])

  const plek = (knoop: Knoop): Plek => kluizen[knoop] ?? plekVan(knoop, vorm)

  return (
    <div ref={laag} className="pointer-events-none absolute inset-0 z-20">
      {betalingen.map((betaling, i) => (
        <Betaalvlucht
          key={`${betaling.van}-${betaling.naar}-${i}`}
          betaling={betaling}
          rang={i}
          van={plek(betaling.van)}
          naar={plek(betaling.naar)}
        />
      ))}
    </div>
  )
}
