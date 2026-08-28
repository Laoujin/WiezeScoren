# Wiezen

Scorebord voor kleurenwiezen met vier spelers. Alles blijft in `localStorage` staan, dus een F5
verandert niets aan de partij.

## Lokaal starten

```bash
bun install
bun dev
```

http://localhost:5173

| Commando          | Doet                          |
| ----------------- | ----------------------------- |
| `bun dev`         | dev-server met HMR            |
| `bun test`        | Vitest, eenmalig              |
| `bun run test:watch` | Vitest in watch-modus      |
| `bun run build`   | typecheck plus productiebuild |
| `bun run preview` | de build serveren             |
| `bun run lint`    | ESLint                        |

## Bediening

| Handeling                     | Gevolg                                            |
| ----------------------------- | ------------------------------------------------- |
| Klik op een zetel             | die speler speelt mee, tot twee spelers            |
| Rechtsklik op een zetel       | zet de deler                                       |
| Dubbelklik op een naam        | hernoemen                                          |
| Contractknop                  | actief zodra het aantal geselecteerde spelers past |
| Klik op een punt in de tabel  | handmatig aanpassen                                |
| `+ Correctie`                 | lege rij met vier vrije velden                     |
| `Nieuw spel`                  | partij naar het archief, namen blijven staan       |

Een rij kleurt rood zodra de punten niet op nul uitkomen. De deler schuift automatisch door na
elke ronde, behalve na een correctie.

## Scoreregels

De contractwaarde is de inzet die elke tegenstander neerlegt. Het spelende kamp verdeelt de hele
pot, dus een solist wint driemaal de inzet en een duo eenmaal.

| Contract         | Kamp   | Slagen nodig | Gehaald | Verloren | Per extra slag | Per slag tekort | Dubbel bij 13 |
| ---------------- | ------ | ------------ | ------- | -------- | -------------- | --------------- | ------------- |
| Vragen           | 2      | 8            | 2       | 3        | 1              | 1               | ja            |
| Troel            | 2      | 8            | 4       | 6        | 2              | 2               | ja            |
| Alleen gaan      | 1      | 5            | 2       | 3        | 1              | 1               | ja            |
| Abondance        | 1      | 9            | 15      | 15       | 0              | 0               | nee           |
| Miserie          | 1 of 2 | 0            | 15      | 15       | 0              | 0               | nee           |
| Miserie op tafel | 1 of 2 | 0            | 30      | 30       | 0              | 0               | nee           |
| Solo slim        | 1      | 13           | 50      | 50       | 0              | 0               | nee           |

Haalt het kamp alle dertien slagen bij vragen, troel of alleen gaan, dan verdubbelt de inzet:
vragen met dertien slagen is (2 + 5) x 2 = 14 per tegenstander.

Alle waarden zijn aanpasbaar onder Instellingen. Een wijziging herrekent de lopende partij, want
rondes bewaren alleen hun invoer.

## Opslag

| Sleutel          | Inhoud                              |
| ---------------- | ----------------------------------- |
| `wiezen.spel`    | de lopende partij                   |
| `wiezen.config`  | de contractwaarden                  |
| `wiezen.archief` | afgesloten partijen, nieuwste eerst |

## Structuur

| Pad                         | Inhoud                                     |
| --------------------------- | ------------------------------------------ |
| `src/domein/contracten.ts`  | contracttypes en standaardwaarden          |
| `src/domein/score.ts`       | `berekenPunten`                            |
| `src/domein/spel.ts`        | partijstate, rondes, totalen               |
| `src/opslag/opslag.ts`      | laden, bewaren, archiveren                 |
| `src/ui/`                   | tafel, contractknoppen, scorebord, schermen |

Het ontwerp staat in [docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md](docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md).
