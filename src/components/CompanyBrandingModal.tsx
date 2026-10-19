import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Check, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  RotateCcw,
  Globe
} from 'lucide-react';
import { 
  CompanyBranding, 
  getCompanyBranding, 
  saveCompanyBranding, 
  DEFAULT_COMPANY_BRANDING 
} from '../types/companyBranding';
import { OPayLogo } from './OPayLogo';
import { soundManager } from '../utils/sound';

interface CompanyBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBranding: (newBranding: CompanyBranding) => void;
}

export const CompanyBrandingModal: React.FC<CompanyBrandingModalProps> = ({
  isOpen,
  onClose,
  onUpdateBranding,
}) => {
  const current = getCompanyBranding();
  const [companyName, setCompanyName] = useState(current.companyName);
  const [subTitle, setSubTitle] = useState(current.subTitle);
  const [logoType, setLogoType] = useState<'opay_default' | 'custom_image' | 'hamvida'>(current.logoType);
  const [customLogoUrl, setCustomLogoUrl] = useState(current.customLogoUrl || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(current.customLogoUrl || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle local file upload (PNG, JPG, SVG, WebP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Image file is too large. Please upload an image under 2.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomLogoUrl(dataUrl);
      setLogoPreview(dataUrl);
      setLogoType('custom_image');
      soundManager.playCollect(1.2);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBranding: CompanyBranding = {
      companyName: companyName.trim() || 'OPay Field Operations App',
      subTitle: subTitle.trim() || 'Official Merchant Loan Disbursement & CDL Policy Simulator',
      logoType,
      customLogoUrl: logoType === 'custom_image' ? customLogoUrl : undefined,
      accentColor: '#1DCE9F',
      partnerBrandName: 'OPay Digital Services Nigeria',
    };

    saveCompanyBranding(finalBranding);
    soundManager.playStampApproval();
    onUpdateBranding(finalBranding);
    setSuccessNotice('Company Logo & Name successfully updated across the app!');
    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 1500);
  };

  const handleRestoreDefault = () => {
    setCompanyName(DEFAULT_COMPANY_BRANDING.companyName);
    setSubTitle(DEFAULT_COMPANY_BRANDING.subTitle);
    setLogoType('opay_default');
    setCustomLogoUrl('');
    setLogoPreview(null);
    soundManager.playClick();
  };

  const previewBranding: CompanyBranding = {
    companyName: companyName.trim() || 'OPay Field Operations App',
    subTitle: subTitle.trim(),
    logoType,
    customLogoUrl: logoPreview || undefined,
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto safe-top safe-bottom">
      <div className="bg-neutral-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Company Branding &amp; Logo Settings</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  CUSTOMIZER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Import your company logo &amp; name from your other app/slot or upload your brand asset
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-xs sm:text-sm text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* Live Logo Preview Box */}
        <div className="my-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-[10px] text-neutral-500 uppercase font-mono font-bold">
            Live Header Logo Preview
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-white shadow-lg inline-flex items-center justify-center">
            <OPayLogo height={32} variant="dark" customBranding={previewBranding} />
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            {companyName || 'OPay Field Operations App'}
          </div>
          <div className="text-[11px] text-neutral-400">
            {subTitle || 'Official Merchant Loan Disbursement & CDL Policy Simulator'}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Logo Source Preset Choice */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Choose Company Logo Source:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogoType('opay_default');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  logoType === 'opay_default'
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-extrabold">Official OPay</div>
                <div className="text-[9.5px] text-neutral-400 mt-0.5">Vector Wordmark</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLogoType('custom_image');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  logoType === 'custom_image'
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-extrabold">Custom Logo</div>
                <div className="text-[9.5px] text-neutral-400 mt-0.5">Upload or URL</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLogoType('hamvida');
                  setCompanyName('Hamvida Field Operations');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  logoType === 'hamvida'
                    ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-extrabold">Hamvida</div>
                <div className="text-[9.5px] text-neutral-400 mt-0.5">Creator Agency</div>
              </button>
            </div>
          </div>

          {/* If Custom Logo selected: Upload from device or Paste Image URL */}
          {logoType === 'custom_image' && (
            <div className="p-3.5 bg-neutral-950 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Logo File or Paste Image URL:</span>
              </div>

              {/* File upload input */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-neutral-700 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Choose Image File (PNG/JPG/SVG)</span>
                </button>
                <span className="text-[11px] text-neutral-400 truncate">
                  Max 2.5MB
                </span>
              </div>

              {/* Paste Image URL */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Or Paste Logo Image URL (e.g., from your GitHub, CDN, or website):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/my-company-logo.png"
                    value={customLogoUrl}
                    onChange={(e) => {
                      setCustomLogoUrl(e.target.value);
                      setLogoPreview(e.target.value);
                    }}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
                  />
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLogoUrl('');
                        setLogoPreview(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Company Name Field */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">
              Company / App Name (Displayed in Header &amp; Documents):
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. OPay Field Operations App"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-semibold"
            />
          </div>

          {/* Subtitle / Operational Tagline */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">
              Operational Subtitle / Department:
            </label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="e.g. Official Merchant Loan Disbursement & CDL Policy Simulator"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-neutral-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE &amp; APPLY COMPANY BRANDING</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreDefault}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Reset to default OPay Field Operations App branding"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </form>

        {/* Footer info for Vercel naming */}
        <div className="mt-4 pt-3 border-t border-neutral-800 text-[10.5px] text-neutral-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Recommended Vercel Domain: <strong className="text-neutral-300 font-mono">opay-field-operations-app.vercel.app</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
