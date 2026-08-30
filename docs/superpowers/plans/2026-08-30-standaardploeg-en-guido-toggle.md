# Standaardploeg en Guido-toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De app start met een neutrale ploeg van vijf verzonnen namen met dier-iconen; een knop `Guido` in de voettekst wisselt naar het gezin met hun foto's en terug.

**Architecture:** `wiezen.ploeg` bewaart voortaan twee ploegen naast elkaar — elk met eigen leden én eigen zetelverdeling — plus welke actief is. De toggle schrijft de huidige zetels weg bij de oude ploeg en laadt die van de nieuwe. Rondes verwijzen naar zetelnummers, niet naar namen, dus een lopende partij overleeft de wissel ongeschonden.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 4, Vitest + Testing Library. Pakketbeheerder is `bun`; tests draaien met `bun run test` (niet `bun test`).

**Spec:** `docs/superpowers/specs/2026-08-30-standaardploeg-en-guido-toggle-design.md`

---

## Bestandsoverzicht

| Bestand                       | Verantwoordelijkheid                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `src/domein/ploeg.ts`         | de twee ploeglijsten, `Ploegen`-type, `wisselPloeg`, `zetelnamen` |
| `src/ui/diericonen.tsx`       | de vijf dier-iconen als SVG-componenten achter een map           |
| `src/ui/Avatar.tsx`           | foto → icoon → initialen                                         |
| `src/opslag/opslag.ts`        | `laadPloegen` / `bewaarPloegen`, migratie van de oude array      |
| `src/ui/useSpel.ts`           | `ploeg`, `ploegkeuze`, `wisselPloegkeuze`                        |
| `src/App.tsx`                 | de `Guido`-knop in de voettekst                                  |
| `src/ui/Tafel.tsx`            | geeft `icoon` door aan `Avatar`                                  |
| `src/ui/Ploegkiezer.tsx`      | geeft `icoon` door aan `Avatar`                                  |

Volgorde: eerst het domein (Taak 1–3), dan de iconen en `Avatar` (Taak 4–5), dan de opslag (Taak 6), dan de bedrading (Taak 7–9).

**Elke taak eindigt met een commit.** Onderwerpregel in de gebiedende wijs, in het Nederlands, hoogstens 72 tekens — zoals de rest van de geschiedenis.

---

### Taak 1: De twee ploeglijsten

De huidige `STANDAARD_PLOEG` is het gezin. Die lijst wordt hernoemd tot `GEZINS_PLOEG` en er komt een nieuwe `STANDAARD_PLOEG` met verzonnen namen en icoonsleutels.

**Files:**
- Modify: `src/domein/ploeg.ts`
- Modify: `src/domein/ploeg.test.ts`
- Modify: `src/opslag/opslag.ts` (import van `STANDAARD_PLOEG`)
- Modify: `src/opslag/opslag.test.ts` (import van `STANDAARD_PLOEG`)

- [ ] **Stap 1: Schrijf de falende test**

Vervang in `src/domein/ploeg.test.ts` het blok `describe('STANDAARD_PLOEG', ...)` door:

```ts
describe('STANDAARD_PLOEG', () => {
  it('bevat de vijf verzonnen namen', () => {
    expect(STANDAARD_PLOEG.map((l) => l.naam)).toEqual(['Tom', 'Caro', 'Lies', 'Bert', 'Fien'])
  })

  it('geeft elk lid een icoon in plaats van een foto', () => {
    expect(STANDAARD_PLOEG.filter((l) => !l.icoon)).toEqual([])
    expect(STANDAARD_PLOEG.filter((l) => l.avatar)).toEqual([])
  })

  it('geeft elk lid een eigen id', () => {
    expect(new Set(STANDAARD_PLOEG.map((l) => l.id)).size).toBe(STANDAARD_PLOEG.length)
  })
})

describe('GEZINS_PLOEG', () => {
  it('bevat het gezin', () => {
    expect(GEZINS_PLOEG.map((l) => l.naam)).toEqual(['Wouter', 'Gert', 'Moe', 'Va', 'Zus'])
  })

  it('geeft elk lid een foto', () => {
    expect(GEZINS_PLOEG.filter((l) => !l.avatar)).toEqual([])
  })

  it('geeft elk lid een eigen id', () => {
    expect(new Set(GEZINS_PLOEG.map((l) => l.id)).size).toBe(GEZINS_PLOEG.length)
  })
})
```

Voeg `GEZINS_PLOEG` toe aan de import bovenaan datzelfde bestand:

```ts
import {
  GEZINS_PLOEG,
  STANDAARD_PLOEG,
  hernoemInPloeg,
  initialen,
  maakGast,
  zetOpZetel,
  type Ploeglid,
} from './ploeg'
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/domein/ploeg.test.ts`
Expected: FAIL — `GEZINS_PLOEG` bestaat niet.

- [ ] **Stap 3: Implementeer**

In `src/domein/ploeg.ts`: voeg `icoon` toe aan `Ploeglid` en vervang het `STANDAARD_PLOEG`-blok.

```ts
export type Ploeglid = {
  id: string
  naam: string
  /** Bestandsnaam onder `public/spelers/`; zonder foto valt de weergave terug op het icoon. */
  avatar?: string
  /** Sleutel in de diericonen-map, voor wie geen foto heeft. */
  icoon?: string
}

/** Wie de app voor het eerst opent, speelt met deze vijf. */
export const STANDAARD_PLOEG: Ploeglid[] = [
  { id: 'tom', naam: 'Tom', icoon: 'vos' },
  { id: 'caro', naam: 'Caro', icoon: 'uil' },
  { id: 'lies', naam: 'Lies', icoon: 'haas' },
  { id: 'bert', naam: 'Bert', icoon: 'beer' },
  { id: 'fien', naam: 'Fien', icoon: 'das' },
]

export const GEZINS_PLOEG: Ploeglid[] = [
  { id: 'wouter', naam: 'Wouter', avatar: 'wouter.webp' },
  { id: 'gert', naam: 'Gert', avatar: 'gert.webp' },
  { id: 'moe', naam: 'Moe', avatar: 'lieve.webp' },
  { id: 'va', naam: 'Va', avatar: 'guido.webp' },
  { id: 'zus', naam: 'Zus', avatar: 'zus.webp' },
]
```

`src/opslag/opslag.ts` verwijst nu naar de verkeerde lijst. Wijzig daar de import en de twee
gebruiken van `STANDAARD_PLOEG` naar `GEZINS_PLOEG` — Taak 6 herschrijft die functie toch, dit is
enkel om de build groen te houden:

```ts
import { GEZINS_PLOEG, type Ploeglid } from '../domein/ploeg'
```

```ts
export function laadPloeg(opslag: Storage): Ploeglid[] {
  const bewaard = lees<Ploeglid[]>(opslag, SLEUTELS.ploeg)
  if (!Array.isArray(bewaard) || bewaard.length === 0) return GEZINS_PLOEG
  return bewaard.map((lid) => {
    const standaard = GEZINS_PLOEG.find((s) => s.id === lid.id)
    return lid.avatar || !standaard?.avatar ? lid : { ...lid, avatar: standaard.avatar }
  })
}
```

Pas in `src/opslag/opslag.test.ts` de import en de drie verwijzingen naar `STANDAARD_PLOEG` aan
naar `GEZINS_PLOEG` (regels rond 4, 68 en 95). Taak 6 herschrijft die tests.

- [ ] **Stap 4: Draai de tests en zie ze slagen**

Run: `bun run test src/domein/ploeg.test.ts src/opslag/opslag.test.ts`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/domein/ploeg.ts src/domein/ploeg.test.ts src/opslag/opslag.ts src/opslag/opslag.test.ts
git commit -m "Splits de ploeg in een standaardploeg en het gezin"
```

---

### Taak 2: `zetelnamen`

Een ploeg zonder bewaarde zetels zet zijn eerste vier leden aan tafel.

**Files:**
- Modify: `src/domein/ploeg.ts`
- Modify: `src/domein/ploeg.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

Voeg onderaan `src/domein/ploeg.test.ts` toe:

```ts
describe('zetelnamen', () => {
  it('geeft de bewaarde zetels terug', () => {
    const stand = { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] }
    expect(zetelnamen(stand)).toEqual(['Fien', 'Tom', 'Bert', 'Caro'])
  })

  it('valt terug op de eerste vier leden zonder bewaarde zetels', () => {
    expect(zetelnamen({ leden: STANDAARD_PLOEG, zetels: [] })).toEqual([
      'Tom',
      'Caro',
      'Lies',
      'Bert',
    ])
  })
})
```

Voeg `zetelnamen` toe aan de import bovenaan het bestand.

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/domein/ploeg.test.ts`
Expected: FAIL — `zetelnamen` bestaat niet.

- [ ] **Stap 3: Implementeer**

In `src/domein/ploeg.ts`, onder de twee ploeglijsten:

```ts
/** Zoveel spelers passen er aan tafel; de rest van de ploeg kijkt toe. */
export const ZETELS = 4

export type Ploegstand = { leden: Ploeglid[]; zetels: string[] }

export function zetelnamen(stand: Ploegstand): string[] {
  if (stand.zetels.length === ZETELS) return stand.zetels
  return stand.leden.slice(0, ZETELS).map((lid) => lid.naam)
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/domein/ploeg.test.ts`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/domein/ploeg.ts src/domein/ploeg.test.ts
git commit -m "Geef elke ploeg een eigen zetelverdeling"
```

---

### Taak 3: `wisselPloeg`

**Files:**
- Modify: `src/domein/ploeg.ts`
- Modify: `src/domein/ploeg.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

Voeg onderaan `src/domein/ploeg.test.ts` toe:

```ts
function versePloegen(): Ploegen {
  return {
    actief: 'standaard',
    standaard: { leden: STANDAARD_PLOEG, zetels: [] },
    gezin: { leden: GEZINS_PLOEG, zetels: [] },
  }
}

describe('wisselPloeg', () => {
  it('zet de andere ploeg actief', () => {
    expect(wisselPloeg(versePloegen(), ['Tom', 'Caro', 'Lies', 'Bert']).actief).toBe('gezin')
  })

  it('bewaart de meegegeven zetels bij de ploeg die je verlaat', () => {
    const na = wisselPloeg(versePloegen(), ['Fien', 'Caro', 'Lies', 'Bert'])
    expect(na.standaard.zetels).toEqual(['Fien', 'Caro', 'Lies', 'Bert'])
  })

  it('geeft de zetels terug bij het terugwisselen', () => {
    const heen = wisselPloeg(versePloegen(), ['Fien', 'Caro', 'Lies', 'Bert'])
    const terug = wisselPloeg(heen, ['Zus', 'Gert', 'Moe', 'Va'])
    expect(terug.actief).toBe('standaard')
    expect(zetelnamen(terug.standaard)).toEqual(['Fien', 'Caro', 'Lies', 'Bert'])
    expect(terug.gezin.zetels).toEqual(['Zus', 'Gert', 'Moe', 'Va'])
  })

  it('laat de leden van beide ploegen ongemoeid', () => {
    const na = wisselPloeg(versePloegen(), ['Tom', 'Caro', 'Lies', 'Bert'])
    expect(na.standaard.leden).toEqual(STANDAARD_PLOEG)
    expect(na.gezin.leden).toEqual(GEZINS_PLOEG)
  })
})
```

Voeg `wisselPloeg` en `type Ploegen` toe aan de import bovenaan het bestand.

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/domein/ploeg.test.ts`
Expected: FAIL — `wisselPloeg` bestaat niet.

- [ ] **Stap 3: Implementeer**

In `src/domein/ploeg.ts`, onder `zetelnamen`:

```ts
export type Ploegkeuze = 'standaard' | 'gezin'

export type Ploegen = Record<Ploegkeuze, Ploegstand> & { actief: Ploegkeuze }

export const VERSE_PLOEGEN: Ploegen = {
  actief: 'standaard',
  standaard: { leden: STANDAARD_PLOEG, zetels: [] },
  gezin: { leden: GEZINS_PLOEG, zetels: [] },
}

/** De zetels van de ploeg die je verlaat gaan mee de opslag in, zodat terugwisselen ze teruggeeft. */
export function wisselPloeg(ploegen: Ploegen, zetels: string[]): Ploegen {
  const verlaten = { ...ploegen[ploegen.actief], zetels }
  return ploegen.actief === 'standaard'
    ? { actief: 'gezin', standaard: verlaten, gezin: ploegen.gezin }
    : { actief: 'standaard', standaard: ploegen.standaard, gezin: verlaten }
}
```

Een berekende sleutel (`[ploegen.actief]: ...`) verbreedt het type naar een index-signatuur en
haalt de typecheck onderuit; vandaar de twee takken uitgeschreven.

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/domein/ploeg.test.ts`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/domein/ploeg.ts src/domein/ploeg.test.ts
git commit -m "Wissel tussen de twee ploegen met behoud van hun zetels"
```

---

### Taak 4: De dier-iconen

Vijf SVG-componenten in één bestand, opgebouwd uit primitieve vormen zodat ze bij de vlakke
karikaturen passen. Ze vullen hun houder volledig (`viewBox="0 0 64 64"`, `h-full w-full`) want
`Avatar` bepaalt de maat.

**Files:**
- Create: `src/ui/diericonen.tsx`
- Create: `src/ui/diericonen.test.tsx`

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/ui/diericonen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DIERICONEN, Diericoon } from './diericonen'
import { STANDAARD_PLOEG } from '../domein/ploeg'

afterEach(cleanup)

describe('DIERICONEN', () => {
  it('heeft een icoon voor elk lid van de standaardploeg', () => {
    for (const lid of STANDAARD_PLOEG) expect(DIERICONEN[lid.icoon!]).toBeTruthy()
  })

  it('geeft elk dier een eigen tint', () => {
    const tinten = Object.values(DIERICONEN).map((d) => d.tint)
    expect(new Set(tinten).size).toBe(tinten.length)
  })
})

describe('Diericoon', () => {
  it('tekent het gevraagde dier', () => {
    const { container } = render(<Diericoon soort="vos" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('tekent niets voor een onbekend dier', () => {
    const { container } = render(<Diericoon soort="draak" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/ui/diericonen.test.tsx`
Expected: FAIL — `./diericonen` bestaat niet.

- [ ] **Stap 3: Implementeer**

Maak `src/ui/diericonen.tsx`:

```tsx
/**
 * De standaardploeg draagt dieren in plaats van foto's: vlakke kleurvlakken met een donkere lijn,
 * in dezelfde taal als de karikaturen uit `scripts/avatars.py`.
 */

import type { ReactNode } from 'react'

const LIJN = '#1a1410'

type Dier = { tint: string; teken: () => ReactNode }

function Oog({ x }: { x: number }) {
  return <circle cx={x} cy={30} r={3} fill={LIJN} />
}

export const DIERICONEN: Record<string, Dier> = {
  vos: {
    tint: '#d8763a',
    teken: () => (
      <>
        <polygon points="14,12 24,26 10,28" fill="#d8763a" stroke={LIJN} strokeWidth="2" />
        <polygon points="50,12 40,26 54,28" fill="#d8763a" stroke={LIJN} strokeWidth="2" />
        <polygon points="32,54 10,24 54,24" fill="#d8763a" stroke={LIJN} strokeWidth="2" />
        <polygon points="32,54 22,38 42,38" fill="#f4e3d0" stroke="none" />
        <Oog x={24} />
        <Oog x={40} />
        <circle cx={32} cy={48} r={3} fill={LIJN} />
      </>
    ),
  },
  uil: {
    tint: '#d8a93a',
    teken: () => (
      <>
        <polygon points="12,14 22,22 10,26" fill="#d8a93a" stroke={LIJN} strokeWidth="2" />
        <polygon points="52,14 42,22 54,26" fill="#d8a93a" stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={34} r={22} fill="#d8a93a" stroke={LIJN} strokeWidth="2" />
        <circle cx={24} cy={30} r={8} fill="#f4e3d0" stroke={LIJN} strokeWidth="2" />
        <circle cx={40} cy={30} r={8} fill="#f4e3d0" stroke={LIJN} strokeWidth="2" />
        <Oog x={24} />
        <Oog x={40} />
        <polygon points="32,36 28,42 36,42" fill={LIJN} />
      </>
    ),
  },
  haas: {
    tint: '#d89aa8',
    teken: () => (
      <>
        <ellipse cx={23} cy={16} rx={5} ry={14} fill="#d89aa8" stroke={LIJN} strokeWidth="2" />
        <ellipse cx={41} cy={16} rx={5} ry={14} fill="#d89aa8" stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={40} r={18} fill="#d89aa8" stroke={LIJN} strokeWidth="2" />
        <Oog x={25} />
        <Oog x={39} />
        <circle cx={32} cy={44} r={3} fill={LIJN} />
        <path d="M20 48 H30 M34 48 H44" stroke={LIJN} strokeWidth="2" fill="none" />
      </>
    ),
  },
  beer: {
    tint: '#a3703f',
    teken: () => (
      <>
        <circle cx={16} cy={20} r={9} fill="#a3703f" stroke={LIJN} strokeWidth="2" />
        <circle cx={48} cy={20} r={9} fill="#a3703f" stroke={LIJN} strokeWidth="2" />
        <circle cx={32} cy={36} r={21} fill="#a3703f" stroke={LIJN} strokeWidth="2" />
        <ellipse cx={32} cy={44} rx={11} ry={8} fill="#f4e3d0" stroke="none" />
        <Oog x={25} />
        <Oog x={39} />
        <ellipse cx={32} cy={41} rx={4} ry={3} fill={LIJN} />
      </>
    ),
  },
  das: {
    tint: '#6d7f8c',
    teken: () => (
      <>
        <polygon points="16,16 26,22 14,26" fill="#6d7f8c" stroke={LIJN} strokeWidth="2" />
        <polygon points="48,16 38,22 50,26" fill="#6d7f8c" stroke={LIJN} strokeWidth="2" />
        <polygon points="32,56 12,22 52,22" fill="#6d7f8c" stroke={LIJN} strokeWidth="2" />
        <polygon points="32,56 27,24 37,24" fill="#f4e3d0" stroke="none" />
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
      {dier.teken()}
    </svg>
  )
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/ui/diericonen.test.tsx`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/ui/diericonen.tsx src/ui/diericonen.test.tsx
git commit -m "Teken vijf dier-iconen voor de standaardploeg"
```

---

### Taak 5: `Avatar` tekent het icoon

**Files:**
- Modify: `src/ui/Avatar.tsx`
- Modify: `src/ui/Avatar.test.tsx`

- [ ] **Stap 1: Schrijf de falende test**

Voeg in `src/ui/Avatar.test.tsx` binnen `describe('Avatar', ...)` toe:

```tsx
  it('tekent het icoon wanneer er geen foto is', () => {
    const { container } = render(<Avatar naam="Tom" icoon="vos" />)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.queryByText('T')).toBeNull()
  })

  it('laat de foto voorgaan op het icoon', () => {
    const { container } = render(<Avatar naam="Tom" avatar="wouter.webp" icoon="vos" />)
    expect(foto()).toBeTruthy()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('valt terug op het icoon wanneer de foto niet laadt', () => {
    const { container } = render(<Avatar naam="Tom" avatar="weg.webp" icoon="vos" />)
    fireEvent.error(foto()!)
    expect(container.querySelector('svg')).toBeTruthy()
  })
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/ui/Avatar.test.tsx`
Expected: FAIL — `icoon` is geen prop van `Avatar`.

- [ ] **Stap 3: Implementeer**

Vervang `src/ui/Avatar.tsx` volledig:

```tsx
import { useState, type CSSProperties } from 'react'
import { initialen } from '../domein/ploeg'
import { Diericoon } from './diericonen'

export function Avatar({
  naam,
  avatar,
  icoon,
  className = '',
  style,
}: {
  naam: string
  avatar?: string | undefined
  icoon?: string | undefined
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
      ) : icoon ? (
        <Diericoon soort={icoon} />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-[0.58em] leading-none font-black text-messing">
          {initialen(naam)}
        </span>
      )}
    </span>
  )
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/ui/Avatar.test.tsx`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/ui/Avatar.tsx src/ui/Avatar.test.tsx
git commit -m "Laat de avatar op een dier-icoon terugvallen"
```

---

### Taak 6: De opslag bewaart twee ploegen

`laadPloeg` en `bewaarPloeg` verdwijnen ten voordele van `laadPloegen` en `bewaarPloegen`.

**Files:**
- Modify: `src/opslag/opslag.ts`
- Modify: `src/opslag/opslag.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

Vervang in `src/opslag/opslag.test.ts` het hele blok `describe('ploeg', ...)` door:

```ts
describe('ploegen', () => {
  it('begint bij de standaardploeg wanneer er niets bewaard is', () => {
    const ploegen = laadPloegen(opslag)
    expect(ploegen.actief).toBe('standaard')
    expect(ploegen.standaard.leden).toEqual(STANDAARD_PLOEG)
    expect(ploegen.gezin.leden).toEqual(GEZINS_PLOEG)
  })

  it('leest een oude ploeglijst als het gezin en houdt dat gezin actief', () => {
    opslag.setItem('wiezen.ploeg', JSON.stringify([{ id: 'gert', naam: 'Gerrit' }]))
    const ploegen = laadPloegen(opslag)
    expect(ploegen.actief).toBe('gezin')
    expect(ploegen.gezin.leden).toEqual([{ id: 'gert', naam: 'Gerrit', avatar: 'gert.webp' }])
    expect(ploegen.standaard.leden).toEqual(STANDAARD_PLOEG)
  })

  it('valt terug op de standaardploeg bij een lege oude lijst', () => {
    opslag.setItem('wiezen.ploeg', '[]')
    expect(laadPloegen(opslag).actief).toBe('standaard')
  })

  it('bewaart en herleest beide ploegen met hun zetels', () => {
    const ploegen = {
      actief: 'gezin' as const,
      standaard: { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] },
      gezin: { leden: GEZINS_PLOEG, zetels: ['Zus', 'Gert', 'Moe', 'Va'] },
    }
    bewaarPloegen(opslag, ploegen)
    expect(laadPloegen(opslag)).toEqual(ploegen)
  })

  it('vult een ontbrekende foto aan bij het gezin', () => {
    bewaarPloegen(opslag, {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: [{ id: 'gert', naam: 'Gert' }], zetels: [] },
    })
    expect(laadPloegen(opslag).gezin.leden).toEqual([
      { id: 'gert', naam: 'Gert', avatar: 'gert.webp' },
    ])
  })

  it('laat een gast zonder foto met rust', () => {
    bewaarPloegen(opslag, {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: [{ id: 'gast-1', naam: 'Jef' }], zetels: [] },
    })
    expect(laadPloegen(opslag).gezin.leden).toEqual([{ id: 'gast-1', naam: 'Jef' }])
  })
})
```

Pas ook de test `'zet de eerste vier van de ploeg aan tafel'` in `describe('spel', ...)` aan — een
verse installatie zet nu de standaardploeg aan tafel:

```ts
  it('zet de zetels van de actieve ploeg aan tafel', () => {
    expect(laadSpel(opslag).spelers).toEqual(['Tom', 'Caro', 'Lies', 'Bert'])
  })

  it('volgt de bewaarde zetels van de actieve ploeg', () => {
    bewaarPloegen(opslag, {
      actief: 'standaard',
      standaard: { leden: STANDAARD_PLOEG, zetels: ['Fien', 'Tom', 'Bert', 'Caro'] },
      gezin: { leden: GEZINS_PLOEG, zetels: [] },
    })
    expect(laadSpel(opslag).spelers).toEqual(['Fien', 'Tom', 'Bert', 'Caro'])
  })
```

Werk de imports bovenaan bij:

```ts
import { GEZINS_PLOEG, STANDAARD_PLOEG } from '../domein/ploeg'
```

en vervang `bewaarPloeg` / `laadPloeg` in de importlijst uit `'./opslag'` door `bewaarPloegen` /
`laadPloegen`.

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/opslag/opslag.test.ts`
Expected: FAIL — `laadPloegen` bestaat niet.

- [ ] **Stap 3: Implementeer**

Vervang in `src/opslag/opslag.ts` de import, de constante `ZETELS` en het paar
`laadPloeg` / `bewaarPloeg`:

```ts
import {
  GEZINS_PLOEG,
  STANDAARD_PLOEG,
  VERSE_PLOEGEN,
  zetelnamen,
  type Ploegen,
  type Ploeglid,
  type Ploegstand,
} from '../domein/ploeg'
```

Verwijder de regel `const ZETELS = 4` met haar commentaar; `zetelnamen` neemt dat over.

```ts
/** Een bewaarde ploeg kan ouder zijn dan de avatars, dus ontbrekende foto's per lid aanvullen. */
function vulAan(leden: Ploeglid[], standaard: Ploeglid[]): Ploeglid[] {
  return leden.map((lid) => {
    const bron = standaard.find((s) => s.id === lid.id)
    return lid.avatar || !bron?.avatar ? lid : { ...lid, avatar: bron.avatar }
  })
}

function standVan(bewaard: Ploegstand | undefined, standaard: Ploeglid[]): Ploegstand {
  if (!Array.isArray(bewaard?.leden) || bewaard.leden.length === 0)
    return { leden: standaard, zetels: [] }
  return { leden: vulAan(bewaard.leden, standaard), zetels: bewaard.zetels ?? [] }
}

/** Een array is de vorm van voor de standaardploeg: dat was toen het gezin, dus dat blijft actief. */
export function laadPloegen(opslag: Storage): Ploegen {
  const bewaard = lees<Ploegen | Ploeglid[]>(opslag, SLEUTELS.ploeg)
  if (Array.isArray(bewaard)) {
    if (bewaard.length === 0) return VERSE_PLOEGEN
    return {
      actief: 'gezin',
      standaard: { leden: STANDAARD_PLOEG, zetels: [] },
      gezin: { leden: vulAan(bewaard, GEZINS_PLOEG), zetels: [] },
    }
  }
  if (!bewaard) return VERSE_PLOEGEN
  return {
    actief: bewaard.actief === 'gezin' ? 'gezin' : 'standaard',
    standaard: standVan(bewaard.standaard, STANDAARD_PLOEG),
    gezin: standVan(bewaard.gezin, GEZINS_PLOEG),
  }
}

export function bewaarPloegen(opslag: Storage, ploegen: Ploegen): void {
  schrijf(opslag, SLEUTELS.ploeg, ploegen)
}
```

Pas `laadSpel` aan:

```ts
/** Een verse partij zet de zetels van de actieve ploeg aan tafel. */
export function laadSpel(opslag: Storage): Spel {
  const spel = lees<Spel>(opslag, SLEUTELS.spel)
  if (spel?.rondes) return spel
  const ploegen = laadPloegen(opslag)
  return nieuwSpel(zetelnamen(ploegen[ploegen.actief]))
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/opslag/opslag.test.ts`
Expected: PASS

- [ ] **Stap 5: Commit**

```bash
git add src/opslag/opslag.ts src/opslag/opslag.test.ts
git commit -m "Bewaar beide ploegen onder wiezen.ploeg"
```

---

### Taak 7: `useSpel` draagt de ploegkeuze

**Files:**
- Modify: `src/ui/useSpel.ts`

Deze taak heeft geen eigen test: Taak 9 dekt het gedrag via `App.test.tsx`. De hook is louter
bedrading rond het domein dat Taak 1–3 al testen.

- [ ] **Stap 1: Vervang de ploeg-state door ploegen-state**

In `src/ui/useSpel.ts`:

```ts
import {
  VERSE_PLOEGEN,
  hernoemInPloeg,
  maakGast,
  wisselPloeg,
  zetelnamen,
  type Ploegen,
  type Ploeglid,
} from '../domein/ploeg'
```

Vervang in de import uit `'../opslag/opslag'` `bewaarPloeg` door `bewaarPloegen` en `laadPloeg`
door `laadPloegen`.

```ts
type Moment = { spel: Spel; ploegen: Ploegen }
```

```ts
  const [ploegen, zetPloegen] = useState<Ploegen>(() => laadPloegen(localStorage))
  const ploeg = ploegen[ploegen.actief].leden
```

- [ ] **Stap 2: Trek het moment en de effecten mee**

```ts
  // De rondleiding speelt op de echte tafel; deze twee refs zetten haar sporen achteraf terug.
  const huidig = useRef<Moment>({ spel, ploegen })
  const moment = useRef<Moment | null>(null)
  useEffect(() => {
    huidig.current = { spel, ploegen }
  }, [spel, ploegen])

  const bewaarMoment = useCallback(() => {
    moment.current = huidig.current
  }, [])

  const herstelMoment = useCallback(() => {
    const bewaard = moment.current
    moment.current = null
    if (!bewaard) return
    zetSpel(bewaard.spel)
    zetPloegen(bewaard.ploegen)
  }, [])
```

```ts
  useEffect(() => bewaarPloegen(localStorage, ploegen), [ploegen])
```

- [ ] **Stap 3: Laat hernoemen en gasten op de actieve ploeg werken**

```ts
  /** Alleen de actieve ploeg verandert; de andere houdt haar eigen namen en gasten. */
  const pasActieveLedenAan = useCallback((wijzig: (leden: Ploeglid[]) => Ploeglid[]) => {
    zetPloegen((huidig) => {
      const stand = { ...huidig[huidig.actief], leden: wijzig(huidig[huidig.actief].leden) }
      return huidig.actief === 'standaard'
        ? { ...huidig, standaard: stand }
        : { ...huidig, gezin: stand }
    })
  }, [])

  // Hernoemen volgt de persoon: de ploeg houdt zo dezelfde avatar bij de nieuwe naam.
  const hernoem = useCallback(
    (speler: SpelerId, naam: string) => {
      const oud = spel.spelers[speler] ?? ''
      pasActieveLedenAan((leden) => hernoemInPloeg(leden, oud, naam))
      zetSpel((huidig) => hernoemSpeler(huidig, speler, naam))
    },
    [spel.spelers, pasActieveLedenAan],
  )

  const voegGastToe = useCallback(
    (zetel: SpelerId) => {
      const gast = maakGast(ploeg)
      pasActieveLedenAan((leden) => [...leden, gast])
      zetSpel((huidig) => zetZetel(huidig, zetel, gast.naam))
    },
    [ploeg, pasActieveLedenAan],
  )
```

- [ ] **Stap 4: Voeg de toggle toe**

Zet dit onder `zetTafelvorm`:

```ts
  // De rondes verwijzen naar zetels en niet naar namen, dus de lopende partij blijft staan.
  const wisselPloegkeuze = useCallback(() => {
    const na = wisselPloeg(ploegen, spel.spelers)
    zetPloegen(na)
    zetSpel((huidig) => ({ ...huidig, spelers: zetelnamen(na[na.actief]) }))
  }, [ploegen, spel.spelers])
```

Voeg `ploegkeuze: ploegen.actief` en `wisselPloegkeuze` toe aan het teruggegeven object, naast het
bestaande `ploeg`. `VERSE_PLOEGEN` blijft ongebruikt in dit bestand — laat het uit de import als
ESLint erover valt.

- [ ] **Stap 5: Draai lint en de volledige suite**

Run: `bun run lint && bun run test`
Expected: lint stil, alle tests PASS.

- [ ] **Stap 6: Commit**

```bash
git add src/ui/useSpel.ts
git commit -m "Laat useSpel tussen de twee ploegen wisselen"
```

---

### Taak 8: Het icoon bereikt de tafel

**Files:**
- Modify: `src/ui/Tafel.tsx:118-122`
- Modify: `src/ui/Ploegkiezer.tsx`

- [ ] **Stap 1: Geef het icoon door in `Tafel`**

In `src/ui/Tafel.tsx`, in de `Avatar` binnen `Plaquette`:

```tsx
            <Avatar
              naam={naam}
              avatar={lid?.avatar}
              icoon={lid?.icoon}
              className={`h-9 w-9 text-lg ${geselecteerd ? 'border-messing' : ''}`}
            />
```

- [ ] **Stap 2: Geef het icoon door in `Ploegkiezer`**

In `src/ui/Ploegkiezer.tsx`:

```tsx
          <Avatar naam={lid.naam} avatar={lid.avatar} icoon={lid.icoon} className="h-9 w-9 text-base" />
```

- [ ] **Stap 3: Draai lint en de volledige suite**

Run: `bun run lint && bun run test`
Expected: lint stil, alle tests PASS.

- [ ] **Stap 4: Commit**

```bash
git add src/ui/Tafel.tsx src/ui/Ploegkiezer.tsx
git commit -m "Toon het dier-icoon aan tafel en in de kieslijst"
```

---

### Taak 9: De Guido-knop

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Stap 1: Schrijf de falende test**

Voeg in `src/App.test.tsx` binnen `describe('App', ...)` toe:

```tsx
  function naamAanZetel(speler: number): string {
    return zetel(speler).textContent!.trim()
  }

  it('begint met de standaardploeg', () => {
    render(<App />)
    expect(naamAanZetel(0)).toContain('Tom')
  })

  it('wisselt met de Guido-knop naar het gezin en terug', () => {
    render(<App />)
    fireEvent.click(knopMetTekst('Guido'))
    expect(naamAanZetel(0)).toContain('Wouter')
    fireEvent.click(knopMetTekst('Guido'))
    expect(naamAanZetel(0)).toContain('Tom')
  })

  it('laat de punten staan bij het wisselen van ploeg', () => {
    render(<App />)
    fireEvent.click(zetel(0))
    fireEvent.click(zetel(1))
    fireEvent.click(knopMet('Vragen'))
    fireEvent.click(knopMetTekst('Ronde opslaan'))
    const voor = totalen()
    fireEvent.click(knopMetTekst('Guido'))
    expect(totalen()).toEqual(voor)
  })
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `bun run test src/App.test.tsx`
Expected: FAIL — geen knop "Guido".

- [ ] **Stap 3: Implementeer**

In `src/App.tsx`, in de `<footer>`, naast de `Uitleg`-knop:

```tsx
          <button
            type="button"
            onClick={spelState.wisselPloegkeuze}
            aria-pressed={spelState.ploegkeuze === 'gezin'}
            className="rounded-lg border border-krijt/20 px-3 py-1.5 text-sm font-semibold text-krijt-dof transition-colors hover:border-messing hover:text-messing aria-pressed:border-messing aria-pressed:text-messing"
          >
            Guido
          </button>
```

Zet de twee knoppen samen in een `<div className="flex items-center gap-2">` zodat de GitHub-link
rechts blijft staan:

```tsx
          <div className="flex items-center gap-2">
            <button type="button" onClick={openTutorial} className="...">
              Uitleg
            </button>
            <button type="button" onClick={spelState.wisselPloegkeuze} ...>
              Guido
            </button>
          </div>
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

Run: `bun run test src/App.test.tsx`
Expected: PASS

- [ ] **Stap 5: Draai lint en de volledige suite**

Run: `bun run lint && bun run build && bun run test`
Expected: lint stil, build slaagt, alle tests PASS.

- [ ] **Stap 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "Wissel met de Guido-knop tussen de ploeg en het gezin"
```

---

### Taak 10: De README bijwerken

**Files:**
- Modify: `README.md`

- [ ] **Stap 1: Herschrijf de sectie "De ploeg"**

Vervang de eerste alinea van `## De ploeg` door:

```markdown
De ploeg telt vijf leden, waarvan er vier aan tafel zitten. Standaard zijn dat Tom, Caro, Lies,
Bert en Fien, elk met een dier-icoon. `Guido` in de voettekst wisselt naar het gezin — Wouter,
Gert, Moe, Va en Zus, met hun foto-karikaturen — en terug. Elke ploeg houdt haar eigen
hernoemingen, gasten en zetelverdeling; de lopende partij blijft staan, want rondes verwijzen naar
zetels en niet naar namen.

Klik een avatar om iemand anders op die zetel te zetten; zit die al aan tafel, dan ruilen de twee
van plaats. Dubbelklik een naam om te hernoemen, dat volgt de persoon zodat zijn avatar meegaat.
```

- [ ] **Stap 2: Vul de bedieningstabel aan**

Voeg onderaan de tabel in `## Bediening` een rij toe:

```markdown
| `Guido` in de voettekst       | wissel tussen de standaardploeg en het gezin       |
```

- [ ] **Stap 3: Werk de opslagtabel bij**

Vervang de rij `wiezen.ploeg`:

```markdown
| `wiezen.ploeg`   | beide ploegen met hun leden en zetels, en welke actief is |
```

- [ ] **Stap 4: Vul de structuurtabel aan**

Voeg onder de rij van `src/domein/ploeg.ts` toe:

```markdown
| `src/ui/diericonen.tsx`    | de dier-iconen van de standaardploeg         |
```

En pas de rij van `src/domein/ploeg.ts` aan:

```markdown
| `src/domein/ploeg.ts`      | de twee ploegen, hun zetels en het wisselen  |
```

- [ ] **Stap 5: Commit**

```bash
git add README.md
git commit -m "Beschrijf de standaardploeg en de Guido-knop in de README"
```

---

## Afronden

- [ ] `bun run lint` — stil
- [ ] `bun run build` — slaagt
- [ ] `bun run test` — 20 testbestanden, alles groen (19 nu plus `diericonen.test.tsx`)
- [ ] Merge de branch naar `main`
