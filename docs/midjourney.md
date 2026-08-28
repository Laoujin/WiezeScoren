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

`.vilt` zit op het tafelblad in `src/ui/Tafel.tsx`, en dat is hoogstens 560 px breed. Een tegel is
genoeg; de 1600 px uit een eerdere versie van deze doc was overkill.

De `feTurbulence` die hier stond, lag als *overlay* op `bg-vilt-licht`. Een kleurenfoto op die plek
duwt het palet weg, dus gaat er enkel de wolnop in: grijswaarde, hoogdoorlaat om het lichtverloop
van de foto eruit te filteren, en vier keer gespiegeld zodat de tegel naadloos is.

```bash
convert bron.png -crop 256x256+1100+510 +repage -colorspace Gray \
  \( +clone -blur 0x12 \) -compose Divide -composite \
  -contrast-stretch 0.4%x0.4% -normalize +level '36%,64%' /tmp/nop.png
convert /tmp/nop.png \( +clone -flop \) +append \( +clone -flip \) -append /tmp/tegel.png
cwebp -q 80 /tmp/tegel.png -o src/assets/vilt.webp
```

Het `-blur 0x12` gedeeld door zichzelf haalt het laagfrequente licht eruit. Zonder die stap trekt
`-normalize` het verloop van de uitsnede uit elkaar en zie je een kruis op de spiegelnaden.

Zet het pad relatief vanuit `src/`, niet als `/vilt.webp` in `public/`: Vite hasht en herschrijft
alleen relatieve verwijzingen mee met de `base` van GitHub Pages.

Wordt de tekst op de tafel slechter leesbaar, verlaag dan `background-size` van de tegel: kleiner
maakt de nop fijner en minder aanwezig.

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

1. Bewaar als `public/og.jpg`, exact 1200 x 630, onder de 300 kB. Midjourney levert op
   `--ar 1.91:1` een 1536 x 768, dus 2:1: eerst breedte weg snijden, dan schalen.

```bash
convert bron.png -gravity center -crop 1463x768+0+0 +repage -resize 1200x630! \
  -quality 82 -strip public/og.jpg
```

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
2. Omzetten met de `create-ico` skill, `-s 16,32,48`, uitvoer naar `public/favicon.ico`.
   Met de standaardmaten erbij weegt de 256-laag alleen al 190 kB en het web vraagt hem nooit op.
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

## Avatars uit de portretfoto's

De vier avatars in `public/spelers/`. Komen nu uit `scripts/avatars.py`: MediaPipe overdrijft de
kenmerken en er gaat een filter over. Dat blijft een bewerkte foto. Deze prompts maken er een
tekening van die nog steeds op de speler lijkt.

De foto staat in de prompt als omni reference. Sleep `players-raw/gert.jpg` in de imagine-balk,
Midjourney zet er een URL van, en daarachter komt de promptregel. Eén keer per speler, met
dezelfde promptregel, anders vallen de vier uiteen als set.

`--ow` regelt hoe letterlijk de gelijkenis is: 100 is los, 400 plakt tegen de foto aan. Voor een
karikatuur die nog herkenbaar is zit de bruikbare band tussen 150 en 250. Begin op 200.

### Gravure

Past bij het messing en de plaquettes. Eén lijnkleur, dus houdt zich goed op 44 px.

```
--oref <URL> --ow 200 engraved portrait of this person, copperplate line etching, cross-hatched shading, gently exaggerated features in the manner of a caricature, warm brass ink on a deep green-black ground, head and shoulders, centred, plain background --ar 1:1 --v 7 --style raw --stylize 80 --no text letters signature frame border hands cards
```

### Inkt-karikatuur

Losser, meer persoonlijkheid, minder streng dan de gravure.

```
--oref <URL> --ow 200 caricature portrait of this person in brush and ink, confident tapering strokes, features pushed just past life, a single wash of muted green behind the head, cream paper, head and shoulders, centred --ar 1:1 --v 7 --style raw --stylize 150 --no text letters signature frame border hands cards
```

### Olieverf

Warmst van de drie, maar de minste lijn: verliest het meest op 44 px.

```
--oref <URL> --ow 200 painted portrait of this person, Flemish old master lighting, one warm lamp from the upper left, deep green-black background, visible brushwork, slightly heightened features, head and shoulders, centred --ar 1:1 --v 7 --style raw --stylize 120 --no text letters signature frame border hands cards
```

**Referencen**

1. Kies één stijl en draai die voor alle vier de foto's. Twee stijlen door elkaar valt op.
2. Vierkant bijsnijden op het gezicht, dan naar 256 px.
3. Wegschrijven als `public/spelers/<voornaam>.webp`, kleine letters, geen accenten. De namen
   liggen vast in de ploeg: `gert`, `guido`, `lieve`, `wouter`.

```bash
bunx @squoosh/cli --resize '{"width":256,"height":256}' --webp '{"quality":80}' \
  -d public/spelers ~/Downloads/gert.png
```

`Avatar.tsx` zet er zelf `rounded-full` en `overflow-hidden` op, dus een vierkante WebP is genoeg;
het alfakanaal dat `scripts/avatars.py` erin snijdt is voor de weergave niet nodig.

Blijft `scripts/avatars.py` staan: die werkt zonder Midjourney-abonnement en voor een nieuwe
speler halverwege een avond is dat sneller dan vier keer wachten op een grid.

Weigert Midjourney `--oref` samen met een andere referentievlag, laat de andere dan vallen: de
gelijkenis is hier het punt. `--oref` vraagt `--v 7` en werkt niet in draft mode.

---

## Na het binnenhalen

De ruwe uitvoer staat in `docs/midjourney/`. Comprimeer naar `src/assets/` of `public/` voor je
commit; onbewerkte Midjourney-bestanden zijn enkele megabytes per stuk.

Vite houdt zijn transformaties in `node_modules/.vite`. Op deze Dropbox-schijf komen de mtimes niet
altijd door en bouwt hij dan met de oude bron verder: `dist/index.html` en de CSS bleven achter
terwijl `tsc` de nieuwe bestanden wel zag. Ruim die map op wanneer de build je wijziging negeert.

```bash
rm -rf dist node_modules/.vite && bun run build
```
