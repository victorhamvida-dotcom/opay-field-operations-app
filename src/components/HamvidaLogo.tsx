import React from 'react';

interface HamvidaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

/**
 * Official Hamvida Tech Logo Component
 * Yellow-gold rounded stadium enclosure with modern stylized "H" monogram
 * Matching the official brand asset provided by Hamzat Victor Chisom.
 */
export const HamvidaLogo: React.FC<HamvidaLogoProps> = ({ 
  size = 28, 
  className = '',
  showText = false 
}) => {
  const gold = '#F6D870'; // Official Hamvida gold
  const bgNavy = '#141724'; // Brand dark badge background

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={Math.round(size * 1.15)}
        viewBox="0 0 100 115"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        role="img"
        aria-label="Hamvida Tech"
      >
        {/* Dark badge background */}
        <rect
          x="4"
          y="4"
          width="92"
          height="107"
          rx="32"
          fill={bgNavy}
        />
        {/* Outer Gold Stadium Rounded Border */}
        <rect
          x="8"
          y="8"
          width="84"
          height="99"
          rx="28"
          fill="none"
          stroke={gold}
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stylized Modern 'H' Monogram matching the official Hamvida mark */}
        {/* Left vertical pillar */}
        <path
          d="M 33 28 L 33 87"
          stroke={gold}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Right vertical pillar */}
        <path
          d="M 67 28 L 67 87"
          stroke={gold}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Stylized bridge with slight right-drop curve signature */}
        <path
          d="M 33 56 C 45 56, 57 56, 67 61"
          stroke={gold}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
          <span>Made by</span>
          <span className="text-[#F6D870] font-black tracking-normal">Hamvida Tech</span>
        </span>
      )}
    </div>
  );
};
