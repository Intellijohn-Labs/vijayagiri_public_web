"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Target = number | string | HTMLElement;
interface ScrollApi {
  scrollTo: (target: Target, opts?: { offset?: number }) => void;
}

const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {} });
export const useSmoothScroll = () => useContext(ScrollContext);

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Butter-smooth momentum scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in lock-step.
 * Visitors who prefer reduced motion get the browser's native scrolling instead.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: Target, opts?: { offset?: number }) => {
    const offset = opts?.offset ?? 0;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    const top = typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY : 0;
    window.scrollTo({ top: top + offset, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  // same-page anchor links (#showcase, #book, ...) glide instead of jumping
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const href = a?.getAttribute("href");
      if (!a || !href || href === "#") return;
      const el = href === "#top" ? 0 : document.querySelector<HTMLElement>(href);
      if (el === null) return;
      e.preventDefault();
      scrollTo(el);
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const api = useMemo(() => ({ scrollTo }), [scrollTo]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
