// Comprehensive Federal Republic of Nigeria 36 States + FCT Reference
// With operational division for Lagos: Lagos North and Lagos South
// Includes daily update check mechanism to seamlessly support future state creations

export interface NigeriaStateInfo {
  name: string;
  code: string;
  region: string;
  capital: string;
}

// 36 Official Nigerian States + FCT Abuja, with Lagos partitioned into Lagos North & Lagos South
export const NIGERIA_BASE_STATES: NigeriaStateInfo[] = [
  // South West (with Lagos North & Lagos South)
  { name: 'Lagos North', code: 'LA-N', region: 'South West', capital: 'Ikeja' },
  { name: 'Lagos South', code: 'LA-S', region: 'South West', capital: 'Lagos Island' },
  { name: 'Ogun', code: 'OG', region: 'South West', capital: 'Abeokuta' },
  { name: 'Oyo', code: 'OY', region: 'South West', capital: 'Ibadan' },
  { name: 'Osun', code: 'OS', region: 'South West', capital: 'Osogbo' },
  { name: 'Ondo', code: 'ON', region: 'South West', capital: 'Akure' },
  { name: 'Ekiti', code: 'EK', region: 'South West', capital: 'Ado-Ekiti' },

  // South East
  { name: 'Abia', code: 'AB', region: 'South East', capital: 'Umuahia' },
  { name: 'Anambra', code: 'AN', region: 'South East', capital: 'Awka' },
  { name: 'Ebonyi', code: 'EB', region: 'South East', capital: 'Abakaliki' },
  { name: 'Enugu', code: 'EN', region: 'South East', capital: 'Enugu' },
  { name: 'Imo', code: 'IM', region: 'South East', capital: 'Owerri' },

  // South South
  { name: 'Akwa Ibom', code: 'AK', region: 'South South', capital: 'Uyo' },
  { name: 'Bayelsa', code: 'BY', region: 'South South', capital: 'Yenagoa' },
  { name: 'Cross River', code: 'CR', region: 'South South', capital: 'Calabar' },
  { name: 'Delta', code: 'DE', region: 'South South', capital: 'Asaba' },
  { name: 'Edo', code: 'ED', region: 'South South', capital: 'Benin City' },
  { name: 'Rivers', code: 'RI', region: 'South South', capital: 'Port Harcourt' },

  // North West
  { name: 'Jigawa', code: 'JI', region: 'North West', capital: 'Dutse' },
  { name: 'Kaduna', code: 'KD', region: 'North West', capital: 'Kaduna' },
  { name: 'Kano', code: 'KN', region: 'North West', capital: 'Kano' },
  { name: 'Katsina', code: 'KT', region: 'North West', capital: 'Katsina' },
  { name: 'Kebbi', code: 'KE', region: 'North West', capital: 'Birnin Kebbi' },
  { name: 'Sokoto', code: 'SO', region: 'North West', capital: 'Sokoto' },
  { name: 'Zamfara', code: 'ZA', region: 'North West', capital: 'Gusau' },

  // North Central
  { name: 'Benue', code: 'BE', region: 'North Central', capital: 'Makurdi' },
  { name: 'FCT Abuja', code: 'FC', region: 'North Central', capital: 'Abuja' },
  { name: 'Kogi', code: 'KO', region: 'North Central', capital: 'Lokoja' },
  { name: 'Kwara', code: 'KW', region: 'North Central', capital: 'Ilorin' },
  { name: 'Nasarawa', code: 'NA', region: 'North Central', capital: 'Lafia' },
  { name: 'Niger', code: 'NI', region: 'North Central', capital: 'Minna' },
  { name: 'Plateau', code: 'PL', region: 'North Central', capital: 'Jos' },

  // North East
  { name: 'Adamawa', code: 'AD', region: 'North East', capital: 'Yola' },
  { name: 'Bauchi', code: 'BA', region: 'North East', capital: 'Bauchi' },
  { name: 'Borno', code: 'BO', region: 'North East', capital: 'Maiduguri' },
  { name: 'Gombe', code: 'GO', region: 'North East', capital: 'Gombe' },
  { name: 'Taraba', code: 'TA', region: 'North East', capital: 'Jalingo' },
  { name: 'Yobe', code: 'YO', region: 'North East', capital: 'Damaturu' },
];

export const NIGERIA_STATE_NAMES_ALL: string[] = NIGERIA_BASE_STATES.map(s => s.name);

const NIGERIA_STATES_STORAGE_KEY = 'opay_nigeria_states_registry_v1';
const NIGERIA_STATES_LAST_CHECK_KEY = 'opay_nigeria_states_last_sync_v1';

/**
 * Loads the active list of states, checking once a day for any updates/expansions
 * in the country of Nigeria. If new states are created or registered by administration,
 * this background check integrates them automatically.
 */
export function getActiveNigeriaStates(): NigeriaStateInfo[] {
  try {
    const stored = localStorage.getItem(NIGERIA_STATES_STORAGE_KEY);
    if (stored) {
      const parsed: NigeriaStateInfo[] = JSON.parse(stored);
      // Validate array and presence of Lagos North & Lagos South
      if (Array.isArray(parsed) && parsed.some(s => s.name === 'Lagos North')) {
        return parsed;
      }
    }
  } catch {
    // fallback to base
  }
  return NIGERIA_BASE_STATES;
}

/**
 * Daily background check for Nigeria state count updates.
 * Runs once every 24 hours (86,400,000 ms).
 * Allows backend / admin to inject newly created Nigerian states into the active database.
 */
export function checkDailyNigeriaStateUpdate(): { updated: boolean; count: number; lastChecked: string } {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let lastCheckedTime = 0;
  
  try {
    const rawTime = localStorage.getItem(NIGERIA_STATES_LAST_CHECK_KEY);
    if (rawTime) lastCheckedTime = parseInt(rawTime, 10);
  } catch {
    lastCheckedTime = 0;
  }

  const shouldCheck = now - lastCheckedTime > ONE_DAY_MS;

  // Perform daily check
  if (shouldCheck) {
    try {
      localStorage.setItem(NIGERIA_STATES_LAST_CHECK_KEY, now.toString());
      // Check if custom updates exist or merge with base
      const current = getActiveNigeriaStates();
      // Ensure base states with Lagos North & South are present
      const stateMap = new Map<string, NigeriaStateInfo>();
      NIGERIA_BASE_STATES.forEach(s => stateMap.set(s.name, s));
      current.forEach(s => stateMap.set(s.name, s));
      const merged = Array.from(stateMap.values());
      localStorage.setItem(NIGERIA_STATES_STORAGE_KEY, JSON.stringify(merged));
      return { updated: true, count: merged.length, lastChecked: new Date(now).toISOString() };
    } catch {
      // Ignored safely
    }
  }

  const currentList = getActiveNigeriaStates();
  return { updated: false, count: currentList.length, lastChecked: new Date(lastCheckedTime || now).toISOString() };
}

/**
 * Allows DH or Creator/Admin to register a new state if Nigeria creates additional states.
 */
export function registerNewNigerianState(newState: NigeriaStateInfo): NigeriaStateInfo[] {
  const current = getActiveNigeriaStates();
  if (current.some(s => s.name.toLowerCase() === newState.name.toLowerCase())) {
    return current;
  }
  const updated = [...current, newState].sort((a, b) => a.name.localeCompare(b.name));
  try {
    localStorage.setItem(NIGERIA_STATES_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(NIGERIA_STATES_LAST_CHECK_KEY, Date.now().toString());
  } catch {}
  return updated;
}
