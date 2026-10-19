/**
 * Official Nigeria geography for OP/CDL hierarchy placement.
 * - 36 States + FCT
 * - Lagos split into Lagos North & Lagos South (operational zones)
 * - Daily refresh check so backend/config can expand if states increase
 */

export const GEO_CACHE_KEY = 'opay_nigeria_geo_v2';
export const GEO_LAST_CHECK_KEY = 'opay_nigeria_geo_last_check_v1';

/** Built-in baseline: 36 states + FCT (as of current Nigeria structure) */
export const BASELINE_NIGERIA_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export type NigeriaStateName = (typeof BASELINE_NIGERIA_STATES)[number] | string;

/**
 * Operational regions used by OPay field hierarchy.
 * Lagos is split into North & South for SM/CDLM placement clarity.
 */
export const NIGERIA_REGIONS = [
  'North-West',
  'North-East',
  'North-Central',
  'South-West',
  'South-East',
  'South-South',
  'Lagos North',
  'Lagos South',
] as const;

export type NigeriaRegion = (typeof NIGERIA_REGIONS)[number];

/**
 * Default region → states map.
 * Note: "Lagos" state appears under both Lagos North & Lagos South as the parent state,
 * while LGAs/zones distinguish North vs South operationally.
 */
export const DEFAULT_STATES_BY_REGION: Record<NigeriaRegion, string[]> = {
  'North-West': ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
  'North-East': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
  'North-Central': ['Benue', 'FCT Abuja', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau'],
  'South-West': ['Ekiti', 'Ogun', 'Ondo', 'Osun', 'Oyo'], // Lagos handled via Lagos North/South
  'South-East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
  'South-South': ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
  'Lagos North': [
    'Lagos', // parent state
    'Agege',
    'Alimosho',
    'Ifako-Ijaiye',
    'Ikeja',
    'Kosofe',
    'Mushin',
    'Oshodi-Isolo',
    'Shomolu',
  ],
  'Lagos South': [
    'Lagos', // parent state
    'Ajeromi-Ifelodun',
    'Amuwo-Odofin',
    'Apapa',
    'Eti-Osa',
    'Lagos Island',
    'Lagos Mainland',
    'Surulere',
  ],
};

export interface NigeriaGeoConfig {
  version: string;
  updatedAt: string;
  stateCount: number; // expected official count (36 + FCT = 37 identity units commonly tracked)
  states: string[]; // flat list for pickers
  regions: NigeriaRegion[];
  statesByRegion: Record<string, string[]>;
  source: 'baseline' | 'cache' | 'remote';
  notes?: string;
}

export function buildBaselineGeo(): NigeriaGeoConfig {
  return {
    version: '2026.1-baseline',
    updatedAt: new Date().toISOString(),
    stateCount: BASELINE_NIGERIA_STATES.length, // 36 states + FCT
    states: [...BASELINE_NIGERIA_STATES].sort((a, b) => a.localeCompare(b)),
    regions: [...NIGERIA_REGIONS],
    statesByRegion: { ...DEFAULT_STATES_BY_REGION },
    source: 'baseline',
    notes: 'Lagos operationally split into Lagos North & Lagos South. Full 36 states + FCT available in picker.',
  };
}

export function loadGeoConfig(): NigeriaGeoConfig {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NigeriaGeoConfig;
      if (parsed?.states?.length && parsed?.regions?.length) {
        return { ...parsed, source: 'cache' };
      }
    }
  } catch {
    // ignore
  }
  const baseline = buildBaselineGeo();
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(baseline));
  } catch {
    // ignore
  }
  return baseline;
}

export function saveGeoConfig(cfg: NigeriaGeoConfig): void {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

/**
 * Once-per-day update check.
 * - Keeps baseline if offline
 * - Merges any newly announced states from a lightweight remote config when available
 * - Never deletes existing states
 */
export async function checkNigeriaGeoUpdateOncePerDay(): Promise<{
  checked: boolean;
  updated: boolean;
  message: string;
  config: NigeriaGeoConfig;
}> {
  const now = Date.now();
  try {
    const last = localStorage.getItem(GEO_LAST_CHECK_KEY);
    if (last && now - Number(last) < 24 * 60 * 60 * 1000) {
      return {
        checked: false,
        updated: false,
        message: 'Geo update already checked today.',
        config: loadGeoConfig(),
      };
    }
  } catch {
    // continue check
  }

  const current = loadGeoConfig();
  let updated = false;
  let message = 'Nigeria geography verified against baseline (36 states + FCT).';

  // Attempt remote refresh (optional endpoint). Safe no-op if unavailable.
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    // Public placeholder path — if not present, catch and keep baseline.
    // You can later host: /geo/nigeria-states.json { states: string[], regions?: Record<string,string[]> }
    const res = await fetch('/geo/nigeria-states.json', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timer);

    if (res && res.ok) {
      const data = (await res.json()) as {
        states?: string[];
        statesByRegion?: Record<string, string[]>;
        version?: string;
        notes?: string;
      };
      if (Array.isArray(data.states) && data.states.length >= current.states.length) {
        const mergedStates = Array.from(
          new Set([...(current.states || []), ...data.states.map((s) => s.trim()).filter(Boolean)])
        ).sort((a, b) => a.localeCompare(b));

        const mergedByRegion: Record<string, string[]> = { ...current.statesByRegion };
        if (data.statesByRegion) {
          Object.entries(data.statesByRegion).forEach(([region, states]) => {
            const prev = mergedByRegion[region] || [];
            mergedByRegion[region] = Array.from(new Set([...prev, ...states])).sort((a, b) =>
              a.localeCompare(b)
            );
          });
        }

        const next: NigeriaGeoConfig = {
          ...current,
          version: data.version || `remote-${new Date().toISOString().slice(0, 10)}`,
          updatedAt: new Date().toISOString(),
          stateCount: mergedStates.length,
          states: mergedStates,
          statesByRegion: mergedByRegion,
          source: 'remote',
          notes: data.notes || current.notes,
        };
        saveGeoConfig(next);
        updated = mergedStates.length > current.states.length;
        message = updated
          ? `Geography updated: now tracking ${mergedStates.length} state/FCT entries.`
          : `Remote geography checked. Still ${mergedStates.length} entries.`;
        try {
          localStorage.setItem(GEO_LAST_CHECK_KEY, String(now));
        } catch {
          // ignore
        }
        return { checked: true, updated, message, config: next };
      }
    }
  } catch {
    message = 'Offline/local baseline used. Will retry geography update tomorrow.';
  }

  // Ensure baseline completeness even offline
  const baseline = buildBaselineGeo();
  const mergedStates = Array.from(new Set([...baseline.states, ...current.states])).sort((a, b) =>
    a.localeCompare(b)
  );
  const next: NigeriaGeoConfig = {
    ...current,
    states: mergedStates,
    stateCount: mergedStates.length,
    regions: baseline.regions,
    statesByRegion: {
      ...baseline.statesByRegion,
      ...current.statesByRegion,
    },
    updatedAt: new Date().toISOString(),
    source: current.source === 'remote' ? 'remote' : 'baseline',
  };
  saveGeoConfig(next);
  try {
    localStorage.setItem(GEO_LAST_CHECK_KEY, String(now));
  } catch {
    // ignore
  }

  return { checked: true, updated: false, message, config: next };
}

export function getRegionForState(state: string, cfg?: NigeriaGeoConfig): NigeriaRegion | '' {
  const geo = cfg || loadGeoConfig();
  const s = state.trim().toLowerCase();
  for (const region of geo.regions) {
    const list = geo.statesByRegion[region] || [];
    if (list.some((x) => x.toLowerCase() === s)) return region as NigeriaRegion;
  }
  // Parent Lagos state convenience
  if (s === 'lagos') return 'Lagos South';
  return '';
}

export function getAllStatesFlat(cfg?: NigeriaGeoConfig): string[] {
  const geo = cfg || loadGeoConfig();
  // Prefer official 36+FCT list for pickers (avoid flooding with only LGA labels)
  const official = geo.states?.length ? geo.states : [...BASELINE_NIGERIA_STATES];
  return Array.from(new Set(official)).sort((a, b) => a.localeCompare(b));
}

export function getStatesForRegion(region: string, cfg?: NigeriaGeoConfig): string[] {
  const geo = cfg || loadGeoConfig();
  return [...(geo.statesByRegion[region] || [])].sort((a, b) => a.localeCompare(b));
}
