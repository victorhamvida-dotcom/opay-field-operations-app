export type RegionCode =
  | 'North-West'
  | 'North-East'
  | 'North-Central'
  | 'South-West'
  | 'South-East'
  | 'South-South'
  | 'Lagos North'
  | 'Lagos South'

export interface OfficerMetric {
  id: string;
  name: string;
  role: 'RM' | 'SM' | 'CDLM' | 'CDL';
  region: RegionCode;
  state: string;
  tier?: string;
  potentialPOS: number;
  standardRatio: number;
  excellentRatio: number;
  loans3mo: number;
  disbursedVolume: number;
  compliance: number;
  score: number;
  warning: boolean;
}

export interface RegionRollup {
  region: RegionCode;
  rms: number;
  sms: number;
  cdlms: number;
  cdls: number;
  potentialPOS: number;
  loans3mo: number;
  disbursedVolume: number;
  avgCompliance: number;
  warningCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export const SAMPLE_OFFICERS: OfficerMetric[] = [
  // RMs
  { id: 'rm1', name: 'Amina Bello', role: 'RM', region: 'North-West', state: 'HQ Kano', potentialPOS: 8200, standardRatio: 58, excellentRatio: 41, loans3mo: 420, disbursedVolume: 890000000, compliance: 94, score: 91000, warning: false },
  { id: 'rm2', name: 'Chukwudi Okafor', role: 'RM', region: 'South-East', state: 'HQ Enugu', potentialPOS: 6100, standardRatio: 55, excellentRatio: 38, loans3mo: 310, disbursedVolume: 640000000, compliance: 91, score: 84000, warning: false },
  { id: 'rm3', name: 'Folake Adeyemi', role: 'RM', region: 'South-West', state: 'HQ Ibadan', potentialPOS: 9400, standardRatio: 62, excellentRatio: 44, loans3mo: 510, disbursedVolume: 1120000000, compliance: 96, score: 98000, warning: false },
  { id: 'rm4', name: 'Ibrahim Yusuf', role: 'RM', region: 'North-Central', state: 'HQ Abuja', potentialPOS: 7000, standardRatio: 57, excellentRatio: 39, loans3mo: 360, disbursedVolume: 720000000, compliance: 92, score: 87000, warning: false },
  { id: 'rm5', name: 'Grace Ekong', role: 'RM', region: 'South-South', state: 'HQ Port Harcourt', potentialPOS: 5800, standardRatio: 53, excellentRatio: 36, loans3mo: 280, disbursedVolume: 590000000, compliance: 89, score: 80000, warning: false },
  { id: 'rm6', name: 'Tunde Bakare', role: 'RM', region: 'Lagos South', state: 'HQ Ikeja', potentialPOS: 12000, standardRatio: 66, excellentRatio: 48, loans3mo: 640, disbursedVolume: 1450000000, compliance: 97, score: 105000, warning: false },
  { id: 'rm7', name: 'Hadiza Mohammed', role: 'RM', region: 'North-East', state: 'HQ Maiduguri', potentialPOS: 3900, standardRatio: 49, excellentRatio: 31, loans3mo: 190, disbursedVolume: 380000000, compliance: 86, score: 72000, warning: false },

  // SMs
  { id: 'sm1', name: 'Suleiman Kano', role: 'SM', region: 'North-West', state: 'Kano', potentialPOS: 2100, standardRatio: 56, excellentRatio: 40, loans3mo: 95, disbursedVolume: 210000000, compliance: 93, score: 54000, warning: false },
  { id: 'sm2', name: 'Ngozi Eze', role: 'SM', region: 'South-East', state: 'Anambra', potentialPOS: 1800, standardRatio: 54, excellentRatio: 37, loans3mo: 82, disbursedVolume: 175000000, compliance: 90, score: 50000, warning: false },
  { id: 'sm3', name: 'Bola Adebayo', role: 'SM', region: 'South-West', state: 'Oyo', potentialPOS: 2400, standardRatio: 60, excellentRatio: 42, loans3mo: 110, disbursedVolume: 260000000, compliance: 95, score: 58000, warning: false },
  { id: 'sm4', name: 'Musa Abdullahi', role: 'SM', region: 'North-Central', state: 'Niger', potentialPOS: 1500, standardRatio: 51, excellentRatio: 34, loans3mo: 70, disbursedVolume: 140000000, compliance: 88, score: 46000, warning: false },
  { id: 'sm5', name: 'Efe Okoro', role: 'SM', region: 'South-South', state: 'Delta', potentialPOS: 1700, standardRatio: 52, excellentRatio: 35, loans3mo: 76, disbursedVolume: 155000000, compliance: 87, score: 47000, warning: false },
  { id: 'sm6', name: 'Aisha Lawal', role: 'SM', region: 'Lagos South', state: 'Lagos', potentialPOS: 3200, standardRatio: 65, excellentRatio: 47, loans3mo: 150, disbursedVolume: 380000000, compliance: 96, score: 62000, warning: false },
  { id: 'sm7', name: 'Yusuf Borno', role: 'SM', region: 'North-East', state: 'Borno', potentialPOS: 980, standardRatio: 46, excellentRatio: 28, loans3mo: 42, disbursedVolume: 82000000, compliance: 84, score: 39000, warning: true },

  // CDLMs (include the six mentors + more)
  { id: 'cdlm1', name: 'Ikechukwu Kenneth', role: 'CDLM', region: 'South-East', state: 'Enugu', potentialPOS: 620, standardRatio: 61, excellentRatio: 45, loans3mo: 28, disbursedVolume: 52000000, compliance: 97, score: 45500, warning: false, tier: 'Gold 3' },
  { id: 'cdlm2', name: 'Folorunsho O. Femi', role: 'CDLM', region: 'South-West', state: 'Osun', potentialPOS: 580, standardRatio: 59, excellentRatio: 43, loans3mo: 26, disbursedVolume: 48000000, compliance: 95, score: 39800, warning: false, tier: 'Gold 2' },
  { id: 'cdlm3', name: 'Philip Ukahi Onaah', role: 'CDLM', region: 'North-Central', state: 'Kogi', potentialPOS: 510, standardRatio: 57, excellentRatio: 40, loans3mo: 22, disbursedVolume: 41000000, compliance: 94, score: 31400, warning: false, tier: 'Gold 1' },
  { id: 'cdlm4', name: 'Shafiu Murtala', role: 'CDLM', region: 'North-West', state: 'Kaduna', potentialPOS: 540, standardRatio: 58, excellentRatio: 42, loans3mo: 24, disbursedVolume: 45000000, compliance: 96, score: 36800, warning: false, tier: 'Gold 2' },
  { id: 'cdlm5', name: 'Orieke Chukwuemeka Kalu', role: 'CDLM', region: 'South-South', state: 'Rivers', potentialPOS: 470, standardRatio: 55, excellentRatio: 38, loans3mo: 20, disbursedVolume: 36000000, compliance: 92, score: 29400, warning: false, tier: 'Silver 3' },
  { id: 'cdlm6', name: 'Ilenowa Julius Owvie', role: 'CDLM', region: 'South-South', state: 'Edo', potentialPOS: 430, standardRatio: 53, excellentRatio: 36, loans3mo: 18, disbursedVolume: 32000000, compliance: 91, score: 26200, warning: false, tier: 'Silver 3' },
  { id: 'cdlm7', name: 'Zainab Sule', role: 'CDLM', region: 'North-East', state: 'Yobe', potentialPOS: 210, standardRatio: 41, excellentRatio: 22, loans3mo: 8, disbursedVolume: 12000000, compliance: 78, score: 15000, warning: true, tier: 'Warning 2' },

  // CDLs
  { id: 'cdl1', name: 'Ibrahim Danjuma', role: 'CDL', region: 'North-West', state: 'Kano', potentialPOS: 120, standardRatio: 48, excellentRatio: 30, loans3mo: 5, disbursedVolume: 8500000, compliance: 90, score: 18200, warning: false, tier: 'Silver 1' },
  { id: 'cdl2', name: 'Blessing Okon', role: 'CDL', region: 'South-South', state: 'Akwa Ibom', potentialPOS: 95, standardRatio: 46, excellentRatio: 28, loans3mo: 4, disbursedVolume: 6200000, compliance: 88, score: 16400, warning: false, tier: 'Bronze 3' },
  { id: 'cdl3', name: 'Taiwo Adeyemi', role: 'CDL', region: 'Lagos South', state: 'Lagos', potentialPOS: 310, standardRatio: 62, excellentRatio: 46, loans3mo: 9, disbursedVolume: 24000000, compliance: 97, score: 28600, warning: false, tier: 'Gold 1' },
  { id: 'cdl4', name: 'Chinedu Eze', role: 'CDL', region: 'South-East', state: 'Enugu', potentialPOS: 28, standardRatio: 18, excellentRatio: 8, loans3mo: 1, disbursedVolume: 900000, compliance: 62, score: 4200, warning: true, tier: 'Warning 2' },
  { id: 'cdl5', name: 'Fatima Abubakar', role: 'CDL', region: 'North-Central', state: 'Kwara', potentialPOS: 86, standardRatio: 44, excellentRatio: 27, loans3mo: 4, disbursedVolume: 5800000, compliance: 89, score: 15100, warning: false, tier: 'Bronze 3' },
  { id: 'cdl6', name: 'Kelvin Ojo', role: 'CDL', region: 'South-West', state: 'Ogun', potentialPOS: 175, standardRatio: 52, excellentRatio: 34, loans3mo: 6, disbursedVolume: 11200000, compliance: 93, score: 20100, warning: false, tier: 'Silver 2' },
  { id: 'cdl7', name: 'Maryam Bello', role: 'CDL', region: 'North-East', state: 'Adamawa', potentialPOS: 40, standardRatio: 22, excellentRatio: 10, loans3mo: 1, disbursedVolume: 1500000, compliance: 70, score: 6100, warning: true, tier: 'Warning 3' },
  { id: 'cdl8', name: 'Sandra Ike', role: 'CDL', region: 'Lagos North', state: 'Lagos', potentialPOS: 240, standardRatio: 58, excellentRatio: 41, loans3mo: 7, disbursedVolume: 18500000, compliance: 95, score: 24800, warning: false, tier: 'Silver 3' },
];

export function rollupByRegion(data: OfficerMetric[] = SAMPLE_OFFICERS): RegionRollup[] {
  const regions = Array.from(new Set(data.map((d) => d.region)));
  return regions.map((region) => {
    const rows = data.filter((d) => d.region === region);
    const cdls = rows.filter((d) => d.role === 'CDL');
    const avgCompliance =
      rows.reduce((s, r) => s + r.compliance, 0) / Math.max(1, rows.length);
    return {
      region,
      rms: rows.filter((d) => d.role === 'RM').length,
      sms: rows.filter((d) => d.role === 'SM').length,
      cdlms: rows.filter((d) => d.role === 'CDLM').length,
      cdls: cdls.length,
      potentialPOS: rows.reduce((s, r) => s + r.potentialPOS, 0),
      loans3mo: rows.reduce((s, r) => s + r.loans3mo, 0),
      disbursedVolume: rows.reduce((s, r) => s + r.disbursedVolume, 0),
      avgCompliance: Math.round(avgCompliance),
      warningCount: rows.filter((r) => r.warning).length,
      goldCount: cdls.filter((c) => (c.tier || '').includes('Gold')).length,
      silverCount: cdls.filter((c) => (c.tier || '').includes('Silver')).length,
      bronzeCount: cdls.filter((c) => (c.tier || '').includes('Bronze')).length,
    };
  });
}

export function nationalTotals(data: OfficerMetric[] = SAMPLE_OFFICERS) {
  return {
    officers: data.length,
    potentialPOS: data.reduce((s, r) => s + r.potentialPOS, 0),
    loans3mo: data.reduce((s, r) => s + r.loans3mo, 0),
    disbursedVolume: data.reduce((s, r) => s + r.disbursedVolume, 0),
    avgCompliance: Math.round(data.reduce((s, r) => s + r.compliance, 0) / Math.max(1, data.length)),
    warnings: data.filter((d) => d.warning).length,
    rms: data.filter((d) => d.role === 'RM').length,
    sms: data.filter((d) => d.role === 'SM').length,
    cdlms: data.filter((d) => d.role === 'CDLM').length,
    cdls: data.filter((d) => d.role === 'CDL').length,
  };
}

export interface DHAccount {
  name: string;
  staffCode: string;
  password: string; // stored locally for this internal tool
  createdAt: string;
}

export const DH_ACCOUNTS_KEY = 'opay_dh_accounts_v1';
export const DH_SESSION_KEY = 'opay_dh_session_v1';
