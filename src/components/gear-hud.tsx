"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GEARS } from "@/lib/data";
import { useGear } from "./gear-context";

const SIZE = 160;
const C = SIZE / 2;
const R_RING = 62;
const R_PROGRESS = 74;
const CIRC = 2 * Math.PI * R_PROGRESS;
const STEP = 360 / GEARS.length;

/** Decorative HUD: a gear selector wheel that "shifts" as the visitor moves through the story. */
export function GearHud() {
  const { gear } = useGear();
  const progress = useRef<SVGCircleElement>(null);

  // thin arc around the dial = how far down the page you are
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => progress.current?.style.setProperty("stroke-dashoffset", String(CIRC * (1 - self.progress))),
    });
    return () => st.kill();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-2 top-[4.75rem] z-40 flex flex-col items-end gap-2 sm:right-5 lg:top-1/2 lg:-translate-y-1/2">
      <div className="relative size-[64px] min-[380px]:size-[76px] sm:size-[112px] lg:size-[148px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full drop-shadow-[0_0_18px_rgba(47,107,255,0.35)]">
          <circle cx={C} cy={C} r={C - 2} fill="rgba(4,6,12,0.72)" stroke="rgba(255,255,255,0.08)" />
          <circle cx={C} cy={C} r={R_PROGRESS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <circle ref={progress} cx={C} cy={C} r={R_PROGRESS} fill="none" stroke="#2f6bff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC} transform={`rotate(-90 ${C} ${C})`} />

          {/* the ring turns so the engaged gear sits under the indicator at 12 o'clock */}
          <motion.g style={{ transformOrigin: "center", transformBox: "fill-box" }} animate={{ rotate: -gear * STEP }} transition={{ type: "spring", stiffness: 90, damping: 16 }}>
            <circle cx={C} cy={C} r={R_RING} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
            {Array.from({ length: GEARS.length * 6 }, (_, i) => {
              const major = i % 6 === 0;
              const a = (i * STEP) / 6;
              return <line key={i} x1={C} y1={C - R_RING} x2={C} y2={C - R_RING + (major ? 11 : 5)} stroke={major ? "#ffffff" : "rgba(255,255,255,0.28)"} strokeWidth={major ? 2 : 1} transform={`rotate(${a} ${C} ${C})`} />;
            })}
            {GEARS.map((g, i) => (
              <text key={g.label} x={C} y={C - R_RING + 27} textAnchor="middle" fontSize="11" fontWeight="700" fill={i === gear ? "#ffffff" : "rgba(255,255,255,0.4)"} transform={`rotate(${i * STEP} ${C} ${C})`}>
                {g.label}
              </text>
            ))}
          </motion.g>

          {/* fixed indicator dot */}
          <circle cx={C} cy={C - R_RING - 6} r="4" fill="#2f6bff" />
          <circle cx={C} cy={C - R_RING - 6} r="8" fill="#2f6bff" opacity="0.28" />
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-none">
            <AnimatePresence mode="wait">
              <motion.span key={gear} initial={{ opacity: 0, y: 8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.85 }} transition={{ duration: 0.22 }} className="font-display block text-3xl font-extrabold italic text-white sm:text-5xl lg:text-6xl">
                {GEARS[gear].label}
              </motion.span>
            </AnimatePresence>
            <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:block">Gear</span>
          </div>
        </div>
      </div>

      <div className="hidden min-h-10 w-[11.5rem] text-right sm:block">
        <AnimatePresence mode="wait">
          <motion.p key={gear} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="text-xs font-medium leading-snug text-slate-200 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
            {GEARS[gear].subtitle}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
