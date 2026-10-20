import { useId } from "react";
import type { BikeKind } from "@/lib/data";

/** Lightens (+) or darkens (−) a #rrggbb colour. */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v));
  const r = c((n >> 16) + amt);
  const g = c(((n >> 8) & 255) + amt);
  const b = c((n & 255) + amt);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

interface WheelProps {
  cx: number;
  cy: number;
  r: number;
  id: string;
}

function Wheel({ cx, cy, r, id }: WheelProps) {
  const rim = r - 14;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0a0c11" />
      <circle cx={cx} cy={cy} r={r - 2.5} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={rim + 3} fill="#10131a" stroke="url(#alloy-ring)" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r - 36} fill="none" stroke="#7e8798" strokeWidth="1.4" opacity="0.7" />
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          transform={`rotate(${a} ${cx} ${cy})`}
          d={`M${cx - 4.5} ${cy - 9} L${cx - 8.5} ${cy - rim + 2} L${cx + 8.5} ${cy - rim + 2} L${cx + 4.5} ${cy - 9} Z`}
          fill={`url(#alloy-${id})`}
        />
      ))}
      <circle cx={cx} cy={cy} r="10" fill="#222733" stroke="#aab2c2" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3.4" fill="#aab2c2" />
      {/* brake caliper */}
      <rect x={cx + r - 46} y={cy - 12} width="14" height="24" rx="3" fill="#c0392b" opacity="0.9" />
    </g>
  );
}

function Defs({ id, body }: { id: string; body: string }) {
  return (
    <defs>
      <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(body, 46)} />
        <stop offset="0.45" stopColor={body} />
        <stop offset="1" stopColor={shade(body, -48)} />
      </linearGradient>
      <linearGradient id={`bodyd-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(body, -10)} />
        <stop offset="1" stopColor={shade(body, -74)} />
      </linearGradient>
      <linearGradient id={`steel-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f1f4fa" />
        <stop offset="0.5" stopColor="#a9b1c1" />
        <stop offset="1" stopColor="#5a6272" />
      </linearGradient>
      <linearGradient id={`alloy-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d7dce8" />
        <stop offset="1" stopColor="#6d7587" />
      </linearGradient>
      <linearGradient id="alloy-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e6eaf3" />
        <stop offset="1" stopColor="#7b8396" />
      </linearGradient>
      <linearGradient id={`engine-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a404d" />
        <stop offset="1" stopColor="#171a21" />
      </linearGradient>
      <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f0cf7a" />
        <stop offset="1" stopColor="#a7802f" />
      </linearGradient>
      <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#bcd3ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#6c8fe0" stopOpacity="0.18" />
      </linearGradient>
    </defs>
  );
}



function R15({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <path d="M222 232 L124 246 L114 262 L224 252 Z" fill="#1a1d25" />
      <path d="M96 268 Q92 256 106 254 L214 242 Q228 241 230 252 L231 262 Q230 272 216 273 L108 286 Q94 287 96 268 Z" fill={`url(#steel-${id})`} />
      <ellipse cx="97" cy="270" rx="6" ry="14" fill="#2a2f3a" />
      <path d="M262 204 L346 198 L370 222 L364 276 L278 286 L254 250 Z" fill={`url(#engine-${id})`} />
      {[214, 226, 238, 250, 262].map((y) => (
        <line key={y} x1="272" y1={y} x2="358" y2={y - 4} stroke="rgba(255,255,255,0.09)" strokeWidth="2" />
      ))}
      <circle cx="314" cy="254" r="22" fill="#232833" stroke="#4a5262" strokeWidth="2" />
      <path d="M362 226 C346 248 310 282 226 270" fill="none" stroke={`url(#steel-${id})`} strokeWidth="8" strokeLinecap="round" />

      <Wheel cx={118} cy={254} r={84} id={id} />

      {/* tail, seat, tank */}
      <path d="M50 104 C66 94 112 94 152 102 L222 114 L244 142 L232 172 L160 166 C104 160 62 134 50 104 Z" fill={`url(#body-${id})`} />
      <path d="M48 102 L62 98 L66 112 L52 114 Z" fill="#ff3b4d" />
      <path d="M150 106 C180 112 210 118 232 128" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2" />
      <path d="M150 100 L236 108 L270 122 L236 132 L168 124 Z" fill="#14161c" />
      <path d="M250 116 C276 86 336 78 384 90 L418 112 L402 138 C366 146 306 146 266 140 Z" fill={`url(#body-${id})`} />
      <path d="M270 100 C306 88 346 88 380 98" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />

      {/* side panel + belly pan + fairing */}
      <path d="M300 140 L412 140 L452 214 L474 238 L346 252 L318 214 Z" fill={`url(#bodyd-${id})`} />
      <path d="M318 150 L404 150 L440 208" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <path d="M392 100 C440 70 510 66 556 82 L590 130 L584 152 C556 170 500 172 462 164 C436 158 410 146 396 130 Z" fill={`url(#body-${id})`} />
      <path d="M420 120 C470 112 520 116 572 134" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
      <path d="M420 146 C470 152 530 154 582 146" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />

      {/* screen, mirror, clip-on */}
      <path d="M470 82 L522 34 C531 28 541 33 540 44 L560 90 C524 86 494 84 470 82 Z" fill={`url(#glass-${id})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d="M418 104 L440 96" stroke="#20242d" strokeWidth="7" strokeLinecap="round" />
      <path d="M440 98 L452 80" stroke="#20242d" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="456" cy="76" rx="12" ry="6" transform="rotate(-28 456 76)" fill={`url(#bodyd-${id})`} />

      {/* split LED headlight */}
      <path d="M544 116 L586 126 L584 134 L542 124 Z" fill="#eaf6ff" />
      <path d="M540 136 L578 142 L576 148 L538 143 Z" fill="#cfe3ff" />

      {/* USD fork (leans back ~25°), fender, front wheel */}
      <path d="M466 168 L478 214" stroke={`url(#gold-${id})`} strokeWidth="10" strokeLinecap="round" />
      <path d="M478 214 L489 254" stroke="#b9c0cf" strokeWidth="13" strokeLinecap="round" />
      <path d="M424 192 C452 160 520 158 548 190 L538 198 C516 176 460 178 436 204 Z" fill={`url(#body-${id})`} />
      <Wheel cx={489} cy={254} r={84} id={id} />
    </g>
  );
}

function MT15({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <path d="M222 232 L124 246 L114 262 L224 252 Z" fill="#1a1d25" />
      <path d="M104 268 Q100 258 112 256 L212 244 Q226 243 228 254 L229 262 Q228 271 214 272 L114 284 Q102 285 104 268 Z" fill={`url(#steel-${id})`} />
      <ellipse cx="105" cy="270" rx="5" ry="13" fill="#2a2f3a" />
      <Wheel cx={118} cy={254} r={84} id={id} />

      {/* trellis frame + engine */}
      <path d="M418 118 L330 148 L262 190 L226 236" fill="none" stroke="#252a34" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M418 124 L382 196 L360 226" fill="none" stroke="#252a34" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M262 204 L346 198 L370 222 L364 276 L278 286 L254 250 Z" fill={`url(#engine-${id})`} />
      {[214, 226, 238, 250, 262].map((y) => (
        <line key={y} x1="272" y1={y} x2="358" y2={y - 4} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      ))}
      <circle cx="314" cy="254" r="22" fill="#232833" stroke="#4d5565" strokeWidth="2" />
      <path d="M362 226 C346 248 310 282 228 268" fill="none" stroke={`url(#steel-${id})`} strokeWidth="8" strokeLinecap="round" />

      {/* tail, seat, tank + shrouds */}
      <path d="M62 118 C80 104 130 100 200 108 L246 120 L252 146 L214 170 L150 164 C104 158 70 140 62 118 Z" fill={`url(#body-${id})`} />
      <path d="M60 116 L74 112 L76 126 L62 128 Z" fill="#ff3b4d" />
      <path d="M150 106 L238 112 L272 124 L238 134 L170 128 Z" fill="#14161c" />
      <path d="M262 120 C290 92 346 86 392 98 L424 118 L408 146 C372 154 314 152 278 146 Z" fill={`url(#body-${id})`} />
      <path d="M392 98 L446 104 L456 132 L424 140 Z" fill={accent} opacity="0.95" />
      <path d="M280 106 C312 94 350 94 384 104" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />

      {/* bars + mirror */}
      <path d="M420 112 L432 80 L454 74" fill="none" stroke="#20242d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M450 75 L466 71" stroke="#0b0c10" strokeWidth="10" strokeLinecap="round" />
      <path d="M436 80 L446 56" stroke="#20242d" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="452" cy="52" rx="12" ry="6" transform="rotate(-22 452 52)" fill={`url(#bodyd-${id})`} />

      {/* LED cluster */}
      <path d="M452 92 L500 80 L520 104 L462 114 Z" fill={`url(#body-${id})`} />
      <path d="M456 108 C486 98 520 106 528 124 L522 146 C496 154 466 146 456 130 Z" fill="#11141b" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <path d="M470 118 L514 114" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      <path d="M472 134 L512 130" stroke="#cfe3ff" strokeWidth="4" strokeLinecap="round" opacity="0.92" />

      {/* USD fork, fender, front wheel */}
      <path d="M434 130 L468 208" stroke={`url(#gold-${id})`} strokeWidth="10" strokeLinecap="round" />
      <path d="M468 208 L489 254" stroke="#b9c0cf" strokeWidth="13" strokeLinecap="round" />
      <path d="M452 190 C476 172 520 172 540 190 L532 198 C514 184 480 186 462 202 Z" fill={`url(#body-${id})`} />
      <Wheel cx={489} cy={254} r={84} id={id} />
    </g>
  );
}

function Aerox({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <path d="M74 250 L190 254 L200 276 L80 284 Z" fill={`url(#steel-${id})`} />
      <ellipse cx="76" cy="268" rx="6" ry="17" fill="#2a2f3a" />
      <path d="M205 252 L125 268" stroke="#1a1d25" strokeWidth="16" strokeLinecap="round" />
      <Wheel cx={125} cy={268} r={70} id={id} />

      {/* rear body, seat, CVT cover */}
      <path d="M62 168 C70 130 150 112 220 118 L286 128 L300 196 L238 226 L160 220 C104 214 58 198 62 168 Z" fill={`url(#body-${id})`} />
      <path d="M116 114 C170 98 248 100 300 120 L306 134 L120 134 Z" fill="#14161c" />
      <path d="M68 172 C130 150 224 156 290 194" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <path d="M60 164 L74 160 L76 176 L62 178 Z" fill="#ff3b4d" />
      <circle cx="212" cy="232" r="28" fill={`url(#bodyd-${id})`} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

      {/* floor + front apron */}
      <path d="M298 232 L420 236 L430 262 L306 262 Z" fill={`url(#bodyd-${id})`} />
      <path d="M418 240 L436 118 L474 90 L522 86 L552 108 L562 160 L536 236 L474 258 L428 258 Z" fill={`url(#body-${id})`} />
      <path d="M440 156 C480 162 520 162 554 148" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <path d="M448 132 C476 118 512 116 542 124" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />

      {/* screen, bars, mirror */}
      <path d="M474 84 L510 52 L534 58 L520 90 Z" fill={`url(#glass-${id})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d="M436 100 L448 62 L482 54" fill="none" stroke="#20242d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M452 62 L462 40" stroke="#20242d" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="466" cy="36" rx="12" ry="6" transform="rotate(-22 466 36)" fill={`url(#bodyd-${id})`} />

      {/* twin LED lamps */}
      <path d="M516 104 L552 106 L554 122 L518 122 Z" fill="#eaf6ff" />
      <path d="M520 113 L548 114" stroke="#fff" strokeWidth="2" opacity="0.9" />

      {/* fork, fender, front wheel */}
      <path d="M494 240 L503 268" stroke="#b9c0cf" strokeWidth="13" strokeLinecap="round" />
      <path d="M460 250 C480 224 528 224 546 250 L536 258 C520 242 490 242 472 260 Z" fill={`url(#body-${id})`} />
      <Wheel cx={503} cy={268} r={70} id={id} />
    </g>
  );
}

export interface BikeSvgProps {
  kind: BikeKind;
  body: string;
  accent?: string;
  className?: string;
  /** Unique key so gradient ids do not collide when several copies are on the page. */
  uid?: string;
  /** Show the contact shadow under the tyres. */
  shadow?: boolean;
}

/** Stylised side-profile bike (facing right) in a 640 × 360 box. The R15's headlight sits near x = 580, y = 126. */
export function BikeSvg({ kind, body, accent = "#ffffff", className, uid, shadow = true }: BikeSvgProps) {
  const auto = useId().replace(/:/g, "");
  const id = `${uid ?? "b"}${auto}`;
  return (
    <svg viewBox="0 0 640 360" className={className} role="img" aria-label={`${kind} illustration`} xmlns="http://www.w3.org/2000/svg">
      <Defs id={id} body={body} />
      {shadow && <ellipse cx="320" cy="340" rx="262" ry="9" fill="rgba(0,0,0,0.55)" />}
      {kind === "r15" && <R15 id={id} accent={accent} />}
      {kind === "mt15" && <MT15 id={id} accent={accent} />}
      {kind === "aerox" && <Aerox id={id} accent={accent} />}
    </svg>
  );
}
