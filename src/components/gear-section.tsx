"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { GEAR_ITEMS, SITE } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { BagIcon, GlovesIcon, HelmetIcon, JacketIcon } from "./gear-icons";
import { useGearSection } from "./gear-context";
import { Container, SectionHeading } from "./ui";

const ICONS = { jacket: JacketIcon, helmet: HelmetIcon, gloves: GlovesIcon, bag: BagIcon } as const;

/** Gear 5: riding kit. Each card follows the pointer with a soft spotlight. */
export function GearSection() {
  const ref = useRef<HTMLElement>(null);
  useGearSection(ref, 5);

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section id="gear" ref={ref} className="relative bg-ink py-24 sm:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <Container>
        <SectionHeading eyebrow="Racing DNA" title={<>Dress for the <span className="text-outline-strong">track</span></>}>
          The ride starts with what you put on. Ask any of our showrooms about riding jackets, racing helmets, gloves and tail bags from the Yamaha range.
        </SectionHeading>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GEAR_ITEMS.map((g, i) => {
            const Icon = ICONS[g.id as keyof typeof ICONS];
            return (
              <motion.article
                key={g.id}
                onPointerMove={spot}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
                style={{ transformPerspective: 900 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-race/50"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),rgba(47,107,255,0.28),transparent_70%)] group-hover:opacity-100" />
                <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">{g.tag}</p>
                <Icon className="relative mx-auto my-6 size-28 text-race-soft transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-white" />
                <h3 className="font-display relative text-3xl font-extrabold uppercase italic leading-none text-white">{g.name}</h3>
                <p className="relative mt-2 min-h-[2.75rem] text-sm leading-relaxed text-slate-400">{g.blurb}</p>
                <a href={waLink(SITE.botWhatsapp, `Hi Vijayagiri Yamaha, I'd like to know about the ${g.name}: availability and sizes.`)} target="_blank" rel="noopener noreferrer" className="relative mt-5 inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white/5 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-95">
                  <MessageCircle className="size-3.5" /> Ask about it
                </a>
              </motion.article>
            );
          })}
        </div>
        <p className="mt-8 text-xs text-slate-500">Range and sizes vary by showroom: ask your nearest showroom for current stock.</p>
      </Container>
    </section>
  );
}
