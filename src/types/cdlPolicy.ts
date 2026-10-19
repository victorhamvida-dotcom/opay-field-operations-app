// Comprehensive domain model for OPay Field Hierarchy, CDL Policy, and CDLM Merchant Loan Best Practices

export type OrgRole = 'CDL' | 'CDLM' | 'SM' | 'RM';

export interface HierarchyInfo {
  role: OrgRole;
  title: string;
  reportsTo: string;
  supervises: string;
  coreDuty: string;
}

export const ORG_HIERARCHY: Record<OrgRole, HierarchyInfo> = {
  RM: {
    role: 'RM',
    title: 'Regional Manager',
    reportsTo: 'National Head of Offline Sales',
    supervises: 'State Managers (SMs)',
    coreDuty: 'Drives overall regional loan portfolio health, credit quality review, and cross-state quota governance.'
  },
  SM: {
    role: 'SM',
    title: 'State Manager',
    reportsTo: 'Regional Manager (RM)',
    supervises: 'CDL Managers (CDLMs)',
    coreDuty: 'Leads statewide merchant loan expansion, market storming across capitals & rural commercial hubs, and compliance integrity.'
  },
  CDLM: {
    role: 'CDLM',
    title: 'Channel Development Lead Manager',
    reportsTo: 'State Manager (SM)',
    supervises: 'Channel Development Leads (CDLs)',
    coreDuty: 'Whitelisted lead screening, WhatsApp coaching groups, high-value personal disbursement visits, and VFO readiness preparation.'
  },
  CDL: {
    role: 'CDL',
    title: 'Channel Development Lead',
    reportsTo: 'CDL Manager (CDLM)',
    supervises: 'Direct Merchant Network',
    coreDuty: 'Direct on-ground merchant visits, FMCG footfall observation, objection handling, loan application, and POS quality portfolio management.'
  }
};

export type CDLTier = 'Warning' | 'Bronze' | 'Silver' | 'Gold';
export type CDLSubLevel = 
  | 'Warning 1' | 'Warning 2' | 'Warning 3'
  | 'Bronze 1' | 'Bronze 2' | 'Bronze 3'
  | 'Silver 1' | 'Silver 2' | 'Silver 3'
  | 'Gold 1' | 'Gold 2' | 'Gold 3';

export interface CDLTierSpec {
  level: CDLSubLevel;
  tier: CDLTier;
  potentialPOS: string;
  standardRatio: string;
  excellentRatio: string;
  monthlyLoanTarget: number; // avg loans sold / mo over 3 months
  dailyBaseComm: string;
  weeklyPosIncentive: string;
  badgeColor: string;
}

export const CDL_TIER_SPECS: Record<CDLSubLevel, CDLTierSpec> = {
  'Warning 1': {
    level: 'Warning 1',
    tier: 'Warning',
    potentialPOS: 'Other / Default',
    standardRatio: '<1%',
    excellentRatio: '<0.5%',
    monthlyLoanTarget: 0,
    dailyBaseComm: 'Restricted',
    weeklyPosIncentive: '0',
    badgeColor: '#EF4444'
  },
  'Warning 2': {
    level: 'Warning 2',
    tier: 'Warning',
    potentialPOS: '>5 POS',
    standardRatio: '>1%',
    excellentRatio: '>0.5%',
    monthlyLoanTarget: 0,
    dailyBaseComm: 'Minimal',
    weeklyPosIncentive: '0',
    badgeColor: '#F97316'
  },
  'Warning 3': {
    level: 'Warning 3',
    tier: 'Warning',
    potentialPOS: '>10 POS',
    standardRatio: '>5%',
    excellentRatio: '>2%',
    monthlyLoanTarget: 1,
    dailyBaseComm: 'Reduced',
    weeklyPosIncentive: '0',
    badgeColor: '#F59E0B'
  },
  'Bronze 1': {
    level: 'Bronze 1',
    tier: 'Bronze',
    potentialPOS: '>30 POS (or >35 for new)',
    standardRatio: '>25%',
    excellentRatio: '>15%',
    monthlyLoanTarget: 2,
    dailyBaseComm: 'Standard',
    weeklyPosIncentive: 'Eligible',
    badgeColor: '#CD7F32'
  },
  'Bronze 2': {
    level: 'Bronze 2',
    tier: 'Bronze',
    potentialPOS: '>50 POS',
    standardRatio: '>30%',
    excellentRatio: '>20%',
    monthlyLoanTarget: 2,
    dailyBaseComm: 'Standard +',
    weeklyPosIncentive: 'Eligible',
    badgeColor: '#CD7F32'
  },
  'Bronze 3': {
    level: 'Bronze 3',
    tier: 'Bronze',
    potentialPOS: '>70 POS',
    standardRatio: '>35%',
    excellentRatio: '>25%',
    monthlyLoanTarget: 3,
    dailyBaseComm: 'Bronze Max',
    weeklyPosIncentive: 'Weekly +',
    badgeColor: '#CD7F32'
  },
  'Silver 1': {
    level: 'Silver 1',
    tier: 'Silver',
    potentialPOS: '>100 POS',
    standardRatio: '>40%',
    excellentRatio: '>25%',
    monthlyLoanTarget: 4,
    dailyBaseComm: 'Silver Rate',
    weeklyPosIncentive: 'High Tier',
    badgeColor: '#94A3B8'
  },
  'Silver 2': {
    level: 'Silver 2',
    tier: 'Silver',
    potentialPOS: '>150 POS',
    standardRatio: '>45%',
    excellentRatio: '>30%',
    monthlyLoanTarget: 5,
    dailyBaseComm: 'Silver Rate +',
    weeklyPosIncentive: 'High Tier +',
    badgeColor: '#94A3B8'
  },
  'Silver 3': {
    level: 'Silver 3',
    tier: 'Silver',
    potentialPOS: '>200 POS',
    standardRatio: '>50%',
    excellentRatio: '>35%',
    monthlyLoanTarget: 6,
    dailyBaseComm: 'Silver Max',
    weeklyPosIncentive: 'Top Silver',
    badgeColor: '#94A3B8'
  },
  'Gold 1': {
    level: 'Gold 1',
    tier: 'Gold',
    potentialPOS: '>300 POS',
    standardRatio: '>55%',
    excellentRatio: '>40%',
    monthlyLoanTarget: 7,
    dailyBaseComm: 'Gold Tier 1',
    weeklyPosIncentive: 'Weekly Premium',
    badgeColor: '#EAB308'
  },
  'Gold 2': {
    level: 'Gold 2',
    tier: 'Gold',
    potentialPOS: '>400 POS',
    standardRatio: '>60%',
    excellentRatio: '>45%',
    monthlyLoanTarget: 8,
    dailyBaseComm: 'Gold Tier 2',
    weeklyPosIncentive: 'Weekly VIP',
    badgeColor: '#EAB308'
  },
  'Gold 3': {
    level: 'Gold 3',
    tier: 'Gold',
    potentialPOS: '>500 POS',
    standardRatio: '>70%',
    excellentRatio: '>50%',
    monthlyLoanTarget: 10,
    dailyBaseComm: 'Highest Multiplier',
    weeklyPosIncentive: 'Maximum Mon Bonus',
    badgeColor: '#F59E0B'
  }
};

// 6 Core CDLM Best Practice Mentors from Field Submissions
export interface FieldMentor {
  name: string;
  role: 'CDLM';
  location: string;
  signatureTactic: string;
  fieldRule: string;
}

export const CDLM_MENTORS: FieldMentor[] = [
  {
    name: 'Ikechukwu Kenneth',
    role: 'CDLM',
    location: 'Eastern Commercial Cluster',
    signatureTactic: 'Whitelisted Sheet Prioritization & Systematic Market-to-Market Storming',
    fieldRule: 'Never pitch blind. Filter high-turnover FMCG merchants on whitelisted sheets, then execute physical market sweeps to verify actual customer density.'
  },
  {
    name: 'Folorunsho O. Femi',
    role: 'CDLM',
    location: 'South-West Metro',
    signatureTactic: 'Immediate Refinancing Pipeline & Responsible Borrowing Education',
    fieldRule: 'Monitor existing loan repayment calendars daily. The minute a compliant merchant completes repayment, initiate instant refinancing before capital drifts away.'
  },
  {
    name: 'Philip Ukahi Onaah',
    role: 'CDLM',
    location: 'North-Central Hub',
    signatureTactic: 'WhatsApp Real-Time Sales Coaching & 1-on-1 High-Potential CDL Pairing',
    fieldRule: 'Run a dedicated WhatsApp war-room. Provide real-time objection handling on the fly and handpick serious CDLs monthly for targeted merchant conversions.'
  },
  {
    name: 'Shafiu Murtala',
    role: 'CDLM',
    location: 'North-West Cluster',
    signatureTactic: 'Pre-VFO Readiness Verification & Personal High-Value Disbursement Visits',
    fieldRule: 'Inspect CAC/store lease documents personally before the Verification Officer (VFO) arrives. For large loans, accompany the CDL to build supreme merchant trust.'
  },
  {
    name: 'Orieke Chukwuemeka Kalu',
    role: 'CDLM',
    location: 'South-South Delta Basin',
    signatureTactic: 'Beneficiary Referral "Evangelism" & Joint Merchant-CDL WhatsApp Community',
    fieldRule: 'Transform satisfied loan merchants into brand evangelists. An active borrower testifying to neighbor stalls reduces rejection friction to zero.'
  },
  {
    name: 'Ilenowa Julius Owvie',
    role: 'CDLM',
    location: 'Mid-West Commercial Corridor',
    signatureTactic: 'Structured Sales Pitch Training, Realistic Targets & Public Recognition Incentives',
    fieldRule: 'Train CDLs to pitch working capital and inventory restocking rather than interest debt. Publicly celebrate top weekly loan converters to ignite healthy team rivalry.'
  }
];

export interface MerchantEncounter {
  id: string;
  merchantName: string;
  businessType: string;
  locationCategory: 'High-Footfall FMCG Market' | 'Rural Major Town Hub' | 'Low-Traffic Kiosk' | 'Suspicious Staging Stall';
  footfallObservation: string;
  whitelistedStatus: 'Whitelisted High Potential' | 'Standard Terminal' | 'Blacklisted/Non-Operating';
  existingLoanStatus: 'New Prospect' | 'Just Repaid Today (Refinance Ready)' | 'Past Due / Overdue' | 'Active Mid-Term';
  merchantObjection: string;
  options: {
    text: string;
    isCorrect: boolean;
    cdlmPrinciple: string;
    points: number;
    cashDisbursed: number;
    explanation: string;
    tierImpact: 'upgrade' | 'downgrade' | 'warning' | 'none';
  }[];
}

export const MERCHANT_ENCOUNTERS: MerchantEncounter[] = [
  {
    id: 'm1_fmcg_whitelisted',
    merchantName: 'Mama Nkechi Provisions & Drinks',
    businessType: 'FMCG High-Turnover Wholesale Store',
    locationCategory: 'High-Footfall FMCG Market',
    footfallObservation: 'Heavy customer queues, crates being loaded every 5 minutes, 3 active OPay POS terminals.',
    whitelistedStatus: 'Whitelisted High Potential',
    existingLoanStatus: 'New Prospect',
    merchantObjection: '"I need ₦1.5M for weekend beverage truck restocking, but my last loan from another bank had too many hidden paperwork delays and rejections."',
    options: [
      {
        text: 'Deploy CDLM Shafiu & Ikechukwu tactics: Conduct physical VFO pre-check on CAC/store lease, verify whitelisted turnover, and guarantee personal CDLM disbursement visit.',
        isCorrect: true,
        cdlmPrinciple: 'Rigorous VFO Pre-Check & Personal Disbursement Trust',
        points: 450,
        cashDisbursed: 1500000,
        explanation: 'CDLM Shafiu Murtala proves personal disbursement visits and advance VFO document verification prevent rejections for high-value FMCG merchants.',
        tierImpact: 'upgrade'
      },
      {
        text: 'Hand her an application flyer and tell her to upload whatever documents she has on the app without visiting the shop again.',
        isCorrect: false,
        cdlmPrinciple: 'Lacks Physical Observation & VFO Readiness',
        points: 0,
        cashDisbursed: 0,
        explanation: 'Failing to prepare the merchant for VFO inspection leads to immediate rejection due to incomplete verification.',
        tierImpact: 'warning'
      },
      {
        text: 'Offer to split her transaction turnover across fake personal wallets to manipulate her qualification rating.',
        isCorrect: false,
        cdlmPrinciple: 'Policy Compliance Violation (Zero Tolerance)',
        points: -500,
        cashDisbursed: 0,
        explanation: 'Under the CDL New Policy, volume manipulation results in immediate tier downgrade, observation period, or direct contract termination.',
        tierImpact: 'downgrade'
      }
    ]
  },
  {
    id: 'm2_refinance_evangelism',
    merchantName: 'Alhaji Gambo Grain Millers',
    businessType: 'Agro-Allied & Grain Depot (Major Town Commercial Cluster)',
    locationCategory: 'Rural Major Town Hub',
    footfallObservation: 'Steady farmer deliveries, ₦2.8M weekly terminal inflow, strong regional reputation.',
    whitelistedStatus: 'Whitelisted High Potential',
    existingLoanStatus: 'Just Repaid Today (Refinance Ready)',
    merchantObjection: '"I successfully settled my ₦800,000 working capital loan today! I am glad it is over, though maize prices are rising fast."',
    options: [
      {
        text: 'Apply CDLM Folorunsho & Orieke tactics: Congratulate Alhaji on his 100% timely repayment, pitch instant higher refinancing for bulk maize restocking, and request referrals for neighboring suppliers.',
        isCorrect: true,
        cdlmPrinciple: 'Refinancing Pipeline & Beneficiary Referral Evangelism',
        points: 500,
        cashDisbursed: 2000000,
        explanation: 'CDLM Folorunsho Femi highlights targeting merchants immediately upon repayment, while CDLM Orieke Kalu uses satisfied borrowers as evangelists.',
        tierImpact: 'upgrade'
      },
      {
        text: 'Wait for 4 months until the merchant calls CDL before discussing another facility.',
        isCorrect: false,
        cdlmPrinciple: 'Passive Follow-Up Hazard',
        points: 0,
        cashDisbursed: 0,
        explanation: 'Proactive follow-up is mandatory. Without prompt outreach, merchants take working capital from competitors.',
        tierImpact: 'none'
      },
      {
        text: 'Advise him not to take another loan because borrowing back-to-back always hurts businesses.',
        isCorrect: false,
        cdlmPrinciple: 'Poor Value Positioning',
        points: -100,
        cashDisbursed: 0,
        explanation: 'OPay loans are designed as revolving working capital to capture inventory price spikes and business expansion.',
        tierImpact: 'warning'
      }
    ]
  },
  {
    id: 'm3_suspicious_kiosk',
    merchantName: 'QuickCash Swap Corner',
    businessType: 'Makeshift Wooden Shed with Borrowed Terminal',
    locationCategory: 'Suspicious Staging Stall',
    footfallObservation: 'Zero inventory, no retail customers, terminal bound only 12 days ago generating irregular spikes.',
    whitelistedStatus: 'Blacklisted/Non-Operating',
    existingLoanStatus: 'New Prospect',
    merchantObjection: '"Disburse ₦3M loan to me immediately. I will give you a 10% private kickback cash commission."',
    options: [
      {
        text: 'Strictly reject! Under Section 3.1 & Policy Compliance, reject non-operating stalls, verify terminal bound >30 days with legitimate footfall, and log anti-fraud report to CDLM/SM.',
        isCorrect: true,
        cdlmPrinciple: 'Field Integrity & Merchant Screening Discipline',
        points: 400,
        cashDisbursed: 0,
        explanation: 'Loan deployment is strictly based on legitimate cash flow and compliance, never unverified volume or illicit incentives.',
        tierImpact: 'upgrade'
      },
      {
        text: 'Accept the kickback and rush the application before VFO can inspect the physical site.',
        isCorrect: false,
        cdlmPrinciple: 'Severe Integrity Breach & Immediate Exit',
        points: -800,
        cashDisbursed: 0,
        explanation: 'Kickbacks and collusion trigger immediate permanent contract closure and blacklisting across the entire national fintech registry.',
        tierImpact: 'downgrade'
      },
      {
        text: 'Suggest he buy 5 new empty terminals so his CDL potential POS count can artificially upgrade to Gold.',
        isCorrect: false,
        cdlmPrinciple: 'Terminal Stacking Violation',
        points: -400,
        cashDisbursed: 0,
        explanation: 'Only POS bound >30 days with >₦300 monthly revenue count toward Potential POS. Stacking dead terminals breaches policy.',
        tierImpact: 'warning'
      }
    ]
  },
  {
    id: 'm4_objection_interest',
    merchantName: 'Chidi Auto Spare Parts & Batteries',
    businessType: 'Motor Spare Parts Wholesaler',
    locationCategory: 'High-Footfall FMCG Market',
    footfallObservation: 'Extremely busy mechanics district, rapid stock turnover, terminal generating ₦1.8M monthly.',
    whitelistedStatus: 'Whitelisted High Potential',
    existingLoanStatus: 'New Prospect',
    merchantObjection: '"I am worried about high daily interest rates wiping out my slim margins on imported vehicle parts."',
    options: [
      {
        text: 'Apply CDLM Ilenowa Julius method: Frame OPay loan as high-speed inventory restocking capital that yields 25% profit margin within 14 days, far exceeding low monthly interest.',
        isCorrect: true,
        cdlmPrinciple: 'Needs-Based Sales Pitch & ROI Positioning',
        points: 420,
        cashDisbursed: 1200000,
        explanation: 'CDLM Ilenowa trains CDLs to position loans according to working capital expansion, turning interest objections into calculated profit margins.',
        tierImpact: 'upgrade'
      },
      {
        text: 'Tell the merchant that interest rates are zero and OPay gives free government grants.',
        isCorrect: false,
        cdlmPrinciple: 'False Product Misrepresentation',
        points: -350,
        cashDisbursed: 0,
        explanation: 'Misleading merchants regarding pricing leads to repayment defaults, customer disputes, and CDL disciplinary downgrade.',
        tierImpact: 'warning'
      },
      {
        text: 'Leave immediately without clarifying his doubts or calculating his inventory turn-time.',
        isCorrect: false,
        cdlmPrinciple: 'Failure in Objection Handling',
        points: 0,
        cashDisbursed: 0,
        explanation: 'Best practice demands listening carefully, clarifying the concern, and presenting a concrete numerical solution.',
        tierImpact: 'none'
      }
    ]
  },
  {
    id: 'm5_cdlm_whatsapp_coaching',
    merchantName: 'Hajiya Fatima Supermarket & Bakery',
    businessType: 'Multi-Shelf Retail Supermarket',
    locationCategory: 'High-Footfall FMCG Market',
    footfallObservation: 'Continuous point-of-sale customer checkout, 4 attendants, terminal bound 140 days generating >₦1,400 monthly (Excellent POS).',
    whitelistedStatus: 'Whitelisted High Potential',
    existingLoanStatus: 'New Prospect',
    merchantObjection: '"I am ready for a ₦5,000,000 expansion facility, but my utility bill still bears the previous landlord’s name."',
    options: [
      {
        text: 'Apply CDLM Philip Ukahi Onaah & Shafiu protocol: Escalate to CDLM WhatsApp group for real-time document substitution guidance (submit tenancy contract + store photo + market chairman intro letter before VFO dispatch).',
        isCorrect: true,
        cdlmPrinciple: 'Real-Time WhatsApp Coaching & Thorough VFO Readiness',
        points: 480,
        cashDisbursed: 5000000,
        explanation: 'CDLM Philip maintains dedicated WhatsApp coaching while CDLM Shafiu verifies supporting documents in advance to eliminate VFO rejection.',
        tierImpact: 'upgrade'
      },
      {
        text: 'Forge a fake utility bill with Photoshop and submit it directly to the system.',
        isCorrect: false,
        cdlmPrinciple: 'Document Forgery / Criminal Compliance Offense',
        points: -600,
        cashDisbursed: 0,
        explanation: 'Falsifying KYC records leads to immediate blacklisting, loss of all held commissions, and police handover.',
        tierImpact: 'downgrade'
      },
      {
        text: 'Downgrade her loan request to ₦50,000 without attempting document remedy.',
        isCorrect: false,
        cdlmPrinciple: 'Under-servicing Prime Merchants',
        points: 50,
        cashDisbursed: 50000,
        explanation: 'High-turnover supermarkets require matched capital. Overcoming verifiable paperwork hurdles unlocks prime portfolio growth.',
        tierImpact: 'none'
      }
    ]
  }
];

export interface PolicyQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  sourceDoc: string;
}

export const CDL_POLICY_QUESTIONS: PolicyQuizQuestion[] = [
  {
    id: 1,
    question: 'Under the CDL New Policy, which combination correctly represents the 4 tiers?',
    options: [
      'Platinum, Gold, Silver, Bronze',
      'Gold, Silver, Bronze, Warning',
      'Gold, Bronze, Warning, Restricted',
      'Silver, Bronze, Warning, Exit'
    ],
    correctAnswer: 1,
    explanation: 'The 4 formal tiers are Gold, Silver, Bronze, and Warning. There are 3 sub-levels each, creating 12 sub-levels in total.',
    sourceDoc: 'CDL Tiering Structure §2'
  },
  {
    id: 2,
    question: 'How many total sub-levels exist across the entire CDL tiering classification?',
    options: ['8', '10', '12', '15'],
    correctAnswer: 2,
    explanation: '4 tiers x 3 sub-levels each = exactly 12 sub-levels (from Warning 1 up to Gold 3).',
    sourceDoc: 'CDL Tiering Structure §2'
  },
  {
    id: 3,
    question: 'What is the standard protection / growth period granted to New CDLs before regular tier assessment?',
    options: ['30 days', '60 days', '90 days', '120 days'],
    correctAnswer: 2,
    explanation: 'New CDLs receive a 90-day grace period to build their merchant portfolio and achieve at least Bronze 1.',
    sourceDoc: 'New CDL Protection §7'
  },
  {
    id: 4,
    question: 'Which POS qualifies as a "Potential-or-above POS" under policy metrics?',
    options: [
      'A POS bound for 20 days generating ₦500 monthly',
      'A POS bound for more than 30 days generating more than ₦300 monthly',
      'A POS bound for 10 days generating ₦1,000 monthly',
      'Any POS regardless of days or revenue'
    ],
    correctAnswer: 1,
    explanation: 'To qualify as Potential POS, the terminal must be bound for >30 days and generate >₦300 monthly revenue.',
    sourceDoc: 'CDL Tiering Criteria §3'
  },
  {
    id: 5,
    question: 'How is the CDL merchant-loan performance criterion formally measured for tier upgrades?',
    options: [
      'Total loan amount disbursed in the last 7 days',
      'Average monthly number of merchant loans sold over the previous three months',
      'Number of unverified loan leads entered into WhatsApp',
      'Lifetime count of merchant applications regardless of approval'
    ],
    correctAnswer: 1,
    explanation: 'The merchant-loan criterion evaluates the average monthly count of merchant loans sold over the trailing 3-month window.',
    sourceDoc: 'CDL Tiering Criteria §3 & Q&A #8'
  },
  {
    id: 6,
    question: 'What happens if a CDL meets all volume targets but is found guilty of artificial data manipulation?',
    options: [
      'The CDL automatically upgrades to Gold',
      'The violation is ignored because revenue was made',
      'OPay may impose an immediate tier downgrade, observation period, or direct exit',
      'The CDL receives additional incentive bonuses'
    ],
    correctAnswer: 2,
    explanation: 'OPay maintains zero tolerance for data tampering, phantom merchants, or terminal gaming.',
    sourceDoc: 'Compliance Governance & Q&A #9'
  },
  {
    id: 7,
    question: 'Which entry standard combination is required to attain the pinnacle Gold 3 level?',
    options: [
      '>500 Potential POS, >70% Standard ratio, and >50% Excellent ratio',
      '>300 Potential POS, 60% Standard ratio, and 40% Excellent ratio',
      '>200 Potential POS, 50% Standard ratio, and 35% Excellent ratio',
      '>100 Potential POS, 40% Standard ratio, and 30% Excellent ratio'
    ],
    correctAnswer: 0,
    explanation: 'Gold 3 demands >500 Potential POS, >70% Standard POS ratio, and >50% Excellent POS ratio alongside top loan averages.',
    sourceDoc: 'Gold Tier Standards §4.1 & Q&A #12'
  },
  {
    id: 8,
    question: 'If a CDL enters the Warning Tier, how long do they have to improve their standing before account closure?',
    options: ['One week', 'Two weeks', 'One month (30 days)', 'Three months'],
    correctAnswer: 2,
    explanation: 'A Warning Tier CDL has one month to elevate their portfolio quality or face permanent contract termination / exit options.',
    sourceDoc: 'Warning Tier Policy §8 & Q&A #27'
  },
  {
    id: 9,
    question: 'How frequently is the CDL High-Quality POS incentive calculated and paid?',
    options: ['Every day', 'Weekly (Every Monday)', 'Monthly lump sum only', 'Quarterly'],
    correctAnswer: 1,
    explanation: 'High-Quality POS incentive is distributed weekly every Monday, alongside daily Base Commission and monthly New Deployment rewards.',
    sourceDoc: 'Reward & Commission Payment Cycle §6 & Q&A #33'
  },
  {
    id: 10,
    question: 'When a new CDL successfully reaches Bronze 1 within their 90-day grace period, how are accrued bonuses paid?',
    options: [
      'They are completely forfeited',
      'They are paid out in a single lump-sum payment',
      'They are converted into illiquid loan tokens',
      'They are delayed for 24 months'
    ],
    correctAnswer: 1,
    explanation: 'Upon reaching Bronze 1 within 90 days, held commissions and milestone bonuses are released as a single lump-sum payout.',
    sourceDoc: 'New CDL Protection §7 & Q&A #34'
  }
];
