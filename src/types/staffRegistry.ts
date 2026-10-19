// Unified staff registry integrated into existing OP/CDL auth
// Hierarchy: DH → RM → SM → CDLM → CDL → Merchant

import {
  NIGERIA_REGIONS,
  NigeriaRegion,
  loadGeoConfig,
  getAllStatesFlat,
  getStatesForRegion,
  getRegionForState,
  checkNigeriaGeoUpdateOncePerDay,
} from './nigeriaGeography';

export type StaffRole = 'CDL' | 'CDLM' | 'SM' | 'RM' | 'DH';

export type StaffGender = 'male' | 'female';

export type AccountStatus = 'active' | 'locked' | 'pending_verification';

export type CreationSource = 'self_registration' | 'creator_manual' | 'legacy_dh' | 'seed';

// Re-export geography so existing imports keep working
export { NIGERIA_REGIONS };
export type { NigeriaRegion };

/** Dynamic region→states map from geo config (Lagos North/South aware) */
export function getStatesByRegionMap(): Record<string, string[]> {
  return loadGeoConfig().statesByRegion;
}

/** @deprecated use getStatesByRegionMap(); kept for compatibility */
export const STATES_BY_REGION: Record<string, string[]> = new Proxy({} as Record<string, string[]>, {
  get(_t, prop: string) {
    return getStatesForRegion(prop);
  },
  ownKeys() {
    return [...NIGERIA_REGIONS];
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

/** Full official list (36 states + FCT) for pickers */
export function getAllNigeriaStates(): string[] {
  return getAllStatesFlat();
}

export const ALL_STATES: string[] = getAllStatesFlat();

export interface StaffAssignmentHistory {
  id: string;
  at: string;
  byRole: 'DH' | 'Creator';
  byLoginId: string;
  byName: string;
  fromRegion?: string;
  fromState?: string;
  toRegion?: string;
  toState?: string;
  fromAssignedRegions?: NigeriaRegion[];
  fromAssignedStates?: string[];
  toAssignedRegions?: NigeriaRegion[];
  toAssignedStates?: string[];
  reason: string;
}

export interface StaffAccount {
  /** Internal unique account key — never use identity fields as PK */
  accountId: string;
  loginId: string; // Staff ID e.g. OP12345 / DH12345 / RM12345
  loginName: string; // Staff display name
  role: StaffRole;
  gender?: StaffGender; // collected at registration
  password: string;
  /** Required for CDL/CDLM/SM; optional/omitted for DH; multi for RM */
  region?: NigeriaRegion | '';
  state?: string;
  /** SM may cover one or more states under their region */
  smStates?: string[];
  /** CDLM placement under SM — states they operate */
  cdlmStates?: string[];
  /** Optional explicit parent links for hierarchy clarity */
  reportsToSmLoginId?: string;
  reportsToRmLoginId?: string;
  /** RM multi-assignment support */
  assignedRegions?: NigeriaRegion[];
  assignedStates?: string[];
  supervisedRmIds?: string[]; // loginIds of RMs this RM supervises
  status: AccountStatus;
  createdAt: string;
  createdBy: CreationSource;
  createdByAdminName?: string;
  lastLoginAt?: string;
  notes?: string;
  /** Audit trail for real-life region/state transfers */
  assignmentHistory?: StaffAssignmentHistory[];
}

/** DH hierarchy visibility helpers */
export interface HierarchyView {
  state: string;
  region: string;
  smInCharge: StaffAccount | null;
  rmInCharge: StaffAccount | null;
  cdlmsInState: StaffAccount[];
  cdlsInState: StaffAccount[];
}

export function findSmInChargeOfState(state: string, registry?: StaffAccount[]): StaffAccount | null {
  const list = registry || loadStaffRegistry();
  const s = state.trim().toLowerCase();
  const sms = list.filter((a) => a.role === 'SM' && a.status === 'active');
  const direct =
    sms.find((a) => (a.state || '').toLowerCase() === s) ||
    sms.find((a) => (a.smStates || []).some((x) => x.toLowerCase() === s));
  return direct || null;
}

export function findRmInChargeOfRegion(region: string, registry?: StaffAccount[]): StaffAccount | null {
  const list = registry || loadStaffRegistry();
  const r = region.trim().toLowerCase();
  const rms = list.filter((a) => a.role === 'RM' && a.status === 'active');
  return (
    rms.find((a) => (a.region || '').toLowerCase() === r) ||
    rms.find((a) => (a.assignedRegions || []).some((x) => x.toLowerCase() === r)) ||
    null
  );
}

export function findRmInChargeOfState(state: string, registry?: StaffAccount[]): StaffAccount | null {
  const list = registry || loadStaffRegistry();
  const s = state.trim().toLowerCase();
  const rms = list.filter((a) => a.role === 'RM' && a.status === 'active');
  const byState =
    rms.find((a) => (a.state || '').toLowerCase() === s) ||
    rms.find((a) => (a.assignedStates || []).some((x) => x.toLowerCase() === s));
  if (byState) return byState;
  const region = getRegionForState(state);
  if (region) return findRmInChargeOfRegion(region, list);
  return null;
}

export interface GenderAnalytics {
  total: number;
  male: number;
  female: number;
  unspecified: number;
  malePct: number;
  femalePct: number;
  byRole: Record<string, { male: number; female: number; unspecified: number; total: number }>;
  topMale: StaffAccount[];
  topFemale: StaffAccount[];
}

export function computeGenderAnalytics(registry?: StaffAccount[]): GenderAnalytics {
  const list = (registry || loadStaffRegistry()).filter((a) => a.status !== 'locked');
  const male = list.filter((a) => a.gender === 'male');
  const female = list.filter((a) => a.gender === 'female');
  const unspecified = list.filter((a) => !a.gender);
  const roles: StaffRole[] = ['DH', 'RM', 'SM', 'CDLM', 'CDL'];
  const byRole: GenderAnalytics['byRole'] = {};
  roles.forEach((role) => {
    const subset = list.filter((a) => a.role === role);
    byRole[role] = {
      total: subset.length,
      male: subset.filter((a) => a.gender === 'male').length,
      female: subset.filter((a) => a.gender === 'female').length,
      unspecified: subset.filter((a) => !a.gender).length,
    };
  });
  const total = list.length || 1;
  return {
    total: list.length,
    male: male.length,
    female: female.length,
    unspecified: unspecified.length,
    malePct: Math.round((male.length / total) * 100),
    femalePct: Math.round((female.length / total) * 100),
    byRole,
    topMale: male.slice(0, 5),
    topFemale: female.slice(0, 5),
  };
}

export function buildHierarchyForState(state: string, registry?: StaffAccount[]): HierarchyView {
  const list = registry || loadStaffRegistry();
  const region = getRegionForState(state) || '';
  const sm = findSmInChargeOfState(state, list);
  const rm = findRmInChargeOfState(state, list);
  const s = state.trim().toLowerCase();
  const cdlmsInState = list.filter(
    (a) =>
      a.role === 'CDLM' &&
      a.status === 'active' &&
      ((a.state || '').toLowerCase() === s || (a.cdlmStates || []).some((x) => x.toLowerCase() === s))
  );
  const cdlsInState = list.filter(
    (a) => a.role === 'CDL' && a.status === 'active' && (a.state || '').toLowerCase() === s
  );
  return {
    state,
    region,
    smInCharge: sm,
    rmInCharge: rm,
    cdlmsInState,
    cdlsInState,
  };
}

export { checkNigeriaGeoUpdateOncePerDay, getAllStatesFlat, getStatesForRegion, getRegionForState, loadGeoConfig };

export type DuplicateVerdict =
  | 'none'
  | 'exact'
  | 'partial'
  | 'login_id_conflict'
  | 'name_only'; // informational — never block

export interface DuplicateCheckResult {
  verdict: DuplicateVerdict;
  matchedAccounts: StaffAccount[];
  reasons: string[];
  messageTitle: string;
  messageBody: string;
  allowSelfRegister: boolean;
}

export const STAFF_REGISTRY_KEY = 'opay_staff_registry_v1';
export const STAFF_SESSION_KEY = 'opay_staff_session_v1';

export function normalizeId(id: string): string {
  return id.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function newAccountId(): string {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Role-aware duplicate / conflict check — never blocks on name alone */
export function checkStaffDuplicate(
  input: {
    loginId: string;
    loginName: string;
    role: StaffRole;
    region?: string;
    state?: string;
  },
  existing: StaffAccount[],
  opts?: { excludeAccountId?: string }
): DuplicateCheckResult {
  const loginId = normalizeId(input.loginId);
  const loginName = normalizeName(input.loginName);
  const region = (input.region || '').trim();
  const state = (input.state || '').trim();
  const isDh = input.role === 'DH';

  const pool = existing.filter((a) => a.accountId !== opts?.excludeAccountId);

  // 1) Exact match
  if (isDh) {
    const exact = pool.filter(
      (a) =>
        a.role === 'DH' &&
        normalizeId(a.loginId) === loginId &&
        normalizeName(a.loginName) === loginName
    );
    if (exact.length) {
      return {
        verdict: 'exact',
        matchedAccounts: exact,
        reasons: ['Same Login ID + Same Login Name (DH)'],
        messageTitle: 'Existing Account Found',
        messageBody:
          'An account already exists with these staff details.\n\nPlease use your original account to log in.\n\nIf you believe there is an issue with your existing account, please contact the administrator.',
        allowSelfRegister: false,
      };
    }
  } else {
    const exact = pool.filter(
      (a) =>
        normalizeId(a.loginId) === loginId &&
        normalizeName(a.loginName) === loginName &&
        (a.region || '') === region &&
        (a.state || '') === state
    );
    if (exact.length) {
      return {
        verdict: 'exact',
        matchedAccounts: exact,
        reasons: ['Same Login ID + Login Name + Region + State'],
        messageTitle: 'Existing Account Found',
        messageBody:
          'An account already exists with these staff details.\n\nPlease use your original account to log in.\n\nIf you believe there is an issue with your existing account, please contact the administrator.',
        allowSelfRegister: false,
      };
    }
  }

  // 2) Strong identifier: Login ID already used
  const idHits = pool.filter((a) => normalizeId(a.loginId) === loginId);
  if (idHits.length) {
    const reasons: string[] = [`Login ID ${loginId} already exists`];
    idHits.forEach((a) => {
      if (normalizeName(a.loginName) === loginName) reasons.push('Same Login Name on existing ID');
      if (!isDh && a.region && a.region === region) reasons.push(`Same Region (${region})`);
      if (!isDh && a.state && a.state === state) reasons.push(`Same State (${state})`);
      if (a.role !== input.role) reasons.push(`Existing role is ${a.role}, new role is ${input.role}`);
    });
    return {
      verdict: 'login_id_conflict',
      matchedAccounts: idHits,
      reasons,
      messageTitle: 'Staff Information Requires Verification',
      messageBody: isDh
        ? 'We found an existing staff record with some matching information.\n\nPlease verify your Login ID and Name.\n\nDH accounts do not require Region or State. If you believe your information is correct but the system is showing this warning, please contact the administrator.'
        : 'We found an existing staff record with some matching information.\n\nPlease verify your Login ID, Name, Region and State where applicable.\n\nIf you believe your information is correct but the system is showing this warning, please contact the administrator.',
      allowSelfRegister: false,
    };
  }

  // 3) Partial match for normal staff (ID+Name+Region different state, etc.)
  if (!isDh) {
    const partial = pool.filter((a) => {
      const sameName = normalizeName(a.loginName) === loginName;
      const sameRegion = !!region && a.region === region;
      const sameState = !!state && a.state === state;
      // Name + Region + State but different ID → suspicious
      if (sameName && sameRegion && sameState) return true;
      // Name + Region with very similar organizational placement
      if (sameName && sameRegion && a.role === input.role) return true;
      return false;
    });

    // Name alone is NEVER enough — filter those out unless paired
    const strongPartial = partial.filter((a) => {
      const sameName = normalizeName(a.loginName) === loginName;
      const orgOverlap =
        (!!region && a.region === region) || (!!state && a.state === state);
      return sameName && orgOverlap;
    });

    if (strongPartial.length) {
      return {
        verdict: 'partial',
        matchedAccounts: strongPartial,
        reasons: [
          'Possible duplicate: matching name with overlapping Region/State assignment',
          'Login IDs differ — may be legitimate different staff, needs verification',
        ],
        messageTitle: 'Verification Required',
        messageBody:
          'Some of the staff information entered matches an existing account.\n\nPlease verify your details or contact the administrator.\n\nNote: Same name alone is not treated as a duplicate — but combined identity fields require review.',
        allowSelfRegister: false,
      };
    }
  }

  // 4) Name-only hits — allow registration, no block
  const nameOnly = pool.filter((a) => normalizeName(a.loginName) === loginName);
  if (nameOnly.length) {
    return {
      verdict: 'name_only',
      matchedAccounts: nameOnly,
      reasons: ['Same display name exists on other Login IDs (allowed)'],
      messageTitle: '',
      messageBody: '',
      allowSelfRegister: true,
    };
  }

  return {
    verdict: 'none',
    matchedAccounts: [],
    reasons: [],
    messageTitle: '',
    messageBody: '',
    allowSelfRegister: true,
  };
}

export function loadStaffRegistry(): StaffAccount[] {
  try {
    const raw = window.localStorage.getItem(STAFF_REGISTRY_KEY);
    if (!raw) return seedStaffRegistry();
    const parsed = JSON.parse(raw) as StaffAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedStaffRegistry();
    return parsed;
  } catch {
    try {
      const raw = window.sessionStorage.getItem(STAFF_REGISTRY_KEY);
      if (raw) return JSON.parse(raw) as StaffAccount[];
    } catch {
      // ignore
    }
    return seedStaffRegistry();
  }
}

export function saveStaffRegistry(list: StaffAccount[]): boolean {
  try {
    const payload = JSON.stringify(list);
    window.localStorage.setItem(STAFF_REGISTRY_KEY, payload);
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(STAFF_REGISTRY_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }
}

export function findStaffByLogin(loginId: string, registry?: StaffAccount[]): StaffAccount | undefined {
  const list = registry || loadStaffRegistry();
  const id = normalizeId(loginId);
  return list.find((a) => normalizeId(a.loginId) === id);
}

export function authenticateStaff(
  loginId: string,
  password: string,
  registry?: StaffAccount[]
): { ok: true; account: StaffAccount } | { ok: false; reason: string } {
  const list = registry || loadStaffRegistry();
  const account = findStaffByLogin(loginId, list);
  if (!account) return { ok: false, reason: 'No account found for this Login ID. Please register or contact the administrator.' };
  if (account.status === 'locked') return { ok: false, reason: 'This account is locked. Contact the Creator/Admin.' };
  if (account.status === 'pending_verification') return { ok: false, reason: 'Account pending admin verification.' };
  if (account.password !== password) return { ok: false, reason: 'Incorrect password.' };
  return { ok: true, account };
}

export function registerStaffSelf(
  input: {
    loginId: string;
    loginName: string;
    role: StaffRole;
    password: string;
    gender?: StaffGender;
    region?: string;
    state?: string;
    assignedRegions?: NigeriaRegion[];
    assignedStates?: string[];
    supervisedRmIds?: string[];
  }
): { ok: true; account: StaffAccount } | { ok: false; check: DuplicateCheckResult } {
  const list = loadStaffRegistry();
  const check = checkStaffDuplicate(input, list);
  if (!check.allowSelfRegister) {
    return { ok: false, check };
  }

  // Role field requirements
  if (input.role !== 'DH') {
    if (input.role === 'RM') {
      const hasRegions = (input.assignedRegions && input.assignedRegions.length > 0) || !!input.region;
      const hasStates = (input.assignedStates && input.assignedStates.length > 0) || !!input.state;
      if (!hasRegions || !hasStates) {
        return {
          ok: false,
          check: {
            verdict: 'partial',
            matchedAccounts: [],
            reasons: ['RM requires region and state assignment'],
            messageTitle: 'Missing Required Fields',
            messageBody: 'RM registration requires Login ID, Login Name, and at least one Region and State assignment.',
            allowSelfRegister: false,
          },
        };
      }
    } else if (!input.region || !input.state) {
      return {
        ok: false,
        check: {
          verdict: 'partial',
          matchedAccounts: [],
          reasons: ['Region and State are required for this role'],
          messageTitle: 'Missing Required Fields',
          messageBody: 'Normal staff registration requires Login ID, Login Name, Region and State.',
          allowSelfRegister: false,
        },
      };
    }
  }

  if (!input.gender) {
    return {
      ok: false,
      check: {
        verdict: 'partial',
        matchedAccounts: [],
        reasons: ['Gender is required'],
        messageTitle: 'Missing Required Fields',
        messageBody: 'Please select Male or Female during registration.',
        allowSelfRegister: false,
      },
    };
  }

  const account: StaffAccount = {
    accountId: newAccountId(),
    loginId: normalizeId(input.loginId),
    loginName: input.loginName.trim().replace(/\s+/g, ' '),
    role: input.role,
    gender: input.gender,
    password: input.password,
    region: input.role === 'DH' ? undefined : ((input.region as NigeriaRegion) || input.assignedRegions?.[0] || undefined),
    state: input.role === 'DH' ? undefined : input.state || input.assignedStates?.[0] || undefined,
    smStates: input.role === 'SM' ? input.assignedStates || (input.state ? [input.state] : []) : undefined,
    cdlmStates: input.role === 'CDLM' ? input.assignedStates || (input.state ? [input.state] : []) : undefined,
    assignedRegions: input.role === 'RM' ? input.assignedRegions || [] : undefined,
    assignedStates: input.role === 'RM' ? input.assignedStates || [] : undefined,
    supervisedRmIds:
      input.role === 'RM'
        ? (input.supervisedRmIds || [])
            .map((s) => normalizeId(s))
            .filter(Boolean)
        : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: 'self_registration',
  };

  // Soft uniqueness index: never overwrite existing by ID
  if (list.some((a) => normalizeId(a.loginId) === account.loginId)) {
    return {
      ok: false,
      check: checkStaffDuplicate(input, list),
    };
  }

  list.push(account);
  saveStaffRegistry(list);
  return { ok: true, account };
}

export function creatorCreateStaff(
  input: {
    loginId: string;
    loginName: string;
    role: StaffRole;
    password: string;
    gender?: StaffGender;
    region?: string;
    state?: string;
    assignedRegions?: NigeriaRegion[];
    assignedStates?: string[];
    supervisedRmIds?: string[];
    notes?: string;
    forceDespiteConflict?: boolean;
  },
  adminName: string
): { ok: true; account: StaffAccount; warning?: string } | { ok: false; error: string; check?: DuplicateCheckResult } {
  const list = loadStaffRegistry();
  const check = checkStaffDuplicate(input, list);

  if (check.verdict === 'exact' && !input.forceDespiteConflict) {
    return {
      ok: false,
      error: 'Exact existing account found. Enable “Force create verified exception” only after investigation.',
      check,
    };
  }

  if (check.verdict === 'login_id_conflict' && !input.forceDespiteConflict) {
    return {
      ok: false,
      error: 'Login ID already exists. Review the conflict or force-create only if verified as legitimate exception.',
      check,
    };
  }

  // Never silently overwrite
  if (list.some((a) => normalizeId(a.loginId) === normalizeId(input.loginId)) && !input.forceDespiteConflict) {
    return { ok: false, error: 'Login ID already in registry. Do not overwrite — resolve conflict first.', check };
  }

  // If force and ID exists, still block overwrite — create only if ID free OR force with new unique internal id but same login is forbidden
  if (list.some((a) => normalizeId(a.loginId) === normalizeId(input.loginId))) {
    return {
      ok: false,
      error: 'Cannot create: Login ID already exists. Edit the existing account instead of creating a duplicate Login ID.',
      check,
    };
  }

  const account: StaffAccount = {
    accountId: newAccountId(),
    loginId: normalizeId(input.loginId),
    loginName: input.loginName.trim().replace(/\s+/g, ' '),
    role: input.role,
    gender: input.gender,
    password: input.password,
    region: input.role === 'DH' ? undefined : ((input.region as NigeriaRegion) || undefined),
    state: input.role === 'DH' ? undefined : input.state || undefined,
    smStates: input.role === 'SM' ? input.assignedStates || (input.state ? [input.state] : []) : undefined,
    cdlmStates: input.role === 'CDLM' ? input.assignedStates || (input.state ? [input.state] : []) : undefined,
    assignedRegions: input.role === 'RM' ? input.assignedRegions || [] : undefined,
    assignedStates: input.role === 'RM' ? input.assignedStates || [] : undefined,
    supervisedRmIds: input.role === 'RM' ? input.supervisedRmIds || [] : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: 'creator_manual',
    createdByAdminName: adminName,
    notes: input.notes || (input.forceDespiteConflict ? 'Creator-verified exception' : undefined),
  };

  list.push(account);
  saveStaffRegistry(list);
  return {
    ok: true,
    account,
    warning: check.verdict === 'partial' || check.verdict === 'name_only' ? check.reasons.join('; ') : undefined,
  };
}

/**
 * DH power: update a staff member's Region/State when they truly transfer in real life.
 * - Never changes Login ID
 * - Never silently overwrites without explicit DH action + reason
 * - DH accounts themselves do not take Region/State
 * - RM can receive multi-region / multi-state updates
 * - Full audit history retained on the account
 */
export function dhUpdateStaffAssignment(input: {
  targetAccountId: string;
  dhLoginId: string;
  dhName: string;
  newRegion?: NigeriaRegion | '';
  newState?: string;
  newAssignedRegions?: NigeriaRegion[];
  newAssignedStates?: string[];
  reason: string;
}): { ok: true; account: StaffAccount } | { ok: false; error: string } {
  const reason = (input.reason || '').trim();
  if (reason.length < 5) {
    return { ok: false, error: 'Please provide a clear transfer reason (min 5 characters).' };
  }

  const list = loadStaffRegistry();
  const idx = list.findIndex((a) => a.accountId === input.targetAccountId);
  if (idx < 0) return { ok: false, error: 'Staff account not found.' };

  const current = list[idx];
  if (current.role === 'DH') {
    return { ok: false, error: 'DH accounts do not use Region/State assignments.' };
  }

  // Validate region/state pairing for single-posting roles
  if (current.role === 'CDL' || current.role === 'CDLM' || current.role === 'SM') {
    if (!input.newRegion || !input.newState) {
      return { ok: false, error: 'Region and State are required for this staff role.' };
    }
    const allowed = STATES_BY_REGION[input.newRegion] || [];
    if (!allowed.includes(input.newState)) {
      return { ok: false, error: `State “${input.newState}” is not under Region “${input.newRegion}”.` };
    }
  }

  if (current.role === 'RM') {
    const regions = input.newAssignedRegions || [];
    const states = input.newAssignedStates || [];
    // Allow primary region/state as fallback if multi lists empty but primary provided
    if (!regions.length && !input.newRegion && !states.length && !input.newState) {
      return { ok: false, error: 'Provide at least one Region/State assignment for this RM transfer.' };
    }
  }

  const historyEntry: StaffAssignmentHistory = {
    id: `xfer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    byRole: 'DH',
    byLoginId: normalizeId(input.dhLoginId),
    byName: input.dhName.trim(),
    fromRegion: current.region || undefined,
    fromState: current.state || undefined,
    toRegion: input.newRegion || undefined,
    toState: input.newState || undefined,
    fromAssignedRegions: current.assignedRegions ? [...current.assignedRegions] : undefined,
    fromAssignedStates: current.assignedStates ? [...current.assignedStates] : undefined,
    toAssignedRegions: input.newAssignedRegions ? [...input.newAssignedRegions] : undefined,
    toAssignedStates: input.newAssignedStates ? [...input.newAssignedStates] : undefined,
    reason,
  };

  const updated: StaffAccount = {
    ...current,
    region:
      current.role === 'RM'
        ? (input.newRegion as NigeriaRegion) ||
          input.newAssignedRegions?.[0] ||
          current.region
        : (input.newRegion as NigeriaRegion),
    state:
      current.role === 'RM'
        ? input.newState || input.newAssignedStates?.[0] || current.state
        : input.newState,
    assignedRegions:
      current.role === 'RM'
        ? input.newAssignedRegions && input.newAssignedRegions.length
          ? input.newAssignedRegions
          : current.assignedRegions
        : current.assignedRegions,
    assignedStates:
      current.role === 'RM'
        ? input.newAssignedStates && input.newAssignedStates.length
          ? input.newAssignedStates
          : current.assignedStates
        : current.assignedStates,
    assignmentHistory: [...(current.assignmentHistory || []), historyEntry],
    notes: current.notes,
  };

  // No-op guard
  const samePrimary =
    (updated.region || '') === (current.region || '') &&
    (updated.state || '') === (current.state || '');
  const sameMulti =
    JSON.stringify(updated.assignedRegions || []) === JSON.stringify(current.assignedRegions || []) &&
    JSON.stringify(updated.assignedStates || []) === JSON.stringify(current.assignedStates || []);
  if (samePrimary && sameMulti) {
    return { ok: false, error: 'No change detected. Select a different Region/State before saving.' };
  }

  list[idx] = updated;
  saveStaffRegistry(list);
  return { ok: true, account: updated };
}

function seedStaffRegistry(): StaffAccount[] {
  // Seed from known field mentors + sample officers style IDs — does not wipe later user data if key exists
  const seed: StaffAccount[] = [
    {
      accountId: newAccountId(),
      loginId: 'OP-CDL-KAN-102',
      loginName: 'Ibrahim Danjuma',
      role: 'CDL',
      gender: 'male',
      password: 'ChangeMe1',
      region: 'North-West',
      state: 'Kano',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-CDL-LAG-289',
      loginName: 'Taiwo Adeyemi',
      role: 'CDL',
      gender: 'male',
      password: 'ChangeMe1',
      region: 'Lagos South',
      state: 'Lagos',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-SM-LAG-S-01',
      loginName: 'Bola Adebayo',
      role: 'SM',
      gender: 'female',
      password: 'ChangeMe1',
      region: 'Lagos South',
      state: 'Lagos',
      smStates: ['Lagos'],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-SM-KANO-01',
      loginName: 'Suleiman Kano',
      role: 'SM',
      gender: 'male',
      password: 'ChangeMe1',
      region: 'North-West',
      state: 'Kano',
      smStates: ['Kano'],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-CDLM-KAD-007',
      loginName: 'Shafiu Murtala',
      role: 'CDLM',
      gender: 'male',
      password: 'ChangeMe1',
      region: 'North-West',
      state: 'Kaduna',
      cdlmStates: ['Kaduna'],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-CDLM-LAG-S-02',
      loginName: 'Chioma Okeke',
      role: 'CDLM',
      gender: 'female',
      password: 'ChangeMe1',
      region: 'Lagos South',
      state: 'Lagos',
      cdlmStates: ['Lagos'],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'OP-RM-SW-01',
      loginName: 'Folake Adeyemi',
      role: 'RM',
      gender: 'female',
      password: 'ChangeMe1',
      region: 'South-West',
      state: 'Oyo',
      assignedRegions: ['South-West', 'Lagos North', 'Lagos South'],
      assignedStates: ['Lagos', 'Ogun', 'Oyo', 'Osun'],
      supervisedRmIds: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    },
    {
      accountId: newAccountId(),
      loginId: 'DH-NAT-001',
      loginName: 'National Oversight Desk',
      role: 'DH',
      gender: 'female',
      password: 'ChangeMe1',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
      notes: 'DH has no Region/State requirement',
    },
  ];
  saveStaffRegistry(seed);
  return seed;
}

/** Migrate legacy DH accounts into staff registry once */
export function migrateLegacyDhAccounts(): void {
  try {
    const legacyKey = 'opay_dh_accounts_v1';
    const raw = window.localStorage.getItem(legacyKey);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Array<{ name: string; staffCode: string; password: string; createdAt?: string }>;
    if (!Array.isArray(legacy) || !legacy.length) return;
    const list = loadStaffRegistry();
    let changed = false;
    legacy.forEach((d) => {
      const id = normalizeId(d.staffCode || '');
      if (!id) return;
      if (list.some((a) => normalizeId(a.loginId) === id)) return;
      list.push({
        accountId: newAccountId(),
        loginId: id,
        loginName: (d.name || 'DH User').trim(),
        role: 'DH',
        password: d.password || 'ChangeMe1',
        status: 'active',
        createdAt: d.createdAt || new Date().toISOString(),
        createdBy: 'legacy_dh',
      });
      changed = true;
    });
    if (changed) saveStaffRegistry(list);
  } catch {
    // ignore
  }
}
