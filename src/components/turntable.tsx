"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useAnimationFrame, useMotionValue } from "framer-motion";
import type { BikeKind } from "@/lib/data";
import { BikeSvg } from "./bike-art";

/** Z offsets of the stacked copies of the artwork. Seen edge-on they read as the bike's thickness. */
const LAYERS = [-20, -14, -8, -4, 0, 4, 8, 14, 20];

interface TurntableProps {
  kind: BikeKind;
  body: string;
  accent: string;
  /** CSS colour for the platform glow */
  glow: string;
}

/**
 * A spotlit platform with a drag-to-rotate bike. There are no 3D models or photo sequences yet, so the bike is
 * a stack of flat layers turned in CSS 3D: convincing from the sides, honest about being an illustration.
 * It sways gently on its own and returns to that after you let go.
 */
export function Turntable({ kind, body, accent, glow }: TurntableProps) {
  const angle = useMotionValue(0);
  const amp = useMotionValue(1);
  const s = useRef({ dragging: false, sway: true, startX: 0, startAngle: 0, timer: 0 });

  useAnimationFrame((t) => {
    if (s.current.sway) angle.set(Math.sin(t / 1800) * 22 * amp.get());
  });

  useEffect(() => {
    const state = s.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    window.clearTimeout(st.timer);
    st.dragging = true;
    st.sway = false;
    st.startX = e.clientX;
    st.startAngle = angle.get();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (st.dragging) angle.set(st.startAngle + (e.clientX - st.startX) * 0.55);
  };
  const onUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    st.timer = window.setTimeout(() => {
      // settle to the nearest full turn, then ease the sway back in
      const target = Math.round(angle.get() / 360) * 360;
      animate(angle, target, {
        type: "spring",
        stiffness: 70,
        damping: 16,
        onComplete: () => {
          angle.set(0);
          amp.set(0);
          st.sway = true;
          animate(amp, 1, { duration: 1.6 });
        },
      });
    }, 1600);
  };

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-[780px] 2xl:max-w-[900px]" style={{ ["--glow" as string]: glow }}>
      {/* platform: glowing base and rings lying flat */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[2%] -bottom-[4%] h-[34%] [perspective:900px]">
        <div className="absolute inset-0 [transform:rotateX(72deg)]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--glow)_0%,transparent_66%)] opacity-70" />
          <div className="absolute inset-[4%] rounded-full border border-white/20 shadow-[0_0_44px_var(--glow),inset_0_0_30px_rgba(255,255,255,0.05)]" />
          <div className="absolute inset-[14%] animate-[ring-spin_26s_linear_infinite] rounded-full border-2 border-dashed border-white/35" />
          <div className="absolute inset-[24%] animate-[ring-spin-rev_18s_linear_infinite] rounded-full border border-white/30" />
          <div className="absolute inset-[34%] rounded-full border border-white/20 shadow-[0_0_22px_var(--glow)]" />
        </div>
      </div>
      {/* flat contact shadow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[10%] bottom-[2%] h-[7%] rounded-full bg-black/60 blur-xl" />

      <div
        role="img"
        aria-label="Drag left or right to turn the bike"
        className="relative aspect-[640/360] cursor-grab touch-pan-y select-none [perspective:1200px] active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY: angle }}>
          {LAYERS.map((z, i) => (
            <div key={z} className="absolute inset-0" style={{ transform: `translateZ(${z}px)`, filter: i < LAYERS.length - 1 ? `brightness(${0.32 + i * 0.05})` : undefined }}>
              <BikeSvg kind={kind} body={body} accent={accent} uid={`t${i}`} shadow={false} className="block h-auto w-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
