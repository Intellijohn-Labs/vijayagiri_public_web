"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { MODELS, SITE, modelById } from "@/lib/data";
import { fmt12, nowInShopTime } from "@/lib/time";
import { waLink } from "@/lib/whatsapp";
import { useBooking } from "./booking-context";
import { useGearSection } from "./gear-context";
import { useToast } from "./toast";
import { Container, SectionHeading } from "./ui";

const STEPS = ["Model", "Date & time", "Your details"];
const LAST_STEP = STEPS.length - 1;

interface Day {
  iso: string;
  weekday: string;
  day: string;
  month: string;
  dow: number;
}
interface Calendar {
  days: Day[];
  todayISO: string;
  nowMin: number;
}

/** Fourteen days starting today, in the dealership's time zone. Built in the browser after mount. */
function buildCalendar(): Calendar {
  const now = new Date();
  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timeZone }).format(now);
  const [y, m, d] = todayISO.split("-").map(Number);
  const days = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const f = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString("en-IN", { ...o, timeZone: "UTC" });
    return { iso: dt.toISOString().slice(0, 10), weekday: f({ weekday: "short" }), day: f({ day: "numeric" }), month: f({ month: "short" }), dow: dt.getUTCDay() };
  });
  const t = nowInShopTime(now);
  return { days, todayISO, nowMin: t.min };
}

/** Hourly slots between the default ride hours; for today, only the ones still ahead. */
function slotsFor(iso: string, cal: Calendar): string[] {
  if (!cal.days.some((d) => d.iso === iso)) return [];
  const [oh] = SITE.testRideHours.open.split(":").map(Number);
  const [ch] = SITE.testRideHours.close.split(":").map(Number);
  const out: string[] = [];
  for (let h = oh; h < ch; h++) {
    if (iso === cal.todayISO && h * 60 <= cal.nowMin + 30) continue;
    out.push(`${String(h).padStart(2, "0")}:00`);
  }
  return out;
}

function cleanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

/** Gear 6: a four-step test-ride request. It hands the finished request to WhatsApp (there is no booking backend). */
export function Booking() {
  const ref = useRef<HTMLElement>(null);
  const toast = useToast();
  const { preset } = useBooking();
  useGearSection(ref, 6);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [modelId, setModelId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [cal, setCal] = useState<Calendar | null>(null);
  const [seen, setSeen] = useState(preset.nonce);

  // a "book a test ride" button elsewhere on the page pre-fills the form
  if (seen !== preset.nonce) {
    setSeen(preset.nonce);
    setSent(false);
    setTouched(false);
    setDate(null);
    setSlot(null);
    if (preset.modelId) setModelId(preset.modelId);
    setNote(preset.note ?? "");
    setDir(1);
    setStep(preset.modelId ? 1 : 0);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setCal(buildCalendar()));
    return () => cancelAnimationFrame(id);
  }, []);

  const model = modelId ? modelById(modelId) : null;
  const slots = date && cal ? slotsFor(date, cal) : [];
  const phoneOk = cleanPhone(phone);
  const nameOk = name.trim().length >= 2;

  const canNext = [Boolean(modelId), Boolean(date && slot), nameOk && Boolean(phoneOk)][step];
  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };
  const next = () => {
    if (step === LAST_STEP) return submit();
    if (canNext) go(step + 1);
  };

  function submit() {
    setTouched(true);
    if (!model || !date || !slot || !nameOk || !phoneOk) return;
    const day = cal?.days.find((d) => d.iso === date);
    const when = day ? `${day.weekday}, ${day.day} ${day.month}` : date;
    const text = [
      "Hi Vijayagiri Yamaha, I'd like to book a test ride.",
      `Model: Yamaha ${model.name}`,
      `Preferred slot: ${when}, ${fmt12(slot)}`,
      `Name: ${name.trim()}`,
      `Phone: +91 ${phoneOk}`,
      note.trim() && `Note: ${note.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(SITE.hotline, text), "_blank", "noopener,noreferrer");
    setSent(true);
    toast({ title: "Test-ride request ready", body: "Send the message in WhatsApp to confirm your slot. It isn't booked until we reply." });
  }

  function reset() {
    setSent(false);
    setTouched(false);
    setStep(0);
    setDir(-1);
    setModelId(null);
    setDate(null);
    setSlot(null);
    setName("");
    setPhone("");
    setNote("");
  }

  const label = "text-xs font-semibold uppercase tracking-[0.18em] text-slate-400";
  const input = "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-race focus:outline-none focus:ring-2 focus:ring-race/40";

  return (
    <section id="book" ref={ref} className="relative overflow-hidden bg-night py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_100%,rgba(30,70,190,0.3),transparent_70%)]" />
      <Container className="relative">
        <SectionHeading eyebrow="The Summit" title={<>Book your <span className="text-outline-strong">test ride</span></>}>
          Three quick steps. We&apos;ll pass your request to our team on WhatsApp, and they confirm the slot with you there.
        </SectionHeading>

        <div className="glass mt-12 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-3xl lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* progress */}
          <ol className="flex gap-2 overflow-x-auto border-b border-white/10 p-4 lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:p-6" aria-label="Booking steps">
            {STEPS.map((s, i) => {
              const done = i < step || sent;
              return (
                <li key={s} className="shrink-0">
                  <button type="button" disabled={i > step && !sent} onClick={() => i < step && go(i)} aria-current={i === step && !sent ? "step" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${i === step && !sent ? "bg-race/20 text-white" : "text-slate-400"} ${i < step ? "hover:text-white" : ""}`}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-race text-white" : i === step ? "border border-race text-white" : "border border-white/20"}`}>{done ? <Check className="size-4" /> : i + 1}</span>
                    <span className={i === step && !sent ? "" : "max-sm:hidden"}>{s}</span>
                  </button>
                </li>
              );
            })}
            <li className="mt-auto hidden pt-6 text-xs leading-relaxed text-slate-500 lg:block">
              {model ? <p className="font-semibold text-slate-300">Yamaha {model.short}</p> : null}
              {date && slot ? <p>{date} · {fmt12(slot)}</p> : null}
            </li>
          </ol>

          <div className="relative min-h-[26rem] min-w-0 p-5 sm:p-8">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-start justify-center gap-4">
                <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Send className="size-6" />
                </span>
                <h3 className="font-display text-4xl font-extrabold uppercase italic text-white">Almost there</h3>
                <p className="max-w-lg text-slate-300">
                  Your request for the <strong className="text-white">Yamaha {model?.short}</strong> is ready in WhatsApp. Tap send there; our team will reply to confirm your slot.
                </p>
                <p className="text-sm text-slate-500">WhatsApp didn&apos;t open? Allow pop-ups for this site, then submit again.</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={submit} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-600 active:scale-95">
                    <Send className="size-4" /> Open WhatsApp again
                  </button>
                  <button type="button" onClick={reset} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5">
                    Book another ride
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }}>
                    {step === 0 && (
                      <fieldset>
                        <legend className={label}>1 · Choose your Yamaha</legend>
                        <div role="radiogroup" aria-label="Model" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {MODELS.map((m) => (
                            <button key={m.id} type="button" role="radio" aria-checked={modelId === m.id} onClick={() => setModelId(m.id)} className={`rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${modelId === m.id ? "border-race bg-race/15 shadow-[0_0_0_1px_var(--color-race)]" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
                              <p className="font-display text-2xl font-extrabold uppercase italic leading-none text-white">{m.short}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {m.series} · {m.specs.engine}
                              </p>
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    )}

                    {step === 1 && (
                      <div>
                        <p className={label}>2 · Choose a day</p>
                        {!cal ? (
                          <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white/5" />
                        ) : (
                          <div role="radiogroup" aria-label="Day" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
                            {cal.days.map((d) => {
                              const open = slotsFor(d.iso, cal).length > 0;
                              const on = date === d.iso;
                              return (
                                <button key={d.iso} type="button" role="radio" aria-checked={on} disabled={!open} onClick={() => { setDate(d.iso); if (slot && !slotsFor(d.iso, cal).includes(slot)) setSlot(null); }} className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${on ? "border-race bg-race text-white shadow-lg shadow-blue-600/30" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/30"}`}>
                                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{d.weekday}</span>
                                  <span className="font-display text-3xl font-extrabold italic leading-none">{d.day}</span>
                                  <span className="text-[11px] opacity-80">{d.month}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className={`${label} mt-6`}>Preferred time</p>
                        {date ? (
                          slots.length ? (
                            <div role="radiogroup" aria-label="Time" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                              {slots.map((s) => (
                                <button key={s} type="button" role="radio" aria-checked={slot === s} onClick={() => setSlot(s)} className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all active:scale-95 ${slot === s ? "border-race bg-race/20 text-white" : "border-white/10 text-slate-300 hover:border-white/30"}`}>
                                  {fmt12(s)}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-400">No slots left that day. Please pick another day.</p>
                          )
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">Pick a day to see the times.</p>
                        )}
                      </div>
                    )}

                    {step === LAST_STEP && (
                      <div>
                        <p className={label}>3 · How should we reach you?</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-medium text-slate-200">
                            Your name
                            <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Arjun Menon" aria-invalid={touched && !nameOk} />
                            {touched && !nameOk && <span className="mt-1 block text-xs text-red-400">Please enter your name.</span>}
                          </label>
                          <label className="block text-sm font-medium text-slate-200">
                            Mobile number
                            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={touched && !phoneOk} />
                            {touched && !phoneOk && <span className="mt-1 block text-xs text-red-400">Enter a 10-digit Indian mobile number.</span>}
                          </label>
                          <label className="block text-sm font-medium text-slate-200 sm:col-span-2">
                            Anything else? <span className="text-slate-500">(optional)</span>
                            <textarea className={`${input} min-h-20 resize-y`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Riding experience, colour you want to see, a route you have in mind…" />
                          </label>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-slate-500">We use your name and number only to send this request on WhatsApp. Nothing is stored on this site.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white disabled:invisible">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button type="button" onClick={next} disabled={!canNext && step !== LAST_STEP} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                    {step === LAST_STEP ? (
                      <>
                        Send request on WhatsApp <Send className="size-4" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
