"""
Builds the draped satin cover used by the hero from the bike photo's own silhouette, so it traces the screen, tank, tail and wheels.
Run from the repo root after changing public/images/bikes/r15m.png:  python3 scripts/make-cover.py
Needs: pip install numpy scipy pillow.  Then update BIKE_PHOTOS.r15.cover (width / height / pad) in src/lib/data.ts if they changed.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/bikes/r15m.png"
OUT = ROOT / "public/images/bikes/r15m-cover.webp"
P = 48                                     # padding: the cover is bigger than the bike
rng = np.random.default_rng(15)

bike = Image.open(SRC).convert("RGBA")
W, H = bike.size
A = np.pad(np.asarray(bike.getchannel("A")).astype(np.float32) / 255.0, P)
h, w = A.shape
sil = A > 0.3

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r

# 1. fabric can't follow deep concavities: inflate, then bridge gaps with a big closing, fill holes
M = ndi.binary_dilation(sil, structure=disk(15))
M = ndi.binary_closing(np.pad(M, 60), structure=disk(46))[60:-60, 60:-60]
M = ndi.binary_fill_holes(M)
Mf = ndi.gaussian_filter(M.astype(np.float32), 7)      # round the silhouette
M = Mf > 0.5
alpha = ndi.gaussian_filter(M.astype(np.float32), 1.4)

# 2. height field: a rounded tent plus pleats that hang from the high points toward the hem
D = ndi.distance_transform_edt(M)
Ds = ndi.gaussian_filter(D, 16)                          # smooth the ridge so there is no crease down the middle
Dn = Ds / Ds.max()
hb = (1 - np.exp(-Ds / 34.0)) + 0.4 * Dn
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
def warp(sig):
    f = ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), sig)
    return f / f.std()
folds = np.zeros((h, w), np.float32)
for lam, ang, amp, sig in [(158, 0, 1.0, 80), (104, 9, 0.5, 56), (236, -15, 0.7, 100)]:
    t = np.deg2rad(ang)
    phase = 2 * np.pi * (xx * np.cos(t) + yy * np.sin(t)) / lam + warp(sig) * 1.7
    folds += amp * np.sin(phase)
env = 0.22 + 0.78 * np.exp(-D / 80.0)                   # pleats are strongest near the hem
height = hb * 36.0 + env * folds * 6.4
height = ndi.gaussian_filter(height, 2.6)

# 3. light it: satin = soft diffuse plus a tight specular
gy, gx = np.gradient(height)
n = np.dstack([-gx, -gy, np.ones_like(height)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.55, -0.62, 0.56]); L /= np.linalg.norm(L)
Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
diff = np.clip(n @ L, 0, 1)
spec = np.clip(n @ Hv, 0, 1) ** 26
dark = np.array([8, 11, 24], np.float32); mid = np.array([27, 43, 104], np.float32); hi = np.array([158, 184, 248], np.float32)
col = dark + (mid - dark) * np.clip(diff ** 0.85 * 1.18 - 0.1, 0, 1)[..., None] + hi * (spec * 0.5)[..., None]
ao = np.clip(D / 14.0, 0, 1) ** 0.8                      # hem tucks into shadow
col *= (0.52 + 0.48 * ao)[..., None]
rim = np.clip(1 - D / 3.0, 0, 1)[..., None]               # catch-light along the very edge
col += rim * np.array([120, 150, 215], np.float32) * 0.5
col += ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), 0.7)[..., None] * 3.0   # fine weave grain

out = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, "RGBA")
im.save(OUT, "WEBP", quality=84, alpha_quality=100, method=6)
print("cover", im.size, "pad", P, "bike", (W, H), "bytes", OUT.stat().st_size)
