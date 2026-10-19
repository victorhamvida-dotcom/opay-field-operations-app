// Company Branding and Logo Configuration
// Allows Creator and DH to customize company name, logo image (URL or uploaded file),
// and branding theme across the entire OPay Field Operations App.

export interface CompanyBranding {
  companyName: string;
  subTitle: string;
  logoType: 'opay_default' | 'custom_image' | 'hamvida';
  customLogoUrl?: string; // Data URL or Web URL of the company logo
  accentColor?: string;
  partnerBrandName?: string;
}

export const STORAGE_COMPANY_BRANDING_KEY = 'opay_company_branding_config_v1';

export const DEFAULT_COMPANY_BRANDING: CompanyBranding = {
  companyName: 'OPay Field Operations App',
  subTitle: 'Official Merchant Loan Disbursement & CDL Policy Simulator',
  logoType: 'opay_default',
  accentColor: '#1DCE9F',
  partnerBrandName: 'OPay Digital Services Nigeria',
};

export function getCompanyBranding(): CompanyBranding {
  try {
    const saved = localStorage.getItem(STORAGE_COMPANY_BRANDING_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.companyName) {
        return { ...DEFAULT_COMPANY_BRANDING, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_COMPANY_BRANDING;
}

export function saveCompanyBranding(branding: CompanyBranding): void {
  try {
    localStorage.setItem(STORAGE_COMPANY_BRANDING_KEY, JSON.stringify(branding));
  } catch {}
}
