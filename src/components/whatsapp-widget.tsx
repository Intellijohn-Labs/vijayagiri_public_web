"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SITE } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

const MESSAGE = "Hi Vijayagiri Yamaha, I would like to know more about vehicle models and pricing.";
const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.52.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.3 1.263.489 1.694.626.712.226 1.36.195 1.871.12.571-.09 1.758-.72 2.006-1.41.248-.69.248-1.289.173-1.41-.074-.123-.272-.195-.57-.345m-5.446 7.443h-.016a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";

/** Floating chat button for the 24/7 WhatsApp bot. It does not depend on showroom hours. */
export function WhatsAppWidget() {
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let was = false;
    try {
      was = sessionStorage.getItem("vy-wa-dismissed") === "1";
    } catch {
      /* storage blocked: fine */
    }
    if (was) {
      const id = requestAnimationFrame(() => setDismissed(true));
      return () => cancelAnimationFrame(id);
    }
    // on phones the prompt would cover content, so it only appears there on tap / focus
    if (!window.matchMedia("(min-width: 640px)").matches) return;
    const open = window.setTimeout(() => setBubble(true), 4000);
    const close = window.setTimeout(() => setBubble(false), 14000);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(close);
    };
  }, []);

  const dismiss = () => {
    setBubble(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("vy-wa-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-6 sm:right-6" onMouseEnter={() => !dismissed && setBubble(true)} onMouseLeave={() => setBubble(false)}>
      <AnimatePresence>
        {bubble && !dismissed && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.22 }} className="glass relative w-max max-w-[19rem] rounded-2xl rounded-br-sm py-3 pl-4 pr-10 shadow-2xl shadow-black/50">
            <button type="button" onClick={dismiss} aria-label="Dismiss chat prompt" className="absolute right-2 top-2 grid size-6 place-items-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
              <X className="size-3.5" />
            </button>
            <p className="whitespace-nowrap text-sm font-semibold text-white">Chat with Vijayagiri Yamaha AI 💬</p>
            <p className="mt-0.5 flex items-center gap-2 text-xs font-medium leading-snug text-emerald-400">
              <span className="relative inline-flex size-2 shrink-0 rounded-full bg-emerald-500">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500" />
              </span>
              24/7 Instant WhatsApp Bot • Always Available
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <a href={waLink(SITE.botWhatsapp, MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Chat with Vijayagiri Yamaha AI on WhatsApp (24/7 instant bot reply)" onFocus={() => !dismissed && setBubble(true)} className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] hover:shadow-2xl active:scale-95 sm:size-[58px]">
        <span aria-hidden className="absolute inset-0 animate-[ping-slow_4.5s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[#25D366] motion-reduce:hidden" />
        <svg viewBox="0 0 24 24" className="relative size-7" fill="currentColor" aria-hidden>
          <path d={WA_PATH} />
        </svg>
        <span aria-hidden className="absolute right-0.5 top-0.5 size-3.5 rounded-full border-2 border-ink bg-emerald-400" />
      </a>
    </div>
  );
}
