// OPay 7-Game Simulation Architecture & Policy AI Recommendation Engine
// Supports 7 full training game formats, dynamic document NLP matching,
// real-time version history tracking (Date, Time, Year) with rollback,
// and Creator Studio to build & add new game types.

export type SimulationGameMode = 
  | 'market_stormer'       // Game 1: 3-Lane 3D Endless Market Runner
  | 'merchant_dossier'     // Game 2: Merchant Credit Dossier Desk & Underwriting
  | 'tribunal_survival'    // Game 3: Warning Tier Disciplinary Tribunal
  | 'speed_disbursement'   // Game 4: 24-Hour Time-Attack Quota Blitz
  | 'terminal_empire'      // Game 5: POS Territory & Grid Empire Strategy
  | 'objection_duel'       // Game 6: Merchant Objection & Sales Pitch Duel
  | 'vfo_forensics'        // Game 7: VFO Forensic Document & Anti-Fraud Inspector
  | 'custom_creator';      // Game 8+: Custom Creator-Engineered Games

export interface GameModeDefinition {
  id: SimulationGameMode;
  name: string;
  tagline: string;
  category: 'Action Runner' | 'Deep Underwriting' | 'Crisis Survival' | 'Speed Time-Attack' | 'Strategy & Math' | 'Roleplay Duel' | 'Forensic Audit';
  icon: string;
  accentColor: string;
  badge: string;
  description: string;
  primarySkillsTested: string[];
  bestSuitedForDocuments: string[];
  modernDesignNotes: string; // Expert feedback on modern vs old-school design
}

export const OFFICIAL_GAME_MODES: GameModeDefinition[] = [
  {
    id: 'market_stormer',
    name: '3D Market Stormer Run',
    tagline: 'High-octane field run dodging traps & catching compliant loan bundles',
    category: 'Action Runner',
    icon: '🏃🏾‍♂️',
    accentColor: '#10B981',
    badge: 'Flagship Runner',
    description: 'Sprint through bustling Lagos & Kano markets. Steer your CDL officer across 3 lanes, pick whitelisted FMCG approvals, grab compliance shields, and avoid dead kiosks & volume stacking penalties.',
    primarySkillsTested: ['Field Reflexes', 'Visual Whitelist Recognition', 'Hazard Evasion', 'Turbo Dash Timing'],
    bestSuitedForDocuments: ['Market storming SOPs', 'Field blitz directives', 'Daily FMCG sweeps', 'Brand presence guidelines'],
    modernDesignNotes: 'Modernized with animated running human sprites, OPay uniform gear, safe-area viewport clipping, and dynamic streak multipliers.'
  },
  {
    id: 'merchant_dossier',
    name: 'Merchant Credit Dossier Desk',
    tagline: 'Tactical shop underwriting & capacity verification (Papers & Credit style)',
    category: 'Deep Underwriting',
    icon: '📋',
    accentColor: '#06B6D4',
    badge: 'Underwriting Simulator',
    description: 'Sit at the credit desk. Inspect merchant CAC papers, daily footfall density, bank turnover sheets, and merchant intentions. Stamp with APPROVED, REJECTED, or CDLM ESCALATION.',
    primarySkillsTested: ['Cash Flow Analysis', 'Shop Lease Inspection', 'Capacity Assessment', 'Repayment Viability'],
    bestSuitedForDocuments: ['Merchant loan screening checklists', 'Capacity validation SOPs', 'Working capital guidelines'],
    modernDesignNotes: 'Replaces boring text quizzes with tactile rubber-stamp animations, authentic audio thuds, and side-by-side document comparison.'
  },
  {
    id: 'tribunal_survival',
    name: 'Disciplinary Tribunal Survival',
    tagline: 'High-stakes Section 8 compliance court & career remediation defense',
    category: 'Crisis Survival',
    icon: '⚖️',
    accentColor: '#EF4444',
    badge: 'Crisis Court',
    description: 'Your portfolio is flagged by internal audit. Face the Disciplinary Tribunal board, defend against volume manipulation charges, and choose your official career survival pathway (Merge with Big CDL, Join BD Team, or Buyout Resignation).',
    primarySkillsTested: ['Policy Compliance', 'Risk Remediation', 'Section 8 Awareness', 'Audit Defense'],
    bestSuitedForDocuments: ['Warning Tier guidelines', 'Compliance enforcement memos', 'Anti-fraud protocols', 'Disciplinary exit policies'],
    modernDesignNotes: 'Uses dramatic high-contrast dark courtroom aesthetic with clear consequence branches instead of dry policy lists.'
  },
  {
    id: 'speed_disbursement',
    name: '24-Hour Quota Blitz',
    tagline: 'Rapid-fire time-attack credit allocation under countdown pressure',
    category: 'Speed Time-Attack',
    icon: '⏱️',
    accentColor: '#F59E0B',
    badge: 'Time-Attack Blitz',
    description: 'The regional clock is ticking! Review fast-flowing merchant loan requests in 15-second windows. Make lightning-fast compliant calls before the market day closes to maximize PTS/min efficiency.',
    primarySkillsTested: ['Rapid Decision-Making', 'Time Efficiency', 'Instinctive Policy Application', 'Quota Velocity'],
    bestSuitedForDocuments: ['Monthly sales targets', 'Same-day disbursement SOPs', 'Rapid turnaround quotas'],
    modernDesignNotes: 'Pulsing countdown gauges and streak audio pitch-glides create intense, engaging pressure without eye-straining falling balls.'
  },
  {
    id: 'terminal_empire',
    name: 'POS Territory & Grid Empire',
    tagline: 'Strategic route mapping & balancing Potential vs Standard vs Excellent ratios',
    category: 'Strategy & Math',
    icon: '🗺️',
    accentColor: '#38BDF8',
    badge: 'Strategy & Formula',
    description: 'Interactive territory deployment simulator. Strategically allocate terminals across commercial junctions, rural hubs, and state clusters to hit Gold 3 standards (>500 Potential, >70% Std, >50% Exc) while avoiding Warning Tier demotions.',
    primarySkillsTested: ['Portfolio Mathematical Modeling', 'Standard/Excellent Ratio Optimization', 'Cluster Route Strategy'],
    bestSuitedForDocuments: ['CDL Tiering criteria (5 metrics)', 'POS Volume & Quality policies', 'Commission payout schedules'],
    modernDesignNotes: 'Turns dry mathematical formulas (Standard ratio >25%, Excellent ratio >15%) into an intuitive visual grid with live progress dials.'
  },
  {
    id: 'objection_duel',
    name: 'Sales Pitch & Objection Duel',
    tagline: 'Conversational battle against real Nigerian market merchant archetypes',
    category: 'Roleplay Duel',
    icon: '⚔️',
    accentColor: '#A855F7',
    badge: 'Negotiation Duel',
    description: 'Face authentic merchant personalities (Alhaji in Dawanau, Mama Chichi in Onitsha, Tech vendor in Computer Village). Overcome interest rate objections, build trust, and pitch inventory expansion without making non-compliant false promises.',
    primarySkillsTested: ['Objection Handling', 'Merchant Psychology', 'Trust Building', 'Working Capital Value Proposition'],
    bestSuitedForDocuments: ['Sales pitch training manuals', 'Objection handling scripts', 'Merchant trust & evangelism guides'],
    modernDesignNotes: 'RPG-style dialogue battle featuring localized Nigerian business vernacular and real-time merchant trust meters.'
  },
  {
    id: 'vfo_forensics',
    name: 'VFO Forensic Document Scanner',
    tagline: 'Detective inspection spotting forged bills, fake CAC & ghost kiosks',
    category: 'Forensic Audit',
    icon: '🔍',
    accentColor: '#EC4899',
    badge: 'Fraud Detector',
    description: 'Act as the pre-VFO quality controller. Examine applicant utility bills, CAC seals, BVN records, and shop lease agreements under a forensic lens. Catch forged documents and address mismatches before the official Verification Officer visit.',
    primarySkillsTested: ['Document Fraud Detection', 'KYC Forensic Verification', 'VFO Pre-Check Protocols', 'Rejection Prevention'],
    bestSuitedForDocuments: ['VFO preparation guidelines (Shafiu Murtala model)', 'Anti-fraud inspection checklists', 'KYC compliance standards'],
    modernDesignNotes: 'Engaging magnifying glass and UV-light forensic mechanics that train CDLs to spot counterfeit documents easily.'
  }
];

export interface PolicyGeneratedItem {
  id: string;
  title: string;
  subText: string;
  category: 'right_approach' | 'wrong_approach' | 'tactic_milestone';
  value: number;
  cashAmount: number;
  icon: string;
  color: string;
  rationale: string;
}

export interface GameRecommendation {
  gameMode: SimulationGameMode;
  gameTitle: string;
  gameIcon: string;
  category: string;
  matchScore: number; // 0 to 100%
  recommendationRank: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  whyThisGameFits: string;
  testedMetrics: string[];
}

export interface PolicyVersionSnapshot {
  versionId: string;
  versionName: string;
  policyTitle: string;
  rawPolicyText: string;
  mode: SimulationGameMode;
  createdAt: string;
  timestamp: number;
  dateDisplay: string;   // Real-time Day, Month, Year
  timeDisplay: string;   // Real-time HH:MM:SS AM/PM
  year: number;          // Real-time Year
  authorName: string;
  authorRole: 'Creator' | 'DH';
  generatedItemsCount: number;
  items: PolicyGeneratedItem[];
  recommendations: GameRecommendation[];
  appliedAsActive: boolean;
  notes?: string;
}

export const STORAGE_VERSION_HISTORY_KEY = 'opay_policy_game_version_history_v2';
export const STORAGE_ACTIVE_CONFIG_KEY = 'opay_policy_game_active_config_v2';

// Modern Baseline Version 1.0 Snapshot
export const DEFAULT_INITIAL_SNAPSHOT: PolicyVersionSnapshot = {
  versionId: 'ver-v1-aug2026',
  versionName: 'V1.0 - Official Aug 2026 CDL Policy & Merchant Loan Playbook',
  policyTitle: 'OPay Merchant Loan Best Practice & 4 PEAK Pillars Baseline',
  rawPolicyText: `Six Best Practice Sharing submissions from CDL Managers were reviewed and consolidated:
1. Whitelisted sheets and direct physical observation to identify loan-ready FMCG merchants with strong repayment capacity.
2. Educate CDLs and merchants on loan products, processes, and working capital requirements.
3. Proactive follow-ups to gauge readiness even without immediate need.
4. Monitor repaid loans for instant refinancing pipeline.
5. Rigorous VFO preparation (CAC, shop lease) to prevent document rejection.
6. Personal disbursement visits for high-value loans to build trust.
7. Zero tolerance for volume manipulation, ghost kiosks or kickbacks.`,
  mode: 'market_stormer',
  createdAt: new Date('2026-08-01T09:00:00Z').toISOString(),
  timestamp: new Date('2026-08-01T09:00:00Z').getTime(),
  dateDisplay: '01 Aug 2026',
  timeDisplay: '09:00:00 AM',
  year: 2026,
  authorName: 'Hamzat Victor Chisom',
  authorRole: 'Creator',
  generatedItemsCount: 6,
  items: [
    {
      id: 'gen-1',
      title: 'WHITELISTED FMCG',
      subText: 'High Footfall Daily Patronage',
      category: 'right_approach',
      value: 200,
      cashAmount: 600000,
      icon: '🏬',
      color: '#10B981',
      rationale: 'Whitelisted FMCG businesses provide reliable daily cash flow for loan servicing.',
    },
    {
      id: 'gen-2',
      title: 'VFO PRE-CHECK OK',
      subText: 'CAC & Verified Tenancy Lease',
      category: 'right_approach',
      value: 300,
      cashAmount: 1000000,
      icon: '📑',
      color: '#06B6D4',
      rationale: 'Incomplete documentation is the top cause of loan denials; pre-checking stops rejection.',
    },
    {
      id: 'gen-3',
      title: 'INSTANT REFINANCE',
      subText: 'Compliant Loan Settled Today',
      category: 'right_approach',
      value: 350,
      cashAmount: 1500000,
      icon: '🔄',
      color: '#8B5CF6',
      rationale: 'Capture merchants immediately upon timely repayment before capital is redirected.',
    },
    {
      id: 'gen-4',
      title: 'DEAD KIOSK TRAP',
      subText: 'Unverified Location / Low Footfall',
      category: 'wrong_approach',
      value: -300,
      cashAmount: -250000,
      icon: '🏚️',
      color: '#EF4444',
      rationale: 'Stagnant businesses without customer density create non-performing loan defaults.',
    },
    {
      id: 'gen-5',
      title: 'VOLUME MANIPULATION',
      subText: 'Artificial POS Stacking Violation',
      category: 'wrong_approach',
      value: -500,
      cashAmount: -500000,
      icon: '🚫',
      color: '#DC2626',
      rationale: 'Direct compliance breach; triggers observation downgrade and disciplinary tribunal.',
    },
    {
      id: 'gen-6',
      title: 'PERSONAL DISBURSAL',
      subText: 'High-Value In-Person Visit',
      category: 'right_approach',
      value: 400,
      cashAmount: 2000000,
      icon: '🤝',
      color: '#EC4899',
      rationale: 'Personal delivery by supervisory leads cuts application drop-offs on large sums.',
    },
  ],
  recommendations: [
    {
      gameMode: 'market_stormer',
      gameTitle: '3D Market Stormer Run',
      gameIcon: '🏃🏾‍♂️',
      category: 'Action Runner',
      matchScore: 98,
      recommendationRank: 1,
      whyThisGameFits: 'Contains direct market-storming directives, fast-turnover FMCG criteria, and physical avoidance of dead kiosks.',
      testedMetrics: ['Field Reflexes', 'FMCG Whitelist Prioritization', 'Obstacle Evasion']
    },
    {
      gameMode: 'merchant_dossier',
      gameTitle: 'Merchant Credit Dossier Desk',
      gameIcon: '📋',
      category: 'Deep Underwriting',
      matchScore: 92,
      recommendationRank: 2,
      whyThisGameFits: 'Heavily emphasizes VFO document verification, tenancy checking, and capacity validation.',
      testedMetrics: ['Credit Underwriting', 'CAC Inspection', 'Tenancy Verification']
    },
    {
      gameMode: 'objection_duel',
      gameTitle: 'Sales Pitch & Objection Duel',
      gameIcon: '⚔️',
      category: 'Roleplay Duel',
      matchScore: 88,
      recommendationRank: 3,
      whyThisGameFits: 'Focuses on merchant education, addressing interest rate objections, and working capital needs.',
      testedMetrics: ['Objection Handling', 'Merchant Trust', 'Refinancing Conversion']
    }
  ],
  appliedAsActive: true,
  notes: 'Original master baseline configuration with 6 CDLM field-tested practices and 7 game mode recommendations.',
};

/**
 * Intelligent Document Analyzer:
 * Reads raw text, analyzes semantic criteria, generates playable cards,
 * and calculates exact compatibility match scores (%) across all 7 game types.
 */
export function analyzeDocumentAndRecommendGames(rawText: string): {
  suggestedTitle: string;
  extractedKeywords: string[];
  recommendations: GameRecommendation[];
  topRecommendedMode: SimulationGameMode;
  generatedItems: PolicyGeneratedItem[];
  expertModernCritique: string;
} {
  const lower = rawText.toLowerCase();

  // Criteria Weight Scores for all 7 Game Modes
  let scoreRunner = 50;
  let scoreDossier = 50;
  let scoreTribunal = 40;
  let scoreSpeed = 45;
  let scoreEmpire = 45;
  let scoreDuel = 45;
  let scoreForensics = 40;

  // Keyword scoring
  if (lower.includes('storm') || lower.includes('market') || lower.includes('footfall') || lower.includes('traffic')) {
    scoreRunner += 35;
    scoreSpeed += 20;
  }
  if (lower.includes('dossier') || lower.includes('screening') || lower.includes('review') || lower.includes('capacity') || lower.includes('underwrite')) {
    scoreDossier += 40;
    scoreForensics += 25;
  }
  if (lower.includes('warning') || lower.includes('tribunal') || lower.includes('sack') || lower.includes('demot') || lower.includes('remedy') || lower.includes('breach')) {
    scoreTribunal += 45;
  }
  if (lower.includes('speed') || lower.includes('quota') || lower.includes('blitz') || lower.includes('countdown') || lower.includes('24h') || lower.includes('hours') || lower.includes('instant')) {
    scoreSpeed += 38;
    scoreRunner += 20;
  }
  if (lower.includes('tier') || lower.includes('ratio') || lower.includes('standard') || lower.includes('excellent') || lower.includes('potential pos') || lower.includes('formula') || lower.includes('500') || lower.includes('percentage') || lower.includes('commission')) {
    scoreEmpire += 45;
    scoreDossier += 20;
  }
  if (lower.includes('objection') || lower.includes('pitch') || lower.includes('merchant says') || lower.includes('interview') || lower.includes('trust') || lower.includes('rate') || lower.includes('convince') || lower.includes('evangelis')) {
    scoreDuel += 44;
  }
  if (lower.includes('vfo') || lower.includes('cac') || lower.includes('fraud') || lower.includes('counterfeit') || lower.includes('fake') || lower.includes('lease') || lower.includes('bvn') || lower.includes('document')) {
    scoreForensics += 45;
    scoreDossier += 25;
  }

  // Normalize all scores between 60% and 99%
  const allRaw = [
    { mode: 'market_stormer' as SimulationGameMode, score: scoreRunner, why: 'High concentration of market storming, footfall verification, and active field evasion.' },
    { mode: 'merchant_dossier' as SimulationGameMode, score: scoreDossier, why: 'Strong emphasis on detailed merchant capacity assessment and credit underwriting.' },
    { mode: 'tribunal_survival' as SimulationGameMode, score: scoreTribunal, why: 'Explicit Warning Tier protocols, disciplinary clauses, and crisis remediation options.' },
    { mode: 'speed_disbursement' as SimulationGameMode, score: scoreSpeed, why: 'Urgent turnaround quotas, blitz time constraints, and instant disbursement targets.' },
    { mode: 'terminal_empire' as SimulationGameMode, score: scoreEmpire, why: 'Heavy reliance on Standard/Excellent POS ratios, mathematical formulas, and tier standards.' },
    { mode: 'objection_duel' as SimulationGameMode, score: scoreDuel, why: 'Prominent merchant dialogue, sales pitch negotiation, and interest rate objection handling.' },
    { mode: 'vfo_forensics' as SimulationGameMode, score: scoreForensics, why: 'Intensive VFO pre-check criteria, anti-fraud inspection, and CAC document validation.' },
  ];

  // Sort descending by score
  allRaw.sort((a, b) => b.score - a.score);

  const recommendations: GameRecommendation[] = allRaw.map((item, index) => {
    const modeDef = OFFICIAL_GAME_MODES.find(m => m.id === item.mode)!;
    // Normalize percentage
    const maxVal = allRaw[0].score;
    const pct = Math.min(99, Math.max(62, Math.round((item.score / (maxVal + 20)) * 100)));

    return {
      gameMode: item.mode,
      gameTitle: modeDef.name,
      gameIcon: modeDef.icon,
      category: modeDef.category,
      matchScore: pct,
      recommendationRank: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      whyThisGameFits: item.why,
      testedMetrics: modeDef.primarySkillsTested,
    };
  });

  const topRecommendedMode = recommendations[0].gameMode;

  // Extract Suggested Title
  let suggestedTitle = 'OPay Operational Directive';
  const firstLine = rawText.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
    suggestedTitle = firstLine.replace(/^[#*\-•\d.]+\s*/, '');
  } else if (lower.includes('vfo')) {
    suggestedTitle = 'VFO Verification & Readiness Standard Protocol';
  } else if (lower.includes('ratio') || lower.includes('tier')) {
    suggestedTitle = 'CDL POS Tiering & Standard Ratio Framework';
  }

  // Keywords
  const keywords: string[] = [];
  ['whitelist', 'vfo', 'refinance', 'fmcg', 'manipulation', 'evangelism', 'coaching', 'tribunal', 'standard', 'excellent', 'footfall', 'bvn', 'cac', 'quota', 'objection'].forEach(k => {
    if (lower.includes(k)) keywords.push(k.toUpperCase());
  });

  // Generate dynamic items
  const items: PolicyGeneratedItem[] = [];

  if (lower.includes('whitelist') || lower.includes('fmcg') || lower.includes('turnover')) {
    items.push({
      id: `dyn-${Date.now()}-1`,
      title: 'WHITELISTED FMCG',
      subText: 'High Footfall Daily Patronage',
      category: 'right_approach',
      value: 250,
      cashAmount: 800000,
      icon: '🏬',
      color: '#10B981',
      rationale: 'Whitelisted FMCG businesses provide reliable daily cash flow for loan servicing.',
    });
  }

  if (lower.includes('vfo') || lower.includes('cac') || lower.includes('doc')) {
    items.push({
      id: `dyn-${Date.now()}-2`,
      title: 'VFO PRE-CHECK OK',
      subText: 'CAC & Verified Tenancy Lease',
      category: 'right_approach',
      value: 300,
      cashAmount: 1200000,
      icon: '📑',
      color: '#06B6D4',
      rationale: 'Thorough pre-verification eliminates loan application denials.',
    });
  }

  if (lower.includes('refinanc') || lower.includes('repay')) {
    items.push({
      id: `dyn-${Date.now()}-3`,
      title: 'INSTANT REFINANCE',
      subText: 'Same-Day Top-Up Disbursement',
      category: 'right_approach',
      value: 350,
      cashAmount: 1500000,
      icon: '🔄',
      color: '#8B5CF6',
      rationale: 'Re-engage compliant borrowers immediately upon full repayment.',
    });
  }

  if (lower.includes('manipulat') || lower.includes('fraud') || lower.includes('ghost')) {
    items.push({
      id: `dyn-${Date.now()}-4`,
      title: 'VOLUME FRAUD TRAP',
      subText: 'Artificial Stacking Violation',
      category: 'wrong_approach',
      value: -600,
      cashAmount: -600000,
      icon: '🚫',
      color: '#DC2626',
      rationale: 'Direct compliance breach; triggers observation downgrade and disciplinary tribunal.',
    });
  } else {
    items.push({
      id: `dyn-${Date.now()}-4`,
      title: 'DEAD KIOSK TRAP',
      subText: 'Zero Footfall / Churn Risk',
      category: 'wrong_approach',
      value: -300,
      cashAmount: -250000,
      icon: '🏚️',
      color: '#EF4444',
      rationale: 'Deploying low-quality terminals degrades Standard and Excellent ratios.',
    });
  }

  items.push({
    id: `dyn-${Date.now()}-5`,
    title: 'POLICY MANDATE MASTERED',
    subText: 'Core Objective Completed',
    category: 'tactic_milestone',
    value: 500,
    cashAmount: 1000000,
    icon: '🏆',
    color: '#F59E0B',
    rationale: 'Successfully executing the active directive promotes CDL standing.',
  });

  // Honest, Professional Feedback on Modern vs Old-school Game Design
  let expertModernCritique = '✓ Modernized: Clean typography, tactile audio feedback, real-time timestamping, and 100dvh safe-area support.';
  if (lower.length < 50) {
    expertModernCritique = '⚠️ Warning: The pasted text is very brief. For rich gameplay, include specific metrics, merchant objections, or compliance consequences.';
  } else if (lower.includes('question') && lower.includes('answer') && lower.includes('option a')) {
    expertModernCritique = '💡 Creator Insight: Text looks like an old-school multiple-choice quiz. We recommend pairing it with "Merchant Credit Dossier" or "Objection Duel" for modern interactive immersion rather than static text dumps.';
  } else if (lower.includes('warning') || lower.includes('sack')) {
    expertModernCritique = '🔥 High-Impact: Document contains strong consequence triggers. The Disciplinary Tribunal mode will give officers realistic crisis simulation.';
  }

  return {
    suggestedTitle,
    extractedKeywords: keywords,
    recommendations,
    topRecommendedMode,
    generatedItems: items,
    expertModernCritique,
  };
}

/**
 * Loads all saved version snapshots.
 */
export function getSavedPolicySnapshots(): PolicyVersionSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_VERSION_HISTORY_KEY);
    if (raw) {
      const parsed: PolicyVersionSnapshot[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [DEFAULT_INITIAL_SNAPSHOT];
}

/**
 * Saves a new version snapshot with real-time Date, Time, and Year tracking.
 */
export function saveNewPolicySnapshot(
  snapshot: Omit<PolicyVersionSnapshot, 'versionId' | 'createdAt' | 'timestamp' | 'dateDisplay' | 'timeDisplay' | 'year'>
): PolicyVersionSnapshot {
  const now = new Date();
  
  const dateDisplay = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  
  const timeDisplay = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const newSnapshot: PolicyVersionSnapshot = {
    ...snapshot,
    versionId: `ver-${Date.now()}`,
    createdAt: now.toISOString(),
    timestamp: now.getTime(),
    dateDisplay,
    timeDisplay,
    year: now.getFullYear(),
  };

  const history = getSavedPolicySnapshots();
  const updatedHistory = [
    newSnapshot,
    ...history.map(h => snapshot.appliedAsActive ? { ...h, appliedAsActive: false } : h),
  ];

  try {
    localStorage.setItem(STORAGE_VERSION_HISTORY_KEY, JSON.stringify(updatedHistory));
    if (newSnapshot.appliedAsActive) {
      localStorage.setItem(STORAGE_ACTIVE_CONFIG_KEY, JSON.stringify(newSnapshot));
    }
  } catch {}

  return newSnapshot;
}

/**
 * Rollback to any past version snapshot in real time.
 */
export function rollbackToVersionSnapshot(targetVersionId: string): PolicyVersionSnapshot | null {
  const history = getSavedPolicySnapshots();
  const target = history.find(h => h.versionId === targetVersionId);
  if (!target) return null;

  const updatedHistory = history.map(h => ({
    ...h,
    appliedAsActive: h.versionId === targetVersionId,
  }));

  try {
    localStorage.setItem(STORAGE_VERSION_HISTORY_KEY, JSON.stringify(updatedHistory));
    localStorage.setItem(STORAGE_ACTIVE_CONFIG_KEY, JSON.stringify({ ...target, appliedAsActive: true }));
  } catch {}

  return target;
}

/**
 * Gets currently active policy snapshot.
 */
export function getActivePolicySnapshot(): PolicyVersionSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_INITIAL_SNAPSHOT;
}
