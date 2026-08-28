import { useEffect, useRef, useState } from 'react'

const DUUR_MS = 550

/**
 * Laat een totaal naar zijn nieuwe waarde toe lopen in plaats van te springen. Een nieuw doel
 * vertrekt vanaf de waarde die nu op het scherm staat, ook als de vorige loop nog bezig was.
 */
export function useTelling(doel: number): number {
  const [waarde, zetWaarde] = useState(doel)
  const getoond = useRef(doel)

  useEffect(() => {
    const start = getoond.current
    if (start === doel) return

    const duur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DUUR_MS
    const begin = performance.now()
    let frame = 0

    const stap = (nu: number) => {
      const verloop = duur === 0 ? 1 : Math.min(1, (nu - begin) / duur)
      const soepel = 1 - (1 - verloop) ** 3
      getoond.current = Math.round(start + (doel - start) * soepel)
      zetWaarde(getoond.current)
      if (verloop < 1) frame = requestAnimationFrame(stap)
    }

    frame = requestAnimationFrame(stap)
    return () => cancelAnimationFrame(frame)
  }, [doel])

  return waarde
}
