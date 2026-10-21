"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface BookingPreset {
  nonce: number;
  modelId?: string;
  note?: string;
}
interface BookingApi {
  preset: BookingPreset;
  /** Preselect values in the booking form (the caller then scrolls to #book). */
  prefill: (p: Omit<BookingPreset, "nonce">) => void;
}

const BookingContext = createContext<BookingApi>({ preset: { nonce: 0 }, prefill: () => {} });
export const useBooking = () => useContext(BookingContext);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<BookingPreset>({ nonce: 0 });
  const api = useMemo<BookingApi>(() => ({ preset, prefill: (p) => setPreset((prev) => ({ ...p, nonce: prev.nonce + 1 })) }), [preset]);
  return <BookingContext.Provider value={api}>{children}</BookingContext.Provider>;
}
