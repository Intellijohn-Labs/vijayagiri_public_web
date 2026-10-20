/** Simple line-art icons for the riding-gear cards. */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function JacketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path {...stroke} d="M42 18 L24 28 L10 64 L26 70 L32 52 L32 104 L88 104 L88 52 L94 70 L110 64 L96 28 L78 18 C74 28 46 28 42 18 Z" />
      <path {...stroke} d="M60 30 L60 104" />
      <path {...stroke} d="M38 62 L50 62 M70 62 L82 62" opacity="0.7" />
      <path {...stroke} d="M14 60 L28 66 M106 60 L92 66" opacity="0.5" />
      <rect x="38" y="36" width="14" height="14" rx="3" fill="currentColor" opacity="0.25" />
      <rect x="68" y="36" width="14" height="14" rx="3" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

export function HelmetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path {...stroke} d="M16 74 C14 40 36 18 64 18 C92 18 108 40 106 66 L106 82 C106 90 100 96 92 96 L70 96 C66 90 60 86 54 86 L28 86 C20 86 16 82 16 74 Z" />
      <path {...stroke} d="M62 48 L104 48 C106 56 106 62 104 70 L62 70 C58 64 58 54 62 48 Z" fill="currentColor" fillOpacity="0.18" />
      <path {...stroke} d="M30 36 C40 26 52 22 64 22" opacity="0.6" />
      <path {...stroke} d="M44 100 L76 100" opacity="0.5" />
    </svg>
  );
}

export function GlovesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path {...stroke} d="M36 106 L34 70 L24 56 C20 50 26 44 32 48 L40 56 L40 28 C40 22 48 22 48 28 L48 48 L50 20 C50 14 58 14 58 20 L58 48 L62 24 C62 18 70 18 70 24 L68 52 L76 34 C78 28 86 30 84 36 L76 66 L88 56 C93 52 98 58 94 63 L78 90 L76 106 Z" />
      <path {...stroke} d="M36 98 L76 98" opacity="0.6" />
      <path {...stroke} d="M44 62 L70 62" opacity="0.4" />
    </svg>
  );
}

export function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path {...stroke} d="M24 48 C24 40 30 34 38 34 L82 34 C90 34 96 40 96 48 L100 90 C100 96 96 100 90 100 L30 100 C24 100 20 96 20 90 Z" />
      <path {...stroke} d="M44 34 C44 24 50 20 60 20 C70 20 76 24 76 34" />
      <path {...stroke} d="M22 60 L98 60" opacity="0.6" />
      <rect x="50" y="56" width="20" height="14" rx="4" fill="currentColor" opacity="0.28" />
      <path {...stroke} d="M16 84 L8 84 M104 84 L112 84" opacity="0.6" />
    </svg>
  );
}
