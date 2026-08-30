import type { Actie } from './acties'

export type Stap = {
  id: string
  titel: string
  tekst: string
  /** Selector(s) van wat in de schijnwerper komt; zonder doel dimt het hele scherm. */
  doel?: string | string[]
  /** Waar de uitlegkaart hangt; boven houdt de klikken eronder zichtbaar. Standaard onder. */
  plaats?: 'boven' | 'onder'
  /** Wordt één keer afgespeeld, wanneer de stap voor het eerst in beeld komt. */
  acties?: Actie[]
}

export const STAPPEN: Stap[] = [
  {
    id: 'spelers',
    titel: 'Wie zit er aan tafel',
    doel: '[data-tafel]',
    tekst: 'Kies de spelers en de gasten. Dubbelklik een naam om deze te wijzigen.',
    acties: [
      { soort: 'klik', doel: '[data-avatar-knop="1"]' },
      { soort: 'klik', doel: '[data-ploeglid]' },
      { soort: 'klik', doel: '[data-avatar-knop="3"]' },
      { soort: 'klik', doel: '[data-gast]' },
      { soort: 'dubbelklik', doel: '[data-naam="3"]' },
      { soort: 'typ', doel: '[data-naam-invoer]', tekst: 'Nonkel Jef' },
    ],
  },
  {
    id: 'deler',
    titel: 'De deler',
    doel: '[data-tafel]',
    tekst:
      'De D-fiche staat bij wie deelt en schuift na elke ronde één zetel door. Tik de fiche en dan een zetel om ze te verzetten.',
    acties: [
      { soort: 'klik', doel: '[data-deler]' },
      { soort: 'klik', doel: '[data-delerkeuze="2"]' },
    ],
  },
  {
    id: 'scoren',
    titel: 'Een ronde invoeren',
    doel: ['[data-tafel]', '[data-blok="contractkeuze"]'],
    tekst:
      'Klik wie speelt, kies het contract en tik het aantal gehaalde slagen. Ronde opslaan zet de punten op het bord.',
    acties: [
      { soort: 'klik', doel: '[data-zetel="0"]' },
      { soort: 'klik', doel: '[data-zetel="1"]' },
      { soort: 'klik', doel: '[data-contract="vragen"]' },
      { soort: 'klik', doel: '[data-slagen="9"]' },
      { soort: 'klik', doel: '[data-opslaan]' },
    ],
  },
  {
    id: 'correctie',
    titel: 'Punten bijsturen',
    doel: '[data-blok="scorebord"]',
    plaats: 'boven',
    tekst:
      'Klik een punt in de tabel om het zelf te typen. + Correctie zet er een lege rij bij met vier vrije velden. Een rij kleurt rood zolang de punten samen met de pot niet op nul uitkomen.',
    acties: [
      { soort: 'klik', doel: '[data-correctie]' },
      { soort: 'klik', doel: 'tbody tr:last-child [data-punt]' },
      { soort: 'typ', doel: '[data-punt-invoer]', tekst: '10' },
    ],
  },
  {
    id: 'wissen',
    titel: 'Een uitslag wissen',
    doel: '[data-blok="scorebord"]',
    plaats: 'boven',
    tekst: 'Het kruisje achteraan een rij gooit die ronde weg; de deler schuift mee terug.',
    acties: [{ soort: 'klik', doel: 'tbody tr:last-child [data-wis-ronde]' }],
  },
]
