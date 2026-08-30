import type { ReactNode } from 'react'

const HOEKEN = {
  lb: 'bottom-1 left-1 -rotate-90',
  rb: 'right-1 bottom-1 rotate-180',
  lt: 'top-1 left-1',
  rt: 'top-1 right-1 rotate-90',
} as const

function Sierhoek({ plek }: { plek: keyof typeof HOEKEN }) {
  return (
    <svg
      data-hoek={plek}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className={`pointer-events-none absolute h-4 w-4 text-messing/70 ${HOEKEN[plek]}`}
    >
      <path d="M2 30 C2 12 12 2 30 2" />
      <path d="M8 30 C8 16 16 8 30 8" />
      <path d="M14 8 C22 12 24 18 22 24 C20 29 14 30 12 26 C10 22 14 19 18 21" />
      <circle cx="9" cy="9" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

type Props = {
  as?: 'section' | 'nav'
  /** Ankernaam voor de rondleiding, die dit blok in de schijnwerper zet. */
  blok?: string
  /** De sierhoeken eisen zo'n 21px vrije rand; een smalle balk zet ze daarom af. */
  sierhoeken?: boolean
  /**
   * De sierhoeken hangen absoluut in het kader, dus er moet een positie staan. Via deze prop en
   * niet via className: twee positie-utilities in hetzelfde class-attribuut laten de volgorde in
   * de gegenereerde CSS beslissen, en daar wint `relative` van `absolute`.
   */
  positie?: string
  className?: string
  children: ReactNode
}

export function Kader({
  as: Element = 'section',
  blok,
  sierhoeken = true,
  positie = 'relative',
  className = '',
  children,
}: Props) {
  return (
    <Element data-blok={blok} className={`kader ${positie} ${className}`}>
      {sierhoeken &&
        (Object.keys(HOEKEN) as (keyof typeof HOEKEN)[]).map((plek) => (
          <Sierhoek key={plek} plek={plek} />
        ))}
      {children}
    </Element>
  )
}
