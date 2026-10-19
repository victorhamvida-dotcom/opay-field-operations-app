// National Hierarchical Performance Data Model for Department Heads (DH)
// Covering National Regions, Regional Managers (RM), State Managers (SM), CDLMs and CDLs

export interface CDLReport {
  id: string;
  name: string;
  tier: string;
  potentialPOS: number;
  standardRatio: number; // in %
  excellentRatio: number; // in %
  avgMonthlyLoans: number;
  complianceScore: number;
  disbursedTotal: number;
  status: 'Compliant' | 'Observation' | 'Warning' | 'Top Performer';
  joinedDate: string;
}

export interface CDLMReport {
  id: string;
  name: string;
  region: string;
  state: string;
  cdlsSupervised: number;
  activePortfolioLoans: number;
  totalDisbursedMonth: number;
  vfoPassRate: number; // in %
  refinanceRate: number; // in %
  primaryTactic: string;
  cdlTeam: CDLReport[];
}

export interface SMReport {
  id: string;
  name: string;
  state: string;
  region: string;
  cdlmsCount: number;
  totalActivePOS: number;
  monthlyDisbursementVolume: number;
  complianceRating: number;
  cdlms: CDLMReport[];
}

export interface RMReport {
  id: string;
  name: string;
  regionName: string;
  statesCovered: string[];
  totalDisbursementPortfolio: number;
  activeMerchantsCount: number;
  nplRate: number; // non-performing loan %
  overallGrowthMoM: number; // Month-over-Month %
  stateManagers: SMReport[];
}

export const NATIONAL_REGIONS_AUDIT: RMReport[] = [
  {
    id: 'RM-LAGOS-01',
    name: 'Babatunde Adeleke (RM)',
    regionName: 'South-West Metro & Lagos Core',
    statesCovered: ['Lagos', 'Ogun', 'Oyo'],
    totalDisbursementPortfolio: 184500000,
    activeMerchantsCount: 4280,
    nplRate: 1.2,
    overallGrowthMoM: 14.8,
    stateManagers: [
      {
        id: 'SM-LAG-01',
        name: 'Chinyere Okafor (SM - Lagos Island & Mainland)',
        state: 'Lagos',
        region: 'South-West Metro & Lagos Core',
        cdlmsCount: 4,
        totalActivePOS: 2150,
        monthlyDisbursementVolume: 92400000,
        complianceRating: 98.4,
        cdlms: [
          {
            id: 'CDLM-FOL-01',
            name: 'Folorunsho O. Femi',
            region: 'South-West Metro & Lagos Core',
            state: 'Lagos (Ikeja & Agege FMCG Cluster)',
            cdlsSupervised: 18,
            activePortfolioLoans: 340,
            totalDisbursedMonth: 38200000,
            vfoPassRate: 94.2,
            refinanceRate: 46.8,
            primaryTactic: 'Immediate Refinancing Pipeline on full repayment & Responsible Borrowing',
            cdlTeam: [
              {
                id: 'CDL-LAG-101',
                name: 'Kazeem Oladipo',
                tier: 'Gold 3',
                potentialPOS: 540,
                standardRatio: 74,
                excellentRatio: 52,
                avgMonthlyLoans: 11,
                complianceScore: 100,
                disbursedTotal: 12500000,
                status: 'Top Performer',
                joinedDate: 'Jan 2025'
              },
              {
                id: 'CDL-LAG-102',
                name: 'Blessing Adeyemi',
                tier: 'Silver 2',
                potentialPOS: 180,
                standardRatio: 48,
                excellentRatio: 32,
                avgMonthlyLoans: 6,
                complianceScore: 95,
                disbursedTotal: 5800000,
                status: 'Compliant',
                joinedDate: 'Oct 2025'
              },
              {
                id: 'CDL-LAG-103',
                name: 'Tunde Lawal',
                tier: 'Warning 2',
                potentialPOS: 18,
                standardRatio: 12,
                excellentRatio: 4,
                avgMonthlyLoans: 1,
                complianceScore: 78,
                disbursedTotal: 800000,
                status: 'Warning',
                joinedDate: 'Jun 2026'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'RM-EAST-02',
    name: 'Nnamdi Eze (RM)',
    regionName: 'South-East Commercial Basin (Aba, Onitsha, Nnewi)',
    statesCovered: ['Anambra', 'Abia', 'Enugu', 'Imo'],
    totalDisbursementPortfolio: 168200000,
    activeMerchantsCount: 3890,
    nplRate: 0.9,
    overallGrowthMoM: 18.2,
    stateManagers: [
      {
        id: 'SM-ANA-01',
        name: 'Emeka Okonkwo (SM - Anambra & Environs)',
        state: 'Anambra',
        region: 'South-East Commercial Basin',
        cdlmsCount: 3,
        totalActivePOS: 1940,
        monthlyDisbursementVolume: 88500000,
        complianceRating: 99.1,
        cdlms: [
          {
            id: 'CDLM-IKE-01',
            name: 'Ikechukwu Kenneth',
            region: 'South-East Commercial Basin',
            state: 'Anambra (Main Market & Relief Market)',
            cdlsSupervised: 22,
            activePortfolioLoans: 412,
            totalDisbursedMonth: 45500000,
            vfoPassRate: 96.8,
            refinanceRate: 41.5,
            primaryTactic: 'Whitelisted Sheet Prioritization & Systematic Market-to-Market Storming',
            cdlTeam: [
              {
                id: 'CDL-ON-201',
                name: 'Chinedu Obi',
                tier: 'Gold 1',
                potentialPOS: 620,
                standardRatio: 78,
                excellentRatio: 56,
                avgMonthlyLoans: 14,
                complianceScore: 100,
                disbursedTotal: 16200000,
                status: 'Top Performer',
                joinedDate: 'Mar 2024'
              },
              {
                id: 'CDL-ON-202',
                name: 'Amaka Nwosu',
                tier: 'Silver 1',
                potentialPOS: 240,
                standardRatio: 55,
                excellentRatio: 38,
                avgMonthlyLoans: 8,
                complianceScore: 98,
                disbursedTotal: 7900000,
                status: 'Compliant',
                joinedDate: 'Dec 2025'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'RM-NORTH-03',
    name: 'Malam Ibrahim Danjuma (RM)',
    regionName: 'North-West Commercial Zone (Kano, Kaduna, Katsina)',
    statesCovered: ['Kano', 'Kaduna', 'Katsina', 'Sokoto'],
    totalDisbursementPortfolio: 142000000,
    activeMerchantsCount: 3450,
    nplRate: 1.4,
    overallGrowthMoM: 12.3,
    stateManagers: [
      {
        id: 'SM-KAN-01',
        name: 'Usman Sani (SM - Kano Dawanau & Kurmi)',
        state: 'Kano',
        region: 'North-West Commercial Zone',
        cdlmsCount: 3,
        totalActivePOS: 1620,
        monthlyDisbursementVolume: 74200000,
        complianceRating: 97.6,
        cdlms: [
          {
            id: 'CDLM-SHA-01',
            name: 'Shafiu Murtala',
            region: 'North-West Commercial Zone',
            state: 'Kano (Dawanau Grain Market & Singa FMCG)',
            cdlsSupervised: 16,
            activePortfolioLoans: 295,
            totalDisbursedMonth: 34800000,
            vfoPassRate: 98.1,
            refinanceRate: 38.0,
            primaryTactic: 'Pre-VFO Documentation Readiness & Personal High-Value Loan Disbursement Visits',
            cdlTeam: [
              {
                id: 'CDL-KN-301',
                name: 'Abubakar Garba',
                tier: 'Gold 2',
                potentialPOS: 480,
                standardRatio: 68,
                excellentRatio: 46,
                avgMonthlyLoans: 9,
                complianceScore: 100,
                disbursedTotal: 11400000,
                status: 'Top Performer',
                joinedDate: 'Aug 2024'
              },
              {
                id: 'CDL-KN-302',
                name: 'Fatima Aliyu',
                tier: 'Bronze 1',
                potentialPOS: 85,
                standardRatio: 36,
                excellentRatio: 22,
                avgMonthlyLoans: 4,
                complianceScore: 92,
                disbursedTotal: 2900000,
                status: 'Compliant',
                joinedDate: 'Apr 2026'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'RM-NC-04',
    name: 'Gabriel Akande (RM)',
    regionName: 'North-Central Capital & Agricultural Hub',
    statesCovered: ['FCT Abuja', 'Nasarawa', 'Plateau', 'Benue'],
    totalDisbursementPortfolio: 118500000,
    activeMerchantsCount: 2790,
    nplRate: 1.1,
    overallGrowthMoM: 16.5,
    stateManagers: [
      {
        id: 'SM-FCT-01',
        name: 'Sarah Danladi (SM - FCT & Suburbs)',
        state: 'FCT Abuja',
        region: 'North-Central Capital & Agricultural Hub',
        cdlmsCount: 2,
        totalActivePOS: 1320,
        monthlyDisbursementVolume: 61500000,
        complianceRating: 98.9,
        cdlms: [
          {
            id: 'CDLM-PHI-01',
            name: 'Philip Ukahi Onaah',
            region: 'North-Central Capital & Agricultural Hub',
            state: 'FCT Abuja (Wuse, Garki & Mararaba Hub)',
            cdlsSupervised: 14,
            activePortfolioLoans: 260,
            totalDisbursedMonth: 31400000,
            vfoPassRate: 93.5,
            refinanceRate: 44.0,
            primaryTactic: 'WhatsApp Sales Coaching War-Rooms & Monthly 1-on-1 High Performer Pairing',
            cdlTeam: [
              {
                id: 'CDL-ABJ-401',
                name: 'David Agbo',
                tier: 'Gold 1',
                potentialPOS: 510,
                standardRatio: 72,
                excellentRatio: 51,
                avgMonthlyLoans: 12,
                complianceScore: 100,
                disbursedTotal: 13800000,
                status: 'Top Performer',
                joinedDate: 'Feb 2025'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'RM-SS-05',
    name: 'Tariere Briggs (RM)',
    regionName: 'South-South Delta & Coastal Trade Zone',
    statesCovered: ['Rivers', 'Delta', 'Akwa Ibom', 'Edo'],
    totalDisbursementPortfolio: 134700000,
    activeMerchantsCount: 3120,
    nplRate: 1.3,
    overallGrowthMoM: 15.1,
    stateManagers: [
      {
        id: 'SM-RIV-01',
        name: 'Tonye Douglas (SM - Port Harcourt Metro)',
        state: 'Rivers',
        region: 'South-South Delta & Coastal Trade Zone',
        cdlmsCount: 3,
        totalActivePOS: 1480,
        monthlyDisbursementVolume: 67300000,
        complianceRating: 97.8,
        cdlms: [
          {
            id: 'CDLM-ORI-01',
            name: 'Orieke Chukwuemeka Kalu',
            region: 'South-South Delta & Coastal Trade Zone',
            state: 'Rivers (Oil Mill Market & Mile 1 FMCG)',
            cdlsSupervised: 15,
            activePortfolioLoans: 270,
            totalDisbursedMonth: 27800000,
            vfoPassRate: 95.0,
            refinanceRate: 49.2,
            primaryTactic: 'Satisfied Beneficiary Referral "Evangelism" & Joint Merchant-CDL WhatsApp Community',
            cdlTeam: [
              {
                id: 'CDL-PH-501',
                name: 'Ebiere Wilcox',
                tier: 'Silver 1',
                potentialPOS: 260,
                standardRatio: 58,
                excellentRatio: 40,
                avgMonthlyLoans: 8,
                complianceScore: 97,
                disbursedTotal: 8400000,
                status: 'Compliant',
                joinedDate: 'May 2025'
              }
            ]
          },
          {
            id: 'CDLM-JUL-01',
            name: 'Ilenowa Julius Owvie',
            region: 'South-South Delta & Coastal Trade Zone',
            state: 'Delta (Warri Main Market & Asaba)',
            cdlsSupervised: 14,
            activePortfolioLoans: 235,
            totalDisbursedMonth: 23500000,
            vfoPassRate: 92.4,
            refinanceRate: 36.8,
            primaryTactic: 'Structured Sales Pitch Training, Realistic Milestones & Healthy Competition Incentives',
            cdlTeam: [
              {
                id: 'CDL-WAR-601',
                name: 'Oghenekevwe Onoja',
                tier: 'Bronze 2',
                potentialPOS: 65,
                standardRatio: 32,
                excellentRatio: 18,
                avgMonthlyLoans: 3,
                complianceScore: 94,
                disbursedTotal: 2100000,
                status: 'Compliant',
                joinedDate: 'Jan 2026'
              }
            ]
          }
        ]
      }
    ]
  }
];
