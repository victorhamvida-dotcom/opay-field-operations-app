// Unified Staff Database & Identity Verification Engine for OPay OP/CDL Simulation
// Supports: CDL, CDLM, SM, RM (Multi-Region / Multi-State / Multi-RM), and DH (Department Head)
// Enforces intelligent duplicate account checks, composite uniqueness, and Creator/Admin exception approvals.

export type StaffRole = 'CDL' | 'CDLM' | 'SM' | 'RM' | 'DH';

export type StaffGender = 'male' | 'female';

export interface StaffAccount {
  id: string; // internal unique database primary key (e.g. 'usr-101')
  loginId: string; // e.g. 'OP12345', 'DH12345', 'RM-LAGOS-01'
  loginName: string; // e.g. 'John Doe', 'Jane Smith'
  role: StaffRole;
  gender?: StaffGender; // Gender selection (male / female)
  password?: string;
  // Performance metrics (for gender-based & regional analytics)
  disbursedTotal?: number;
  score?: number;
  potentialPOS?: number;
  complianceRating?: number;
  // Hierarchy fields (Role-specific)
  region?: string; // Operating region (e.g. 'South West')
  state?: string;  // Primary Operating state (e.g. 'Lagos North', 'Lagos South')
  
  // Specific hierarchical relationships:
  // SM level: states supervised under them (can be 1 or multiple, e.g. Lagos North + Lagos South)
  supervisedStates?: string[];
  
  // CDLM & CDL placement:
  // Which State Manager (SM) is in charge of this staff's assigned state
  assignedSMId?: string;
  assignedSMName?: string;
  // Which Regional Manager (RM) is in charge of this staff's region
  assignedRMId?: string;
  assignedRMName?: string;
  
  // RM specific multi-assignment capabilities:
  assignedRegions?: string[]; // RM can supervise multiple regions
  assignedStates?: string[];  // RM can supervise multiple states
  supervisedRMs?: string[];   // RM can supervise multiple RMs (names or IDs)
  supervisedSMs?: string[];   // SMs reporting to this RM
  
  // Metadata
  tier?: string;
  status: 'Active' | 'Locked (Failed Logins)' | 'Pending Verification' | 'Exception Approved';
  createdAt: string;
  createdBy: 'Self-Registration' | 'Creator/Admin Manual Creation';
  approvalNotes?: string;
}

import { 
  getActiveNigeriaStates 
} from './nigeriaStates';

export const INITIAL_STAFF_DATABASE: StaffAccount[] = [
  // 1. Existing RM supervising multiple Regions, States and RMs
  {
    id: 'usr-006',
    loginId: 'RM-LAGOS-01',
    loginName: 'Babatunde Adeleke',
    role: 'RM',
    gender: 'male',
    region: 'South West',
    state: 'Lagos North',
    assignedRegions: ['South West', 'South South'],
    assignedStates: ['Lagos North', 'Lagos South', 'Ogun', 'Oyo'],
    supervisedRMs: ['Tariere Briggs (Delta/Rivers)'],
    supervisedSMs: ['Chinyere Okafor (Lagos North & South)', 'Gbenga Adebayo (Ogun/Oyo)'],
    disbursedTotal: 184500000,
    score: 48900,
    potentialPOS: 4280,
    complianceRating: 98.6,
    tier: 'Gold 3',
    status: 'Active',
    createdAt: '2024-05-01',
    createdBy: 'Creator/Admin Manual Creation',
  },
  // 2. Existing SM with states under them (Lagos North & Lagos South)
  {
    id: 'usr-005',
    loginId: 'SM-LAG-01',
    loginName: 'Chinyere Okafor',
    role: 'SM',
    gender: 'female',
    region: 'South West',
    state: 'Lagos North',
    supervisedStates: ['Lagos North', 'Lagos South'],
    assignedRMId: 'RM-LAGOS-01',
    assignedRMName: 'Babatunde Adeleke (RM)',
    disbursedTotal: 92400000,
    score: 41200,
    potentialPOS: 2150,
    complianceRating: 98.4,
    tier: 'Gold 3',
    status: 'Active',
    createdAt: '2024-08-01',
    createdBy: 'Self-Registration',
  },
  // 3. Existing CDLM in Lagos North under SM Chinyere Okafor
  {
    id: 'usr-003',
    loginId: 'OPAY-CDLM-FOL-01',
    loginName: 'Folorunsho O. Femi',
    role: 'CDLM',
    gender: 'male',
    region: 'South West',
    state: 'Lagos North',
    assignedSMId: 'SM-LAG-01',
    assignedSMName: 'Chinyere Okafor (SM)',
    assignedRMId: 'RM-LAGOS-01',
    assignedRMName: 'Babatunde Adeleke (RM)',
    disbursedTotal: 38200000,
    score: 39800,
    potentialPOS: 540,
    complianceRating: 99.2,
    tier: 'Gold 3',
    status: 'Active',
    createdAt: '2024-11-01',
    createdBy: 'Self-Registration',
  },
  // 4. CDL in Lagos North under CDLM Folorunsho and SM Chinyere Okafor
  {
    id: 'usr-001',
    loginId: 'OP12345',
    loginName: 'John Doe',
    role: 'CDL',
    gender: 'male',
    region: 'South West',
    state: 'Lagos North',
    assignedSMId: 'SM-LAG-01',
    assignedSMName: 'Chinyere Okafor (SM)',
    assignedRMId: 'RM-LAGOS-01',
    assignedRMName: 'Babatunde Adeleke (RM)',
    disbursedTotal: 4800000,
    score: 16500,
    potentialPOS: 42,
    complianceRating: 96.0,
    tier: 'Bronze 1',
    status: 'Active',
    createdAt: '2025-01-15',
    createdBy: 'Self-Registration',
  },
  // 5. Existing CDLM in South East (Anambra)
  {
    id: 'usr-004',
    loginId: 'OPAY-CDLM-IKE-01',
    loginName: 'Ikechukwu Kenneth',
    role: 'CDLM',
    gender: 'male',
    region: 'South East',
    state: 'Anambra',
    assignedSMId: 'SM-ANA-01',
    assignedSMName: 'Emeka Okonkwo (SM)',
    assignedRMId: 'RM-EAST-02',
    assignedRMName: 'Nnamdi Eze (RM)',
    disbursedTotal: 45500000,
    score: 45500,
    potentialPOS: 620,
    complianceRating: 100.0,
    tier: 'Gold 1',
    status: 'Active',
    createdAt: '2024-10-15',
    createdBy: 'Self-Registration',
  },
  // 6. Female CDL in South East (Aba / Onitsha)
  {
    id: 'usr-009',
    loginId: 'CDL-ON-202',
    loginName: 'Amaka Nwosu',
    role: 'CDL',
    gender: 'female',
    region: 'South East',
    state: 'Anambra',
    assignedSMId: 'SM-ANA-01',
    assignedSMName: 'Emeka Okonkwo (SM)',
    assignedRMId: 'RM-EAST-02',
    assignedRMName: 'Nnamdi Eze (RM)',
    disbursedTotal: 7900000,
    score: 28400,
    potentialPOS: 240,
    complianceRating: 98.0,
    tier: 'Silver 1',
    status: 'Active',
    createdAt: '2024-12-01',
    createdBy: 'Self-Registration',
  },
  // 7. Female CDL in Port Harcourt
  {
    id: 'usr-010',
    loginId: 'CDL-PH-501',
    loginName: 'Ebiere Wilcox',
    role: 'CDL',
    gender: 'female',
    region: 'South South',
    state: 'Rivers',
    disbursedTotal: 8400000,
    score: 29500,
    potentialPOS: 260,
    complianceRating: 97.0,
    tier: 'Silver 1',
    status: 'Active',
    createdAt: '2025-05-12',
    createdBy: 'Self-Registration',
  },
  // 8. Female CDL in Kano Singa Market
  {
    id: 'usr-011',
    loginId: 'CDL-KN-302',
    loginName: 'Fatima Aliyu',
    role: 'CDL',
    gender: 'female',
    region: 'North West',
    state: 'Kano',
    disbursedTotal: 3400000,
    score: 18200,
    potentialPOS: 85,
    complianceRating: 94.0,
    tier: 'Bronze 1',
    status: 'Active',
    createdAt: '2025-04-18',
    createdBy: 'Self-Registration',
  },
  // 9. Legitimate different staff member with same name in Kano
  {
    id: 'usr-002',
    loginId: 'OP67890',
    loginName: 'John Doe',
    role: 'CDL',
    gender: 'male',
    region: 'North West',
    state: 'Kano',
    assignedSMId: 'SM-KAN-01',
    assignedSMName: 'Usman Sani (SM)',
    assignedRMId: 'RM-NORTH-03',
    assignedRMName: 'Malam Ibrahim Danjuma (RM)',
    disbursedTotal: 6200000,
    score: 21800,
    potentialPOS: 180,
    complianceRating: 95.0,
    tier: 'Silver 2',
    status: 'Active',
    createdAt: '2025-02-10',
    createdBy: 'Self-Registration',
  },
  // 10. DH (Department Head) Accounts
  {
    id: 'usr-007',
    loginId: 'DH12345',
    loginName: 'Jane Smith',
    role: 'DH',
    gender: 'female',
    tier: 'Executive',
    status: 'Active',
    createdAt: '2024-01-01',
    createdBy: 'Creator/Admin Manual Creation',
  },
  {
    id: 'usr-008',
    loginId: 'DH-HQ-001',
    loginName: 'Dr. Aliyu Mustapha',
    role: 'DH',
    gender: 'male',
    tier: 'Executive',
    status: 'Active',
    createdAt: '2024-01-10',
    createdBy: 'Creator/Admin Manual Creation',
  }
];

export const OPAY_REGIONS: string[] = [
  'South West',
  'South East',
  'South South',
  'North West',
  'North Central',
  'North East',
];

// Dynamically generated from active Nigeria States registry (with Lagos North & Lagos South)
export function getStatesByRegion(): Record<string, string[]> {
  const activeStates = getActiveNigeriaStates();
  const map: Record<string, string[]> = {
    'South West': [],
    'South East': [],
    'South South': [],
    'North West': [],
    'North Central': [],
    'North East': [],
  };
  activeStates.forEach(s => {
    if (!map[s.region]) map[s.region] = [];
    map[s.region].push(s.name);
  });
  return map;
}

export const OPAY_STATES_BY_REGION: Record<string, string[]> = getStatesByRegion();

// Complete list of all 36 States + FCT (including Lagos North & Lagos South)
export function getAllNigeriaStateNames(): string[] {
  return getActiveNigeriaStates().map(s => s.name);
}

// Find State Manager (SM) in charge of a particular state
export function findSMInChargeOfState(stateName: string, database: StaffAccount[]): StaffAccount | undefined {
  return database.find(s => 
    s.role === 'SM' && (
      s.state === stateName ||
      (s.supervisedStates && s.supervisedStates.includes(stateName))
    )
  );
}

// Find Regional Manager (RM) in charge of a particular region or state
export function findRMInChargeOfRegionOrState(regionName: string, stateName: string, database: StaffAccount[]): StaffAccount | undefined {
  return database.find(s => 
    s.role === 'RM' && (
      s.region === regionName ||
      (s.assignedRegions && s.assignedRegions.includes(regionName)) ||
      (s.assignedStates && s.assignedStates.includes(stateName))
    )
  );
}

export const STAFF_ROLES: { role: StaffRole; label: string; description: string }[] = [
  { role: 'CDL', label: 'Channel Development Lead (CDL)', description: 'Direct field merchant engagement & POS deployment' },
  { role: 'CDLM', label: 'CDL Manager (CDLM)', description: 'Supervises CDLs, conducts market storming & loan audits' },
  { role: 'SM', label: 'State Manager (SM)', description: 'Oversees CDLMs & regional state operations' },
  { role: 'RM', label: 'Regional Manager (RM)', description: 'Supervises multiple RMs, assigned regions & states' },
  { role: 'DH', label: 'Department Head (DH)', description: 'National executive oversight (Region/State not required)' },
];

// Result of background duplicate check
export type DuplicateCheckResult = 
  | { status: 'no_conflict' }
  | { 
      status: 'exact_match'; 
      message: string; 
      existingAccount: StaffAccount;
    }
  | { 
      status: 'partial_conflict'; 
      message: string; 
      conflictType: 'same_id_different_details' | 'same_id_dh_conflict' | 'same_id_role_conflict';
      existingAccount: StaffAccount;
    };

/**
 * Intelligent background check against existing staff database.
 * Does NOT treat same name as duplicate.
 * Respects that DH does not use Region/State.
 * Flags strong identifier conflicts (same loginId with mismatched details).
 */
export function checkStaffDuplicate(
  registration: {
    loginId: string;
    loginName: string;
    role: StaffRole;
    region?: string;
    state?: string;
  },
  database: StaffAccount[]
): DuplicateCheckResult {
  const normId = registration.loginId.trim().toUpperCase();
  const normName = registration.loginName.trim().toLowerCase();
  const regRole = registration.role;
  const regRegion = (registration.region || '').trim().toLowerCase();
  const regState = (registration.state || '').trim().toLowerCase();

  // Find any record with the same Login ID (the primary strong identifier)
  const idMatch = database.find(a => a.loginId.trim().toUpperCase() === normId);

  // 1. Check for DH Account logic (No Region/State required)
  if (regRole === 'DH') {
    if (idMatch) {
      const matchName = idMatch.loginName.trim().toLowerCase();
      if (idMatch.role === 'DH' && matchName === normName) {
        return {
          status: 'exact_match',
          message: 'An existing DH account already exists with this Login ID and Name. Please use your original account to log in.',
          existingAccount: idMatch,
        };
      }
      return {
        status: 'partial_conflict',
        message: 'This Login ID is already registered to an existing staff member in the system. Please verify your credentials or contact the administrator.',
        conflictType: 'same_id_different_details',
        existingAccount: idMatch,
      };
    }
    // No ID match for DH
    return { status: 'no_conflict' };
  }

  // 2. Normal Staff Account (CDL, CDLM, SM, RM)
  if (idMatch) {
    const matchName = idMatch.loginName.trim().toLowerCase();
    const matchRegion = (idMatch.region || '').trim().toLowerCase();
    const matchState = (idMatch.state || '').trim().toLowerCase();

    // Check for exact match across 4 fields: Login ID + Name + Region + State
    const nameMatches = matchName === normName;
    const regionMatches = matchRegion === regRegion;
    const stateMatches = matchState === regState;

    if (nameMatches && regionMatches && stateMatches) {
      return {
        status: 'exact_match',
        message: 'An account already exists with these exact staff details (Login ID, Name, Region, and State). Please use your original account to log in.',
        existingAccount: idMatch,
      };
    }

    // Partial match / conflict: Same ID but some fields differ
    // Case A: Same ID + Name + Region, different State
    // Case C: Same ID, different Name
    // Case D: Role mismatch
    return {
      status: 'partial_conflict',
      message: 'Staff Information Requires Verification. We found an existing staff record with matching Login ID but conflicting details. Do not duplicate account without admin review.',
      conflictType: 'same_id_different_details',
      existingAccount: idMatch,
    };
  }

  // 3. What if Login ID is new, but someone has the SAME NAME?
  // SECTION 5: "Different staff members can legitimately have the same name. Name alone must never be treated as duplicate."
  // So if Login ID is different, having the same name is NOT blocked!
  return { status: 'no_conflict' };
}
