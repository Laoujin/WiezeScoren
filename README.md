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

| Handeling                     | Gevolg                                             |
| ----------------------------- | -------------------------------------------------- |
| Klik op een zetel             | die speler speelt mee, tot twee spelers            |
| Klik op een avatar            | iemand anders uit de ploeg op die zetel            |
| Tik de D-fiche, dan een zetel | verzet de deler; rechtsklikken werkt ook           |
| Dubbelklik op een naam        | hernoemen                                          |
| Contractknop                  | actief zodra het aantal geselecteerde spelers past |
| Passen                        | verdeel de vier madams over de spelers             |
| Klik op een punt in de tabel  | handmatig aanpassen                                |
| `+ Correctie`                 | lege rij met vier vrije velden                     |
| `Nieuw spel`                  | partij naar het archief, namen blijven staan       |
| `Uitleg` in de voettekst      | rondleiding die de klikken zelf voordoet           |
| `Guido` in de voettekst       | wissel tussen de standaardploeg en het gezin       |

Een rij kleurt rood zodra de punten samen met de potbeweging niet op nul uitkomen. De deler
schuift automatisch door na elke ronde, behalve na een correctie.

De rondleiding opent vanzelf bij een verse partij en speelt op de echte tafel: ze verzet de deler,
haalt er een gast bij en slaat een ronde op. Bij het sluiten komt de partij terug zoals ze was.

## Scoreregels

### De inzet

De contractwaarde is de inzet die elke tegenstander neerlegt. Het spelende kamp verdeelt de hele
inleg, dus een solist wint driemaal de inzet en een duo eenmaal.

| Contract         | Kamp   | Slagen nodig | Gehaald | Verloren | Per extra slag | Per slag tekort | Bij 13 slagen | Om de pot |
| ---------------- | ------ | ------------ | ------- | -------- | -------------- | --------------- | ------------- | --------- |
| Vragen           | 2      | 8            | 2       | 3        | 1              | 1               | 15            | nee       |
| Troel            | 2      | 8            | 4       | 6        | 2              | 2               | 30            | nee       |
| Alleen gaan      | 1      | 5            | 2       | 3        | 1              | 1               | 20            | nee       |
| Abondance        | 1      | 9            | 15      | 15       | 0              | 0               | 0             | ja        |
| Miserie          | 1 of 2 | 0            | 15      | 15       | 0              | 0               | 0             | ja        |
| Miserie op tafel | 1 of 2 | 0            | 30      | 30       | 0              | 0               | 0             | ja        |
| Solo slim        | 1      | 13           | 50      | 50       | 0              | 0               | 0             | ja        |

Haalt het kamp alle dertien slagen, dan vervangt de kolom "Bij 13 slagen" de slagenrekening:
vragen met dertien slagen is 15 per tegenstander. Een nul in die kolom laat de gewone rekening
staan.

### De pot

De pot begint op nul en staat midden op de tafel.

| Gebeurtenis                     | Gevolg                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| Iedereen past                   | elke speler betaalt 3 punten per madam die hij vasthoudt, in de pot |
| Contract om de pot gehaald      | het kamp krijgt de pot bovenop zijn punten, de pot gaat naar nul    |
| Contract om de pot niet gehaald | het kamp betaalt het potbedrag, waardoor de pot verdubbelt          |

De vier madams worden altijd volledig verdeeld, dus een pasronde stopt twaalf punten in de pot.
Bij twee miseriespelers wordt de pot gedeeld. Scores en pot samen komen altijd op nul uit.

Alle waarden zijn aanpasbaar onder Instellingen. Een wijziging herrekent de lopende partij, want
rondes bewaren alleen hun invoer.

## De ploeg

De ploeg telt vijf leden, waarvan er vier aan tafel zitten. Standaard zijn dat Tom, Caro, Lies,
Bert en Fien, elk met een dier-icoon. `Guido` in de voettekst wisselt naar het gezin — Wouter,
Gert, Moe, Va en Zus, met hun foto-karikaturen — en terug. Elke ploeg houdt haar eigen
hernoemingen, gasten en zetelverdeling; de lopende partij blijft staan, want rondes verwijzen naar
zetels en niet naar namen.

Klik een avatar om iemand anders op die zetel te zetten; zit die al aan tafel, dan ruilen de twee
van plaats. Dubbelklik een naam om te hernoemen, dat volgt de persoon zodat zijn avatar meegaat.

### Avatars maken

De avatars zijn karikaturen, gemaakt uit gewone portretfoto's. Het script zoekt de
gezichtspunten, blaast neus, ogen, mond, kin en schedel op, brengt de foto naar vlakke
kleurvlakken met zwarte lijnen, en snijdt er een ronde WebP uit.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install mediapipe opencv-python-headless
.venv/bin/python scripts/avatars.py players-raw/*.jpg
```

De uitvoer belandt in `public/spelers/` als `<naam>.webp`, 256 px en rond uitgesneden. Zet die
bestandsnaam in het `avatar`-veld van het ploeglid; ontbreekt hij of laadt hij niet, dan toont de
app de initialen.

| Knop             | Standaard | Doet                                                     |
| ---------------- | --------- | -------------------------------------------------------- |
| `--stijl`        | `inkt`    | `inkt`, `penseel`, `waterverf`, `potlood`, `pentekening` |
| `--overdrijving` | 1.0       | schaalt alle kenmerken tegelijk                          |
| `--proefblad`    | —         | alle stijlen naast elkaar in één PNG                     |
| `--ogen`         | 1.45      | ogen vergroten                                           |
| `--neus`         | 1.40      | neus vergroten                                           |
| `--mond`         | 1.20      | mond vergroten                                           |
| `--kin`          | 1.20      | kin verlengen                                            |
| `--schedel`      | 1.25      | schedel verbreden                                        |

1.0 zet een kenmerk uit. Voorbij `--overdrijving 2.6` gaan de trekken schuiven en wordt het
vervorming in plaats van overdrijving.

## Opslag

| Sleutel          | Inhoud                                                    |
| ---------------- | --------------------------------------------------------- |
| `wiezen.spel`    | de lopende partij                                         |
| `wiezen.config`  | de contractwaarden                                        |
| `wiezen.archief` | afgesloten partijen, nieuwste eerst                       |
| `wiezen.ploeg`   | beide ploegen met hun leden en zetels, en welke actief is |

De pot hoort bij de partij en gaat dus mee het archief in.

## Structuur

| Pad                        | Inhoud                                      |
| -------------------------- | ------------------------------------------- |
| `src/domein/contracten.ts` | contracttypes en standaardwaarden           |
| `src/domein/score.ts`      | `berekenPunten` en `speelRonde`             |
| `src/domein/betalingen.ts` | wie aan wie betaalt, met de pot als knoop   |
| `src/domein/spel.ts`       | partijstate, rondes, potverloop, totalen    |
| `src/domein/ploeg.ts`      | de twee ploegen, hun zetels en het wisselen |
| `src/ui/diericonen.tsx`    | de dier-iconen van de standaardploeg        |
| `scripts/avatars.py`       | foto naar karikatuur-avatar                 |
| `src/opslag/opslag.ts`     | laden, bewaren, archiveren                  |
| `src/ui/`                  | tafel, contractknoppen, scorebord, schermen |

## Publiceren

`.github/workflows/deploy.yml` draait lint, tests en build bij elke push naar `main` en zet `dist`
op GitHub Pages. Zet in de repository onder Settings > Pages de source op GitHub Actions.

De buildbase staat op `/WiezeScoren/` in `vite.config.ts`; hernoem je de repository, pas die dan mee aan.

Het ontwerp staat in [docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md](docs/superpowers/specs/2026-08-28-wiezen-scorebord-design.md).
