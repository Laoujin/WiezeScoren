import { useEffect, useState } from 'react'
import { betalingen, type Betaling } from '../domein/betalingen'
import type { Rondestand } from '../domein/spel'
import { VLUCHT_MS } from './MuntStroom'

/** Hoelang de tellers na de landing nog krijgen voor ze aan de volgende vlucht mogen beginnen. */
const NATELLEN_MS = 700

export type Vlucht = { id: string; betalingen: Betaling[] }

function rustig(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Laat de munten vliegen zodra er een ronde bijkomt. Verwijderen of handmatig aanpassen van een
 * bestaande ronde blijft stil, want daar hoort geen geldstroom bij, net als een lege correctie.
 */
export function useMuntStroom(stand: Rondestand[]): { vlucht: Vlucht | null; vertraging: number } {
  const [vlucht, zetVlucht] = useState<Vlucht | null>(null)
  const [vorigAantal, zetVorigAantal] = useState(stand.length)

  if (stand.length !== vorigAantal) {
    const gegroeid = stand.length > vorigAantal
    const laatste = stand.at(-1)
    zetVorigAantal(stand.length)
    if (gegroeid && laatste && !rustig()) {
      const stroom = betalingen(laatste)
      if (stroom.length > 0) zetVlucht({ id: laatste.ronde.id, betalingen: stroom })
    }
  }

  useEffect(() => {
    if (!vlucht) return
    const timer = window.setTimeout(() => zetVlucht(null), VLUCHT_MS + NATELLEN_MS)
    return () => window.clearTimeout(timer)
  }, [vlucht])

  return { vlucht, vertraging: vlucht ? VLUCHT_MS : 0 }
}
