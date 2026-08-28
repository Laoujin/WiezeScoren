import { TAFELVORMEN, type Tafelvorm } from '../domein/voorkeuren'

const TITELS: Record<Tafelvorm, string> = { rond: 'Ronde tafel', vierkant: 'Vierkante tafel' }

type Props = {
  vorm: Tafelvorm
  onVorm: (vorm: Tafelvorm) => void
}

export function Tafelvormkiezer({ vorm, onVorm }: Props) {
  return (
    <div className="flex gap-1">
      {TAFELVORMEN.map((keuze) => (
        <button
          key={keuze}
          type="button"
          title={TITELS[keuze]}
          onClick={() => onVorm(keuze)}
          className={`flex h-7 w-7 items-center justify-center transition-colors ${
            keuze === 'rond' ? 'rounded-full' : 'rounded-sm'
          } ${
            vorm === keuze
              ? 'bg-messing text-vilt-diep'
              : 'border border-krijt/30 text-krijt-dof hover:border-krijt/60'
          }`}
        >
          <span className="sr-only">{TITELS[keuze]}</span>
        </button>
      ))}
    </div>
  )
}
