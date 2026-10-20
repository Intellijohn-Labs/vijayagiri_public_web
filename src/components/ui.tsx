import type { ReactNode } from "react";

/** Page-width wrapper. Extra right padding on large screens keeps content clear of the gear dial. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:pl-10 lg:pr-44 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-race-soft">{children}</p>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-3xl pr-14 sm:pr-0">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display mt-3 text-5xl font-extrabold uppercase italic leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">{title}</h2>
      {children && <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{children}</p>}
    </div>
  );
}
