import { CDLSubLevel } from './cdlPolicy';

export type Gender = 'male' | 'female';

export type CharacterId =
  | 'chioma_hustle'
  | 'ibrahim_field'
  | 'tunde_closer'
  | 'aisha_compliance'
  | 'emeka_storm'
  | 'ngozi_closer'
  | 'funke_quality'
  | 'yusuf_rural';

export interface PlayableCharacter {
  id: CharacterId;
  name: string;
  title: string;
  vibe: string;
  gender: Gender;
  /** simple avatar palette for human drawing */
  skin: string;
  hair: string;
  outfit: string;
  accent: string;
  color: string;
  startCash: number;
  speedBonus: number;
  luckBonus: number;
  story: string;
}

export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'chioma_hustle',
    name: 'Chioma',
    title: 'Market Stormer',
    vibe: 'Fast feet · High energy',
    gender: 'female',
    skin: '#C68642',
    hair: '#1C1917',
    outfit: '#10B981',
    accent: '#34D399',
    color: '#10B981',
    startCash: 180000,
    speedBonus: 1.12,
    luckBonus: 1.05,
    story: 'Runs FMCG corridors before sunrise. Loves whitelist storming.',
  },
  {
    id: 'ibrahim_field',
    name: 'Ibrahim',
    title: 'VFO Guardian',
    vibe: 'Steady · Document-first',
    gender: 'male',
    skin: '#8D5524',
    hair: '#0C0A09',
    outfit: '#0891B2',
    accent: '#22D3EE',
    color: '#06B6D4',
    startCash: 220000,
    speedBonus: 0.98,
    luckBonus: 1.12,
    story: 'Never pitches without CAC/lease ready. Compliance is his armor.',
  },
  {
    id: 'tunde_closer',
    name: 'Tunde',
    title: 'Loan Closer',
    vibe: 'Charisma · Refinance king',
    gender: 'male',
    skin: '#A analog16E',
    hair: '#1C1917',
    outfit: '#D97706',
    accent: '#FBBF24',
    color: '#F59E0B',
    startCash: 200000,
    speedBonus: 1.05,
    luckBonus: 1.1,
    story: 'Turns repaid merchants into bigger facilities the same afternoon.',
  },
  {
    id: 'aisha_compliance',
    name: 'Aisha',
    title: 'Quality Queen',
    vibe: 'POS excellence · Clean books',
    gender: 'female',
    skin: '#B5651D',
    hair: '#292524',
    outfit: '#7C3AED',
    accent: '#A78BFA',
    color: '#8B5CF6',
    startCash: 240000,
    speedBonus: 0.95,
    luckBonus: 1.15,
    story: 'Builds Excellent POS ratios and climbs tiers without drama.',
  },
  {
    id: 'emeka_storm',
    name: 'Emeka',
    title: 'Rural Rainmaker',
    vibe: 'Town markets · Volume builder',
    gender: 'male',
    skin: '#6B3A2A',
    hair: '#0C0A09',
    outfit: '#E11D48',
    accent: '#FB7185',
    color: '#F43F5E',
    startCash: 160000,
    speedBonus: 1.08,
    luckBonus: 1.0,
    story: 'Finds loan-ready merchants where others only see “small towns”.',
  },
  {
    id: 'ngozi_closer',
    name: 'Ngozi',
    title: 'Portfolio Builder',
    vibe: 'Referral engine · Calm closer',
    gender: 'female',
    skin: '#A0522D',
    hair: '#44403C',
    outfit: '#0D9488',
    accent: '#2DD4BF',
    color: '#14B8A6',
    startCash: 210000,
    speedBonus: 1.02,
    luckBonus: 1.08,
    story: 'Turns happy beneficiaries into evangelists across the market.',
  },
  {
    id: 'funke_quality',
    name: 'Funke',
    title: 'Tier Climber',
    vibe: 'Metrics · Monday incentives',
    gender: 'female',
    skin: '#C4A484',
    hair: '#1C1917',
    outfit: '#DB2777',
    accent: '#F472B6',
    color: '#EC4899',
    startCash: 230000,
    speedBonus: 1.0,
    luckBonus: 1.14,
    story: 'Tracks Standard/Excellent ratios daily and hits Gold targets.',
  },
  {
    id: 'yusuf_rural',
    name: 'Yusuf',
    title: 'North Corridor Lead',
    vibe: 'Patient · High trust',
    gender: 'male',
    skin: '#8B5A2B',
    hair: '#0C0A09',
    outfit: '#2563EB',
    accent: '#60A5FA',
    color: '#3B82F6',
    startCash: 190000,
    speedBonus: 1.04,
    luckBonus: 1.06,
    story: 'Builds long-term merchant trust across major northern towns.',
  },
];

// fix accidental typo if any in skin hex
PLAYABLE_CHARACTERS.forEach((c) => {
  if (c.id === 'tunde_closer') c.skin = '#A16E4B';
});

export type CareerFate =
  | 'sacked'
  | 'merge_big_cdl'
  | 'join_bd_team'
  | 'sell_and_resign'
  | 'warning_survival'
  | 'gold_glory';

export interface FateOption {
  id: CareerFate;
  title: string;
  blurb: string;
  emoji: string;
  tone: 'danger' | 'warn' | 'info' | 'success';
}

export const FAILURE_FATE_OPTIONS: FateOption[] = [
  {
    id: 'sacked',
    title: 'Sacked by OPay',
    blurb: 'Contract closed after repeated policy breaches / Warning tier collapse.',
    emoji: '⛔',
    tone: 'danger',
  },
  {
    id: 'merge_big_cdl',
    title: 'Merge Dashboard with a Big CDL',
    blurb: 'Your merchants fold under a stronger CDL. You keep learning under their wing.',
    emoji: '🤝',
    tone: 'warn',
  },
  {
    id: 'join_bd_team',
    title: 'Join the BD / Direct POS Team',
    blurb: 'Leave independent CDL path and join OPay Direct POS operations.',
    emoji: '🏢',
    tone: 'info',
  },
  {
    id: 'sell_and_resign',
    title: 'Sell Merchants & Resign',
    blurb: 'Exit cleanly: transfer portfolio, settle commissions, resign with dignity.',
    emoji: '🚪',
    tone: 'warn',
  },
];

export interface RunStats {
  score: number;
  wealth: number;
  cashDisbursed: number;
  tacticsProgress: number;
  combo: number;
  maxCombo: number;
  streak: number;
  shields: number;
  cdlTier: CDLSubLevel;
  whitelistedHits: number;
  fraudBlocks: number;
  elapsedSeconds: number;
  distanceM: number;
  rightAnswers: number;
  wrongAnswers: number;
  characterId: CharacterId;
  fate?: CareerFate;
  richLevel: number;
  gender?: Gender;
}

export function wealthToRichLevel(wealth: number): number {
  if (wealth >= 5000000) return 5;
  if (wealth >= 2500000) return 4;
  if (wealth >= 1200000) return 3;
  if (wealth >= 600000) return 2;
  if (wealth >= 250000) return 1;
  return 0;
}

export const RICH_LABELS = [
  'Broke Field Rookie',
  'Surviving CDL',
  'Rising Earner',
  'Comfortable Closer',
  'Market Boss',
  'OPay Tycoon',
];

/** Draw a simple human male/female field agent on canvas */
export function drawHumanCharacter(
  ctx: CanvasRenderingContext2D,
  c: PlayableCharacter,
  opts: { bob?: number; legPhase?: number; scale?: number } = {}
) {
  const bob = opts.bob || 0;
  const leg = opts.legPhase || 0;
  const s = opts.scale || 1;
  ctx.save();
  ctx.scale(s, s);
  ctx.translate(0, bob);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = c.outfit;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -2);
  ctx.lineTo(-6 - leg * 0.35, 18);
  ctx.moveTo(5, -2);
  ctx.lineTo(6 + leg * 0.35, 18);
  ctx.stroke();

  // shoes
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.ellipse(-8 - leg * 0.2, 20, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(8 + leg * 0.2, 20, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // body / outfit
  ctx.fillStyle = c.outfit;
  if (c.gender === 'female') {
    // dress/tunic silhouette
    ctx.beginPath();
    ctx.moveTo(-12, -42);
    ctx.lineTo(12, -42);
    ctx.lineTo(16, -6);
    ctx.lineTo(-16, -6);
    ctx.closePath();
    ctx.fill();
  } else {
    // jacket block
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.lineTo(12, -44);
    ctx.lineTo(13, -8);
    ctx.lineTo(-13, -8);
    ctx.closePath();
    ctx.fill();
  }

  // arms
  ctx.strokeStyle = c.skin;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, -32);
  ctx.lineTo(-18, -12 + Math.sin(leg) * 3);
  ctx.moveTo(12, -32);
  ctx.lineTo(18, -12 - Math.sin(leg) * 3);
  ctx.stroke();

  // neck
  ctx.fillStyle = c.skin;
  ctx.fillRect(-4, -50, 8, 8);

  // head
  ctx.beginPath();
  ctx.arc(0, -60, 13, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = c.hair;
  if (c.gender === 'female') {
    // fuller hair / bun
    ctx.beginPath();
    ctx.arc(0, -66, 12, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-10, -58, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.ellipse(10, -58, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -70, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // short hair cap
    ctx.beginPath();
    ctx.arc(0, -64, 12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.lineTo(10, -58);
    ctx.lineTo(-10, -58);
    ctx.closePath();
    ctx.fill();
  }

  // eyes
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(-4, -60, 1.4, 0, Math.PI * 2);
  ctx.arc(4, -60, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // smile
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -56, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // OPay badge on chest
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(0, -28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#064E3B';
  ctx.font = 'bold 5px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O', 0, -27.5);

  ctx.restore();
}
