import React from 'react';
import { CompanyBranding, getCompanyBranding } from '../types/companyBranding';

interface OPayLogoProps {
  height?: number;
  variant?: 'light' | 'dark'; // light = for dark backgrounds
  className?: string;
  customBranding?: CompanyBranding;
  showCompanyName?: boolean;
}

/**
 * Universal Brand & Logo Component:
 * Automatically renders official OPay brand vector, custom uploaded company logo,
 * or creator's company branding with fallback.
 */
export const OPayLogo: React.FC<OPayLogoProps> = ({ 
  height = 28, 
  variant = 'light', 
  className = '',
  customBranding,
  showCompanyName = false
}) => {
  const branding = customBranding || getCompanyBranding();

  // If a custom image was uploaded or set from another app/slot
  if (branding.logoType === 'custom_image' && branding.customLogoUrl) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={branding.customLogoUrl}
          alt={branding.companyName || 'Company Logo'}
          style={{ height: `${height}px`, maxHeight: `${height}px` }}
          className="object-contain rounded-md"
          onError={(e) => {
            // Fallback to vector if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {showCompanyName && (
          <span className="font-extrabold text-sm tracking-tight text-white truncate">
            {branding.companyName}
          </span>
        )}
      </div>
    );
  }

  // If Hamvida / Creator Company Branding is selected
  if (branding.logoType === 'hamvida') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-neutral-950 shadow-md"
          style={{ width: `${height}px`, height: `${height}px`, fontSize: `${Math.round(height * 0.55)}px` }}
        >
          H
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-sm tracking-tight text-white">
            HAMVIDA
          </span>
          <span className="text-[9px] font-bold text-emerald-400 tracking-wider font-mono">
            FIELD OPS
          </span>
        </div>
      </div>
    );
  }

  // Default: Official OPay brand vector wordmark
  const teal = '#1DCE9F';
  const navy = '#210F60';
  const textColor = variant === 'light' ? '#FFFFFF' : navy;
  const barColor = variant === 'light' ? '#0B1020' : navy;
  const width = height * 3.05;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 122 40"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="OPay"
      >
        {/* Teal ring O */}
        <circle cx="20" cy="20" r="14" fill="none" stroke={teal} strokeWidth="8" />
        {/* Navy signature bar crossing left side of the O */}
        <rect x="0" y="16" width="19" height="8" rx="4" fill={barColor} />
        {/* Inner accent to mimic dark-and-teal split */}
        <rect x="10" y="16" width="9" height="8" rx="4" fill={teal} opacity="0.0" />

        {/* "Pay" wordmark */}
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
      </svg>
      {showCompanyName && (
        <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
          {branding.companyName}
        </span>
      )}
    </div>
  );
};
