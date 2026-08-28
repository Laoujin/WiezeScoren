#!/usr/bin/env python3
"""Zet portretfoto's om in karikatuur-avatars voor de ploeg.

    .venv/bin/python scripts/avatars.py players-raw/*.jpg
    .venv/bin/python scripts/avatars.py players-raw/*.jpg --proefblad /tmp/stijlen.png

Per foto: gezichtspunten zoeken, de kenmerken overdrijven, er een tekening van maken, vierkant
uitsnijden en als ronde WebP wegschrijven naar public/spelers/.
"""

from __future__ import annotations

import argparse
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

# FaceMesh-punten per kenmerk. De indices liggen vast in het model van MediaPipe. Elk kenmerk
# heeft aparte groepen, want een bult krijgt zijn eigen middelpunt: beide ogen samen zou de
# neusbrug opblazen in plaats van de ogen.
KENMERKEN = {
    "ogen": [
        [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
    ],
    "neus": [[1, 2, 4, 5, 19, 94, 97, 98, 115, 326, 327, 344]],
    "mond": [[61, 291, 0, 17, 13, 14, 78, 308, 84, 314]],
    "kin": [[152, 148, 176, 149, 150, 377, 378, 379, 400, 175]],
    "schedel": [[10, 109, 67, 103, 54, 338, 297, 332, 284]],
}

# Hoe ver het veld rond een kenmerk doorwerkt, als factor op de straal van dat kenmerk.
BEREIK = {"ogen": 1.5, "neus": 1.6, "mond": 1.6, "kin": 1.7, "schedel": 2.0}

STANDAARD_OVERDRIJVING = {
    "ogen": 1.45,
    "neus": 1.40,
    "mond": 1.20,
    "kin": 1.20,
    "schedel": 1.25,
}

# De bewerkingen hangen aan vaste pixelmaten, dus elke foto gaat eerst naar dezelfde werkbreedte.
WERKMAAT = 900

UITVOER = Path("public/spelers")
MAAT = 256

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/1/face_landmarker.task"
)


@dataclass
class Gezicht:
    punten: np.ndarray
    kader: tuple[int, int, int, int]


def slug(naam: str) -> str:
    plat = unicodedata.normalize("NFKD", naam).encode("ascii", "ignore").decode()
    return "".join(c if c.isalnum() else "-" for c in plat.lower()).strip("-")


def haal_model() -> Path:
    doel = Path(sys.prefix) / "share" / "mediapipe" / "face_landmarker.task"
    if not doel.exists():
        from urllib.request import urlretrieve

        doel.parent.mkdir(parents=True, exist_ok=True)
        print(f"model ophalen naar {doel}", file=sys.stderr)
        urlretrieve(MODEL_URL, doel)
    return doel


def zoek_gezicht(afbeelding: np.ndarray) -> Gezicht | None:
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions
    from mediapipe.tasks.python.vision import FaceLandmarker, FaceLandmarkerOptions

    hoogte, breedte = afbeelding.shape[:2]
    opties = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(haal_model())), num_faces=1
    )
    with FaceLandmarker.create_from_options(opties) as zoeker:
        beeld = mp.Image(
            image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(afbeelding, cv2.COLOR_BGR2RGB)
        )
        uitkomst = zoeker.detect(beeld)

    if not uitkomst.face_landmarks:
        return None

    punten = np.array(
        [(p.x * breedte, p.y * hoogte) for p in uitkomst.face_landmarks[0]],
        dtype=np.float32,
    )
    x0, y0 = punten.min(axis=0)
    x1, y1 = punten.max(axis=0)
    return Gezicht(punten=punten, kader=(int(x0), int(y0), int(x1), int(y1)))


def overdrijf(
    afbeelding: np.ndarray, gezicht: Gezicht, sterkte: dict[str, float], factor: float
) -> np.ndarray:
    """Blaast elk kenmerk lokaal op.

    De velden van naburige kenmerken overlappen. Zonder normalisatie tellen ze daar op en smelt
    het gezicht, dus het totale gewicht per pixel wordt tot 1 teruggebracht.
    """
    hoogte, breedte = afbeelding.shape[:2]
    yy, xx = np.mgrid[0:hoogte, 0:breedte].astype(np.float32)

    velden = []
    totaal_gewicht = np.zeros_like(xx)
    for kenmerk, groepen in KENMERKEN.items():
        schaal = 1.0 + (sterkte.get(kenmerk, 1.0) - 1.0) * factor
        if schaal == 1.0:
            continue
        for punten in groepen:
            groep = gezicht.punten[punten]
            midden = groep.mean(axis=0)
            straal = float(np.linalg.norm(groep - midden, axis=1).max()) * BEREIK[kenmerk]
            if straal <= 0:
                continue

            dx = xx - midden[0]
            dy = yy - midden[1]
            t = np.clip(np.sqrt(dx * dx + dy * dy) / straal, 0.0, 1.0)
            gewicht = (1 - t) ** 2 * (1 + 2 * t)
            velden.append((dx, dy, gewicht, 1.0 / schaal - 1.0))
            totaal_gewicht += gewicht

    if not velden:
        return afbeelding

    demping = 1.0 / np.maximum(1.0, totaal_gewicht)
    verschuif_x = np.zeros_like(xx)
    verschuif_y = np.zeros_like(yy)
    for dx, dy, gewicht, kracht in velden:
        aandeel = gewicht * demping * kracht
        verschuif_x += dx * aandeel
        verschuif_y += dy * aandeel

    return cv2.remap(
        afbeelding,
        xx + verschuif_x,
        yy + verschuif_y,
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )


def _inkt(afbeelding: np.ndarray, drempel: tuple[int, int], dikte: int) -> np.ndarray:
    """Contourmasker: wit waar niets staat, zwart op de lijnen."""
    grijs = cv2.GaussianBlur(cv2.cvtColor(afbeelding, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    randen = cv2.Canny(grijs, *drempel)
    return cv2.dilate(randen, np.ones((dikte, dikte), np.uint8))


def _leg_op(vlakken: np.ndarray, randen: np.ndarray, sterkte: float) -> np.ndarray:
    inkt = (randen.astype(np.float32) / 255.0 * sterkte)[:, :, None]
    return np.clip(vlakken.astype(np.float32) * (1 - inkt), 0, 255).astype(np.uint8)


def stijl_penseel(afbeelding: np.ndarray) -> np.ndarray:
    """Geschilderde vlakken met dunne contouren."""
    return _leg_op(
        cv2.stylization(afbeelding, sigma_s=60, sigma_r=0.45), _inkt(afbeelding, (50, 130), 2), 0.85
    )


def stijl_inkt(afbeelding: np.ndarray) -> np.ndarray:
    """Stripverhaal: weinig platte kleuren, dikke zwarte lijnen."""
    glad = afbeelding
    for _ in range(2):
        glad = cv2.bilateralFilter(glad, d=9, sigmaColor=120, sigmaSpace=11)

    data = np.float32(glad).reshape(-1, 3)
    stop = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, label, centra = cv2.kmeans(data, 6, None, stop, 3, cv2.KMEANS_PP_CENTERS)
    vlakken = centra[label.flatten()].reshape(afbeelding.shape).astype(np.uint8)
    return _leg_op(vlakken, _inkt(afbeelding, (40, 110), 3), 1.0)


def stijl_potlood(afbeelding: np.ndarray) -> np.ndarray:
    """Kleurpotlood, zoals een tekenaar op een terras."""
    _, kleur = cv2.pencilSketch(afbeelding, sigma_s=60, sigma_r=0.07, shade_factor=0.05)
    return kleur


def stijl_pentekening(afbeelding: np.ndarray) -> np.ndarray:
    """Zwart-wit lijnwerk op papier, zonder kleurvlakken."""
    grijs, _ = cv2.pencilSketch(afbeelding, sigma_s=60, sigma_r=0.05, shade_factor=0.04)
    papier = np.array([232, 238, 245], dtype=np.float32)
    laag = grijs.astype(np.float32) / 255.0
    return np.clip(laag[:, :, None] * papier, 0, 255).astype(np.uint8)


def stijl_waterverf(afbeelding: np.ndarray) -> np.ndarray:
    """Lichte kleurwassing onder stevige inktlijnen."""
    wassing = cv2.stylization(afbeelding, sigma_s=90, sigma_r=0.6)
    verbleekt = np.clip(wassing.astype(np.float32) * 0.75 + 62, 0, 255).astype(np.uint8)
    return _leg_op(verbleekt, _inkt(afbeelding, (40, 115), 2), 1.0)


STIJLEN = {
    "penseel": stijl_penseel,
    "inkt": stijl_inkt,
    "potlood": stijl_potlood,
    "pentekening": stijl_pentekening,
    "waterverf": stijl_waterverf,
}


def snij_vierkant(afbeelding: np.ndarray, kader: tuple[int, int, int, int]) -> np.ndarray:
    """Vierkant rond het gezicht, met kruinruimte: het kader van FaceMesh stopt bij de haargrens."""
    hoogte, breedte = afbeelding.shape[:2]
    x0, y0, x1, y1 = kader
    zijde = int(max(x1 - x0, y1 - y0) * 1.9)
    midden_x = (x0 + x1) // 2
    midden_y = (y0 + y1) // 2 - int(zijde * 0.13)

    links = midden_x - zijde // 2
    boven = midden_y - zijde // 2
    rand = max(0, -links, -boven, links + zijde - breedte, boven + zijde - hoogte)
    if rand:
        afbeelding = cv2.copyMakeBorder(afbeelding, rand, rand, rand, rand, cv2.BORDER_REPLICATE)
        links += rand
        boven += rand

    return afbeelding[boven : boven + zijde, links : links + zijde]


def rond(afbeelding: np.ndarray) -> np.ndarray:
    zijde = afbeelding.shape[0]
    masker = np.zeros((zijde, zijde), dtype=np.uint8)
    cv2.circle(masker, (zijde // 2, zijde // 2), zijde // 2, 255, -1, lineType=cv2.LINE_AA)
    return np.dstack([afbeelding, masker])


def portret(pad: Path, sterkte: dict[str, float], factor: float, stijl: str) -> np.ndarray:
    afbeelding = cv2.imread(str(pad), cv2.IMREAD_COLOR)
    if afbeelding is None:
        raise SystemExit(f"kan {pad} niet lezen")

    krimp = WERKMAAT / max(afbeelding.shape[:2])
    if krimp < 1:
        afbeelding = cv2.resize(afbeelding, None, fx=krimp, fy=krimp, interpolation=cv2.INTER_AREA)

    gezicht = zoek_gezicht(afbeelding)
    if gezicht is None:
        raise SystemExit(f"geen gezicht gevonden in {pad}")

    getekend = STIJLEN[stijl](overdrijf(afbeelding, gezicht, sterkte, factor))
    vierkant = snij_vierkant(getekend, gezicht.kader)
    return cv2.resize(vierkant, (MAAT, MAAT), interpolation=cv2.INTER_AREA)


def proefblad(
    fotos: list[Path], sterkte: dict[str, float], factor: float, doel: Path
) -> Path:
    """Alle stijlen naast elkaar, één rij per stijl, zodat er iets te kiezen valt."""
    kop = 34
    rand = 8
    breedte = rand + len(fotos) * (MAAT + rand)
    hoogte = kop + len(STIJLEN) * (MAAT + kop)
    blad = np.full((hoogte, breedte, 3), 24, dtype=np.uint8)

    for kolom, foto in enumerate(fotos):
        x = rand + kolom * (MAAT + rand)
        cv2.putText(
            blad, foto.stem, (x, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (210, 210, 210), 2
        )

    for rij, stijl in enumerate(STIJLEN):
        y = kop + rij * (MAAT + kop)
        cv2.putText(
            blad, stijl, (rand, y + MAAT + 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (90, 200, 250), 2
        )
        for kolom, foto in enumerate(fotos):
            x = rand + kolom * (MAAT + rand)
            blad[y : y + MAAT, x : x + MAAT] = portret(foto, sterkte, factor, stijl)

    doel.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(doel), blad)
    return doel


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("fotos", nargs="+", type=Path)
    parser.add_argument("--uit", type=Path, default=UITVOER)
    parser.add_argument("--stijl", choices=sorted(STIJLEN), default="penseel")
    parser.add_argument(
        "--overdrijving", type=float, default=1.0, help="schaalt alle kenmerken tegelijk"
    )
    parser.add_argument("--proefblad", type=Path, help="alle stijlen naast elkaar in één PNG")
    for kenmerk, waarde in STANDAARD_OVERDRIJVING.items():
        parser.add_argument(f"--{kenmerk}", type=float, default=waarde)
    argumenten = parser.parse_args()

    sterkte = {kenmerk: getattr(argumenten, kenmerk) for kenmerk in STANDAARD_OVERDRIJVING}

    if argumenten.proefblad:
        print(proefblad(argumenten.fotos, sterkte, argumenten.overdrijving, argumenten.proefblad))
        return 0

    argumenten.uit.mkdir(parents=True, exist_ok=True)
    for foto in argumenten.fotos:
        doel = argumenten.uit / f"{slug(foto.stem)}.webp"
        beeld = portret(foto, sterkte, argumenten.overdrijving, argumenten.stijl)
        cv2.imwrite(str(doel), rond(beeld))
        print(doel)
    return 0


if __name__ == "__main__":
    sys.exit(main())
