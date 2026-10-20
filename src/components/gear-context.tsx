"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface GearApi {
  gear: number;
  setGear: (g: number) => void;
}
const GearContext = createContext<GearApi>({ gear: 0, setGear: () => {} });
export const useGear = () => useContext(GearContext);

export function GearProvider({ children }: { children: ReactNode }) {
  const [gear, setGear] = useState(0);
  return <GearContext.Provider value={{ gear, setGear }}>{children}</GearContext.Provider>;
}

/** Shifts the HUD into `gear` while this section is crossing the middle of the viewport. */
export function useGearSection(ref: RefObject<HTMLElement | null>, gear: number) {
  const { setGear } = useGear();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: () => setGear(gear),
      onEnterBack: () => setGear(gear),
    });
    return () => st.kill();
  }, [ref, gear, setGear]);
}
