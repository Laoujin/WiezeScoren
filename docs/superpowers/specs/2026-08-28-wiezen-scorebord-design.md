# Wiezen scorebord — design

Datum: 2026-08-28

## Doel

Een scorebord voor kleurenwiezen met vier spelers. De gebruiker duidt aan wie speelt en welk
contract, geeft het aantal gehaalde slagen, en de app rekent de punten voor alle vier de spelers
uit en houdt de stand bij. De partij overleeft een F5.

Taal van de applicatie: Nederlands.

## Scoreregels

### De pot

Alle contracten rekenen via dezelfde regel:

```
pot           = contractwaarde x aantal tegenstanders van het spelende kamp
punt per lid  = pot / kampgrootte, negatief voor het verliezende kamp
```

Bij een solocontract (kamp van 1) is de pot dus 3x de waarde, bij een duocontract 2x.

| Situatie                        | Waarde | Pot | Spelend kamp | Tegenstanders |
| ------------------------------- | ------ | --- | ------------ | ------------- |
| Vragen gehaald, 8 slagen        | 2      | 4   | +2 elk       | -2 elk        |
| Vragen gefaald, 7 slagen        | 3      | 6   | -3 elk       | +3 elk        |
| Abondance gehaald               | 15     | 45  | +45          | -15 elk       |
| Abondance gefaald               | 15     | 45  | -45          | +15 elk       |
| Dubbele miserie gehaald (2 v 2) | 15     | 30  | +15 elk      | -15 elk       |

De som over de vier spelers is altijd nul.

### Contracten

| Contract         | Kamp   | Slagen nodig | Gehaald | Verloren | Per extra slag | Per slag tekort | Dubbel bij 13 |
| ---------------- | ------ | ------------ | ------- | -------- | -------------- | --------------- | ------------- |
| Vragen           | 2      | 8            | 2       | 3        | 1              | 1               | ja            |
| Troel            | 2      | 8            | 4       | 6        | 2              | 2               | ja            |
| Alleen gaan      | 1      | 5            | 2       | 3        | 1              | 1               | ja            |
| Abondance        | 1      | 9            | 15      | 15       | 0              | 0               | nee           |
| Miserie          | 1 of 2 | 0            | 15      | 15       | 0              | 0               | nee           |
| Miserie op tafel | 1 of 2 | 0            | 30      | 30       | 0              | 0               | nee           |
| Solo slim        | 1      | 13           | 50      | 50       | 0              | 0               | nee           |
| Passen           | 0      | n.v.t.       | 0       | 0        | 0              | 0               | nee           |

Haalt het spelende kamp alle dertien slagen, dan verdubbelt de inzet, voor zover het contract
daarvoor aangevinkt staat. Vragen met dertien slagen levert dus (2 + 5) x 2 = 14 per tegenstander
op, troel (4 + 10) x 2 = 28, alleen gaan (2 + 8) x 2 = 20.

Alle waarden in deze tabel zijn instelbaar en worden mee bewaard.

Miserie en miserie op tafel zijn alles-of-niets. Gaan twee spelers samen miserie, dan vormen zij
een kamp van twee: het kamp slaagt alleen als geen van beiden een slag pakt.

## Domeinmodel

`Ronde` bewaart uitsluitend invoer, nooit uitkomsten:

```ts
type SpelerId = 0 | 1 | 2 | 3

type Ronde = {
  id: string
  deler: SpelerId
  contract: ContractType
  spelers: SpelerId[]           // leeg bij passen, 1 of 2 anders
  slagen: number                // slagen van het spelende kamp
  overrides?: Partial<Record<SpelerId, number>>
}
```

`berekenPunten(ronde, config)` levert de punten per speler. Omdat rondes hun uitkomst niet
opslaan, herrekent een wijziging in de instellingen de volledige lopende partij.

Voor miserie, miserie op tafel en solo slim is `slagen` binair: de invoer is een ja/nee-schakelaar
die op het doelaantal of daarnaast mapt.

`Spel = { spelers: [naam, naam, naam, naam], deler: SpelerId, rondes: Ronde[] }`. Totalen zijn
altijd een reduce over `rondes` en worden nooit opgeslagen. Na het toevoegen van een ronde schuift
de deler een plaats met de klok mee.

## Manuele correctie

Elke puntencel in het scorebord is bewerkbaar. Een bewerking landt in `overrides` van die ronde;
de berekende waarde blijft de basis en de override wint bij weergave en optelling. De ronde krijgt
een markering met een knop om de override te wissen.

Daarnaast bestaat er een rondetype `correctie`: een rij met vier vrije velden, zonder contract, die
de deler niet verschuift.

Een rij kleurt rood zodra de som van haar vier punten niet nul is. Dit blokkeert niets. Onderaan
staat een regel met de som over alle rondes, eveneens rood bij een verschil van nul.

## Opslag

localStorage, drie sleutels:

| Sleutel          | Inhoud                                    |
| ---------------- | ----------------------------------------- |
| `wiezen.spel`    | de lopende partij                         |
| `wiezen.config`  | de contractwaarden                        |
| `wiezen.archief` | afgesloten partijen, nieuwste eerst       |

"Nieuw spel" verplaatst de lopende partij naar het archief en start een lege partij met dezelfde
spelersnamen.

## Interface

Een getekende ovale tafel met vier zetels. Linkerklik op een zetel selecteert die speler als
speler van het contract, tot maximaal twee. Dubbelklik op een naam hernoemt. Rechterklik zet de
deler; de delerknop staat als schijfje naast de zetel.

Onder de tafel staan de contractknoppen, elk actief alleen bij de juiste selectiegrootte. Na de
keuze verschijnt een slagenteller van 0 tot 13, of een ja/nee-schakelaar bij de alles-of-niets
contracten. "Ronde opslaan" berekent en bewaart.

Rechts staat het scorebord: een rij per ronde met de vier punten en de lopende totalen, elke ronde
wisbaar. Verder knoppen voor instellingen, archief en nieuw spel.

Visueel mag het uitbundig zijn: kaarttafelgroen, animaties bij het toekennen van punten, een
duidelijke winnaarsmarkering.

## Structuur

```
src/domein/contracten.ts     contracttypes, standaardwaarden
src/domein/score.ts          berekenPunten
src/domein/spel.ts           Spel-state en reducer
src/opslag/localStorage.ts   laden, bewaren, archiveren
src/ui/...                   Tafel, ContractKnoppen, SlagenInvoer, Scorebord, Instellingen, Archief
```

Domeintermen in het Nederlands, de rest in het Engels. De drie bestanden onder `domein` en het
bestand onder `opslag` zijn pure modules met unit tests in Vitest; de UI leest ze alleen uit.

## Buiten scope

Meerdere tafels tegelijk, spelersstatistieken over partijen heen, export, netwerk of accounts.
