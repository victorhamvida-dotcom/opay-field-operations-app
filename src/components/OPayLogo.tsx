import React, { useState } from 'react';

interface OPayLogoProps {
  height?: number;
  variant?: 'light' | 'dark'; // light = for dark backgrounds
  className?: string;
  /** Prefer uploaded company logo from public/brand when available */
  preferCompanyLogo?: boolean;
  showWordmark?: boolean;
}

/**
 * Brand mark for OPay Field Operations App.
 * - Uses public/brand/company-logo.png (or .svg) when present
 * - Falls back to official-style OPay wordmark SVG
 * Brand colors: OPay Teal #1DCE9F, OPay Navy #210F60
 */
export const OPayLogo: React.FC<OPayLogoProps> = ({
  height = 28,
  variant = 'light',
  className = '',
  preferCompanyLogo = true,
  showWordmark = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const teal = '#1DCE9F';
  const navy = '#210F60';
  const textColor = variant === 'light' ? '#FFFFFF' : navy;
  const barColor = variant === 'light' ? '#0B1020' : navy;
  const width = height * (showWordmark ? 3.05 : 1.15);

  // Try common company logo paths from the other branded app / uploads
  const companyCandidates = [
    '/brand/company-logo.svg',
    '/brand/company-logo.png',
    '/brand/logo.svg',
    '/brand/logo.png',
    '/company-logo.png',
    '/logo.png',
  ];

  if (preferCompanyLogo && !imgFailed) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} style={{ height }}>
        <img
          src={companyCandidates[0]}
          alt="OPay Field Operations"
          height={height}
          style={{ height, width: 'auto', maxWidth: height * 4, objectFit: 'contain' }}
          onError={(e) => {
            const img = e.currentTarget;
            const idx = companyCandidates.indexOf(img.getAttribute('src') || '');
            if (idx >= 0 && idx < companyCandidates.length - 1) {
              img.src = companyCandidates[idx + 1];
            } else {
              setImgFailed(true);
            }
          }}
        />
      </span>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={showWordmark ? '0 0 122 40' : '0 0 40 40'}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="OPay Field Operations App"
    >
      <circle cx="20" cy="20" r="14" fill="none" stroke={teal} strokeWidth="8" />
      <rect x="0" y="16" width="19" height="8" rx="4" fill={barColor} />
      {showWordmark && (
        <text
          x="42"
          y="30"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontWeight="800"
          fontSize="30"
          letterSpacing="-1"
          fill={textColor}
        >
          Pay
        </text>
      )}
    </svg>
  );
};

export const AppBrandName = {
  short: 'Field Operations',
  full: 'OPay Field Operations App',
  product: 'OPay Field Operations',
};
