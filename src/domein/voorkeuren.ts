export const TAFELVORMEN = ['rond', 'vierkant'] as const

export type Tafelvorm = (typeof TAFELVORMEN)[number]

export type Voorkeuren = {
  tafelvorm: Tafelvorm
}

export const STANDAARD_VOORKEUREN: Voorkeuren = { tafelvorm: 'rond' }

export function isTafelvorm(waarde: unknown): waarde is Tafelvorm {
  return (TAFELVORMEN as readonly unknown[]).includes(waarde)
}
