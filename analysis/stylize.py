# stylize.py: turn the key frame renders into style studies for the next video.
# Inputs: out/styles/base/t0_50.jpg (watercolour), t1_50.jpg (neon), t2_50.jpg (neon + doodles)
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

B = 'out/styles/base/'; O = 'out/styles/'
wc = cv2.imread(B + 't0_50.jpg'); ne = cv2.imread(B + 't1_50.jpg'); dd = cv2.imread(B + 't2_50.jpg')
wcc = cv2.imread(B + 't3_50.jpg'); nec = cv2.imread(B + 't4_50.jpg')
H, W = ne.shape[:2]
rng = np.random.default_rng(7)
def f32(a): return a.astype(np.float32) / 255
def u8(a): return (np.clip(a, 0, 1) * 255).astype(np.uint8)
def lum(bgr): return f32(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY))
def paper(tone=(0.957, 0.933, 0.875), grain=0.05, seed=1):
    r = np.random.default_rng(seed)
    n = cv2.GaussianBlur(r.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.2)
    fib = cv2.GaussianBlur(r.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 18)
    base = np.ones((H, W, 3), np.float32) * np.array(tone[::-1], np.float32)
    return np.clip(base * (1 + grain * n[..., None] + 0.04 * fib[..., None]), 0, 1)
def halftone(density, cell=8, ang=15, shape='dot'):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.deg2rad(ang); u = x * np.cos(a) + y * np.sin(a); v = -x * np.sin(a) + y * np.cos(a)
    fu = (u / cell) % 1 - .5; fv = (v / cell) % 1 - .5
    d = np.sqrt(fu ** 2 + fv ** 2) / 0.7071 if shape == 'dot' else np.abs(fv) * 2
    return (d < np.sqrt(np.clip(density, 0, 1)) * 1.02).astype(np.float32)

# 1 · risograph: fluorescent pink + teal on cream, misregistered halftones
def riso():
    L = cv2.GaussianBlur(lum(ne), (0, 0), 1.5); b, g, r = [c for c in cv2.split(f32(ne))]
    teal = np.clip((1 - L) ** 1.1 * 1.05 - 0.05, 0, 1)
    pink = np.clip((r - (g + b) / 2) * 2.2 + (b - g) * 0.6 + (1 - L) * 0.15, 0, 1)
    pink = cv2.GaussianBlur(pink, (0, 0), 1.5)
    t1 = halftone(teal, 7, 15); t2 = halftone(pink, 7, 75)
    M = np.float32([[1, 0, 5], [0, 1, -3]]); t2 = cv2.warpAffine(t2, M, (W, H))
    ink_teal = np.array([0.55, 0.47, 0.0])[::-1] * 0 + np.array([138, 121, 0])[::-1] / 255   # BGR of #00798A
    ink_teal = np.array([0x8A, 0x79, 0x00]) / 255
    ink_pink = np.array([0xA8, 0x48, 0xFF]) / 255
    p = paper((0.96, 0.94, 0.89), 0.06, 2)
    out = p * (1 - 0.88 * t1[..., None] * (1 - ink_teal)) * (1 - 0.85 * t2[..., None] * (1 - ink_pink))
    return u8(out)

# 2 · charcoal / graphite on paper
def charcoal():
    g = lum(wc); inv = 1 - g; bl = cv2.GaussianBlur(inv, (0, 0), 9)
    sk = np.clip(g / np.maximum(1 - bl, 1e-3), 0, 1)
    sk = np.clip((sk - 0.35) / 0.65, 0, 1) ** 1.6
    dark = cv2.GaussianBlur(1 - g, (0, 0), 3)
    y, x = np.mgrid[0:H, 0:W]
    h1 = ((x + y) % 11 < 2).astype(np.float32); h2 = ((x - y) % 13 < 2).astype(np.float32); h3 = (y % 9 < 2).astype(np.float32)
    jitter = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 2) > -0.3
    hatch = (h1 * (dark > .35) + h2 * (dark > .55) + h3 * (dark > .72)) * jitter
    smudge = cv2.GaussianBlur(dark, (0, 0), 14) * 0.35
    tone = np.clip(sk * (1 - 0.5 * np.clip(hatch, 0, 1)) - smudge * 0.6, 0, 1)
    p = paper((0.95, 0.93, 0.89), 0.08, 3)
    graphite = np.array([0.20, 0.19, 0.18])
    out = p * (tone[..., None] + (1 - tone[..., None]) * graphite)
    return u8(out)

# 3 · manga screentone (black and white)
def manga():
    g = cv2.GaussianBlur(lum(ne), (0, 0), 1.2)
    g = np.clip((g - g.min()) / (np.percentile(g, 99.5) - g.min()), 0, 1) ** 0.7
    ed = cv2.Canny(u8(cv2.GaussianBlur(lum(ne), (0, 0), 1.6)), 30, 80)
    ed = cv2.dilate(ed, np.ones((2, 2), np.uint8)).astype(np.float32) / 255
    tone = np.ones_like(g)
    light = (g < .75) & (g >= .5); mid = (g < .5) & (g >= .28); dark = g < .28
    tone[light] = 1 - halftone(np.full((H, W), .22, np.float32), 6, 45)[light]
    tone[mid] = 1 - halftone(np.full((H, W), .5, np.float32), 6, 45)[mid]
    tone[dark] = 0.02 + 0.1 * halftone(np.full((H, W), .15, np.float32), 5, 45)[dark]
    out = np.clip(tone - ed, 0, 1)
    p = paper((0.97, 0.965, 0.95), 0.03, 4)
    return u8(p * out[..., None])

# 4 · 16-bit pixel art: downscale, fixed synthwave palette, ordered dithering
def pixel():
    f = 6; sw, sh = W // f, H // f
    small = cv2.resize(nec, (sw, sh), interpolation=cv2.INTER_AREA).astype(np.float32)
    pal_hex = ['0b0716', '1a1033', '2b1e5c', '3a2a78', '5a3a9a', '8a5ac8', 'ff2e88', 'ff6fb5', 'ff8a1f', 'ffd27a', 'f5f03a',
               '27f2f2', '1a8a9a', '0e4a5a', '48ff8a', '2a6a3a', 'f1c9a5', 'a0607a', 'fff6e6', '9fc7ff', '5a6e9a', '3a3a4e', 'c8d2ff', '6c7cff']
    pal = np.array([[int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)] for h in pal_hex], np.float32)
    bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16 - .5
    thr = np.tile(bayer, (sh // 4 + 1, sw // 4 + 1))[:sh, :sw][..., None] * 28
    q = small + thr
    d = ((q[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    idx = d.argmin(-1); out = pal[idx].astype(np.uint8)
    return cv2.resize(out, (W, H), interpolation=cv2.INTER_NEAREST)

# 5 · VHS / 80s synthpop tape
def vhs():
    img = cv2.GaussianBlur(ne, (0, 0), 1.1)
    yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV).astype(np.float32)
    for c in (1, 2):
        ch = cv2.blur(yuv[..., c], (31, 3)); yuv[..., c] = np.roll(ch, 7, axis=1)
    yuv[..., 1] = 128 + (yuv[..., 1] - 128) * 1.25; yuv[..., 2] = 128 + (yuv[..., 2] - 128) * 1.3
    Y = yuv[..., 0]; Y = Y + (Y - cv2.GaussianBlur(Y, (0, 0), 3)) * 0.8
    Y = Y + rng.normal(0, 7, Y.shape).astype(np.float32); yuv[..., 0] = Y
    out = cv2.cvtColor(np.clip(yuv, 0, 255).astype(np.uint8), cv2.COLOR_YUV2BGR).astype(np.float32)
    out[::3] *= 0.86
    # tracking band
    y0 = int(H * .82); band = slice(y0, y0 + 26)
    out[band] = np.roll(out[band], 38, axis=1) * 0.9 + rng.normal(0, 30, out[band].shape)
    for i in range(6): yy = y0 + 30 + i * 5; out[yy:yy + 1] = np.roll(out[yy:yy + 1], int(rng.integers(-60, 60)), axis=1)
    # warm magenta grade + vignette
    out = out * np.array([0.92, 0.9, 1.08]) + np.array([10, 0, 14])
    yy, xx = np.mgrid[0:H, 0:W]; v = 1 - 0.35 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    out = np.clip(out * v[..., None], 0, 255).astype(np.uint8)
    pil = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)); dr = ImageDraw.Draw(pil)
    fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 54)
    for dx, dy, col in ((3, 3, (0, 0, 0)), (0, 0, (240, 240, 240))):
        dr.text((80 + dx, 70 + dy), 'PLAY ▶', font=fnt, fill=col)
        dr.text((1270 + dx, 950 + dy), 'SEP 24 2026', font=fnt, fill=col)
        dr.text((80 + dx, 950 + dy), 'SP  0:02:47', font=fnt, fill=col)
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

# 6 · sumi-e ink wash on rice paper, one red accent (the moon) and a seal
def sumie():
    g = lum(wc)
    sm = cv2.bilateralFilter(u8(g), 11, 60, 9).astype(np.float32) / 255
    levels = np.array([0.12, 0.35, 0.6, 0.82, 0.97])
    q = levels[np.clip(np.digitize(sm, [0.25, 0.45, 0.62, 0.8]), 0, 4)]
    q = cv2.GaussianBlur(q.astype(np.float32), (0, 0), 2.2)
    bleed = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 6) * 0.05
    q = np.clip(q + bleed, 0, 1)
    ed = cv2.Canny(u8(cv2.GaussianBlur(g, (0, 0), 2)), 25, 70).astype(np.float32) / 255
    ed = cv2.GaussianBlur(cv2.dilate(ed, np.ones((3, 3), np.uint8)), (0, 0), 1.1)
    tone = np.clip(q - ed * 0.85, 0, 1)
    p = paper((0.95, 0.92, 0.85), 0.07, 5)
    ink = np.array([0.1, 0.1, 0.12])
    out = p * (tone[..., None] + (1 - tone[..., None]) * ink)
    # the red moon + seal
    yy, xx = np.mgrid[0:H, 0:W]; mx, my, mr = 380 + 1160 * .78, 110 + 600 * .2, 70
    wob = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 4) * 5
    moon = np.clip((mr - np.sqrt((xx - mx) ** 2 + (yy - my) ** 2) + wob) / 3, 0, 1) * 0.9
    red = np.array([0x2A, 0x2A, 0xC8]) / 255
    out = out * (1 - moon[..., None]) + (p * red) * moon[..., None]
    sx, sy, s = 1690, 900, 110
    seal = ((xx > sx) & (xx < sx + s) & (yy > sy) & (yy < sy + s) & (cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.5) > -1.2)).astype(np.float32)
    out = out * (1 - seal[..., None] * .9) + (p * red) * seal[..., None] * .9
    pil = Image.fromarray(cv2.cvtColor(u8(out), cv2.COLOR_BGR2RGB)); dr = ImageDraw.Draw(pil)
    fnt = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 78) if __import__('os').path.exists('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf') else ImageFont.load_default()
    dr.text((sx + 16, sy + 12), '月', font=fnt, fill=(245, 235, 220))
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)


def eq(bgr, clip=2.5):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY); c = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(g)
    return c.astype(np.float32) / 255
def xdog(L, s=1.0, k=1.6, tau=.985, phi=160, eps=0.0):
    g1 = cv2.GaussianBlur(L, (0, 0), s); g2 = cv2.GaussianBlur(L, (0, 0), s * k); D = g1 - tau * g2
    return np.where(D >= eps, 1.0, 1 + np.tanh(phi * (D - eps))).astype(np.float32)

def riso():
    Le = cv2.GaussianBlur(eq(nec, 3), (0, 0), 1.2); b, g, r = cv2.split(f32(nec))
    blue = np.clip((1 - Le) * 1.2 - 0.38, 0, 1) ** 1.2
    warm = np.clip((r - g) * 1.6 + (b - g) * 0.4, 0, 1)
    pink = np.clip(warm * 1.3 + (1 - Le) * 0.25 - 0.08, 0, 1)
    t1 = halftone(blue, 6, 15); t2 = halftone(pink, 6, 75)
    t2 = cv2.warpAffine(t2, np.float32([[1, 0, 4], [0, 1, -3]]), (W, H))
    ink_blue = np.array([0xBF, 0x78, 0x00]) / 255; ink_pink = np.array([0xB0, 0x48, 0xFF]) / 255
    p = paper((0.965, 0.95, 0.915), 0.06, 2)
    out = p * (1 - 0.9 * t1[..., None] * (1 - ink_blue)) * (1 - 0.88 * t2[..., None] * (1 - ink_pink))
    return u8(out)

def charcoal():
    L = lum(wcc); Le = eq(wcc, 2.0)
    lines = xdog(cv2.GaussianBlur(Le, (0, 0), .6), 1.1, 1.7, .99, 90)
    tone = 0.5 + 0.5 * cv2.GaussianBlur(Le, (0, 0), 5) ** 1.3
    y, x = np.mgrid[0:H, 0:W]
    dark = cv2.GaussianBlur(1 - Le, (0, 0), 4)
    hatch = ((x + y) % 10 < 2) * (dark > .72) + ((x - y) % 12 < 2) * (dark > .84)
    smudge = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 20) * 0.04
    out = np.clip(tone * (1 - 0.35 * hatch) * (0.15 + 0.85 * lines) + smudge, 0, 1)
    p = paper((0.955, 0.94, 0.905), 0.07, 3)
    graphite = np.array([0.24, 0.23, 0.22])
    return u8(p * (out[..., None] + (1 - out[..., None]) * graphite))

def manga():
    Le = cv2.GaussianBlur(eq(nec, 3.0), (0, 0), 1.0)
    lines = xdog(eq(nec, 2.0), 1.0, 1.6, .98, 220)
    tone = np.ones_like(Le)
    l1 = (Le < .62) & (Le >= .42); l2 = (Le < .42) & (Le >= .22); l3 = Le < .22
    tone[l1] = 1 - halftone(np.full((H, W), .16, np.float32), 6, 45)[l1]
    tone[l2] = 1 - halftone(np.full((H, W), .45, np.float32), 6, 45)[l2]
    tone[l3] = 0.03
    out = np.clip(tone * lines, 0, 1)
    p = paper((0.975, 0.97, 0.955), 0.025, 4)
    return u8(p * out[..., None])

def sumie():
    Le = eq(nec, 2.2)
    sm = cv2.bilateralFilter(u8(Le), 13, 70, 11).astype(np.float32) / 255
    dens = np.clip(1 - sm, 0, 1) ** 1.35
    levels = np.array([0.0, 0.25, 0.5, 0.78, 0.95])
    q = levels[np.clip(np.digitize(dens, [0.2, 0.42, 0.62, 0.8]), 0, 4)]
    q = cv2.GaussianBlur(q.astype(np.float32), (0, 0), 3.0)
    q = np.clip(q + cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 7) * 0.06, 0, 1)
    lines = xdog(cv2.GaussianBlur(Le, (0, 0), 1.2), 1.4, 1.6, .985, 70)
    tone = np.clip((1 - q * 0.92) * (0.2 + 0.8 * lines), 0, 1)
    p = paper((0.955, 0.93, 0.87), 0.07, 5)
    ink = np.array([0.1, 0.1, 0.12])
    out = p * (tone[..., None] + (1 - tone[..., None]) * ink)
    yy, xx = np.mgrid[0:H, 0:W]; mx, my, mr = 380 + 1160 * .78, 110 + 600 * .2, 72
    wob = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 4) * 6
    moon = np.clip((mr - np.sqrt((xx - mx) ** 2 + (yy - my) ** 2) + wob) / 3, 0, 1) * 0.92
    red = np.array([0x2A, 0x2E, 0xC8]) / 255
    out = out * (1 - moon[..., None]) + (p * red) * moon[..., None]
    sx, sy, s2 = 1690, 900, 110
    seal = ((xx > sx) & (xx < sx + s2) & (yy > sy) & (yy < sy + s2) & (cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.5) > -1.2)).astype(np.float32)
    out = out * (1 - seal[..., None] * .9) + (p * red) * seal[..., None] * .9
    pil = Image.fromarray(cv2.cvtColor(u8(out), cv2.COLOR_BGR2RGB)); dr = ImageDraw.Draw(pil)
    dr.text((sx + 16, sy + 12), '月', font=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 78), fill=(245, 235, 220))
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

# 7 · doodle overlay + fisheye (hip-hop edit energy)
def fisheye(img, k=0.28):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx - W / 2) / (W / 2); ny = (yy - H / 2) / (W / 2); r2 = nx * nx + ny * ny
    f = 1 + k * r2
    mx = (nx / f * 0.86) * (W / 2) + W / 2; my = (ny / f * 0.86) * (W / 2) + H / 2
    out = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    vign = np.clip(1.25 - 0.9 * r2, 0, 1)[..., None]
    return (out * vign).astype(np.uint8)

results = {'risograph': riso(), 'charcoal': charcoal(), 'manga': manga(), 'pixel': pixel(), 'vhs': vhs(), 'sumie': sumie(), 'doodle': fisheye(dd)}
for k, v in results.items(): cv2.imwrite(O + f'style_{k}.jpg', v, [cv2.IMWRITE_JPEG_QUALITY, 92])
cv2.imwrite(O + 'style_watercolor.jpg', wc, [cv2.IMWRITE_JPEG_QUALITY, 92]); cv2.imwrite(O + 'style_neon.jpg', ne, [cv2.IMWRITE_JPEG_QUALITY, 92])
print('ok')
