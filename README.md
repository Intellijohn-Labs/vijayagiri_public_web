# Vijayagiri Auto Agencies – public website

A cinematic, scroll-driven showcase for the Vijayagiri Yamaha dealer network (6 showrooms across Ernakulam).
Next.js App Router · TypeScript · Tailwind CSS v4 · GSAP ScrollTrigger · Framer Motion · Lenis · lucide-react.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## The story

The page is told as a gear change. A fixed dial on the right shifts as you scroll, and each chapter is a section:

| Gear | Chapter | Section |
| --- | --- | --- |
| N | The Silence Before | Hero: a pinned, scroll-scrubbed reveal. A heavy ivory drape, modelled on the R15M, is whipped off from the front wheel back to the tail (`hero.tsx`) |
| 1 | Wake the Machine | As the bodywork clears: the headlight beam fires and a specular sheen rolls tail to nose |
| 2 | Carve the Apex | Flagship turntable: R15M / MT-15 / Aerox (`showcase.tsx`) |
| 3 | Pure Acceleration | Whole range ranked by power, torque or mileage (`range.tsx`) |
| 4 | Open Roads | Kerala riding routes (`routes-section.tsx`) |
| 5 | Racing DNA | Riding gear (`gear-section.tsx`) |
| 6 | The Summit | Test-ride request (3 steps: model, date and time, your details), showrooms, footer (`booking.tsx`, `showrooms.tsx`) |

Smooth scrolling is Lenis, driven by GSAP's ticker so ScrollTrigger stays in sync (`smooth-scroll.tsx`).
Gear changes come from `useGearSection` (`gear-context.tsx`).

## Editing content

Everything editable is in [`src/lib/data.ts`](src/lib/data.ts): contact numbers, showrooms and their hours, models and specs,
the three flagship turntable entries, routes and riding gear.

- A showroom with `phone: null` falls back to the central hotline, and its card says so.
- `SITE.hotlineDisplay` is the text shown for the hotline; the dial and WhatsApp links use `SITE.hotline`.
- `SITE.botWhatsapp` is the number behind the floating chat button (the 24/7 WhatsApp bot).
- Specs are indicative figures from the dealership's internal catalogue; check them against the official brochures. The site shows no prices.
- Route copy is deliberately general. Have someone who rides each road review it.

## Things to know

- **One real photo so far.** The R15M slot uses a transparent cut-out (`public/images/bikes/r15m.png`, configured in
  `BIKE_PHOTOS` in `src/lib/data.ts`). `headlight` there is the lamp's position as fractions of the image and `facing` is the way the bike points; the hero beam
  and glow are placed from them, so they stay locked on if you replace the file (update `width`, `height`, `facing` and `headlight`). All three flagships (R15M, MT-15, Aerox) have photos now.
  The vector illustrations in `bike-art.tsx` (full CSS-3D turn) remain as the fallback for any model without a photo. A photo can
  only show the colour it was shot in, so that model offers just that colour and tilts a little instead of turning. The cut-out is about 1,060px wide, so it
  is sharp on most screens; use a larger one for big retina displays. Next caches optimised images, so a replaced file can take a while to show.
- **The hero cloth is generated.** `public/images/bikes/r15m-cover.<hash>.webp` is built from the photo's own top contour (tent-like over screen, mirrors and tank, hanging in pleats to the floor) by
  `scripts/make-cover.py` (numpy, scipy, Pillow). If you change the R15M photo, rerun it: it writes a content-hashed file name (so caches cannot serve an old cover) and updates `BIKE_PHOTOS.r15.cover` in `src/lib/data.ts` itself.
  In motion the cloth is a WebGL mesh (`src/lib/cloth-gl.ts`): it curls off the front wheel, turns over, flutters and
  flies off up-left, re-lit every frame. Without WebGL it falls back to a clip-path peel; with reduced motion there is no cloth.
- **Booking has no backend.** Submitting the test-ride form opens a pre-filled WhatsApp message to the central line (`SITE.hotline`); it names no showroom, and slots use `SITE.testRideHours`; the
  slot is only confirmed when the team replies. Nothing is stored. Wire up an API route here if you want real bookings.
- **Reduced motion.** With `prefers-reduced-motion`, there is no pinning, no smooth-scroll takeover and no scrubbed animation:
  visitors see the finished scene and the model tabs switch directly.
- **Cache Components is on** (see `next.config.ts`). Anything time- or random-dependent lives in effects or handlers, never in render.
- Dark theme only. Open / closed badges and the booking calendar use `SITE.timeZone` (Asia/Kolkata), not the visitor's clock.
