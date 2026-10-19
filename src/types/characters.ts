// OPay 3D-Style Endless Runner Characters & Tier Outfits
// 4 distinct selectable field personas with unique tactical perks

export interface RunnerCharacter {
  id: string;
  name: string;
  title: string;
  regionOrigin: string;
  perkTitle: string;
  perkDescription: string;
  primaryColor: string;
  accentColor: string;
  skinTone: string;
  hairColor: string;
  gender: 'male' | 'female';
  quote: string;
  avatarIcon: string;
}

export const RUNNER_CHARACTERS: RunnerCharacter[] = [
  {
    id: 'char-chioma',
    name: 'Chioma Okoye',
    title: 'The Whitelist FMCG Specialist',
    regionOrigin: 'South-East Commercial Hub (Onitsha / Aba)',
    perkTitle: 'FMCG Magnetism',
    perkDescription: '+25% extra cash from Whitelisted FMCG shops & 0.3s longer combo windows.',
    primaryColor: '#10B981', // OPay emerald
    accentColor: '#34D399',
    skinTone: '#8D5524',
    hairColor: '#1F2937',
    gender: 'female',
    quote: '"I inspect daily footfall before pitching — zero default loans on my watch!"',
    avatarIcon: '👩🏾‍💼',
  },
  {
    id: 'char-ibrahim',
    name: 'Ibrahim Sani',
    title: 'The Dawanau Grain Cluster Lead',
    regionOrigin: 'North-West (Kano / Kaduna)',
    perkTitle: 'VFO Document Shield',
    perkDescription: 'Starts with 2 Compliance Shields + higher resistance to document traps.',
    primaryColor: '#0EA5E9', // Sky blue
    accentColor: '#38BDF8',
    skinTone: '#A66A38',
    hairColor: '#111827',
    gender: 'male',
    quote: '"Pre-checking CAC & tenancy agreements before VFO visit guarantees 100% approval."',
    avatarIcon: '👨🏾‍💼',
  },
  {
    id: 'char-kazeem',
    name: 'Kazeem Adeleke',
    title: 'The Lagos Market Stormer',
    regionOrigin: 'South-West Metro (Lagos North / South)',
    perkTitle: 'Turbo Refinance Rush',
    perkDescription: 'Faster dash speed & double points on timely customer refinancing.',
    primaryColor: '#F59E0B', // Amber Gold
    accentColor: '#FCD34D',
    skinTone: '#6B4423',
    hairColor: '#111827',
    gender: 'male',
    quote: '"The minute a good merchant finishes repayment, refinance them immediately!"',
    avatarIcon: '🏃🏾‍♂️',
  },
  {
    id: 'char-amina',
    name: 'Amina Bello',
    title: 'The Grassroots CDL Champion',
    regionOrigin: 'North-Central Hub (Abuja / Plateau)',
    perkTitle: 'Merchant Evangelist',
    perkDescription: 'Satisfied loan merchants generate +50% extra referral bonus volume.',
    primaryColor: '#A855F7', // Purple
    accentColor: '#C084FC',
    skinTone: '#9B6B43',
    hairColor: '#111827',
    gender: 'female',
    quote: '"Happy merchants refer their neighbours — that is how big CDLs grow portfolios organically!"',
    avatarIcon: '🌟',
  },
];

export const SAVED_CHARACTER_KEY = 'opay_selected_character_id_v1';

export function getSelectedCharacter(): RunnerCharacter {
  try {
    const savedId = localStorage.getItem(SAVED_CHARACTER_KEY);
    const found = RUNNER_CHARACTERS.find((c) => c.id === savedId);
    if (found) return found;
  } catch {
    // fallback
  }
  return RUNNER_CHARACTERS[0];
}

export function saveSelectedCharacter(charId: string): void {
  try {
    localStorage.setItem(SAVED_CHARACTER_KEY, charId);
  } catch {}
}
