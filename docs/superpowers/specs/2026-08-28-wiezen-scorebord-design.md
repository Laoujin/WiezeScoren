# Wiezen scorebord — design

Datum: 2026-08-28

## Doel

Een scorebord voor kleurenwiezen met vier spelers. De gebruiker duidt aan wie speelt en welk
contract, geeft het aantal gehaalde slagen, en de app rekent de punten voor alle vier de spelers
uit en houdt de stand bij. De partij overleeft een F5.

Taal van de applicatie: Nederlands.

## Scoreregels

### De inzet

Alle contracten rekenen via dezelfde regel:

```
inleg         = contractwaarde x aantal tegenstanders van het spelende kamp
punt per lid  = inleg / kampgrootte, negatief voor het verliezende kamp
```

Bij een solocontract (kamp van 1) is de inleg dus 3x de waarde, bij een duocontract 2x.

| Situatie                        | Waarde | Inleg | Spelend kamp | Tegenstanders |
| ------------------------------- | ------ | ----- | ------------ | ------------- |
| Vragen gehaald, 8 slagen        | 2      | 4     | +2 elk       | -2 elk        |
| Vragen gefaald, 7 slagen        | 3      | 6     | -3 elk       | +3 elk        |
| Abondance gehaald               | 15     | 45    | +45          | -15 elk       |
| Abondance gefaald               | 15     | 45    | -45          | +15 elk       |
| Dubbele miserie gehaald (2 v 2) | 15     | 30    | +15 elk      | -15 elk       |

De som over de vier spelers is altijd nul, op de potbewegingen na; scores en pot samen komen wel
altijd op nul uit.

### De pot

De pot begint op nul en loopt door de hele partij.

| Gebeurtenis                     | Gevolg                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| Iedereen past                   | elke speler betaalt `madamWaarde` per madam die hij vasthoudt, in de pot |
| Contract om de pot gehaald      | het kamp verdeelt de pot bovenop zijn punten, de pot gaat naar nul      |
| Contract om de pot niet gehaald | het kamp betaalt samen het potbedrag, waardoor de pot verdubbelt        |

De vier madams worden altijd volledig verdeeld, dus een pasronde stopt bij de standaardwaarde van
3 twaalf punten in de pot. Contracten die om de pot spelen zijn abondance, miserie, miserie op
tafel en solo slim; vragen, troel en alleen gaan laten de pot ongemoeid. De pot hoort bij de
partij en gaat mee het archief in.

### Contracten

| Contract         | Kamp   | Slagen nodig | Gehaald | Verloren | Per extra slag | Per slag tekort | Dubbel bij 13 | Om de pot |
| ---------------- | ------ | ------------ | ------- | -------- | -------------- | --------------- | ------------- | --------- |
| Vragen           | 2      | 8            | 2       | 3        | 1              | 1               | ja            | nee       |
| Troel            | 2      | 8            | 4       | 6        | 2              | 2               | ja            | nee       |
| Alleen gaan      | 1      | 5            | 2       | 3        | 1              | 1               | ja            | nee       |
| Abondance        | 1      | 9            | 15      | 15       | 0              | 0               | nee           | ja        |
| Miserie          | 1 of 2 | 0            | 15      | 15       | 0              | 0               | nee           | ja        |
| Miserie op tafel | 1 of 2 | 0            | 30      | 30       | 0              | 0               | nee           | ja        |
| Solo slim        | 1      | 13           | 50      | 50       | 0              | 0               | nee           | ja        |
| Passen           | 0      | n.v.t.       | 0       | 0        | 0              | 0               | nee           | nee       |

Haalt het spelende kamp alle dertien slagen, dan verdubbelt de inzet, voor zover het contract
daarvoor aangevinkt staat. Vragen met dertien slagen levert dus (2 + 5) x 2 = 14 per tegenstander
op, troel (4 + 10) x 2 = 28, alleen gaan (2 + 8) x 2 = 20.

Alle waarden in deze tabel zijn instelbaar en worden mee bewaard. Daarnaast staat er één losse
instelling: `madamWaarde`, standaard 3.

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
  madams?: Partial<Record<SpelerId, number>>   // enkel bij een pasronde
  overrides?: Partial<Record<SpelerId, number>>
}
```

`speelRonde(ronde, config, potVoor)` levert de punten per speler plus de pot voor en na de ronde.
`verloop(spel, config)` speelt de partij van voren af aan door zodat elke ronde de pot van dat
moment ziet. Omdat rondes hun uitkomst niet opslaan, herrekent een wijziging in de instellingen de
volledige lopende partij.

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

Een rij kleurt rood zodra haar vier punten samen met de potbeweging niet op nul uitkomen. Dit blokkeert niets. Onderaan
staat een regel met de som over alle rondes plus de pot, eveneens rood bij een verschil van nul.

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
contracten. Bij Passen verschijnt in de plaats daarvan een verdeling van de vier madams over de
spelers; opslaan kan pas wanneer alle vier toegewezen zijn. "Ronde opslaan" berekent en bewaart.

Midden op de tafel staat de pot. Terwijl je een ronde samenstelt tonen de zetels de punten die
elke speler zou krijgen.

Rechts staat het scorebord: een rij per ronde met de vier punten en de lopende totalen, elke ronde
wisbaar. Verder knoppen voor instellingen, archief en nieuw spel.

Onderaan de pagina staat een regel met de bedieningsuitleg. Visueel mag het uitbundig zijn:
kaarttafelgroen, een lamp boven de tafel, animaties bij het toekennen van punten.

## Structuur

```
src/domein/contracten.ts     contracttypes, standaardwaarden
src/domein/score.ts          berekenPunten, speelRonde, madamPunten
src/domein/spel.ts           Spel-state, potverloop en reducer
src/opslag/localStorage.ts   laden, bewaren, archiveren
src/ui/...                   Tafel, ContractKnoppen, SlagenInvoer, Scorebord, Instellingen, Archief
```

Domeintermen in het Nederlands, de rest in het Engels. De drie bestanden onder `domein` en het
bestand onder `opslag` zijn pure modules met unit tests in Vitest; de UI leest ze alleen uit.

## Buiten scope

Meerdere tafels tegelijk, spelersstatistieken over partijen heen, export, netwerk of accounts.
