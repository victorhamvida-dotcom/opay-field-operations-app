import React from 'react';

interface HamvidaBrandProps {
  compact?: boolean;
  className?: string;
}

/** Inline Hamvida Tech mark (works in single-file Vercel/GitHub Pages builds) */
function HamvidaMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hamvida Tech"
      className="rounded-lg shrink-0"
    >
      <rect x="8" y="8" width="112" height="112" rx="28" fill="#0B1020" stroke="#F5C542" strokeWidth="8" />
      <path d="M40 36h16v22h16V36h16v56H72V70H56v22H40V36z" fill="#F5C542" />
    </svg>
  );
}

/** Company credit — Hamvida Tech */
export const HamvidaBrand: React.FC<HamvidaBrandProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <a
        href="https://github.com/victorhamvida-dotcom"
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 text-[11px] text-neutral-400 hover:text-amber-300 transition-colors ${className}`}
        title="Made by Hamvida Tech"
      >
        <HamvidaMark size={20} />
        <span>
          Made by <strong className="text-amber-300/90 font-semibold">Hamvida Tech</strong>
        </span>
      </a>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0B1020] border border-amber-400/40 shadow-[0_0_20px_rgba(245,197,66,0.12)]">
        <HamvidaMark size={32} />
        <div className="text-left leading-tight">
          <div className="text-[10px] uppercase tracking-[0.14em] text-amber-400/80 font-bold">Made by</div>
          <div className="text-sm font-black text-amber-300">Hamvida Tech</div>
        </div>
      </div>
      <a
        href="https://github.com/victorhamvida-dotcom"
        target="_blank"
        rel="noreferrer"
        className="text-[10px] text-neutral-500 hover:text-amber-300 transition-colors"
      >
        github.com/victorhamvida-dotcom
      </a>
    </div>
  );
};

export default HamvidaBrand;
