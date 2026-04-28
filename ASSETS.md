# Harper's Butterfly Garden — Asset Specification

All assets drop into two folders: `images/` and `sounds/`.
Icons go into `icons/`.
No code changes needed to add any of these — the game already has
placeholder hooks for each path.

---

## Icons (PWA + browser)

These make the game installable and give it an icon on the home screen.

| File | Size | Notes |
|------|------|-------|
| `icons/icon-192.png` | 192 × 192 | Android home screen (standard) |
| `icons/icon-512.png` | 512 × 512 | Android splash / high-DPI |
| `icons/icon-512-maskable.png` | 512 × 512 | Android adaptive icon — main artwork must fit inside central **75% safe zone** (384 × 384); the outer ring gets cropped into a circle/squircle by the OS |
| `icons/icon-180.png` | 180 × 180 | iOS home screen (apple-touch-icon) |

**Subject:** A cute purple-and-pink butterfly with a sparkle or two, facing front-on.
**Style:** Bold outlines, bright saturated colors, cartoon/children's illustration.
**Background:** Solid deep purple (`#1a0a2e`) — do NOT use transparency; iOS and Android both need a solid icon background.

**Midjourney prompt:**
> cute purple and pink cartoon butterfly, children's game icon, sparkles, bold outlines, bright colors, facing front, centered, solid deep purple background, flat illustration, no text, square format --ar 1:1 --style raw

---

## Background Image

| File | Size | Format |
|------|------|--------|
| `images/bg-garden.jpg` | 2048 × 1536 | JPG, quality 85 |

This replaces the CSS gradient on `#background-layer`. To activate it, add to `styles.css`:

```css
#background-layer {
  background-image: url('images/bg-garden.png');
  background-size: cover;
  background-position: center bottom;
}
```

**Scene description:**
- Top 40%: soft blue sky with two or three fluffy white clouds
- Middle 20%: distant tree line or rolling hills, hazy/soft
- Bottom 40%: bright green meadow with wildflowers scattered around
  — flowers should cluster near the left edge, right edge, and bottom corners
  — **keep the center of the image relatively clear** (the butterfly and letters live there)
- A few butterflies visible in the far background (tiny, decorative)
- No text, no UI elements, no harsh shadows

**Style:** Soft watercolor illustration, warm sunny lighting, child-friendly, not photo-realistic.
**Orientation:** Landscape primary (4:3). The image is displayed with `background-position: center bottom` so it also crops acceptably in portrait.

**Midjourney prompt:**
> whimsical cartoon garden scene for children's game background, soft blue sky with fluffy clouds, bright green meadow, colorful wildflowers daisies and roses at edges, a few tiny butterflies in distance, warm sunny day, soft watercolor illustration style, wide landscape 4:3, no text, no UI, keep center clear --ar 4:3 --style raw

---

## Butterfly Sprite (optional — canvas drawing is the fallback)

The canvas-drawn butterfly works fine. Replace it only if you want a more
polished look. If you add this file, you'll need a small code change in
`game.js` to load and draw the image instead of the canvas shape.

| File | Size | Format |
|------|------|--------|
| `images/butterfly.png` | 120 × 120 | PNG, transparent background |

**Subject:** Same purple-pink butterfly as the icon, wings spread open, facing upward (as if flying toward the viewer).
**Background:** Fully transparent.
**Notes:** Keep it simple — the game already animates wing scale via canvas transforms, so the sprite just needs to look good at rest.

**Midjourney prompt:**
> cute purple and pink cartoon butterfly, wings fully open and spread, facing upward, children's illustration style, bold outlines, transparent background, centered, no background, isolated --ar 1:1 --style raw

---

## Sounds

### Files required

| File | Duration | Description |
|------|----------|-------------|
| `sounds/music.mp3` | 45–60 s loop | Background garden music, loops seamlessly |
| `sounds/win.mp3` | 3–4 s | Win celebration fanfare |
| `sounds/click.mp3` | 0.1–0.2 s | Button tap sound |

**Format:** MP3, 44.1 kHz, stereo, 128 kbps is fine for all.
All three should be normalized to around **−14 LUFS** so they aren't startlingly loud.

---

### `sounds/music.mp3` — Background loop

**Style:** Gentle, whimsical, children's garden theme. Toy piano or music box lead,
light acoustic guitar or soft strings underneath. No percussion or drums — keep it
calm and non-distracting so Harper can focus on the game.
**Mood:** Magical, happy, slightly sleepy — like a fairy garden.
**Loop point:** Should loop seamlessly (fade out is fine if the loop point is clean).

**Tools:**
- [Suno](https://suno.com) or [Udio](https://udio.com) — generate from a prompt
- Suno prompt: `children's garden music box melody, whimsical fairy garden, soft toy piano, gentle and calm, no lyrics, loop-friendly, 60 BPM`

---

### `sounds/win.mp3` — Win fanfare

**Style:** Short triumphant celebration. Xylophone or toy piano playing a happy
ascending melody (think: five to eight notes climbing up). Not too long — Harper
should hear it and immediately want to press Play Again.
**Mood:** Proud, joyful, exciting. Slightly sparkly.

**Tools:**
- Suno prompt: `children's celebration fanfare, xylophone, 4 seconds, triumphant happy melody, ascending notes, magical sparkle, no lyrics`
- Or use a free SFX library: [freesound.org](https://freesound.org) — search "children fanfare xylophone"

---

### `sounds/click.mp3` — Button tap

**Style:** A soft, friendly pop or gentle click. Think bubble pop or wooden block tap.
Nothing harsh or electronic.

**Tools:**
- [freesound.org](https://freesound.org) — search "soft button click" or "bubble pop"
- Or generate with Suno: `soft bubble pop sound effect, gentle, child-friendly, 0.2 seconds`

---

### Synthesized in code (no files needed)

These are generated by the Web Audio API directly in `game.js` — you don't need
to source or create them. Listed here for completeness:

| Sound | When it plays | How it's made |
|-------|---------------|---------------|
| Collection tones | Each letter collected (H=C4, A=D4, R=E4, P=F4, E=G4, R=A4) | Sine oscillator with quick attack/release |
| Wing flutter | While butterfly is moving | Low-amplitude oscillator tied to speed |
| Sparkle chimes | Particle burst on collection | Random high-frequency pings |

---

## Summary checklist

```
icons/
  icon-180.png          ← iOS home screen
  icon-192.png          ← Android home screen
  icon-512.png          ← Android high-DPI / splash
  icon-512-maskable.png ← Android adaptive icon

images/
  bg-garden.jpg         ← Garden background (required for visual upgrade)
  butterfly.png         ← Optional butterfly sprite

sounds/
  music.mp3             ← Background loop
  win.mp3               ← Win fanfare
  click.mp3             ← Button tap
```

Minimum for a polished release: **icons + bg-garden.jpg + music.mp3 + win.mp3**.
The click sound and butterfly sprite are nice-to-have.
