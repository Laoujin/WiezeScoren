# Wiezen

Scorebord voor kleurenwiezen met vier spelers. Alles blijft in `localStorage` staan, dus een F5
verandert niets aan de partij.

Gepubliceerd op https://laoujin.github.io/WiezeScoren/

## Lokaal starten

```bash
bun install
bun dev
```

http://localhost:5173

| Commando             | Doet                          |
| -------------------- | ----------------------------- |
| `bun dev`            | dev-server met HMR            |
| `bun run test`       | Vitest, eenmalig              |
| `bun run test:watch` | Vitest in watch-modus         |
| `bun run build`      | typecheck plus productiebuild |
| `bun run preview`    | de build serveren             |
| `bun run lint`       | ESLint                        |

`bun test` start Bun zijn eigen testrunner en niet Vitest; gebruik `bun run test`.

## Bediening

| Handeling                    | Gevolg                                             |
| ---------------------------- | -------------------------------------------------- |
| Klik op een zetel            | die speler speelt mee, tot twee spelers             |
| Rechtsklik op een zetel      | zet de deler                                        |
| Dubbelklik op een naam       | hernoemen                                           |
| Contractknop                 | actief zodra het aantal geselecteerde spelers past  |
| Passen                       | verdeel de vier madams over de spelers              |
| Klik op een punt in de tabel | handmatig aanpassen                                 |
| `+ Correctie`                | lege rij met vier vrije velden                      |
| `Nieuw spel`                 | partij naar het archief, namen blijven staan        |

Een rij kleurt rood zodra de punten samen met de potbeweging niet op nul uitkomen. De deler
schuift automatisch door na elke ronde, behalve na een correctie.

## Scoreregels

### De inzet

De contractwaarde is de inzet die elke tegenstander neerlegt. Het spelende kamp verdeelt de hele
inleg, dus een solist wint driemaal de inzet en een duo eenmaal.

| Contract         | Kamp   | Slagen nodig | Gehaald | Verloren | Per extra slag | Per slag tekort | Dubbel bij 13 | Om de pot |
| ---------------- | ------ | ------------ | ------- | -------- | -------------- | --------------- | ------------- | --------- |
| Vragen           | 2      | 8            | 2       | 3        | 1              | 1               | ja            | nee       |
| Troel            | 2      | 8            | 4       | 6        | 2              | 2               | ja            | nee       |
| Alleen gaan      | 1      | 5            | 2       | 3        | 1              | 1               | ja            | nee       |
| Abondance        | 1      | 9            | 15      | 15       | 0              | 0               | nee           | ja        |
| Miserie          | 1 of 2 | 0            | 15      | 15       | 0              | 0               | nee           | ja        |
| Miserie op tafel | 1 of 2 | 0            | 30      | 30       | 0              | 0               | nee           | ja        |
| Solo slim        | 1      | 13           | 50      | 50       | 0              | 0               | nee           | ja        |

Haalt het kamp alle dertien slagen bij vragen, troel of alleen gaan, dan verdubbelt de inzet:
vragen met dertien slagen is (2 + 5) x 2 = 14 per tegenstander.

### De pot

De pot begint op nul en staat midden op de tafel.

| Gebeurtenis                       | Gevolg                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| Iedereen past                     | elke speler betaalt 3 punten per madam die hij vasthoudt, in de pot |
| Contract om de pot gehaald        | het kamp krijgt de pot bovenop zijn punten, de pot gaat naar nul   |
| Contract om de pot niet gehaald   | het kamp betaalt het potbedrag, waardoor de pot verdubbelt         |

De vier madams worden altijd volledig verdeeld, dus een pasronde stopt twaalf punten in de pot.
Bij twee miseriespelers wordt de pot gedeeld. Scores en pot samen komen altijd op nul uit.

Alle waarden zijn aanpasbaar onder Instellingen. Een wijziging herrekent de lopende partij, want
rondes bewaren alleen hun invoer.

## Opslag

| Sleutel          | Inhoud                              |
| ---------------- | ----------------------------------- |
| `wiezen.spel`    | de lopende partij                   |
| `wiezen.config`  | de contractwaarden                  |
| `wiezen.archief` | afgesloten partijen, nieuwste eerst |

De pot hoort bij de partij en gaat dus mee het archief in.

## Structuur

| Pad                        | Inhoud                                      |
| -------------------------- | ------------------------------------------- |
| `src/domein/contracten.ts` | contracttypes en standaardwaarden           |
| `src/domein/score.ts`      | `berekenPunten` en `speelRonde`             |
| `src/domein/spel.ts`       | partijstate, rondes, potverloop, totalen     |
| `src/opslag/opslag.ts`     | laden, bewaren, archiveren                  |
| `src/ui/`                  | tafel, contractknoppen, scorebord, schermen |

## Publiceren

`.github/workflows/deploy.yml` draait lint, tests en build bij elke push naar `main` en zet `dist`
op GitHub Pages. Zet in de repository onder Settings > Pages de source op GitHub Actions.

De buildbase staat op `/WiezeScoren/` in `vite.config.ts`; hernoem je de repository, pas die dan mee aan.

Het ontwerp staat in [docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md](docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md).
