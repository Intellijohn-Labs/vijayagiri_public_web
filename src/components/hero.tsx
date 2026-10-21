"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronsDown } from "lucide-react";
import { BIKE_PHOTOS } from "@/lib/data";
import { createClothGL, foldAt, type ClothGL } from "@/lib/cloth-gl";
import { useGear } from "./gear-context";

gsap.registerPlugin(ScrollTrigger);

const photo = BIKE_PHOTOS.r15;
const cover = photo.cover;
const facingLeft = photo.facing === "left";

/* ── the cloth ─────────────────────────────────────────────────────────────────────────────────────────────────────
   The cover image is built from the bike's own silhouette, so it traces the screen, tank, tail and wheels. It is
   peeled with a clip edge that runs diagonally from the front wheel up and back toward the tail and ripples like a
   whipped sheet. Coordinates below are percentages of the (padded) cloth box. */
const EDGE_POINTS = 28;
const EDGE_TILT = 34; // how far the top of the edge trails the bottom: the nose and front wheel are freed first

/** x of the leading edge at height y (0 = top, 1 = bottom) once the cloth is p (0..1) of the way off. */
function edgeX(y: number, p: number) {
  const base = 118 - p * 140;
  const slant = (0.5 - y) * EDGE_TILT;
  const amp = 3.4 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, p))), 0.6); // ripples build up, then settle as it clears
  const wave = amp * (Math.sin(y * 9 + p * 16) + 0.55 * Math.sin(y * 21 - p * 11));
  return base + slant + wave;
}

interface ClothParts {
  clip: HTMLElement;
  sway: HTMLElement;
  shadow: SVGPathElement;
  glow: SVGPathElement;
  lip: SVGPathElement;
}

function drawCloth(p: number, c: ClothParts) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= EDGE_POINTS; i++) {
    const y = i / EDGE_POINTS;
    pts.push([edgeX(y, p), y * 100]);
  }
  c.clip.style.clipPath = `polygon(0% 0%, ${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ")}, 0% 100%)`;
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  c.shadow.setAttribute("d", d);
  c.glow.setAttribute("d", d);
  c.lip.setAttribute("d", d);
  c.sway.style.transform = `translateX(${(-p * 3.5).toFixed(2)}%)`; // the cloth drags back as it is pulled
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A paint glint that rides just behind the fold, so the paint catches the light as it is uncovered (nose, tank, tail). */
function placeGlint(p: number, glint: HTMLElement | null) {
  if (!glint || !cover) return;
  const f = foldAt(p, cover.width, cover.height);
  const xCover = (f - 0.3875 * 0.5 * cover.height) / 0.9218;           // where the fold crosses mid-height
  const c = (xCover - cover.pad) / photo.width + 0.04;                 // as a fraction of the photo, a touch behind the fold
  glint.style.setProperty("--glint", ((1.3 - c) / 1.6 * 100).toFixed(2));
  glint.style.opacity = (smooth(0.06, 0.14, p) * (1 - smooth(0.62, 0.74, p)) * 0.85).toFixed(3);
}

/**
 * Pinned hero. While pinned, scroll drives one scrubbed timeline: the cloth is whipped off the R15M from the front wheel
 * back to the tail, then the headlight beam fires, a specular sheen sweeps the bodywork and the type shifts.
 * Visitors who prefer reduced motion see the finished, uncovered scene.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { setGear } = useGear();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      gsap.set(q("[data-lead]"), { y: 16 });

      const clip = el.querySelector<HTMLElement>("[data-cloth-clip]");
      const sway = el.querySelector<HTMLElement>("[data-cloth-sway]");
      const shadow = el.querySelector<SVGPathElement>("[data-edge-shadow]");
      const glow = el.querySelector<SVGPathElement>("[data-edge-glow]");
      const lip = el.querySelector<SVGPathElement>("[data-edge-lip]");
      const parts = clip && sway && shadow && glow && lip ? { clip, sway, shadow, glow, lip } : null;
      const edge = { p: 0 };
      if (parts) drawCloth(0, parts);

      // Prefer the WebGL cloth (real curl, flutter and re-lighting). At rest the static cover stays on screen, so the
      // resting alignment is pixel-exact; the canvas takes over the moment the cloth starts to move.
      const clothEl = el.querySelector<HTMLElement>("[data-cloth]");
      const canvas = el.querySelector<HTMLCanvasElement>("[data-cloth-gl]");
      const glint = el.querySelector<HTMLElement>("[data-glint]");
      let clothGL: ClothGL | null = null;
      let glOn = false;
      const apply = (p: number) => {
        if (glOn && clothGL && canvas && clothEl) {
          const moving = p > 0.0005;
          canvas.style.opacity = moving ? "1" : "0";
          clothEl.style.opacity = moving ? "0" : "1";
          clothGL.setProgress(p);
        } else if (parts) {
          drawCloth(p, parts);
        }
        placeGlint(p, glint);
      };
      if (cover && clothEl && canvas) {
        clothGL = createClothGL({ canvas, anchor: clothEl, src: cover.src, width: cover.width, height: cover.height });
        clothGL?.ready.then((ok) => {
          glOn = ok;
          apply(edge.p);
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=240%",
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => setGear(self.progress > 0.6 ? 1 : 0),
        },
      });
      tl.to(q("[data-cue]"), { opacity: 0, y: 16, duration: 0.8 }, 0)
        // the cloth is whipped off: grabbed at the front wheel / screen, curled up and back, then thrown clear
        .to(edge, { p: 1, duration: 6.5, ease: "sine.inOut", onUpdate: () => apply(edge.p) }, 0.3)
        .to(q("[data-bike]"), { "--b": 1, duration: 4.8, ease: "power1.out" }, 0.8)
        .to(q("[data-headline]"), { yPercent: -6, duration: 8 }, 0)
        .to(q("[data-sub]"), { opacity: 1, letterSpacing: "0.42em", duration: 3 }, 3.2)
        .to(q("[data-glow]"), { "--g": 1.6, "--go": 0.95, duration: 2.4, ease: "power2.out" }, 5.6)
        // hand-off: the tail clears, the headlight flicks on (catch, dip, on) and a fast gloss sweep runs nose to tail
        .to(q("[data-lamp]"), { keyframes: [{ "--lamp": 1, duration: 0.07 }, { "--lamp": 0.15, duration: 0.07 }, { "--lamp": 1, duration: 0.1 }] }, 5.6)
        .to(q("[data-beam]"), { keyframes: [{ "--beam": 1, "--beam-o": 1, duration: 0.12 }, { "--beam-o": 0.2, duration: 0.07 }, { "--beam-o": 1, duration: 0.12 }] }, 5.62)
        .to(q("[data-sheen]"), { "--sheen": 100, duration: 0.75, ease: "power2.inOut" }, 5.8)
        .to(q("[data-headline]"), { opacity: 0, filter: "blur(10px)", duration: 1.6 }, 8.4)
        .to(q("[data-lead]"), { opacity: 1, y: 0, duration: 1.4 }, 8.6);

      return () => {
        clothGL?.destroy();
        if (canvas) canvas.style.opacity = "";
        if (clothEl) clothEl.style.opacity = "";
        if (parts) {
          parts.clip.style.clipPath = "";
          parts.sway.style.transform = "";
        }
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const st = ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onEnter: () => setGear(1), onEnterBack: () => setGear(1) });
      return () => st.kill();
    });

    return () => mm.revert();
  }, [setGear]);

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative isolate h-svh min-h-[560px] overflow-hidden bg-ink">
      {/* atmosphere: floor, spotlight */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_100%,#0d1a44_0%,#070b16_55%,#04060c_100%)]" />
      <div aria-hidden data-glow className="absolute -ml-[40vmax] -mt-[40vmax] left-[52%] top-[52%] size-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(70,125,255,0.55)_0%,rgba(40,80,200,0.18)_35%,transparent_62%)] [--g:0.3] [--go:0.1] [opacity:var(--go)] [scale:var(--g)] motion-reduce:[--g:1.6] motion-reduce:[--go:0.9]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[34svh] bg-[linear-gradient(to_top,rgba(4,6,12,0.95),transparent)]" />

      {/* the bike: a real cut-out photo, with the cloth over it */}
      <div className="absolute bottom-[18svh] right-[-2vw] w-[104vw] sm:bottom-[8svh] sm:right-[2vw] sm:w-[min(84vw,820px,80svh)] lg:bottom-[6svh] lg:right-[12vw] lg:w-[min(60vw,960px,86svh)]" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <div aria-hidden className="absolute inset-x-[6%] -bottom-[1%] h-[6%] rounded-full bg-black/70 blur-xl" />
        <div data-bike className="relative size-full [--b:0.3] [filter:brightness(var(--b))] motion-reduce:[--b:1]">
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} priority sizes="(min-width: 1024px) 60vw, 104vw" draggable={false} className="block h-auto w-full select-none drop-shadow-[0_0_34px_rgba(70,120,255,0.3)]" />
          {/* specular sheen: a soft glare band that rolls tail to nose, masked to the bike's own silhouette */}
          <div
            data-sheen
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay [--sheen:0] [background-position:calc(var(--sheen)*1%)_0] motion-reduce:hidden"
            style={{
              backgroundImage: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.15) 44%, rgba(255,255,255,0.95) 50%, rgba(200,220,255,0.18) 56%, transparent 62%)",
              backgroundSize: "260% 100%",
              backgroundRepeat: "no-repeat",
              WebkitMaskImage: `url(${photo.src})`,
              maskImage: `url(${photo.src})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
          {/* paint glint that rides just behind the fold as the cloth comes off (driven from the timeline) */}
          <div
            data-glint
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay [--glint:100] [background-position:calc(var(--glint)*1%)_0] motion-reduce:hidden"
            style={{
              backgroundImage: "linear-gradient(112deg, transparent 40%, rgba(255,255,255,0.7) 49%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.7) 51%, transparent 60%)",
              backgroundSize: "260% 100%",
              backgroundRepeat: "no-repeat",
              WebkitMaskImage: `url(${photo.src})`,
              maskImage: `url(${photo.src})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
          {/* lamp bloom + beam are placed from the headlight's position in the photo */}
          <div data-lamp className="pointer-events-none absolute -ml-9 -mt-9 size-[4.5rem] rounded-full bg-[radial-gradient(circle,rgba(225,240,255,0.95),rgba(120,170,255,0.4)_40%,transparent_70%)] blur-[2px] [--lamp:0] [opacity:var(--lamp)] motion-reduce:[--lamp:1]" style={{ left: `${photo.headlight.x * 100}%`, top: `${photo.headlight.y * 100}%` }} />
          <div
            data-beam
            className={`pointer-events-none absolute h-[78%] w-[90%] -translate-y-1/2 mix-blend-screen [--beam:0] [--beam-o:0] [opacity:var(--beam-o)] [scale:var(--beam)_1] motion-reduce:[--beam:1] motion-reduce:[--beam-o:1] ${facingLeft ? "origin-right -translate-x-full bg-[linear-gradient(to_left,rgba(214,232,255,0.7),rgba(150,190,255,0.22)_45%,transparent)]" : "origin-left bg-[linear-gradient(to_right,rgba(214,232,255,0.7),rgba(150,190,255,0.22)_45%,transparent)]"}`}
            style={{ left: `${photo.headlight.x * 100}%`, top: `${photo.headlight.y * 100}%`, clipPath: facingLeft ? "polygon(100% 47%, 0% 0%, 0% 100%, 100% 53%)" : "polygon(0% 47%, 100% 0%, 100% 100%, 0% 53%)", filter: "blur(2px)" }}
          />
        </div>

        {/* the cloth: shaped to this bike, peeled front-to-tail with a rippling edge, a lit lip and a cast shadow */}
        {cover && (
          <div
            data-cloth
            aria-hidden
            className="pointer-events-none absolute z-10 drop-shadow-[0_16px_20px_rgba(0,0,0,0.6)] motion-reduce:hidden"
            style={{ left: `${(-cover.pad / photo.width) * 100}%`, top: `${(-cover.pad / photo.height) * 100}%`, width: `${((photo.width + 2 * cover.pad) / photo.width) * 100}%`, height: `${((photo.height + 2 * cover.pad) / photo.height) * 100}%` }}
          >
            <div data-cloth-clip className="size-full">
              <div data-cloth-sway className="size-full">
                <Image src={cover.src} alt="" width={cover.width} height={cover.height} priority sizes="(min-width: 1024px) 66vw, 114vw" draggable={false} className="block size-full select-none" />
              </div>
            </div>
            {/* the edge strokes are masked to the cloth's own outline, so they never float in empty space */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" style={{ WebkitMaskImage: `url(${cover.src})`, maskImage: `url(${cover.src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
              <path data-edge-shadow transform="translate(1.4 0)" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="22" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "blur(9px)" }} />
              <path data-edge-glow fill="none" stroke="rgba(235,240,255,0.22)" strokeWidth="7" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "blur(3px)" }} />
              <path data-edge-lip fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "blur(0.6px)" }} />
            </svg>
          </div>
        )}
      </div>

      {/* WebGL cloth: the whole hero, because the sheet flies well clear of the bike. Hidden until the cloth moves. */}
      <canvas data-cloth-gl aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-0 [filter:drop-shadow(0_18px_22px_rgba(0,0,0,0.45))] motion-reduce:hidden" />

      {/* vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_58%,transparent_32%,rgba(0,0,0,0.88)_100%)]" />

      {/* type */}
      <div className="relative z-30 mx-auto flex h-full w-full max-w-7xl flex-col justify-start px-5 pt-24 sm:px-8 sm:pt-32 lg:pl-10 lg:pr-44">
        <p data-sub className="font-display max-w-[calc(100%-4.5rem)] text-xs font-semibold uppercase tracking-[0.2em] text-white/70 opacity-70 sm:max-w-none sm:text-sm motion-reduce:tracking-[0.42em]">
          Vijayagiri Yamaha Racing Heritage
        </p>
        <h1 id="hero-title" data-headline className="font-display mt-4 text-[clamp(3.4rem,13vw,9.6rem)] font-extrabold uppercase italic leading-[0.84] tracking-tight text-white motion-reduce:opacity-100">
          Uncover
          <br />
          <span className="text-outline-strong">the Ascent</span>
        </h1>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[33%] z-30 lg:top-[36%]">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:pl-10 lg:pr-44">
          <p data-lead className="max-w-sm text-lg font-medium leading-relaxed text-slate-200 opacity-0 motion-reduce:hidden sm:text-xl">
            Six showrooms across Ernakulam. One Yamaha racing heritage, serving riders since 1991.
          </p>
        </div>
      </div>

      <div data-cue aria-hidden className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60 motion-reduce:hidden">
        Scroll to uncover
        <ChevronsDown className="size-5 animate-bounce" />
      </div>
    </section>
  );
}
