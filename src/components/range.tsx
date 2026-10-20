"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { MODELS, SITE, fmtPrice, type Model } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { useGearSection } from "./gear-context";
import { Container, SectionHeading } from "./ui";

const METRICS: { key: string; label: string; unit: string; max: number; decimals: number; get: (m: Model) => number }[] = [
  { key: "power", label: "Power", unit: "PS", max: 20, decimals: 1, get: (m) => m.specs.powerPS },
  { key: "torque", label: "Torque", unit: "Nm", max: 16, decimals: 1, get: (m) => m.specs.torqueNm },
  { key: "mileage", label: "Mileage", unit: "kmpl", max: 72, decimals: 0, get: (m) => m.specs.mileageKmpl },
];

/** Gear 3: the whole range ranked on one metric, re-sorting live as you switch. */
export function Range() {
  const ref = useRef<HTMLElement>(null);
  const [metricKey, setMetricKey] = useState("power");
  useGearSection(ref, 3);
  const metric = METRICS.find((m) => m.key === metricKey)!;
  const ranked = [...MODELS].sort((a, b) => metric.get(b) - metric.get(a));

  return (
    <section id="range" ref={ref} className="relative bg-ink py-24 sm:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-race/50 to-transparent" />
      <Container>
        <SectionHeading eyebrow="The Range" title={<>Pure <span className="text-outline-strong">acceleration</span></>}>
          From the 18 PS R15M to the fuel-sipping hybrid scooters, every Yamaha we sell on one scale. Pick what matters to you and watch the line-up re-rank.
        </SectionHeading>

        <div role="tablist" aria-label="Rank by" className="mt-10 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          {METRICS.map((m) => (
            <button key={m.key} role="tab" type="button" aria-selected={metricKey === m.key} onClick={() => setMetricKey(m.key)} className="relative rounded-full px-5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white aria-selected:text-white">
              {metricKey === m.key && <motion.span layoutId="metric-pill" className="absolute inset-0 rounded-full bg-race/90" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {ranked.map((m, i) => {
            const value = metric.get(m);
            return (
              <motion.li key={m.id} layout transition={{ type: "spring", stiffness: 260, damping: 30 }} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-5 sm:grid-cols-[minmax(0,15rem)_1fr_auto_auto] sm:gap-x-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-display w-7 text-2xl font-bold italic text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-2xl font-bold uppercase italic leading-none text-white">{m.short}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {m.series} · {m.specs.engine}
                    </p>
                  </div>
                </div>
                <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-race to-race-soft" initial={false} animate={{ width: `${Math.min(100, (value / metric.max) * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                  </div>
                </div>
                <p className="font-display text-right text-3xl font-extrabold italic text-white sm:w-28">
                  {value.toFixed(metric.decimals)}
                  <span className="ml-1 text-sm font-semibold not-italic text-race-soft">{metric.unit}</span>
                </p>
                <div className="flex items-center justify-end gap-3">
                  {SITE.showPrices && <span className="hidden text-sm text-slate-400 md:inline">{fmtPrice(m.exShowroom)}*</span>}
                  <a href={waLink(SITE.botWhatsapp, `Hi Vijayagiri Yamaha, I'd like to know more about the ${m.name}.`)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about the ${m.name} on WhatsApp`} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-400 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-95">
                    <MessageCircle className="size-3.5" /> Enquire
                  </a>
                </div>
              </motion.li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-slate-500">Specifications are indicative; refer to the official Yamaha brochure. {SITE.showPrices && SITE.priceNote}</p>
      </Container>
    </section>
  );
}
