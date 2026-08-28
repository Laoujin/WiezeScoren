export function Renner({
  trui,
  geleTrui,
  className = '',
}: {
  trui: string
  geleTrui: boolean
  className?: string
}) {
  const shirt = geleTrui ? 'var(--color-messing)' : trui
  return (
    <svg viewBox="0 0 44 32" aria-hidden="true" className={className}>
      <g stroke="#f3eee2" strokeOpacity="0.35" strokeWidth="1.6" fill="none">
        <circle cx="10" cy="24" r="6.5" />
        <circle cx="34" cy="24" r="6.5" />
      </g>
      <path
        d="M10 24 L20 24 L26 13 L34 24 M20 24 L25 15"
        stroke="#a9a396"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M19 25 L23 17"
        stroke={shirt}
        strokeWidth="3"
        strokeLinecap="round"
        className="trap-been"
      />
      <path
        d="M22 18 L30 11"
        stroke={shirt}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M30 12 L36 19" stroke={shirt} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="7.5" r="3.6" fill={shirt} />
      <path
        d="M28.6 6.2 Q32 2.6 35.4 6.2"
        stroke="var(--color-messing)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {geleTrui && (
        <circle cx="32" cy="7.5" r="7" fill="none" stroke="var(--color-messing)" strokeOpacity="0.5" />
      )}
    </svg>
  )
}
