"use client";

import { useEffect, useRef } from "react";

/** A soft burst of mist over the stage whenever `trigger` changes (not on first paint, and not for reduced motion). */
export function Mist({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const puffs = Array.from({ length: 64 }, () => ({
      x: w * (0.2 + Math.random() * 0.6),
      y: h * (0.4 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 2.4,
      vy: -(Math.random() * 1.2 + 0.1),
      r: 36 + Math.random() * 90,
      ttl: 50 + Math.random() * 45,
      age: -Math.random() * 14,
    }));

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of puffs) {
        p.age += 1;
        if (p.age < 0) {
          alive = true;
          continue;
        }
        if (p.age > p.ttl) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        const k = p.age / p.ttl;
        const a = Math.sin(Math.PI * k) * 0.2;
        const r = p.r * (0.7 + k * 0.8);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(175,205,255,${a})`);
        g.addColorStop(1, "rgba(175,205,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />;
}
