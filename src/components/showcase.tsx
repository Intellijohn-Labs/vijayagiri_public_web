"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import { COLOUR_HEX, FLAGSHIPS, SITE, fmtPrice, modelById } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { useBooking } from "./booking-context";
import { useGearSection } from "./gear-context";
import { Mist } from "./mist";
import { useSmoothScroll } from "./smooth-scroll";
import { Turntable } from "./turntable";
import { Container } from "./ui";

gsap.registerPlugin(ScrollTrigger);

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, value, { duration: 0.9, ease: "easeOut", onUpdate: setV });
    return () => c.stop();
  }, [value]);
  return <>{v.toFixed(decimals)}</>;
}

function Stat({ label, value, unit, decimals = 0, hint }: { label: string; value: number; unit: string; decimals?: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="font-display mt-1 text-3xl font-extrabold italic leading-none text-white sm:text-4xl">
        <CountUp value={value} decimals={decimals} />
        <span className="ml-1 text-base font-semibold not-italic text-race-soft">{unit}</span>
      </p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

/**
 * Gear 2: the flagship turntable. The section is tall and its stage is sticky: scrolling moves through the three models,
 * and the tabs scroll to each one, so the scroll position is the single source of truth.
 */
export function Showcase() {
  const outer = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [colourIdx, setColourIdx] = useState<number[]>(() => FLAGSHIPS.map(() => 0));
  const reduced = useReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const { prefill } = useBooking();
  useGearSection(outer, 2);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setIndex(Math.min(FLAGSHIPS.length - 1, Math.floor(self.progress * FLAGSHIPS.length)));
          el.style.setProperty("--p", self.progress.toFixed(4));
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  const select = (i: number) => {
    if (reduced) {
      setIndex(i);
      return;
    }
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollTo(top + travel * ((i + 0.5) / FLAGSHIPS.length));
  };

  const f = FLAGSHIPS[index];
  const m = modelById(f.modelId)!;
  // a photo only shows one colour, so that is the only colour offered for that model
  const colours = f.photo ? [f.photo.colour] : f.colours;
  const colour = colours[Math.min(colourIdx[index], colours.length - 1)];
  const body = COLOUR_HEX[colour];
  const accent = f.kind === "mt15" ? "#0b2a3a" : "#ffffff";
  const rpm = m.specs.power.split("@")[1]?.trim();

  return (
    <section id="showcase" ref={outer} aria-labelledby="showcase-title" className="relative h-[330vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh min-h-[600px] flex-col overflow-hidden bg-night motion-reduce:static motion-reduce:min-h-svh">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_65%_55%,rgba(30,70,190,0.35),transparent_70%),linear-gradient(to_bottom,#04060c,#070b16_40%,#04060c)]" />

        {/* giant outline lettering, drifting with the scroll */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[24%] flex justify-center overflow-hidden [transform:translateX(calc((0.5_-_var(--p,0.5))_*_220px))] motion-reduce:transform-none lg:top-[16%]">
          <AnimatePresence mode="wait">
            <motion.span key={f.outline} initial={{ opacity: 0, filter: "blur(18px)", scale: 1.06 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(18px)", scale: 0.97 }} transition={{ duration: 0.5 }} className="font-display text-outline select-none whitespace-nowrap text-[clamp(7rem,30vw,26rem)] font-extrabold italic leading-none tracking-tight">
              {f.outline}
            </motion.span>
          </AnimatePresence>
        </div>

        <Container className="relative z-10 flex h-full flex-col gap-3 pb-5 pt-20 sm:pt-24 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-10 lg:pb-8">
          {/* copy + specs */}
          <div className="order-2 flex min-h-0 flex-col lg:order-1">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-race-soft">The Flagships</p>
            <h2 id="showcase-title" className="sr-only">
              Flagship models
            </h2>
            <AnimatePresence mode="wait">
              <motion.div key={f.modelId} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <p className="font-display mt-1 text-4xl font-extrabold uppercase italic leading-[0.9] text-white sm:text-5xl lg:text-6xl">{f.label}</p>
                <p className="mt-2 hidden text-base text-slate-300 sm:block">{m.tagline}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                  <Stat label="Power" value={m.specs.powerPS} unit="PS" decimals={1} hint={rpm ? `@ ${rpm}` : undefined} />
                  <Stat label="Torque" value={m.specs.torqueNm} unit="Nm" decimals={1} />
                  <Stat label="Kerb weight" value={m.specs.weightKg} unit="kg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:mt-4">
                  <span className="rounded-full border border-white/15 px-3 py-1 font-semibold text-slate-200">{m.specs.engine}</span>
                  <span className="rounded-full border border-white/15 px-3 py-1 font-semibold text-slate-200">{m.specs.braking}</span>
                  {f.quickshifter && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1 font-bold text-white shadow-lg shadow-blue-600/30">
                      <Zap className="size-3.5" /> Quick Shifter
                    </span>
                  )}
                </div>
                {SITE.showPrices && (
                  <p className="mt-3 text-sm text-slate-300 sm:mt-4">
                    From <span className="font-display text-2xl font-bold text-white">{fmtPrice(m.exShowroom)}*</span> <span className="text-xs text-slate-500">ex-showroom, indicative</span>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Colour</span>
              {colours.map((c, ci) => (
                <button
                  key={c}
                  disabled={colours.length === 1}
                  type="button"
                  aria-label={c}
                  aria-pressed={ci === Math.min(colourIdx[index], colours.length - 1)}
                  onClick={() => setColourIdx((prev) => prev.map((v, i) => (i === index ? ci : v)))}
                  className={`size-7 rounded-full border-2 transition-transform enabled:hover:scale-110 enabled:active:scale-90 ${ci === Math.min(colourIdx[index], colours.length - 1) ? "border-white shadow-[0_0_0_3px_rgba(47,107,255,0.6)]" : "border-white/25"}`}
                  style={{ background: COLOUR_HEX[c] }}
                />
              ))}
              <span className="ml-1 text-sm font-medium text-slate-200">{colour}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  prefill({ modelId: f.modelId });
                  scrollTo("#book");
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-blue-600 active:scale-95"
              >
                Book a test ride <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href={waLink(SITE.botWhatsapp, `Hi Vijayagiri Yamaha, I'd like to know more about the ${f.label} (${colour}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-400 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-95"
              >
                <MessageCircle className="size-4" /> Enquire
              </a>
            </div>
          </div>

          {/* stage */}
          <div className="relative order-1 flex min-h-0 flex-1 flex-col items-center justify-center lg:order-2 lg:flex-none">
            <div className="relative w-full">
              <Mist trigger={index} />
              <AnimatePresence mode="wait">
                <motion.div key={`${f.kind}-${colour}`} initial={{ opacity: 0, x: 60, filter: "blur(16px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -60, filter: "blur(16px)" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <Turntable kind={f.kind} body={body} accent={accent} glow="rgba(60,110,255,0.55)" photo={f.photo} />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.25em] text-slate-500">{f.photo ? "Drag to tilt" : "Drag to turn · illustration"}</p>

            <div role="tablist" aria-label="Choose a model" className="mt-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur">
              {FLAGSHIPS.map((x, i) => (
                <button key={x.modelId} role="tab" type="button" aria-selected={i === index} onClick={() => select(i)} className="relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:text-white aria-selected:text-white sm:px-5">
                  {i === index && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-race/90 shadow-lg shadow-blue-600/40" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{x.label.replace("Yamaha ", "")}</span>
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
