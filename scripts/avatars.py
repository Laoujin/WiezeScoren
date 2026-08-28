#!/usr/bin/env python3
"""Zet portretfoto's om in karikatuur-avatars voor de ploeg.

    .venv/bin/python scripts/avatars.py foto/*.jpg

Per foto: gezichtspunten zoeken, de kenmerken overdrijven, de foto naar vlakken en lijnen
brengen, vierkant uitsnijden en als ronde WebP wegschrijven naar public/spelers/.
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

# Hoe ver het veld rond een kenmerk doorwerkt, als factor op de straal van dat kenmerk. Ruimer
# dan dit laten de velden elkaar overlappen en smelt het gezicht.
BEREIK = {"ogen": 1.5, "neus": 1.6, "mond": 1.6, "kin": 1.7, "schedel": 1.8}

STANDAARD_OVERDRIJVING = {
    "ogen": 1.35,
    "neus": 1.30,
    "mond": 1.15,
    "kin": 1.15,
    "schedel": 1.12,
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


def overdrijf(afbeelding: np.ndarray, gezicht: Gezicht, sterkte: dict[str, float]) -> np.ndarray:
    """Blaast elk kenmerk lokaal op. De uitdoving loopt naar nul, zodat de randen stil blijven."""
    hoogte, breedte = afbeelding.shape[:2]
    yy, xx = np.mgrid[0:hoogte, 0:breedte].astype(np.float32)
    verschuif_x = np.zeros_like(xx)
    verschuif_y = np.zeros_like(yy)

    for kenmerk, groepen in KENMERKEN.items():
        schaal = sterkte.get(kenmerk, 1.0)
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
            factor = (1.0 / schaal - 1.0) * gewicht
            verschuif_x += dx * factor
            verschuif_y += dy * factor

    return cv2.remap(
        afbeelding,
        xx + verschuif_x,
        yy + verschuif_y,
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )


def teken(afbeelding: np.ndarray, lijnsterkte: float) -> np.ndarray:
    """Penseelvlakken met zwarte lijnen erover, de klassieke cartoonbewerking."""
    vlakken = cv2.stylization(afbeelding, sigma_s=60, sigma_r=0.45)

    # De lijnen komen van het originele beeld: `stylization` heeft de randen al zachter gemaakt.
    grijs = cv2.GaussianBlur(cv2.cvtColor(afbeelding, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    randen = cv2.Canny(grijs, 50, 130)
    randen = cv2.dilate(randen, np.ones((2, 2), np.uint8))
    inkt = (randen.astype(np.float32) / 255.0 * lijnsterkte)[:, :, None]
    return np.clip(vlakken.astype(np.float32) * (1 - inkt), 0, 255).astype(np.uint8)


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
        afbeelding = cv2.copyMakeBorder(
            afbeelding, rand, rand, rand, rand, cv2.BORDER_REPLICATE
        )
        links += rand
        boven += rand

    return afbeelding[boven : boven + zijde, links : links + zijde]


def rond(afbeelding: np.ndarray) -> np.ndarray:
    zijde = afbeelding.shape[0]
    masker = np.zeros((zijde, zijde), dtype=np.uint8)
    cv2.circle(masker, (zijde // 2, zijde // 2), zijde // 2, 255, -1, lineType=cv2.LINE_AA)
    return np.dstack([afbeelding, masker])


def verwerk(pad: Path, uit: Path, sterkte: dict[str, float], lijnsterkte: float) -> Path:
    afbeelding = cv2.imread(str(pad), cv2.IMREAD_COLOR)
    if afbeelding is None:
        raise SystemExit(f"kan {pad} niet lezen")

    krimp = WERKMAAT / max(afbeelding.shape[:2])
    if krimp < 1:
        afbeelding = cv2.resize(afbeelding, None, fx=krimp, fy=krimp, interpolation=cv2.INTER_AREA)

    gezicht = zoek_gezicht(afbeelding)
    if gezicht is None:
        raise SystemExit(f"geen gezicht gevonden in {pad}")

    getekend = teken(overdrijf(afbeelding, gezicht, sterkte), lijnsterkte)
    vierkant = snij_vierkant(getekend, gezicht.kader)

    uit.mkdir(parents=True, exist_ok=True)
    doel = uit / f"{slug(pad.stem)}.webp"
    cv2.imwrite(str(doel), rond(cv2.resize(vierkant, (MAAT, MAAT), cv2.INTER_AREA)))
    return doel


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("fotos", nargs="+", type=Path)
    parser.add_argument("--uit", type=Path, default=UITVOER)
    parser.add_argument("--lijnen", type=float, default=0.85, help="hoe zwart de contourlijnen zijn")
    for kenmerk, waarde in STANDAARD_OVERDRIJVING.items():
        parser.add_argument(f"--{kenmerk}", type=float, default=waarde)
    argumenten = parser.parse_args()

    sterkte = {kenmerk: getattr(argumenten, kenmerk) for kenmerk in STANDAARD_OVERDRIJVING}
    for foto in argumenten.fotos:
        print(verwerk(foto, argumenten.uit, sterkte, argumenten.lijnen))
    return 0


if __name__ == "__main__":
    sys.exit(main())
