import { useState, type CSSProperties } from 'react'
import { initialen } from '../domein/ploeg'

export function Avatar({
  naam,
  avatar,
  className = '',
  style,
}: {
  naam: string
  avatar?: string | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}) {
  const [stuk, zetStuk] = useState(false)
  // Ploegleden bewaren enkel de bestandsnaam; de basis hangt af van waar de app gepubliceerd staat.
  const bron = avatar ? `${import.meta.env.BASE_URL}spelers/${avatar}` : undefined

  return (
    <span
      style={style}
      className={`block shrink-0 overflow-hidden rounded-full border-2 border-messing-diep/70 bg-vilt-diep shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ${className}`}
    >
      {avatar && !stuk ? (
        <img
          src={bron}
          alt=""
          onError={() => zetStuk(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-[0.58em] leading-none font-black text-messing">
          {initialen(naam)}
        </span>
      )}
    </span>
  )
}
