# Standaardploeg met icoon-avatars en de Guido-toggle

De app toont vandaag meteen het gezin met hun foto-karikaturen. Een vreemde die de app opent
krijgt zo namen en gezichten die hem niets zeggen. Daarom start de app voortaan met een neutrale
ploeg van vijf verzonnen namen met dier-iconen. Een knop `Guido` in de voettekst haalt het gezin
terug.

## De twee ploegen

| Ploeg       | Leden                              | Avatar         |
| ----------- | ---------------------------------- | -------------- |
| `standaard` | Tom, Caro, Lies, Bert, Fien        | dier-icoon     |
| `gezin`     | Wouter, Gert, Moe, Va, Zus         | foto uit `public/spelers/` |

De standaardploeg is wat een verse installatie toont. De gezinsploeg is wat `STANDAARD_PLOEG`
vandaag bevat.

### De iconen

| Lid  | Dier | Tint          |
| ---- | ---- | ------------- |
| Tom  | vos  | oranje        |
| Caro | uil  | okergeel      |
| Lies | haas | zachtroze     |
| Bert | beer | warmbruin     |
| Fien | das  | blauwgrijs    |

Elk icoon is inline SVG uit primitieve vormen — cirkels, polygonen, een enkele ellips — in
dezelfde taal als de karikaturen: vlakke kleurvlakken met een donkere lijn. Ze staan samen in
`src/ui/diericonen.tsx` achter een map van sleutel naar component, zodat `Ploeglid.icoon` een
sleutel is en geen bestandsnaam.

## Domein

`src/domein/ploeg.ts` krijgt erbij:

```ts
export type Ploegkeuze = 'standaard' | 'gezin'

export type Ploeglid = {
  id: string
  naam: string
  avatar?: string
  /** Sleutel in de diericonen-map; de standaardploeg heeft geen foto's. */
  icoon?: string
}

export type Ploegstand = { leden: Ploeglid[]; zetels: string[] }
export type Ploegen = Record<Ploegkeuze, Ploegstand> & { actief: Ploegkeuze }
```

`zetels` zijn de vier namen aan tafel. Elke ploeg houdt zo zijn eigen zetelverdeling naast zijn
eigen hernoemingen en gasten.

`wisselPloeg(ploegen: Ploegen, zetels: string[]): Ploegen` schrijft de meegegeven zetels weg bij
de actieve ploeg en zet `actief` op de andere. De aanroeper leest daarna `zetelsVan` op de nieuwe
actieve ploeg.

Een ploeg zonder bewaarde zetels valt terug op de eerste vier van zijn leden.

## Opslag

`wiezen.ploeg` bevat voortaan een `Ploegen` in plaats van een `Ploeglid[]`.

| Wat er staat            | Wat `laadPloegen` ervan maakt                                     |
| ----------------------- | ----------------------------------------------------------------- |
| niets                   | beide standaardploegen, `actief: 'standaard'`                     |
| een array (oude vorm)   | die array als `gezin.leden`, `actief: 'gezin'`                    |
| een `Ploegen`           | zoals bewaard, met ontbrekende foto's per lid aangevuld           |

De migratie houdt bestaande gebruikers bij hun gezin: wie de app al gebruikte, ziet na de update
hetzelfde als ervoor. Alleen een verse installatie begint bij de standaardploeg.

Het aanvullen van ontbrekende foto's dat `laadPloeg` vandaag doet, blijft gelden en werkt nu per
ploeg tegen zijn eigen standaardlijst.

`laadSpel` zet de zetels van de actieve ploeg aan tafel in plaats van de eerste vier van de ploeg.

## De toggle

`useSpel` krijgt `ploegkeuze` en `wisselPloegkeuze()`. Die laatste doet in één stap:

1. `wisselPloeg(ploegen, spel.spelers)` — de huidige zetels gaan naar de oude ploeg.
2. `spel.spelers` wordt de `zetels` van de nieuw actieve ploeg.
3. Bewaren in `wiezen.ploeg`.

Rondes verwijzen naar zetels (`SpelerId`), niet naar namen, dus de lopende partij, de punten en
de pot blijven ongemoeid — alleen de naamplaatjes wisselen. Het archief houdt de namen die er bij
het archiveren stonden.

Hernoemen blijft werken zoals nu, maar raakt enkel de actieve ploeg. Een gast belandt eveneens
enkel in de actieve ploeg.

De rondleiding bewaart al een moment van `spel` plus `ploeg`; dat moment neemt voortaan de hele
`Ploegen` mee zodat een toggle tijdens de rondleiding netjes terugdraait.

## Avatar

`Avatar` krijgt een derde tak, in deze volgorde:

1. `avatar` gezet en de foto laadt → de foto
2. anders `icoon` gezet → het dier-icoon
3. anders → de initialen

De foto wint van het icoon, zodat een ploeglid met beide niets verandert.

## Voettekst

Naast `Uitleg` komt een tekstknop `Guido` in dezelfde stijl, met `aria-pressed` op de actieve
staat: ingedrukt zodra het gezin aan tafel zit.

## Tests

| Bestand              | Dekt                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| `ploeg.test.ts`      | `wisselPloeg` bewaart zetels bij de oude ploeg, terugwisselen geeft ze terug; een ploeg zonder zetels valt terug op zijn eerste vier; hernoemen raakt enkel de actieve ploeg |
| `opslag.test.ts`     | de drie migratiegevallen; heen-en-weer bewaren behoudt beide ploegen; `laadSpel` volgt de actieve zetels |
| `Avatar.test.tsx`    | icoon-tak, foto wint van icoon, initialen zonder beide               |
| `App.test.tsx`       | een verse app toont Tom; de Guido-knop wisselt de namen aan tafel en terug; de punten blijven staan |

## Wat er niet in zit

- Geen instelling onder Instellingen; de knop in de voettekst is de enige ingang.
- Geen derde ploeg of eigen ploegen aanmaken.
- Geen nieuwe foto's of avatarscript-wijzigingen.
