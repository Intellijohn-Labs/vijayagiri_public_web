"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, Menu, Phone, X } from "lucide-react";
import { SITE } from "@/lib/data";

const NAV = [
  { href: "#showcase", label: "Models" },
  { href: "#routes", label: "Routes" },
  { href: "#gear", label: "Gear" },
  { href: "#showrooms", label: "Showrooms" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled || open ? "border-white/10 bg-ink/80 backdrop-blur-md" : "border-transparent bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:h-20 sm:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-3" aria-label="Vijayagiri Auto Agencies – home">
          <Image src="/images/vijayagiri-logo.png" alt="" width={1199} height={460} priority className="h-8 w-auto brightness-0 invert sm:h-10" />
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-semibold tracking-tight text-white">{SITE.brand}</span>
            <span className="block text-[11px] text-slate-400">Since {SITE.sinceYear} • Authorized Dealer</span>
          </span>
        </a>

        <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <a href={`tel:+${SITE.hotline}`} aria-label="Call customer support" className="flex items-center gap-2 rounded-full border border-white/10 p-1 transition-colors hover:border-race/60 hover:bg-white/5 sm:pr-4">
            <span className="grid size-8 place-items-center rounded-full bg-race/20 text-race-soft">
              <Phone className="size-4" />
            </span>
            <span className="hidden font-mono text-sm font-semibold tracking-tight text-white sm:inline">{SITE.hotlineDisplay}</span>
          </a>
          <a href="#book" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 sm:px-5 sm:text-sm">
            <span>
              <span className="hidden sm:inline">Book </span>Test Ride
            </span>
            <ArrowRight className="hidden size-3.5 transition-transform group-hover:translate-x-0.5 sm:block" />
          </a>
          <a href={SITE.loginUrl} aria-label="Staff Login" title="Staff Login" className="hidden size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-white/5 hover:text-race-soft lg:grid">
            <Lock className="size-[18px]" />
          </a>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} className="grid size-10 place-items-center rounded-full text-white lg:hidden">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 bg-ink/95 px-5 pb-5 pt-2 backdrop-blur-md lg:hidden"
          >
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-white/5 py-3.5 text-base font-medium text-slate-200">
                {n.label}
              </a>
            ))}
            <a href={SITE.loginUrl} className="block pt-4 text-sm text-slate-500">
              Staff Portal ↗
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
