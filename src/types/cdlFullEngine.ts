// Complete simulation engine combining CDL Policy & Tiering with Merchant Loan Tactics
export type OrgRole = 'CDL' | 'CDLM' | 'SM' | 'RM';

export const HIERARCHY_CHAIN = [
  { role: 'RM' as OrgRole, title: 'Regional Manager', supervises: 'State Managers (SMs)', duty: 'Regional portfolio governance, cross-state quota steering, and high-level risk audit.' },
  { role: 'SM' as OrgRole, title: 'State Manager', supervises: 'CDL Managers (CDLMs)', duty: 'Statewide merchant loan expansion, market storming across capitals & rural commercial hubs.' },
  { role: 'CDLM' as OrgRole, title: 'Channel Development Lead Manager', supervises: 'CDLs (Channel Development Leads)', duty: 'Whitelisted sheets, WhatsApp coaching rooms, VFO readiness, and high-value personal disbursement visits.' },
  { role: 'CDL' as OrgRole, title: 'Channel Development Lead', supervises: 'Direct Merchant Network', duty: 'Direct field merchant visits, POS deployment, POS quality monitoring, objection handling, and loan sales.' }
];

export type CDLTierName = 'Warning' | 'Bronze' | 'Silver' | 'Gold';

export type CDLSubLevel = 
  | 'Warning 1' | 'Warning 2' | 'Warning 3'
  | 'Bronze 1' | 'Bronze 2' | 'Bronze 3'
  | 'Silver 1' | 'Silver 2' | 'Silver 3'
  | 'Gold 1' | 'Gold 2' | 'Gold 3';

export interface TierCriteria {
  subLevel: CDLSubLevel;
  tier: CDLTierName;
  minPotentialPOS: number; // POS bound > 30 days generating > ₦300/mo
  minStandardRatio: number; // POS generating >= ₦920/mo (%)
  minExcellentRatio: number; // POS generating >= ₦1,400/mo (%)
  minMonthlyLoans: number; // 3-month trailing avg
  dailyBaseComm: string;
  weeklyPosBonus: string;
  monthlyDeploymentBonus: string;
}

export const CDL_TIER_TABLE: TierCriteria[] = [
  {
    subLevel: 'Warning 1',
    tier: 'Warning',
    minPotentialPOS: 0,
    minStandardRatio: 0,
    minExcellentRatio: 0,
    minMonthlyLoans: 0,
    dailyBaseComm: '₦0 (Restricted)',
    weeklyPosBonus: '₦0',
    monthlyDeploymentBonus: '₦0'
  },
  {
    subLevel: 'Warning 2',
    tier: 'Warning',
    minPotentialPOS: 6,
    minStandardRatio: 1,
    minExcellentRatio: 0.5,
    minMonthlyLoans: 0,
    dailyBaseComm: '₦500 / day',
    weeklyPosBonus: '₦0',
    monthlyDeploymentBonus: '₦0'
  },
  {
    subLevel: 'Warning 3',
    tier: 'Warning',
    minPotentialPOS: 11,
    minStandardRatio: 5,
    minExcellentRatio: 2,
    minMonthlyLoans: 1,
    dailyBaseComm: '₦1,200 / day',
    weeklyPosBonus: '₦0',
    monthlyDeploymentBonus: '₦0'
  },
  {
    subLevel: 'Bronze 1',
    tier: 'Bronze',
    minPotentialPOS: 31, // >30 (or >35 for new CDL)
    minStandardRatio: 25,
    minExcellentRatio: 15,
    minMonthlyLoans: 2,
    dailyBaseComm: '₦3,500 / day',
    weeklyPosBonus: '₦15,000 / wk',
    monthlyDeploymentBonus: '₦20,000 / mo'
  },
  {
    subLevel: 'Bronze 2',
    tier: 'Bronze',
    minPotentialPOS: 51,
    minStandardRatio: 30,
    minExcellentRatio: 20,
    minMonthlyLoans: 2,
    dailyBaseComm: '₦4,500 / day',
    weeklyPosBonus: '₦22,000 / wk',
    monthlyDeploymentBonus: '₦25,000 / mo'
  },
  {
    subLevel: 'Bronze 3',
    tier: 'Bronze',
    minPotentialPOS: 71,
    minStandardRatio: 35,
    minExcellentRatio: 25,
    minMonthlyLoans: 3,
    dailyBaseComm: '₦6,000 / day',
    weeklyPosBonus: '₦30,000 / wk',
    monthlyDeploymentBonus: '₦35,000 / mo'
  },
  {
    subLevel: 'Silver 1',
    tier: 'Silver',
    minPotentialPOS: 101,
    minStandardRatio: 40,
    minExcellentRatio: 25,
    minMonthlyLoans: 4,
    dailyBaseComm: '₦8,500 / day',
    weeklyPosBonus: '₦45,000 / wk',
    monthlyDeploymentBonus: '₦50,000 / mo'
  },
  {
    subLevel: 'Silver 2',
    tier: 'Silver',
    minPotentialPOS: 151,
    minStandardRatio: 45,
    minExcellentRatio: 30,
    minMonthlyLoans: 5,
    dailyBaseComm: '₦11,000 / day',
    weeklyPosBonus: '₦60,000 / wk',
    monthlyDeploymentBonus: '₦70,000 / mo'
  },
  {
    subLevel: 'Silver 3',
    tier: 'Silver',
    minPotentialPOS: 201,
    minStandardRatio: 50,
    minExcellentRatio: 35,
    minMonthlyLoans: 6,
    dailyBaseComm: '₦14,000 / day',
    weeklyPosBonus: '₦80,000 / wk',
    monthlyDeploymentBonus: '₦90,000 / mo'
  },
  {
    subLevel: 'Gold 1',
    tier: 'Gold',
    minPotentialPOS: 301,
    minStandardRatio: 55,
    minExcellentRatio: 40,
    minMonthlyLoans: 7,
    dailyBaseComm: '₦18,000 / day',
    weeklyPosBonus: '₦110,000 / wk',
    monthlyDeploymentBonus: '₦120,000 / mo'
  },
  {
    subLevel: 'Gold 2',
    tier: 'Gold',
    minPotentialPOS: 401,
    minStandardRatio: 60,
    minExcellentRatio: 45,
    minMonthlyLoans: 8,
    dailyBaseComm: '₦23,000 / day',
    weeklyPosBonus: '₦145,000 / wk',
    monthlyDeploymentBonus: '₦160,000 / mo'
  },
  {
    subLevel: 'Gold 3',
    tier: 'Gold',
    minPotentialPOS: 501,
    minStandardRatio: 70,
    minExcellentRatio: 50,
    minMonthlyLoans: 10,
    dailyBaseComm: '₦30,000 / day',
    weeklyPosBonus: '₦190,000 / wk',
    monthlyDeploymentBonus: '₦220,000 / mo'
  }
];

export interface CDLPortfolioState {
  potentialPOS: number; // Bound > 30 days & revenue > ₦300
  standardPOS: number;  // Revenue >= ₦920
  excellentPOS: number; // Revenue >= ₦1,400
  recentLoansSold: number; // trailing monthly loans
  totalEarnings: number; // Commissions accrued
  daysOnboarded: number; // If <= 90 days, New CDL protection active
  complianceScore: number; // 0 - 100
  warningStrikes: number; // 1 strike = Warning tier, 30 days to resolve
}

// Helper to determine exact tier based on policy formulas
export function calculateCDLTier(state: CDLPortfolioState): CDLSubLevel {
  const stdRatio = state.potentialPOS > 0 ? (state.standardPOS / state.potentialPOS) * 100 : 0;
  const excRatio = state.potentialPOS > 0 ? (state.excellentPOS / state.potentialPOS) * 100 : 0;

  // Severe compliance breach forces Warning
  if (state.complianceScore < 60 || state.warningStrikes > 0) {
    if (state.potentialPOS > 10 && stdRatio >= 5) return 'Warning 3';
    if (state.potentialPOS > 5 && stdRatio >= 1) return 'Warning 2';
    return 'Warning 1';
  }

  // Iterate top-down from Gold 3 to Bronze 1
  for (let i = CDL_TIER_TABLE.length - 1; i >= 3; i--) {
    const t = CDL_TIER_TABLE[i];
    const posTarget = (state.daysOnboarded <= 90 && t.subLevel === 'Bronze 1') ? 35 : t.minPotentialPOS;
    if (
      state.potentialPOS >= posTarget &&
      stdRatio >= t.minStandardRatio &&
      excRatio >= t.minExcellentRatio &&
      state.recentLoansSold >= t.minMonthlyLoans
    ) {
      return t.subLevel;
    }
  }

  // If in first 90 days protection, hold at Bronze 1 candidate
  if (state.daysOnboarded <= 90) {
    if (state.potentialPOS >= 35 && stdRatio >= 25 && excRatio >= 15) {
      return 'Bronze 1';
    }
    return 'Warning 3'; // Safe incubation during grace period
  }

  if (state.potentialPOS > 10 && stdRatio >= 5) return 'Warning 3';
  if (state.potentialPOS > 5 && stdRatio >= 1) return 'Warning 2';
  return 'Warning 1';
}

export interface DeploymentEvent {
  merchantName: string;
  businessType: string;
  footfallLevel: 'High FMCG' | 'Medium Town' | 'Low/Dormant' | 'Fraud Staged';
  monthlyRevenueEst: number;
  loanNeed: number;
  rightStrategy: string;
  tacticalTip: string;
}
