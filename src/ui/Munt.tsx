import type { CSSProperties } from 'react'

export function Munt({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <ellipse cx="12" cy="17.4" rx="8.4" ry="3.6" fill="currentColor" opacity="0.4" />
      <ellipse cx="12" cy="13.7" rx="8.4" ry="3.6" fill="currentColor" opacity="0.68" />
      <ellipse cx="12" cy="10" rx="8.4" ry="3.6" fill="currentColor" />
      <ellipse
        cx="12"
        cy="10"
        rx="4.6"
        ry="1.9"
        fill="none"
        stroke="#071a13"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </svg>
  )
}
