import type { ReactNode } from 'react'

/**
 * De standaardploeg draagt dieren in plaats van foto's: vlakke kleurvlakken met een donkere lijn,
 * in dezelfde taal als de karikaturen uit `scripts/avatars.py`.
 */

const LIJN = '#1a1410'
const BLEEK = '#f4e3d0'

type Dier = { tint: string; teken: (tint: string) => ReactNode }

function Oog({ x }: { x: number }) {
  return <circle cx={x} cy={30} r={3} fill={LIJN} />
}

const DIERICONEN: Record<string, Dier> = {
  vos: {
    tint: '#d8763a',
    teken: (tint) => (
      <>
        <polygon points="14,12 24,26 10,28" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="50,12 40,26 54,28" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="32,54 10,24 54,24" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="32,54 22,38 42,38" fill={BLEEK} />
        <Oog x={24} />
        <Oog x={40} />
        <circle cx={32} cy={48} r={3} fill={LIJN} />
      </>
    ),
  },
  uil: {
    tint: '#d8a93a',
    teken: (tint) => (
      <>
        <polygon points="12,14 22,22 10,26" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="52,14 42,22 54,26" fill={tint} stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={34} r={22} fill={tint} stroke={LIJN} strokeWidth="2" />
        <circle cx={24} cy={30} r={8} fill={BLEEK} stroke={LIJN} strokeWidth="2" />
        <circle cx={40} cy={30} r={8} fill={BLEEK} stroke={LIJN} strokeWidth="2" />
        <Oog x={24} />
        <Oog x={40} />
        <polygon points="32,36 28,42 36,42" fill={LIJN} />
      </>
    ),
  },
  haas: {
    tint: '#d89aa8',
    teken: (tint) => (
      <>
        <ellipse cx={23} cy={16} rx={5} ry={14} fill={tint} stroke={LIJN} strokeWidth="2" />
        <ellipse cx={41} cy={16} rx={5} ry={14} fill={tint} stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={40} r={18} fill={tint} stroke={LIJN} strokeWidth="2" />
        <Oog x={25} />
        <Oog x={39} />
        <circle cx={32} cy={44} r={3} fill={LIJN} />
        <path d="M20 48 H30 M34 48 H44" stroke={LIJN} strokeWidth="2" fill="none" />
      </>
    ),
  },
  beer: {
    tint: '#a3703f',
    teken: (tint) => (
      <>
        <circle cx={16} cy={20} r={9} fill={tint} stroke={LIJN} strokeWidth="2" />
        <circle cx={48} cy={20} r={9} fill={tint} stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={36} r={21} fill={tint} stroke={LIJN} strokeWidth="2" />
        <ellipse cx={32} cy={44} rx={11} ry={8} fill={BLEEK} />
        <Oog x={25} />
        <Oog x={39} />
        <ellipse cx={32} cy={41} rx={4} ry={3} fill={LIJN} />
      </>
    ),
  },
  das: {
    tint: '#6d7f8c',
    teken: (tint) => (
      <>
        <polygon points="16,16 26,22 14,26" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="48,16 38,22 50,26" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="32,56 12,22 52,22" fill={tint} stroke={LIJN} strokeWidth="2" />
        <polygon points="32,56 27,24 37,24" fill={BLEEK} />
        <polygon points="18,26 26,24 24,40 18,36" fill={LIJN} />
        <polygon points="46,26 38,24 40,40 46,36" fill={LIJN} />
        <circle cx={32} cy={50} r={3} fill={LIJN} />
      </>
    ),
  },
}

export function Diericoon({ soort }: { soort: string }) {
  const dier = DIERICONEN[soort]
  if (!dier) return null
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      {dier.teken(dier.tint)}
    </svg>
  )
}
