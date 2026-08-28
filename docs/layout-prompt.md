# Prompt: zes layouts voor het wiezen-scorebord

Je bent de design lead voor een scorebord-webapp voor kleurenwiezen, een Vlaams kaartspel met vier
spelers. De app is Nederlandstalig, draait in React met Tailwind, is donker van thema en wordt
gebruikt aan de kaarttafel: iemand houdt de score bij op een laptop of telefoon terwijl er
gespeeld wordt. Snelheid van invoer telt zwaarder dan volledigheid van weergave.

Lever **zes structureel verschillende layoutconcepten** voor het hoofdscherm. Geen zes
kleurvarianten en geen zes typografische varianten van dezelfde opbouw: de indeling zelf moet
telkens anders zijn.

## Wat er op het hoofdscherm moet passen

| Element             | Inhoud                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Vier spelers        | naam (ter plaatse hernoembaar), lopende totaalscore, en tijdens het samenstellen van een ronde per speler het puntenverschil dat die ronde zou opleveren |
| Deler               | een merkteken bij één van de vier spelers, verspringt automatisch na elke ronde en is handmatig te verzetten |
| Pot                 | één getal dat door de partij heen loopt en op nul begint                                          |
| Contractkeuze       | acht knoppen: Vragen, Troel, Alleen gaan, Abondance, Miserie, Miserie op tafel, Solo slim, Passen. Elke knop is enkel bruikbaar bij het juiste aantal geselecteerde spelers (nul, één of twee) |
| Uitkomst-invoer     | ofwel een slagenteller van 0 tot 13, ofwel een gehaald/mislukt-schakelaar, ofwel bij Passen een verdeling van vier madams over de vier spelers |
| Bevestigen          | een opslaan-knop plus een manier om de keuze te wissen                                            |
| Scorebord           | één rij per gespeelde ronde met contractnaam, wie speelde, de uitkomst, vier puntencellen (elk ter plaatse te overschrijven) en de potstand na die ronde; daaronder een totalenrij en een waarschuwing wanneer scores plus pot niet op nul uitkomen |
| Navigatie           | Tafel, Instellingen, Archief, en een knop Nieuw spel                                              |

## Interacties die moeten blijven werken

- Een speler aanduiden als deelnemer aan het contract, tot twee spelers tegelijk.
- De deler verzetten naar een andere speler.
- Een naam hernoemen.
- Een puntencel in het scorebord handmatig overschrijven, met een zichtbare markering dat die
  ronde handmatig is aangepast.
- Een ronde verwijderen.

De volgorde van invoer ligt niet vast. Vandaag is het spelers kiezen, dan contract, dan uitkomst,
dan opslaan, maar een concept mag die volgorde omgooien als dat sneller werkt.

## Randvoorwaarden

- Werkt van 360 px tot 1440 px breed, zonder horizontaal scrollen.
- Uitsluitend donker thema. Het bestaande palet is kaarttafelgroen, messing, krijtwit, met rood en
  mintgroen voor negatieve en positieve punten. Je mag daarvan afwijken als het concept erom
  vraagt, maar zeg dan wat je vervangt.
- Zichtbare toetsenbordfocus, en animaties die zich houden aan `prefers-reduced-motion`.
- De vier spelers dragen geen kaartsymbolen meer. Hun herkenningspunt is hun naam.

## Wat je niet mag inleveren

Het huidige scherm ziet er zo uit; lever geen variant die hierop neerkomt:

```
┌────────────────────────────────────────────────────────────┐
│ Wiezen                    [Tafel][Instellingen][Archief]   │
├──────────────────────────────────┬─────────────────────────┤
│              [speler 3]          │  SCOREBORD              │
│                                  │  rij per ronde          │
│   [speler 2]   ( ovale tafel )   │  vier puntenkolommen    │
│                  pot in het      │  totalenrij             │
│                  midden          │                         │
│              [speler 1]          │                         │
│                                  │                         │
│  [Vragen][Troel][Alleen][...]    │                         │
│  slagen: 0 1 2 3 ... 13          │                         │
│  [Ronde opslaan]                 │                         │
└──────────────────────────────────┴─────────────────────────┘
```

Een ronde tafel met vier zetels eromheen en een scorebord in een rechterkolom is dus verbruikt.

## Assen waarop de zes concepten moeten uiteenlopen

Kies zes verschillende antwoorden op deze vragen; twee concepten mogen niet op dezelfde manier
antwoorden op meer dan één as.

- Wat is het brandpunt: de spelers, het scoreverloop, de pot, of de invoer?
- Is de invoer altijd zichtbaar, of verschijnt ze pas wanneer je een ronde begint?
- Staat het scorebord permanent in beeld, of is het een tweede laag?
- Is de opbouw ruimtelijk (een tafel, een baan, een veld) of administratief (een lijst, een raster,
  een boekhouding)?
- Werkt het scherm even goed met de duim op een telefoon als met een muis?
- Hoeveel handelingen kost het invoeren van één ronde?

## Wat je per concept oplevert

1. **Naam** — twee of drie woorden die het idee vastpakken.
2. **Het idee in één zin** — wat dit concept anders organiseert dan de andere vijf.
3. **Wireframe desktop** — ASCII, ongeveer 70 tekens breed, met alle elementen uit de tabel
   hierboven op hun plaats.
4. **Wireframe mobiel** — ASCII, ongeveer 34 tekens breed.
5. **Invoerpad** — de handelingen om één ronde vast te leggen, genummerd, met het totaal.
6. **Winst en verlies** — wat dit concept beter doet dan de huidige opzet, en wat het inlevert.
7. **Handtekening** — het ene detail waaraan je dit scherm herkent: een beweging, een vorm, een
   manier waarop cijfers verschijnen. Geen kleurkeuze.

Sluit af met een tabel die de zes concepten naast elkaar zet op de assen hierboven, en met jouw
aanbeveling plus de reden.
