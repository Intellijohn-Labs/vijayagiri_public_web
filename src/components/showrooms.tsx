"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { BRANCHES, SITE, dialOf, hasOwnLine, prettyPhone, waOf, type Branch } from "@/lib/data";
import { branchStatus, fmt12 } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { waLink } from "@/lib/whatsapp";
import { Container, SectionHeading } from "./ui";

const mapsLink = (b: Branch) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name}, ${b.address}`)}`;

function StatusBadge({ branch, now }: { branch: Branch; now: Date | null }) {
  if (!now) return <span className="inline-block h-6 w-32 animate-pulse rounded-full bg-white/5" />;
  const s = branchStatus(branch, now);
  return (
    <span className={`inline-flex items-baseline gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.open ? "border-emerald-800/50 bg-emerald-950/50 text-emerald-400" : "border-slate-700/60 bg-slate-800/80 text-slate-400"}`}>
      <span aria-hidden className={`text-[9px] ${s.open ? "text-emerald-400" : "text-amber-400"}`}>●</span>
      {s.open ? "Open" : "Closed"}
      <span className="text-[11px] font-medium opacity-80">• {s.detail}</span>
    </span>
  );
}

/** The six-showroom network, with live open / closed status in the dealership's time zone. */
export function Showrooms() {
  const now = useNow();
  return (
    <section id="showrooms" className="relative bg-ink py-24 sm:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-race/40 to-transparent" />
      <Container>
        <SectionHeading eyebrow="Find Us" title={<>Our showrooms &amp; <span className="text-outline-strong">service network</span></>}>
          Six locations across Ernakulam. Call or WhatsApp the one nearest to you.
        </SectionHeading>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {BRANCHES.map((b, i) => {
            const own = hasOwnLine(b);
            return (
              <motion.article key={b.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }} className={`flex flex-col gap-4 rounded-2xl border bg-slate-900/90 p-6 transition-colors hover:border-slate-700 hover:bg-slate-900 ${b.id === "hq" ? "border-race/60" : "border-slate-800/90"}`}>
                <div className="flex flex-col items-start gap-2">
                  <h3 className="text-lg font-bold leading-tight tracking-tight text-white">{b.name}</h3>
                  <StatusBadge branch={b} now={now} />
                </div>
                <dl className="space-y-3">
                  <div>
                    <dt className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Address</dt>
                    <dd className="text-xs leading-relaxed text-slate-300">
                      {b.address}{" "}
                      <a href={mapsLink(b)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-blue-400 hover:underline">
                        Directions <ArrowUpRight className="size-3" />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</dt>
                    <dd className="text-xs text-slate-300">{own ? prettyPhone(b.phone as string) : `${SITE.hotlineDisplay} (central hotline)`}</dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">WhatsApp</dt>
                    <dd className="text-xs text-slate-300">{b.whatsapp || own ? prettyPhone(waOf(b)) : `${SITE.hotlineDisplay} (central)`}</dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Hours</dt>
                    <dd className="text-xs text-slate-300">
                      {fmt12(b.open)} – {fmt12(b.close)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                  <a href={`tel:+${dialOf(b)}`} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold tracking-wide text-slate-100 transition-all hover:bg-slate-700 active:scale-95">
                    <Phone className="size-4" /> Call Showroom
                  </a>
                  <a href={waLink(waOf(b), `Hi ${b.name}, I'd like some information.`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-3 py-2.5 text-xs font-semibold tracking-wide text-emerald-300 transition-all hover:bg-emerald-900/60 active:scale-95">
                    <MessageCircle className="size-4" /> WhatsApp Us
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
