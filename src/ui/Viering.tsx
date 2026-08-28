import type { CSSProperties } from 'react'

const SNIPPERS = 16
const KLEUREN = ['messing', 'krijt', 'munt', 'hart']

/** De snippers spatten over een boog weg, van linksboven naar rechtsboven. */
function baan(i: number, vertraging: number): CSSProperties {
  const hoek = Math.PI * (0.12 + (0.76 * i) / (SNIPPERS - 1))
  const kracht = 46 + ((i * 37) % 34)
  return {
    '--dx': `${Math.round(Math.cos(hoek) * kracht * 1.5)}px`,
    '--dy': `${Math.round(Math.sin(hoek) * kracht + 46)}px`,
    '--draai': `${((i * 137) % 720) - 360}deg`,
    '--snipper': `var(--color-${KLEUREN[i % KLEUREN.length]})`,
    animationDelay: `${vertraging + ((i * 23) % 160)}ms`,
  } as CSSProperties
}

type Props = {
  soort: 'confetti' | 'traan'
  /** Pas wanneer de kluis dicht is mag er gevierd of getreurd worden. */
  vertraging: number
}

export function Viering({ soort, vertraging }: Props) {
  if (soort === 'traan') {
    return (
      <span
        data-viering="traan"
        className="traan pointer-events-none absolute top-7 left-5 z-30"
        style={{ animationDelay: `${vertraging}ms` }}
      />
    )
  }

  return (
    <span data-viering="confetti" className="pointer-events-none absolute inset-0 z-30">
      {Array.from({ length: SNIPPERS }, (_, i) => (
        <span key={i} className="snipper absolute top-1/2 left-1/2" style={baan(i, vertraging)} />
      ))}
    </span>
  )
}
