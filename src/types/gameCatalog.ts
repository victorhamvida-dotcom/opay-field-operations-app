/**
 * Multi-game catalog for the OPay training platform.
 * Creator manages/extends types.
 * DH gets ranked suggestions from uploaded SOP/policy text.
 */

export type GameCategory =
  | 'loan_disbursement'
  | 'pos_quality'
  | 'compliance'
  | 'tier_policy'
  | 'field_coaching'
  | 'merchant_screening'
  | 'assessment'
  | 'exit_pathways'
  | 'speed_engagement'
  | 'leadership_analytics';

export type GameTypeId =
  | 'career_money_run'
  | 'policy_quiz_arena'
  | 'merchant_case_desk'
  | 'pos_tier_climber'
  | 'compliance_gauntlet'
  | 'loan_sprint_lanes'
  | 'warning_exit_simulator'
  | string; // Creator can add more

export interface GameTypeDefinition {
  id: GameTypeId;
  name: string;
  tagline: string;
  description: string;
  /** Categories this game teaches well */
  categories: GameCategory[];
  /** Keywords that boost recommendation score */
  keywords: string[];
  playerExperience: string;
  bestFor: string[];
  difficultyDefault: 'easy' | 'normal' | 'hard';
  estimatedMinutes: number;
  modern: boolean;
  createdBy: 'system' | 'Creator';
  createdByName?: string;
  createdAt: string;
  active: boolean;
  /** visual */
  color: string;
  icon: string;
}

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  loan_disbursement: 'Merchant Loan Disbursement',
  pos_quality: 'POS Volume & Quality',
  compliance: 'Compliance & Integrity',
  tier_policy: 'CDL Tier / Commission Policy',
  field_coaching: 'CDLM Coaching & Field Tactics',
  merchant_screening: 'Merchant Screening',
  assessment: 'Training Assessment / Quiz',
  exit_pathways: 'Warning / Exit Pathways',
  speed_engagement: 'Fast Engagement / Run',
  leadership_analytics: 'Leadership / Oversight',
};

export const SYSTEM_GAME_TYPES: GameTypeDefinition[] = [
  {
    id: 'career_money_run',
    name: 'Career Money Run',
    tagline: 'Temple-run field career · get rich or face fate',
    description:
      'Animated lane runner with human characters. Catch money, answer field gates, climb wealth. Failures unlock sack / merge / BD / resign.',
    categories: ['loan_disbursement', 'field_coaching', 'compliance', 'speed_engagement', 'exit_pathways'],
    keywords: ['run', 'career', 'loan', 'disburse', 'cdl', 'fate', 'merge', 'bd', 'resign', 'money', 'tier', 'vfo', 'whitelist'],
    playerExperience: 'High energy 3-lane chase + decision gates',
    bestFor: ['General CDL onboarding', 'Mixed loan + compliance SOPs', 'Engagement-heavy training'],
    difficultyDefault: 'normal',
    estimatedMinutes: 8,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#10B981',
    icon: '🏃',
  },
  {
    id: 'policy_quiz_arena',
    name: 'Policy Quiz Arena',
    tagline: 'Fast scored exam from policy clauses',
    description:
      'Rapid multiple-choice / scenario quiz focused on policy accuracy, tier rules, and commission logic.',
    categories: ['assessment', 'tier_policy', 'compliance'],
    keywords: ['quiz', 'exam', 'policy', 'tier', 'gold', 'silver', 'bronze', 'warning', 'commission', '90-day', 'training'],
    playerExperience: 'Timed questions, instant feedback, leaderboard score',
    bestFor: ['New policy rollout', 'August 2026 CDL policy tests', 'Knowledge certification'],
    difficultyDefault: 'normal',
    estimatedMinutes: 12,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#8B5CF6',
    icon: '📝',
  },
  {
    id: 'merchant_case_desk',
    name: 'Merchant Case Desk',
    tagline: 'Read full cases · choose correct field action',
    description:
      'Large readable merchant dossiers. Decide screening, pitch, VFO prep, refinance. Best when documents need judgment, not speed.',
    categories: ['merchant_screening', 'loan_disbursement', 'field_coaching'],
    keywords: ['merchant', 'screening', 'fmcg', 'footfall', 'objection', 'case', 'dossier', 'pitch', 'vfo', 'refinance', 'whitelist'],
    playerExperience: 'Card-based decisions with explanations',
    bestFor: ['SOP on merchant handling', 'Objection handling guides', 'Quality over speed training'],
    difficultyDefault: 'normal',
    estimatedMinutes: 15,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#F59E0B',
    icon: '🗂️',
  },
  {
    id: 'pos_tier_climber',
    name: 'POS Tier Climber',
    tagline: 'Deploy right POS · climb Bronze→Gold',
    description:
      'Simulate POS deployment choices that move Potential / Standard / Excellent ratios and tier standing.',
    categories: ['pos_quality', 'tier_policy'],
    keywords: ['pos', 'terminal', 'potential', 'standard', 'excellent', 'deployment', 'tier', 'gold', 'volume', 'quality'],
    playerExperience: 'Metric dashboard + deployment choices',
    bestFor: ['POS quality SOPs', 'Tier upgrade playbooks', 'Monday incentive education'],
    difficultyDefault: 'normal',
    estimatedMinutes: 10,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#06B6D4',
    icon: '📶',
  },
  {
    id: 'compliance_gauntlet',
    name: 'Compliance Gauntlet',
    tagline: 'Survive fraud traps · protect integrity',
    description:
      'Hazard-heavy mode: kickbacks, manipulation, fake docs. Shields, strikes, and compliance score matter most.',
    categories: ['compliance', 'exit_pathways'],
    keywords: ['compliance', 'fraud', 'kickback', 'manipulation', 'integrity', 'warning', 'audit', 'forge', 'blacklist'],
    playerExperience: 'Survival decisions with harsh penalties',
    bestFor: ['Anti-fraud memos', 'Zero-tolerance policies', 'Warning tier communications'],
    difficultyDefault: 'hard',
    estimatedMinutes: 9,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#EF4444',
    icon: '🛡️',
  },
  {
    id: 'loan_sprint_lanes',
    name: 'Loan Disbursement Sprint',
    tagline: 'Speed run correct loan tactics only',
    description:
      'Faster lane sprint focused purely on successful loan disbursement approaches and refinance timing.',
    categories: ['loan_disbursement', 'speed_engagement', 'field_coaching'],
    keywords: ['loan', 'disbursement', 'disburse', 'sprint', 'speed', 'refinance', 'working capital', 'inventory'],
    playerExperience: 'High-speed money run with loan-only gates',
    bestFor: ['Loan push campaigns', 'Short refreshers', 'Competition days'],
    difficultyDefault: 'hard',
    estimatedMinutes: 6,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#22C55E',
    icon: '⚡',
  },
  {
    id: 'warning_exit_simulator',
    name: 'Warning & Exit Simulator',
    tagline: 'Practice Warning-tier choices before real damage',
    description:
      'Scenario lab for Warning tier recovery vs exit: improve portfolio, merge into big CDL, join BD/Direct POS, or resign.',
    categories: ['exit_pathways', 'tier_policy', 'compliance'],
    keywords: ['warning', 'exit', 'merge', 'bd', 'direct pos', 'resign', 'buyout', 'one month', 'remediation', 'closure'],
    playerExperience: 'Branching policy outcomes + counseling tone',
    bestFor: ['Warning tier SOPs', 'Exit pathway briefings', 'Manager coaching packs'],
    difficultyDefault: 'normal',
    estimatedMinutes: 11,
    modern: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    color: '#F97316',
    icon: '⚠️',
  },
];

export const GAME_CATALOG_KEY = 'opay_game_type_catalog_v1';

export function loadGameCatalog(): GameTypeDefinition[] {
  try {
    const raw = localStorage.getItem(GAME_CATALOG_KEY);
    if (raw) {
      const custom = JSON.parse(raw) as GameTypeDefinition[];
      // merge system + custom (custom can override inactive flags by id only if creator-made)
      const map = new Map<string, GameTypeDefinition>();
      SYSTEM_GAME_TYPES.forEach((g) => map.set(g.id, g));
      custom.forEach((g) => {
        if (g.createdBy === 'Creator') map.set(g.id, g);
        else if (map.has(g.id)) {
          // allow active toggle persistence for system games
          const base = map.get(g.id)!;
          map.set(g.id, { ...base, active: g.active });
        }
      });
      return Array.from(map.values());
    }
  } catch {
    // ignore
  }
  return [...SYSTEM_GAME_TYPES];
}

export function saveGameCatalog(list: GameTypeDefinition[]): void {
  try {
    // persist creator games + active flags
    localStorage.setItem(GAME_CATALOG_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function upsertCreatorGameType(
  input: Partial<GameTypeDefinition> & {
    name: string;
    tagline: string;
    description: string;
    categories: GameCategory[];
  },
  creatorName: string
): GameTypeDefinition {
  const list = loadGameCatalog();
  const id =
    input.id ||
    `creator_${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 32)}_${Date.now().toString(36)}`;

  const next: GameTypeDefinition = {
    id,
    name: input.name.trim(),
    tagline: (input.tagline || input.name).trim(),
    description: (input.description || input.tagline || input.name).trim(),
    categories: input.categories,
    keywords: (input.keywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean),
    playerExperience: (input.playerExperience || 'Custom Creator training mode').trim(),
    bestFor: input.bestFor || ['Custom SOP training'],
    difficultyDefault: input.difficultyDefault || 'normal',
    estimatedMinutes: input.estimatedMinutes || 10,
    modern: true,
    createdBy: 'Creator',
    createdByName: creatorName,
    createdAt: new Date().toISOString(),
    active: input.active !== false,
    color: input.color || '#10B981',
    icon: input.icon || '🎮',
  };

  const idx = list.findIndex((g) => g.id === id);
  if (idx >= 0) list[idx] = { ...list[idx], ...next, createdBy: list[idx].createdBy, createdAt: list[idx].createdAt };
  else list.push(next);
  saveGameCatalog(list);
  return next;
}

export interface GameSuggestion {
  game: GameTypeDefinition;
  score: number; // 0-100
  matchedCategories: GameCategory[];
  matchedKeywords: string[];
  why: string[];
  rank: number;
}

export function suggestGamesFromDocument(
  text: string,
  catalog?: GameTypeDefinition[]
): { suggestions: GameSuggestion[]; detectedCategories: GameCategory[]; summary: string } {
  const body = text.toLowerCase();
  const games = (catalog || loadGameCatalog()).filter((g) => g.active);

  const categoryKeywords: Record<GameCategory, string[]> = {
    loan_disbursement: ['loan', 'disburse', 'disbursement', 'refinance', 'interest', 'facility', 'working capital'],
    pos_quality: ['pos', 'terminal', 'potential', 'standard', 'excellent', 'deployment', 'bound'],
    compliance: ['compliance', 'fraud', 'kickback', 'manipulation', 'integrity', 'audit', 'forge', 'blacklist'],
    tier_policy: ['tier', 'gold', 'silver', 'bronze', 'warning', 'commission', '90-day', 'sub-level'],
    field_coaching: ['cdlm', 'coaching', 'whatsapp', 'whitelist', 'market storm', 'mentor'],
    merchant_screening: ['merchant', 'screening', 'fmcg', 'footfall', 'objection', 'kyc', 'cac'],
    assessment: ['quiz', 'exam', 'assessment', 'test', 'training', 'certif'],
    exit_pathways: ['exit', 'merge', 'resign', 'bd team', 'direct pos', 'buyout', 'sack', 'closure'],
    speed_engagement: ['sprint', 'speed', 'race', 'run', 'chase', 'blitz'],
    leadership_analytics: ['dh', 'rm', 'regional', 'analytics', 'oversight', 'dashboard'],
  };

  const detectedCategories: GameCategory[] = [];
  (Object.keys(categoryKeywords) as GameCategory[]).forEach((cat) => {
    if (categoryKeywords[cat].some((k) => body.includes(k))) detectedCategories.push(cat);
  });

  const scored: GameSuggestion[] = games.map((game) => {
    let score = 10;
    const matchedCategories: GameCategory[] = [];
    const matchedKeywords: string[] = [];
    const why: string[] = [];

    game.categories.forEach((cat) => {
      if (detectedCategories.includes(cat)) {
        matchedCategories.push(cat);
        score += 14;
        why.push(`Fits category: ${CATEGORY_LABELS[cat]}`);
      }
    });

    game.keywords.forEach((kw) => {
      if (body.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        score += 4;
      }
    });
    if (matchedKeywords.length) why.push(`Keyword hits: ${matchedKeywords.slice(0, 6).join(', ')}`);

    // Prefer modern catalog items slightly
    if (game.modern) score += 3;

    // Length bonus: longer SOPs favor case desk / quiz
    if (text.length > 800 && (game.id === 'merchant_case_desk' || game.id === 'policy_quiz_arena')) {
      score += 6;
      why.push('Long document → deeper reading/assessment mode scores higher');
    }
    if (text.length < 350 && (game.id === 'loan_sprint_lanes' || game.id === 'career_money_run')) {
      score += 4;
      why.push('Short brief → faster engagement mode fits');
    }

    score = Math.max(0, Math.min(99, score));
    if (!why.length) why.push('General training fit (low specific keyword match)');

    return { game, score, matchedCategories, matchedKeywords, why, rank: 0 };
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((s, i) => {
    s.rank = i + 1;
  });

  const top = scored[0];
  const summary = top
    ? `Best fit: ${top.game.name} (${top.score}% match). ${detectedCategories.length ? `Detected: ${detectedCategories.map((c) => CATEGORY_LABELS[c]).join(', ')}.` : 'Few keywords detected — top general modes shown.'}`
    : 'No active games in catalog.';

  return { suggestions: scored, detectedCategories, summary };
}
