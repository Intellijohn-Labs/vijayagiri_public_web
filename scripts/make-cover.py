"""
Builds the draped cloth cover used by the hero from the bike photo's own silhouette.

Real fabric thrown over a bike behaves in a few simple ways, and this models them:
  * it rests on the highest contour (screen, mirrors, tank, tail) and falls away from each peak at a steep angle, so the
    outline over the top is sharp and tent-like, not inflated;
  * below that it hangs close to vertically to the ground, in heavy pleats that deepen toward the hem;
  * the hem pools on the floor.

Run from the repo root after changing public/images/bikes/r15m.png:  python3 scripts/make-cover.py
Needs: pip install numpy scipy pillow.  The output file name includes a hash of its contents and src/lib/data.ts is updated to match, so browsers and
Next's image cache can never keep serving an older cover from the same URL.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/bikes/r15m.png"
OUT_DIR = ROOT / "public/images/bikes"
DATA = ROOT / "src/lib/data.ts"
P = 48                                      # the cover is a little bigger than the photo (hem pools past the tyres)
rng = np.random.default_rng(7)

bike = Image.open(SRC).convert("RGBA")
W, H = bike.size
A = np.pad(np.asarray(bike.getchannel("A")).astype(np.float32) / 255.0, P)
h, w = A.shape
sil = A > 0.3
xs_idx = np.arange(w, dtype=np.float32)
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

# 1. the top contour the cloth rests on, relaxed so each peak falls away at a steep angle (a tent over mirrors, screen, tank)
cols = sil.any(axis=0)
x_min, x_max = int(np.argmax(cols)), int(w - 1 - np.argmax(cols[::-1]))
ytop = np.where(cols, np.argmax(sil, axis=0).astype(np.float32), np.float32(h * 3))
SLOPE = 3.0
ycl = ytop.copy()
for x in range(1, w):                       # forward then backward pass = lower envelope of cones
    ycl[x] = min(ycl[x], ycl[x - 1] + SLOPE)
for x in range(w - 2, -1, -1):
    ycl[x] = min(ycl[x], ycl[x + 1] + SLOPE)
ycl = ndi.gaussian_filter1d(ycl, 2.2) - 7.0   # cloth has thickness, so it sits just above what it covers

# 2. ground and hem: the cloth hangs down to the floor and pools in a wavy line
y_ground = float(np.where(sil.any(axis=1))[0].max()) - 2.0
hem = y_ground + 5.0 + 5.5 * np.abs(np.sin(xs_idx / 41.0 + 0.7)) + 2.5 * np.sin(xs_idx / 13.0 + 2.0)
xa, xb = x_min - 12, x_max + 12            # near-vertical sides: it hangs straight from the extreme points
inside = (xx >= xa) & (xx <= xb) & (yy >= ycl[None, :]) & (yy <= hem[None, :])
inside = ndi.binary_opening(inside, structure=np.ones((3, 3)))
alpha = ndi.gaussian_filter(inside.astype(np.float32), 0.9)

# 3. surface: it swells over the bike's body, and hangs in vertical pleats that deepen toward the floor
bulge = ndi.gaussian_filter(A, 20) * 40.0
depth = np.clip((yy - ycl[None, :]) / 110.0, 0, 1)             # pleats start a little below the contour
depth = depth * depth * (3 - 2 * depth)
_t = np.clip((yy - (y_ground - 360.0)) / 360.0, 0, 1)
hang = 0.85 + 0.95 * (_t * _t * (3 - 2 * _t))                  # and get heavier near the hem (smooth, so no seam)

def smooth1d(sig):
    f = ndi.gaussian_filter1d(rng.standard_normal(w).astype(np.float32), sig)
    return f / f.std()

# curtain pleats: evenly spaced, rounded ridges whose spacing and lean wander slowly, so they never look machine-made
lam = np.clip(118.0 * (1.0 + 0.16 * smooth1d(80)), 90.0, 150.0)
phase_x = 2 * np.pi * np.cumsum(1.0 / lam).astype(np.float32)
lean = smooth1d(90)
xw = xx + 13.0 * np.sin(yy / 150.0 + 2.2 * lean[None, :]) + 0.035 * (yy - y_ground * 0.4) * lean[None, :]
phase = np.interp(np.clip(xw, 0, w - 1), xs_idx, phase_x)
pleats = 0.7 * np.cos(phase) + 0.3 * np.cos(2 * phase + 1.3)
# a few big, soft irregular folds so the drape is not a perfect fan
soft = np.zeros((h, w), np.float32)
for x0 in np.sort(rng.uniform(x_min, x_max, 6)):
    sg = rng.uniform(34, 56); amp = rng.uniform(3.5, 6.5) * rng.choice([-1, 1]); dr = rng.uniform(-0.18, 0.18)
    cx = x0 + dr * (yy - y_ground * 0.4) + 8 * np.sin(yy / rng.uniform(90, 150) + rng.uniform(0, 6.28))
    soft += amp * np.exp(-((xx - cx) ** 2) / (2 * sg ** 2))
# two broad drag folds sweeping back from the windscreen and tank, where the cloth was pulled over
drag = np.zeros((h, w), np.float32)
for px, sl in [(x_max - 110, 0.55), (x_min + 520, 0.42)]:
    y0 = ycl[int(np.clip(px, 0, w - 1))]
    cx = px - sl * (yy - y0)
    drag += 6.0 * np.exp(-((xx - cx) ** 2) / (2 * 20.0 ** 2)) * np.clip((yy - y0) / 80.0, 0, 1)
micro = ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), 8) * 1.4
z = bulge + (pleats * 12.5 + soft) * depth * hang + drag + micro * depth
z = ndi.gaussian_filter(z, 1.3)

# 4. light it like satin: soft key from the upper left, creases fall into shadow, a broad sheen rides the ridges
gy, gx = np.gradient(z)
n = np.dstack([-gx * 1.1, -gy * 1.1, np.ones_like(z)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.5, -0.55, 0.67]); L /= np.linalg.norm(L)
Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
diff = np.clip(n @ L, 0, 1)
spec = np.clip(n @ Hv, 0, 1) ** 14
valley = np.clip((ndi.gaussian_filter(z, 11) - z) / 6.0, 0, 1)   # creases and valleys are darker
shadow_c = np.array([104, 104, 120], np.float32); light_c = np.array([243, 239, 229], np.float32)
t = np.clip(0.22 + 0.92 * diff ** 1.1, 0, 1) * (1 - 0.36 * valley)
col = shadow_c + (light_c - shadow_c) * t[..., None] + (spec * 26)[..., None]
# where the cloth rests on the bike it is a touch darker (it is in the bike's shadow), then lighter as it falls free
col *= (0.84 + 0.16 * np.clip(depth * 1.5, 0, 1))[..., None]
dist = ndi.distance_transform_edt(inside)
col *= (0.62 + 0.38 * np.clip(dist / 9.0, 0, 1))[..., None]      # edges and hem tuck into shadow
col += (np.clip(1 - dist / 2.2, 0, 1) * 18)[..., None]            # a thin catch-light on the cut edge
col += ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), 0.6)[..., None] * 2.2   # weave grain

out = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, "RGBA")
import hashlib, io, re
buf = io.BytesIO()
im.save(buf, "WEBP", quality=86, alpha_quality=100, method=6)
digest = hashlib.md5(buf.getvalue()).hexdigest()[:8]
name = f"r15m-cover.{digest}.webp"
for old in OUT_DIR.glob("r15m-cover*.webp"):          # drop previous covers so an old URL cannot resolve
    old.unlink()
(OUT_DIR / name).write_bytes(buf.getvalue())
OUT = OUT_DIR / name
text = DATA.read_text()
text, n = re.subn(r'cover: \{ src: "[^"]*", width: \d+, height: \d+, pad: \d+ \}', f'cover: {{ src: "/images/bikes/{name}", width: {im.width}, height: {im.height}, pad: {P} }}', text)
if n != 1:
    raise SystemExit("could not find BIKE_PHOTOS.r15.cover in src/lib/data.ts: update it by hand")
DATA.write_text(text)
print("cover", im.size, "pad", P, "bike", (W, H), "->", OUT.name, f"({OUT.stat().st_size} bytes); data.ts updated")
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:                    # optional: python3 scripts/make-cover.py preview.png  -> bike / covered / cloth only
        bg = Image.new("RGBA", im.size, (7, 11, 26, 255))
        a = bg.copy(); a.alpha_composite(bike, (P, P))
        b = bg.copy(); b.alpha_composite(bike, (P, P)); b.alpha_composite(im)
        sheet = Image.new("RGB", (im.width * 2 + 10, im.height), (60, 60, 60))
        sheet.paste(a.convert("RGB"), (0, 0)); sheet.paste(b.convert("RGB"), (im.width + 10, 0)); sheet.save(sys.argv[1])
