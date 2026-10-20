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
| N | The Silence Before | Hero: a pinned, scroll-scrubbed drape reveal of the R15M (`hero.tsx`) |
| 1 | Wake the Machine | The headlight, beam and glow come on at the end of the unveil |
| 2 | Carve the Apex | Flagship turntable: R15M / MT-15 / Aerox (`showcase.tsx`) |
| 3 | Pure Acceleration | Whole range ranked by power, torque or mileage (`range.tsx`) |
| 4 | Open Roads | Kerala riding routes (`routes-section.tsx`) |
| 5 | Racing DNA | Riding gear (`gear-section.tsx`) |
| 6 | The Summit | Test-ride booking, showrooms, footer (`booking.tsx`, `showrooms.tsx`) |

Smooth scrolling is Lenis, driven by GSAP's ticker so ScrollTrigger stays in sync (`smooth-scroll.tsx`).
Gear changes come from `useGearSection` (`gear-context.tsx`).

## Editing content

Everything editable is in [`src/lib/data.ts`](src/lib/data.ts): contact numbers, showrooms and their hours, models and specs,
the three flagship turntable entries, routes and riding gear.

- A showroom with `phone: null` falls back to the central hotline, and its card says so.
- `SITE.hotlineDisplay` is the text shown for the hotline; the dial and WhatsApp links use `SITE.hotline`.
- `SITE.botWhatsapp` is the number behind the floating chat button (the 24/7 WhatsApp bot).
- Prices and specs are indicative figures from the dealership's internal catalogue. Check them, or set `SITE.showPrices` to `false`.
- Route copy is deliberately general. Have someone who rides each road review it.

## Things to know

- **One real photo so far.** The R15M slot uses a transparent cut-out (`public/images/bikes/r15m.png`, configured in
  `BIKE_PHOTOS` in `src/lib/data.ts`). `headlight` there is the lamp's position as fractions of the image, and the hero beam
  and glow are placed from it, so they stay locked on if you replace the file (update `width`, `height` and `headlight`).
  The MT-15 and Aerox are still vector illustrations (`bike-art.tsx`) that turn in CSS 3D. A photo can only show the colour it
  was shot in, so that model offers just that colour and tilts a little instead of turning. The file is small (about 500px
  wide), so a larger cut-out will look sharper. Next caches optimised images, so a replaced file can take a while to show.
- **Booking has no backend.** Submitting the test-ride form opens a pre-filled WhatsApp message to the chosen showroom; the
  slot is only confirmed when the showroom replies. Nothing is stored. Wire up an API route here if you want real bookings.
- **Reduced motion.** With `prefers-reduced-motion`, there is no pinning, no smooth-scroll takeover and no scrubbed animation:
  visitors see the finished scene and the model tabs switch directly.
- **Cache Components is on** (see `next.config.ts`). Anything time- or random-dependent lives in effects or handlers, never in render.
- Dark theme only. Open / closed badges and the booking calendar use `SITE.timeZone` (Asia/Kolkata), not the visitor's clock.
