import type { CSSProperties } from 'react'
import type { Betaling } from '../domein/betalingen'
import type { Tafelvorm } from '../domein/voorkeuren'
import { Munt } from './Munt'
import { plaats, plekVan } from './zetels'

/** Elke betaling vliegt als hetzelfde trosje, met het bedrag als label; enkel de baan verschilt. */
const TROS = [
  { dx: -9, dy: -2 },
  { dx: 0, dy: -9 },
  { dx: 9, dy: 0 },
]
const START_MS = 110

export const VLUCHT_MS = 850

function Betaalvlucht({
  betaling,
  rang,
  vorm,
}: {
  betaling: Betaling
  rang: number
  vorm: Tafelvorm
}) {
  const van = plekVan(betaling.van, vorm)
  const naar = plekVan(betaling.naar, vorm)
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

export function MuntStroom({
  betalingen,
  vorm,
}: {
  betalingen: Betaling[]
  vorm: Tafelvorm
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {betalingen.map((betaling, i) => (
        <Betaalvlucht
          key={`${betaling.van}-${betaling.naar}-${i}`}
          betaling={betaling}
          rang={i}
          vorm={vorm}
        />
      ))}
    </div>
  )
}
