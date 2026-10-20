"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronsDown } from "lucide-react";
import { BikeSvg } from "./bike-art";
import { useGear } from "./gear-context";

gsap.registerPlugin(ScrollTrigger);

const DRAPE_FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
/** the cloth ends up bunched in the top-left corner */
const DRAPE_PULLED = "polygon(0% 0%, 24% 0%, 9% 24%, 0% 42%)";

/**
 * Pinned hero. While pinned, scroll drives one scrubbed timeline:
 * the drape is pulled off the R15M, the headlight wakes up, the beam and glow spread, and the type shifts.
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
      gsap.set(q("[data-drape]"), { clipPath: DRAPE_FULL });
      gsap.set(q("[data-lead]"), { y: 16 });

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
        .to(q("[data-drape]"), { clipPath: DRAPE_PULLED, duration: 5.2, ease: "power1.inOut" }, 0.3)
        .to(q("[data-bike]"), { "--b": 1, "--bs": 1, duration: 5, ease: "power1.out" }, 0.8)
        .to(q("[data-headline]"), { yPercent: -6, duration: 8 }, 0)
        .to(q("[data-sub]"), { opacity: 1, letterSpacing: "0.42em", duration: 3 }, 3.2)
        .to(q("[data-glow]"), { "--g": 1.6, "--go": 0.95, duration: 4, ease: "power2.out" }, 4.6)
        .to(q("[data-lamp]"), { "--lamp": 1, duration: 1.4 }, 5.2)
        .to(q("[data-beam]"), { "--beam": 1, "--beam-o": 1, duration: 3, ease: "power2.out" }, 5.4)
        .to(q("[data-headline]"), { opacity: 0, filter: "blur(10px)", duration: 1.6 }, 8.2)
        .to(q("[data-lead]"), { opacity: 1, y: 0, duration: 1.4 }, 8.4);
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const st = ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onEnter: () => setGear(1), onEnterBack: () => setGear(1) });
      return () => st.kill();
    });

    return () => mm.revert();
  }, [setGear]);

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative isolate h-svh min-h-[560px] overflow-hidden bg-ink">
      {/* atmosphere: floor, spotlight, vignette */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_100%,#0d1a44_0%,#070b16_55%,#04060c_100%)]" />
      <div aria-hidden data-glow className="absolute -ml-[40vmax] -mt-[40vmax] left-[58%] top-[44%] size-[80vmax] rounded-full bg-[radial-gradient(circle,rgba(70,125,255,0.55)_0%,rgba(40,80,200,0.18)_35%,transparent_62%)] [--g:0.3] [--go:0.1] [opacity:var(--go)] [scale:var(--g)] motion-reduce:[--g:1.6] motion-reduce:[--go:0.9]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[34svh] bg-[linear-gradient(to_top,rgba(4,6,12,0.95),transparent)]" />

      {/* the bike */}
      <div className="absolute bottom-[22svh] right-[-3vw] w-[106vw] sm:bottom-[8svh] sm:right-[-2vw] sm:w-[min(96vw,920px,98svh)] lg:bottom-[7svh] lg:right-[10vw] lg:w-[min(72vw,1100px,98svh)]">
        <div data-bike className="relative origin-[70%_80%] [--b:0.22] [--bs:1.07] [filter:brightness(var(--b))] [scale:var(--bs)] motion-reduce:[--b:1] motion-reduce:[--bs:1]">
          <BikeSvg kind="r15" body="#1f4fa3" accent="#ffffff" uid="hero" className="relative block h-auto w-full" />
          {/* headlight lamp glow + beam share the headlight's position in the artwork (x 90.6%, y 35%) */}
          <div data-lamp className="pointer-events-none absolute -ml-8 -mt-8 left-[90.6%] top-[35%] size-16 rounded-full bg-[radial-gradient(circle,rgba(220,238,255,0.95),rgba(120,170,255,0.4)_40%,transparent_70%)] blur-[2px] [--lamp:0] [opacity:var(--lamp)] motion-reduce:[--lamp:1]" />
          <div
            data-beam
            className="pointer-events-none absolute left-[90.6%] top-[35%] -mt-[22%] h-[78%] w-[95%] origin-left bg-[linear-gradient(to_right,rgba(214,232,255,0.7),rgba(150,190,255,0.22)_45%,transparent)] mix-blend-screen [--beam:0] [--beam-o:0] [opacity:var(--beam-o)] [scale:var(--beam)_1] motion-reduce:[--beam:1] motion-reduce:[--beam-o:1]"
            style={{ clipPath: "polygon(0% 47%, 100% 0%, 100% 100%, 0% 53%)", filter: "blur(2px)" }}
          />
        </div>
      </div>

      {/* vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_58%,transparent_32%,rgba(0,0,0,0.88)_100%)]" />

      {/* the drape */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 drop-shadow-[0_30px_50px_rgba(0,0,0,0.65)] motion-reduce:hidden">
        <div data-drape className="size-full bg-[linear-gradient(115deg,#0b1020_0%,#18204a_36%,#0a0e1d_60%,#1b2450_100%)]">
          <div className="size-full bg-[repeating-linear-gradient(97deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_46px,rgba(0,0,0,0.42)_46px_54px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_40%,rgba(120,150,255,0.16),transparent_70%)]" />
        </div>
      </div>

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
