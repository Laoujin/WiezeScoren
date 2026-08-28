# Midjourney-prompts voor het wiezen-scorebord

Indienen met de `midjourney-submit` skill; elk codeblok hieronder is één prompt.

```
/midjourney-submit docs/midjourney.md
/midjourney-submit docs/midjourney.md vilt      # enkel de sectie met "vilt" in de titel
```

Het palet van de app: kaarttafelgroen `#10412E`, messing `#D9A441`, krijtwit `#F3EEE2`,
hartrood `#C6402F`, diep groen-zwart `#071A13`.

---

## Vilt

De tafeltextuur. Vervangt de `feTurbulence`-ruis in `.vilt`.

```
worn dark green baize card table surface seen from directly above, fine wool nap texture, faint chalk dust caught in the weave, warm pool of lamplight falling from the upper left, deep falloff into shadow towards the corners, cinematic muted palette of deep pine green and antique brass, photographic, tactile, seamless --ar 16:9 --style raw --stylize 120 --no cards chips hands text people objects
```

```
painterly texture study of aged billiard cloth in deep forest green, visible fibres and a soft sheen where a warm lamp catches the nap, slight wear near the edges, chiaroscuro falloff, oil on canvas feel, restrained and moody --ar 16:9 --style raw --stylize 250 --no cards chips hands text people objects pattern
```

**Referencen**

1. Bewaar als `src/assets/vilt.jpg`, ongeveer 1600 px breed, kwaliteit 70, onder de 200 kB.
2. In `src/index.css`, in de regel `.vilt`, de data-URI vervangen:

```css
.vilt {
  background-image:
    radial-gradient(72% 62% at 50% 24%, rgb(255 245 210 / 0.18) 0%, transparent 64%),
    url('./assets/vilt.jpg');
  background-size: cover;
  background-position: center;
  background-blend-mode: screen, overlay;
}
```

Zet het pad relatief vanuit `src/`, niet als `/vilt.jpg` in `public/`: Vite hasht en herschrijft
alleen relatieve verwijzingen mee met de `base` van GitHub Pages.

Wordt de tekst op de tafel slechter leesbaar, verlaag dan de foto met een extra donkere laag:
`linear-gradient(rgb(7 26 19 / 0.45), rgb(7 26 19 / 0.45))` als eerste laag boven de afbeelding.

---

## Social preview

De afbeelding die verschijnt wanneer je de Pages-link deelt. Vast formaat 1200 x 630.

```
cinematic still life above a dark green baize card table, four engraved brass name plaques set around the edge, a stack of chalk white and deep red chips at the centre, a single hanging brass lamp casting one warm pool of light, heavy chiaroscuro, quiet Flemish cafe at closing time, elegant and restrained --ar 1.91:1 --style raw --stylize 200 --no cards hands people text logos faces
```

```
overhead shot of a green baize table lit by one low brass lamp, a neat stack of red and cream chips casting a long shadow, a brass dealer button beside it, everything else swallowed by darkness, moody product photography, shallow depth of field --ar 1.91:1 --style raw --stylize 150 --no cards hands people text logos
```

**Referencen**

1. Bewaar als `public/og.jpg`, exact 1200 x 630, onder de 300 kB.
2. In `index.html`, in de `<head>`:

```html
<meta property="og:title" content="Wiezen" />
<meta property="og:description" content="Scorebord voor kleurenwiezen met vier spelers." />
<meta property="og:image" content="https://laoujin.github.io/WiezeScoren/og.jpg" />
<meta property="og:url" content="https://laoujin.github.io/WiezeScoren/" />
<meta name="twitter:card" content="summary_large_image" />
```

`og:image` moet een volledige URL zijn, geen pad. Verandert de repositorynaam, dan verandert deze
regel mee.

---

## Icoon

Vervangt `public/favicon.svg`. Één symbool, leesbaar op 16 px.

```
emblem of a single antique brass token seen straight on, engraved rim, deep green enamel inlay in the centre, art deco symmetry, flat dark background, luxurious and minimal, crisp edges, centred, icon --ar 1:1 --style raw --stylize 100 --no text letters numbers people hands cards
```

**Referencen**

1. Bewaar het bijgesneden vierkant als `docs/art/icoon.png`.
2. Omzetten met de `create-ico` skill, uitvoer naar `public/favicon.ico`.
3. In `index.html` de regel `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
   vervangen door `<link rel="icon" href="/favicon.ico" sizes="any" />` en `public/favicon.svg`
   verwijderen.

---

## Archief lege staat

Optioneel. Vult het lege Archief-scherm.

```
a single warm brass lamp hanging above an empty dark green card table, long soft shadows, nobody there, closing time, painterly, deep vignette, generous empty space in the lower half --ar 3:2 --style raw --stylize 250 --no cards chips hands people text
```

**Referencen**

1. Bewaar als `src/assets/archief-leeg.jpg`, ongeveer 900 px breed, onder de 120 kB.
2. In `src/ui/Archief.tsx`, in de tak waar `archief.length === 0`:

```tsx
import archiefLeeg from '../assets/archief-leeg.jpg'
...
<div className="py-8 text-center">
  <img src={archiefLeeg} alt="" className="mx-auto mb-4 w-64 rounded-xl opacity-60" />
  <p className="text-sm text-krijt-dof">Afgesloten partijen komen hier terecht.</p>
</div>
```

---

## Na het binnenhalen

Comprimeer voor je commit; onbewerkte Midjourney-uitvoer is enkele megabytes en gaat mee in elke
Pages-deploy.

```bash
bunx @squoosh/cli --mozjpeg '{"quality":70}' -d src/assets ~/Downloads/vilt.png
```

Controleer daarna `bun run build` en kijk of de bundelgrootte in de hand blijft.
