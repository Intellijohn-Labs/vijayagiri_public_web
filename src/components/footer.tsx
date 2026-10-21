"use client";

import Image from "next/image";
import { SITE } from "@/lib/data";
import { useNow } from "@/lib/use-now";

export function Footer() {
  const now = useNow();
  const year = now ? now.getFullYear() : null;
  return (
    <footer id="contact" className="border-t border-white/10 bg-[#03050a] pb-10 pt-16">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:pr-44">
        <div>
          <Image src="/images/vijayagiri-logo.png" alt={SITE.brand} width={1199} height={460} className="h-12 w-auto brightness-0 invert" />
          <p className="mt-4 font-semibold text-white">{SITE.legalName}</p>
          <p className="mt-1 max-w-sm text-sm text-slate-400">Certified Yamaha authorized dealer network across Ernakulam district. Serving riders since {SITE.sinceYear}.</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Quick links</h3>
          <ul className="mt-3 text-sm text-slate-400 sm:mt-4 sm:space-y-2">
            {[["#showcase", "Models"], ["#range", "The range"], ["#routes", "Routes"], ["#gear", "Riding gear"], ["#book", "Book a test ride"], ["#showrooms", "Showrooms"], ["#top", "Back to top"]].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="block py-3 transition-colors hover:text-white sm:inline-block sm:py-0">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contact</h3>
          <ul className="mt-3 text-sm text-slate-400 sm:mt-4 sm:space-y-2">
            <li className="py-2 sm:py-0">
              Support:{" "}
              <a href={`tel:+${SITE.hotline}`} className="inline-block py-3.5 text-white hover:underline sm:py-0">
                {SITE.hotlineDisplay}
              </a>
            </li>
            {SITE.supportEmail && (
              <li>
                Email:{" "}
                <a href={`mailto:${SITE.supportEmail}`} className="text-white hover:underline">
                  {SITE.supportEmail}
                </a>
              </li>
            )}
            <li>Showroom hours: 9:00 AM – 7:00 PM</li>
            {SITE.workingDays && <li>Working days: {SITE.workingDays}</li>}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-2 border-t border-white/10 px-5 pt-6 text-xs text-slate-500 sm:px-8 lg:pr-44">
        <p>
          © {year ?? ""} {SITE.legalName} All rights reserved.
        </p>
        <p>Yamaha and its logos are trademarks of Yamaha Motor Co., Ltd. Vijayagiri Auto Agencies is an authorized dealer. Imagery is illustrative: actual models, colours and specifications may vary.</p>
        <a href={SITE.loginUrl} className="inline-flex min-h-11 w-fit items-center text-slate-600 transition-colors hover:text-slate-300 sm:min-h-0">
          Staff Login
        </a>
      </div>
    </footer>
  );
}
