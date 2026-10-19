/**
 * Policy-driven game mode studio + version history / rollback
 * Accessible to Creator and DH only.
 */

export type GameModeId =
  | 'career_run'
  | 'policy_quiz_blitz'
  | 'merchant_decision_desk'
  | 'pos_tier_climb'
  | 'compliance_survival'
  | 'loan_disbursement_sprint'
  | 'custom';

export interface GameModePreset {
  id: string;
  modeId: GameModeId;
  title: string;
  summary: string;
  sourcePolicySnippet: string;
  tags: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  focus: string[];
  createdAt: string; // ISO
  createdByRole: 'Creator' | 'DH';
  createdByName: string;
  createdById?: string;
  active?: boolean;
}

export interface GameVersionSnapshot {
  versionId: string;
  label: string;
  note: string;
  /** Real-time stamp */
  savedAt: string; // ISO with date+time+year
  savedAtDisplay: string; // human readable local
  savedByRole: 'Creator' | 'DH' | 'System';
  savedByName: string;
  /** What was active when saved */
  activeModeId: string;
  activePresetId?: string;
  /** Serializable config blob */
  config: GameRuntimeConfig;
  kind: 'auto' | 'manual' | 'rollback_restore' | 'policy_upgrade' | 'policy_create';
}

export interface GameRuntimeConfig {
  modeId: GameModeId;
  title: string;
  difficulty: 'easy' | 'normal' | 'hard';
  focus: string[];
  rules: string[];
  scoring: {
    rightAnswerBonus: number;
    wrongAnswerPenalty: number;
    wealthGainMult: number;
    speedMult: number;
  };
  features: {
    characterSelect: boolean;
    moneyRun: boolean;
    decisionGates: boolean;
    fateOptions: boolean;
    posHub: boolean;
    policyExam: boolean;
  };
  policySource?: string;
  presetId?: string;
}

export const GAME_PRESETS_KEY = 'opay_game_mode_presets_v1';
export const GAME_VERSIONS_KEY = 'opay_game_versions_v1';
export const GAME_ACTIVE_CONFIG_KEY = 'opay_game_active_config_v1';

export function nowStamp(): { iso: string; display: string } {
  const d = new Date();
  const iso = d.toISOString();
  const display = d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return { iso, display };
}

export function defaultRuntimeConfig(): GameRuntimeConfig {
  return {
    modeId: 'career_run',
    title: 'OPay Career Run (Default)',
    difficulty: 'normal',
    focus: ['loan_tactics', 'pos_quality', 'compliance', 'tiering'],
    rules: [
      'Only right approaches score',
      'Wrong answers drain wealth',
      'Worst path unlocks sack / merge / BD / resign',
    ],
    scoring: {
      rightAnswerBonus: 420,
      wrongAnswerPenalty: 180,
      wealthGainMult: 1,
      speedMult: 1,
    },
    features: {
      characterSelect: true,
      moneyRun: true,
      decisionGates: true,
      fateOptions: true,
      posHub: true,
      policyExam: true,
    },
  };
}

export function loadActiveConfig(): GameRuntimeConfig {
  try {
    const raw = localStorage.getItem(GAME_ACTIVE_CONFIG_KEY);
    if (raw) return { ...defaultRuntimeConfig(), ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultRuntimeConfig();
}

export function saveActiveConfig(cfg: GameRuntimeConfig): void {
  try {
    localStorage.setItem(GAME_ACTIVE_CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

export function loadPresets(): GameModePreset[] {
  try {
    const raw = localStorage.getItem(GAME_PRESETS_KEY);
    if (raw) return JSON.parse(raw) as GameModePreset[];
  } catch {
    // ignore
  }
  return [];
}

export function savePresets(list: GameModePreset[]): void {
  try {
    localStorage.setItem(GAME_PRESETS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function loadVersions(): GameVersionSnapshot[] {
  try {
    const raw = localStorage.getItem(GAME_VERSIONS_KEY);
    if (raw) {
      const list = JSON.parse(raw) as GameVersionSnapshot[];
      return Array.isArray(list) ? list : [];
    }
  } catch {
    // ignore
  }
  // seed baseline version
  const { iso, display } = nowStamp();
  const seed: GameVersionSnapshot = {
    versionId: `ver_baseline_${Date.now().toString(36)}`,
    label: 'Baseline Career Run',
    note: 'Initial stable build before policy-driven changes.',
    savedAt: iso,
    savedAtDisplay: display,
    savedByRole: 'System',
    savedByName: 'System',
    activeModeId: 'career_run',
    config: defaultRuntimeConfig(),
    kind: 'auto',
  };
  saveVersions([seed]);
  return [seed];
}

export function saveVersions(list: GameVersionSnapshot[]): void {
  try {
    localStorage.setItem(GAME_VERSIONS_KEY, JSON.stringify(list.slice(0, 40)));
  } catch {
    // ignore
  }
}

export function pushVersion(
  partial: Omit<GameVersionSnapshot, 'versionId' | 'savedAt' | 'savedAtDisplay'> & {
    versionId?: string;
  }
): GameVersionSnapshot {
  const { iso, display } = nowStamp();
  const snap: GameVersionSnapshot = {
    versionId: partial.versionId || `ver_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    label: partial.label,
    note: partial.note,
    savedAt: iso,
    savedAtDisplay: display,
    savedByRole: partial.savedByRole,
    savedByName: partial.savedByName,
    activeModeId: partial.activeModeId,
    activePresetId: partial.activePresetId,
    config: partial.config,
    kind: partial.kind,
  };
  const list = loadVersions();
  list.unshift(snap);
  saveVersions(list);
  return snap;
}

export interface PolicyParseResult {
  detectedThemes: string[];
  suggestedModeId: GameModeId;
  suggestedTitle: string;
  suggestedFocus: string[];
  suggestedRules: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  confidence: number; // 0-100
  rationale: string[];
  options: {
    id: 'upgrade' | 'start_new' | 'create_new';
    title: string;
    description: string;
  }[];
}

/** Lightweight keyword intelligence — no external AI required */
export function parsePolicyToGame(text: string): PolicyParseResult {
  const t = text.toLowerCase();
  const themes: string[] = [];
  const rationale: string[] = [];
  const focus: string[] = [];
  const rules: string[] = [];

  const hit = (keys: string[], theme: string, focusItem?: string) => {
    if (keys.some((k) => t.includes(k))) {
      themes.push(theme);
      if (focusItem) focus.push(focusItem);
      rationale.push(`Detected “${theme}” from policy language.`);
      return true;
    }
    return false;
  };

  hit(['loan', 'disburse', 'disbursement', 'refinance', 'interest', 'vfo'], 'Merchant Loans', 'loan_tactics');
  hit(['pos', 'terminal', 'potential', 'standard', 'excellent', 'deployment'], 'POS Quality & Tiering', 'pos_quality');
  hit(['compliance', 'manipulation', 'fraud', 'kickback', 'warning tier', 'crc'], 'Compliance / Integrity', 'compliance');
  hit(['tier', 'gold', 'silver', 'bronze', 'warning', 'commission', '90-day'], 'CDL Tier Policy', 'tiering');
  hit(['cdlm', 'whatsapp', 'coaching', 'whitelist', 'market storm'], 'CDLM Best Practices', 'cdlm_field');
  hit(['merchant', 'fmcg', 'footfall', 'screening', 'objection'], 'Merchant Screening', 'merchant_screening');
  hit(['bd team', 'direct pos', 'merge', 'resign', 'exit', 'buyout'], 'Exit / BD Pathways', 'exit_paths');
  hit(['quiz', 'training', 'exam', 'policy'], 'Training / Assessment', 'assessment');
  hit(['speed', 'sprint', 'race', 'run', 'chase'], 'Fast paced run', 'speed_run');
  hit(['gender', 'male', 'female', 'inclusive'], 'Gender-aware ops', 'gender');

  let suggestedModeId: GameModeId = 'career_run';
  if (themes.includes('Training / Assessment') && !themes.includes('Merchant Loans')) {
    suggestedModeId = 'policy_quiz_blitz';
  } else if (themes.includes('POS Quality & Tiering') && themes.length <= 2) {
    suggestedModeId = 'pos_tier_climb';
  } else if (themes.includes('Compliance / Integrity') && t.includes('survival')) {
    suggestedModeId = 'compliance_survival';
  } else if (themes.includes('Merchant Screening') && !themes.includes('Fast paced run')) {
    suggestedModeId = 'merchant_decision_desk';
  } else if (themes.includes('Merchant Loans') && themes.includes('Fast paced run')) {
    suggestedModeId = 'loan_disbursement_sprint';
  } else if (themes.length === 0) {
    suggestedModeId = 'custom';
  }

  let difficulty: 'easy' | 'normal' | 'hard' = 'normal';
  if (t.includes('hard') || t.includes('strict') || t.includes('zero tolerance')) difficulty = 'hard';
  if (t.includes('easy') || t.includes('beginner') || t.includes('onboard')) difficulty = 'easy';

  if (themes.includes('Compliance / Integrity')) {
    rules.push('Wrong compliance choices apply heavy wealth penalties');
    rules.push('Kickback / manipulation ends run faster');
  }
  if (themes.includes('POS Quality & Tiering')) {
    rules.push('Score favors Potential / Standard / Excellent POS decisions');
  }
  if (themes.includes('Merchant Loans')) {
    rules.push('Right loan approaches increase disbursed volume');
  }
  if (themes.includes('Exit / BD Pathways')) {
    rules.push('Failure path offers sack / merge / BD / resign options');
  }
  if (!rules.length) {
    rules.push('Only correct policy-aligned actions score points');
    rules.push('Progress is tracked against pasted policy themes');
  }

  const confidence = Math.min(96, 35 + themes.length * 12 + (text.length > 120 ? 10 : 0));

  const modeTitles: Record<GameModeId, string> = {
    career_run: 'Career Run (Money Lane + Decisions)',
    policy_quiz_blitz: 'Policy Quiz Blitz',
    merchant_decision_desk: 'Merchant Decision Desk',
    pos_tier_climb: 'POS Tier Climb',
    compliance_survival: 'Compliance Survival',
    loan_disbursement_sprint: 'Loan Disbursement Sprint',
    custom: 'Custom Policy Challenge',
  };

  const suggestedTitle = `${modeTitles[suggestedModeId]} · ${difficulty.toUpperCase()}`;

  return {
    detectedThemes: Array.from(new Set(themes)),
    suggestedModeId,
    suggestedTitle,
    suggestedFocus: Array.from(new Set(focus)),
    suggestedRules: rules,
    difficulty,
    confidence,
    rationale: rationale.length ? rationale : ['No strong keywords found — custom mode suggested from free text.'],
    options: [
      {
        id: 'upgrade',
        title: 'Upgrade current game',
        description: 'Keep Career Run shell, apply this policy focus/scoring on top of the live game.',
      },
      {
        id: 'start_new',
        title: 'Start a new run with this mode',
        description: 'Save a version snapshot, activate this mode, jump players into a fresh session.',
      },
      {
        id: 'create_new',
        title: 'Create a new game preset',
        description: 'Store as a reusable preset without forcing it live yet. Activate later anytime.',
      },
    ],
  };
}

export function configFromParse(
  parse: PolicyParseResult,
  policyText: string
): GameRuntimeConfig {
  const hard = parse.difficulty === 'hard';
  const easy = parse.difficulty === 'easy';
  return {
    modeId: parse.suggestedModeId,
    title: parse.suggestedTitle,
    difficulty: parse.difficulty,
    focus: parse.suggestedFocus,
    rules: parse.suggestedRules,
    scoring: {
      rightAnswerBonus: easy ? 500 : hard ? 360 : 420,
      wrongAnswerPenalty: easy ? 100 : hard ? 280 : 180,
      wealthGainMult: easy ? 1.2 : hard ? 0.85 : 1,
      speedMult: parse.suggestedModeId.includes('sprint') || parse.suggestedFocus.includes('speed_run') ? 1.15 : hard ? 1.08 : 1,
    },
    features: {
      characterSelect: true,
      moneyRun: parse.suggestedModeId !== 'policy_quiz_blitz' && parse.suggestedModeId !== 'merchant_decision_desk',
      decisionGates: true,
      fateOptions: parse.detectedThemes.includes('Exit / BD Pathways') || parse.suggestedModeId === 'career_run' || parse.suggestedModeId === 'compliance_survival',
      posHub: parse.detectedThemes.includes('POS Quality & Tiering') || true,
      policyExam: parse.detectedThemes.includes('Training / Assessment') || parse.suggestedModeId === 'policy_quiz_blitz',
    },
    policySource: policyText.slice(0, 4000),
  };
}
