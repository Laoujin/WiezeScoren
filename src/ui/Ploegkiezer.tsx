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
  onKies,
  onSluit,
}: {
  ploeg: Ploeglid[]
  aanTafel: string
  omhoog: boolean
  onKies: (naam: string) => void
  onSluit: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Kieslijst sluiten"
        onClick={onSluit}
        className="fixed inset-0 z-30 cursor-default"
      />
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
    </>
  )
}
