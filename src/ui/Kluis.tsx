import type { CSSProperties } from 'react'

/**
 * De kluisdeur legt zich over de avatar zolang de munten onderweg zijn: ze zwaait open, laat de
 * vlucht passeren en valt weer dicht wanneer het geld geland is. De cyclus duurt daarom precies
 * even lang als de vlucht.
 */
export function Kluis({ vlucht }: { vlucht: number }) {
  const duur = { '--kluis-duur': `${vlucht}ms` } as CSSProperties

  return (
    <span data-kluis className="kluisvak pointer-events-none absolute inset-0" style={duur}>
      <span className="kluisgat absolute inset-0 rounded-full" />
      <span className="kluisdeur absolute inset-0 rounded-full">
        <span className="kluiswiel absolute inset-[26%] rounded-full" />
      </span>
    </span>
  )
}
