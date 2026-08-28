import { useEffect, type RefObject } from 'react'
import type { Ploeglid } from '../domein/ploeg'
import { Avatar } from './Avatar'

/**
 * De ploeg als rij avatars, om iemand op een zetel te zetten. `omhoog` houdt de lijst binnen de
 * tafel voor zetels in de onderste helft.
 */
export function Ploegkiezer({
  ploeg,
  aanTafel,
  omhoog,
  anker,
  onKies,
  onSluit,
}: {
  ploeg: Ploeglid[]
  aanTafel: string
  omhoog: boolean
  /** De zetel waar de lijst aan hangt; een klik daarbinnen laat hem openstaan. */
  anker: RefObject<HTMLElement | null>
  onKies: (naam: string) => void
  onSluit: () => void
}) {
  // De zetel draagt een transform, dus een `fixed` overlay zou tegen die zetel uitlijnen in
  // plaats van tegen het scherm en niets afdekken. Vandaar het document als sluitklik.
  useEffect(() => {
    const buiten = (gebeurtenis: PointerEvent) => {
      if (!anker.current?.contains(gebeurtenis.target as Node)) onSluit()
    }
    const toets = (gebeurtenis: KeyboardEvent) => {
      if (gebeurtenis.key === 'Escape') onSluit()
    }
    document.addEventListener('pointerdown', buiten)
    document.addEventListener('keydown', toets)
    return () => {
      document.removeEventListener('pointerdown', buiten)
      document.removeEventListener('keydown', toets)
    }
  }, [anker, onSluit])

  return (
    <div
      className={`animatie-open absolute left-0 z-40 flex gap-1 rounded-xl border border-messing/40 bg-vilt-diep/95 p-1.5 shadow-[0_18px_40px_-12px_#000] ${
        omhoog ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}
    >
      {ploeg.map((lid) => (
        <button
          key={lid.id}
          type="button"
          title={lid.naam}
          onClick={() => {
            onKies(lid.naam)
            onSluit()
          }}
          className={`rounded-full transition-transform hover:-translate-y-0.5 ${
            lid.naam === aanTafel ? 'ring-2 ring-messing' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <Avatar naam={lid.naam} avatar={lid.avatar} className="h-9 w-9 text-base" />
        </button>
      ))}
    </div>
  )
}
