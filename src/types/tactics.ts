export interface TacticMilestone {
  step: number;
  id: string;
  title: string;
  shortDesc: string;
  detailedProTip: string;
  iconName: string;
  color: string;
}

export const OPAY_TACTICS: TacticMilestone[] = [
  {
    step: 1,
    id: 'bvn_nin',
    title: 'BVN & NIN Tier 3 Verification',
    shortDesc: 'Unlock maximum credit ceilings instantly with verified identities.',
    detailedProTip: 'Always link an active BVN and NIN with matching legal names and date of birth. Tier-3 verified accounts qualify for higher disbursement bands up to ₦1,000,000+ with lower interest rates.',
    iconName: 'BadgeCheck',
    color: '#10B981',
  },
  {
    step: 2,
    id: 'wallet_velocity',
    title: 'High Transaction Velocity',
    shortDesc: 'Fuel algorithm scoring with steady bills & transfer volume.',
    detailedProTip: 'The automated risk engine checks rolling 30-day wallet turnover. Pay utility bills, buy data/airtime, and receive business transfers directly inside your OPay wallet to prove repayment cashflow.',
    iconName: 'TrendingUp',
    color: '#06B6D4',
  },
  {
    step: 3,
    id: 'credit_cleanse',
    title: 'Clean CRC & FirstCentral Bureau',
    shortDesc: 'Zero overdue flags on nationwide credit registries.',
    detailedProTip: 'OPay/Okash queries CRC Credit Bureau before auto-approvals. Ensure all previous microloans are marked as settled. Keep zero default marks across all fintech platforms.',
    iconName: 'ShieldCheck',
    color: '#8B5CF6',
  },
  {
    step: 4,
    id: 'device_kyc',
    title: 'Single Trusted Hardware ID',
    shortDesc: 'Prevent biometric fraud flags by applying from a personal device.',
    detailedProTip: 'Applying from multiple rooted phones or VPNs triggers anti-fraud suspension. Use one trusted smartphone with active location permissions and consistent geofencing.',
    iconName: 'Smartphone',
    color: '#F59E0B',
  },
  {
    step: 5,
    id: 'early_repay',
    title: 'Early Repay Turbo Boost',
    shortDesc: 'Repaying 24-48 hrs before due date triggers 2x loan limits.',
    detailedProTip: 'Repaying a day before maturity boosts internal credit scoring by +40 points, immediately graduating your tier and expanding instant disbursement limits for subsequent cycles.',
    iconName: 'Zap',
    color: '#EC4899',
  },
  {
    step: 6,
    id: 'disbursement_mastery',
    title: 'Instant 60s Cashout Mastery',
    shortDesc: 'Direct NIP auto-clearing into approved bank balance.',
    detailedProTip: 'You have mastered the entire OPay lending funnel! With 100% tactics active, your loan applications bypass manual compliance review and disburse within 45 seconds.',
    iconName: 'Award',
    color: '#10B981',
  }
];

export interface HighScoreEntry {
  name: string;
  score: number;
  tacticsUnlocked: number;
  disbursedAmount: number;
  date: string;
}

export const INITIAL_LEADERBOARD: HighScoreEntry[] = [
  { name: 'Adekunle CashMaster', score: 38400, tacticsUnlocked: 6, disbursedAmount: 950000, date: 'Today' },
  { name: 'Chioma FastApproval', score: 29500, tacticsUnlocked: 5, disbursedAmount: 720000, date: 'Yesterday' },
  { name: 'Emeka 60sDisbursed', score: 22100, tacticsUnlocked: 4, disbursedAmount: 510000, date: '2 days ago' },
  { name: 'Zainab Tier3VIP', score: 17800, tacticsUnlocked: 3, disbursedAmount: 350000, date: '3 days ago' },
  { name: 'Folake CreditKing', score: 12400, tacticsUnlocked: 2, disbursedAmount: 220000, date: '4 days ago' }
];
