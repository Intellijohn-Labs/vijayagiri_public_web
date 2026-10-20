"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Fuel, MapPin } from "lucide-react";
import { ROUTES, branchById, modelById } from "@/lib/data";
import { useBooking } from "./booking-context";
import { useGearSection } from "./gear-context";
import { useSmoothScroll } from "./smooth-scroll";
import { Container, SectionHeading } from "./ui";

/** Gear 4: three Kerala rides. Each card draws its road as it scrolls in and can pre-fill the test-ride booking. */
export function RoutesSection() {
  const ref = useRef<HTMLElement>(null);
  const { prefill } = useBooking();
  const { scrollTo } = useSmoothScroll();
  useGearSection(ref, 4);

  return (
    <section id="routes" ref={ref} className="relative overflow-hidden bg-night py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(30,70,190,0.25),transparent_70%)]" />
      <Container className="relative">
        <SectionHeading eyebrow="Open Roads" title={<>Curated <span className="text-outline-strong">mountain</span> routes</>}>
          Kerala&apos;s High Range and Western Ghats are an hour or two from our showrooms. Three rides worth building a weekend around.
        </SectionHeading>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ROUTES.map((r, i) => {
            const model = modelById(r.bestWith);
            const branch = branchById(r.nearestBranch);
            return (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="glass group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-colors hover:border-race/50"
              >
                <svg viewBox="0 0 300 120" className="h-28 w-full" aria-hidden>
                  <path d={r.line} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round" />
                  <motion.path d={r.line} fill="none" stroke="url(#route-grad)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.8, delay: 0.3 + i * 0.1, ease: "easeInOut" }} />
                  <defs>
                    <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#2f6bff" />
                      <stop offset="1" stopColor="#8fb0ff" />
                    </linearGradient>
                  </defs>
                  <circle cx={r.line.split(" ")[0].slice(1)} cy={r.line.split(" ")[1]} r="5" fill="#2f6bff" />
                </svg>

                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-race-soft">
                  <MapPin className="size-3.5" /> {r.area}
                </p>
                <h3 className="font-display mt-2 text-3xl font-extrabold uppercase italic leading-[0.95] text-white">{r.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{r.blurb}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {r.character.map((c) => (
                    <li key={c} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200">
                      {c}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                  <p>
                    <span className="font-semibold text-slate-200">Ride it on:</span> {model?.short}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Start from:</span> {branch.chip} showroom
                  </p>
                  <p className="flex gap-2 leading-relaxed">
                    <Fuel className="mt-0.5 size-3.5 shrink-0 text-race-soft" /> {r.tip}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    prefill({ modelId: r.bestWith, branchId: r.nearestBranch, note: `Planning to ride the ${r.name}` });
                    scrollTo("#book");
                  }}
                  className="group/btn mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-race/60 hover:bg-race/20 active:scale-95"
                >
                  Test ride the {model?.short} <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </motion.article>
            );
          })}
        </div>
        <p className="mt-8 text-xs text-slate-500">Ride within local rules and speed limits. Some hill and forest stretches have timing restrictions or wildlife: check conditions before you go.</p>
      </Container>
    </section>
  );
}
