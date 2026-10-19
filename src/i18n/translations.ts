export type AppLanguage =
  | 'en'
  | 'yo'
  | 'ig'
  | 'ha'
  | 'ff'
  | 'efi' // Efik/Ibibio family label as Ibibio
  | 'bin' // Edo (Bini)
  | 'tiv'
  | 'kr'  // Kanuri
  | 'ijc' // Ijaw
  | 'nup' // Nupe
  | 'fr'
  | 'es'
  | 'zh'
  | 'zh-CN';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  region: string;
  group: 'nigeria' | 'international';
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', region: 'Default', group: 'nigeria' },
  { code: 'yo', label: 'Yoruba', nativeLabel: 'Yorùbá', region: 'SW Nigeria', group: 'nigeria' },
  { code: 'ig', label: 'Igbo', nativeLabel: 'Igbo', region: 'SE Nigeria', group: 'nigeria' },
  { code: 'ha', label: 'Hausa', nativeLabel: 'Hausa', region: 'North Nigeria', group: 'nigeria' },
  { code: 'ff', label: 'Fulani', nativeLabel: 'Fulfulde', region: 'North / National', group: 'nigeria' },
  { code: 'efi', label: 'Ibibio', nativeLabel: 'Ibibio', region: 'SS Nigeria', group: 'nigeria' },
  { code: 'bin', label: 'Edo', nativeLabel: 'Ẹ̀dó (Bini)', region: 'SS Nigeria', group: 'nigeria' },
  { code: 'tiv', label: 'Tiv', nativeLabel: 'Tiv', region: 'NC Nigeria', group: 'nigeria' },
  { code: 'kr', label: 'Kanuri', nativeLabel: 'Kanuri', region: 'NE Nigeria', group: 'nigeria' },
  { code: 'ijc', label: 'Ijaw', nativeLabel: 'Izon', region: 'SS Nigeria', group: 'nigeria' },
  { code: 'nup', label: 'Nupe', nativeLabel: 'Nupe', region: 'NC Nigeria', group: 'nigeria' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', region: 'International', group: 'international' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', region: 'International', group: 'international' },
  { code: 'zh', label: 'Mandarin', nativeLabel: '普通话', region: 'International', group: 'international' },
  { code: 'zh-CN', label: 'Chinese', nativeLabel: '中文', region: 'International', group: 'international' },
];

type Dict = Record<string, string>;

const en: Dict = {
  access_portal: 'Access Portal',
  choose_pathway: 'Select how you want to enter the OPay field system',
  language: 'My Language',
  language_hint: 'Default is English. Changing language only affects YOUR session — not other users.',
  more_languages: 'More languages',
  hide_languages: 'Hide languages',
  nigeria_languages: 'Nigerian languages',
  international_languages: 'International',
  creator: 'Creator',
  creator_desc: 'Admin master access — password only',
  play_guest: 'Play as Guest',
  guest_desc: 'Train as a CDL in the field simulator',
  dh_login: 'DH Oversight',
  dh_desc: 'View all regions: RM, SM, CDLM & CDL analytics',
  dh_title: 'DH Performance Portal',
  dh_subtitle: 'Read-only national & regional intelligence',
  full_name: 'Full Name',
  staff_code: 'Staff Code',
  password: 'Password',
  set_password: 'Create your password',
  confirm_password: 'Confirm password',
  login: 'Sign in',
  register_dh: 'First time here? Create DH account',
  back_to_dh_login: 'Back to DH sign in',
  create_dh_account: 'Create DH account',
  dh_register_hint: 'Set your own password. Next time use Name + Staff Code + Password.',
  creator_auth: 'Creator sign in',
  creator_password_only: 'Password only. No name or staff code needed.',
  verify_creator: 'Enter as Creator',
  back: 'Back',
  back_selection: 'Back to main options',
  wrong_password: 'Incorrect password. Try again.',
  wrong_creator: 'Incorrect Creator password.',
  fill_all_fields: 'Please complete all fields.',
  password_mismatch: 'Passwords do not match.',
  password_too_short: 'Password must be at least 6 characters.',
  dh_registered: 'DH account created. You are signed in.',
  dh_not_found: 'No DH account found. Create one first.',
  welcome_dh: 'Welcome, DH',
  all_regions: 'All Regions',
  performance_analytics: 'Performance Analytics',
  logout: 'Sign out',
  start_run: 'Start CDL Field Run',
  feedback: 'Feedback',
  music: 'Music',
  hierarchy: 'Hierarchy',
  scenarios: 'Scenarios',
  policy_exam: 'Policy Exam',
  rankings: 'Rankings',
  deploy_pos: 'Deploy POS',
  only_right_score: 'Only right approaches score points',
  field_chain: 'RM → SM → CDLM → CDL',
  internal_security: 'OPay Internal • Channel Development',
  dh_read_only: 'DH access is analytics only (read-only).',
  region: 'Region',
  score: 'Score',
  tier: 'Tier',
  loans: 'Loans',
  pos: 'POS',
  compliance: 'Compliance',
  search_filter: 'Search name or region',
  national_summary: 'National Summary',
  open_simulator_readonly: 'Open training (observe)',
  save_prefs: 'Save my preferences',
  prefs_saved: 'Preferences saved for you',
  assist_prefs: 'Help me use this app better',
  assist_large_text: 'Larger text',
  assist_reduce_motion: 'Calmer animations',
  assist_sound_on: 'Keep helpful sounds on',
  assist_tips: 'Show guided tips',
  assist_slow_game: 'Prefer slower gameplay pace',
  your_saved_setup: 'Your saved setup',
  continue: 'Continue',
  step_of: 'Step',
};

// Lightweight local packs — login-critical strings first; rest fall back to English
const yo: Dict = {
  ...en,
  access_portal: 'Ìbúdó Wiwọlé',
  choose_pathway: 'Yan bí o ṣe fẹ́ wọlé sí ètò OPay',
  language: 'Èdè Mi',
  language_hint: 'Èdè àìpé jẹ́ English. Yíyípadà èdè kan ṣe fún ẹ nìkan — kì í kan àwọn mìíràn.',
  creator: 'Olùṣẹ̀dá',
  creator_desc: 'Wiwọlé alábòójútó — ọ̀rọ̀ aṣínà nìkan',
  play_guest: 'Ṣe bí Àlejò',
  guest_desc: 'Kọ́ gẹ́gẹ́ bí CDL nínú ere pápá',
  dh_login: 'Alábòójútó DH',
  dh_desc: 'Wo gbogbo àgbègbè: RM, SM, CDLM & CDL',
  full_name: 'Orúkọ Kíkún',
  staff_code: 'Kóòdù Òṣìṣẹ́',
  password: 'Ọ̀rọ̀ aṣínà',
  login: 'Wọlé',
  back: 'Padà',
  back_selection: 'Padà sí àṣàyàn',
  save_prefs: 'Fi ààyò mi pamọ́',
  prefs_saved: 'A ti fi ààyò rẹ pamọ́',
  assist_prefs: 'Ràn mí lọ́wọ́ láti lo app yìí dáadáa',
  start_run: 'Bẹ̀rẹ̀ Iṣẹ́ CDL',
  feedback: 'Èsì',
  music: 'Orin',
};

const ig: Dict = {
  ...en,
  access_portal: 'Ọ́nụ Ụzọ Ọbanye',
  choose_pathway: 'Họrọ otú ị ga-esi banye sistemụ OPay',
  language: 'Asụsụ M',
  language_hint: 'Asụsụ ndabara bụ English. Ịgbanwe asụsụ na-emetụta NÀANỊ gị — ọ bụghị ndị ọzọ.',
  creator: 'Onye Okike',
  creator_desc: 'Nbanye onye nchịkwa — paswọọdụ naanị',
  play_guest: 'Kpọọ dị ka Ọbịa',
  guest_desc: 'Mụta dị ka CDL n’egwuregwu ubi',
  dh_login: 'Nleba anya DH',
  dh_desc: 'Lee mpaghara niile: RM, SM, CDLM & CDL',
  full_name: 'Aha Zuruelu',
  staff_code: 'Koodu Ọrụ',
  password: 'Paswọọdụ',
  login: 'Banye',
  back: 'Laghachi',
  back_selection: 'Laghachi na nhọrọ',
  save_prefs: 'Chekwaa mmasị m',
  prefs_saved: 'Echekwara mmasị gị',
  assist_prefs: 'Nye m aka iji app a nke ọma',
  start_run: 'Malite Ọrụ CDL',
  feedback: 'Nzaghachi',
  music: 'Egwu',
};

const ha: Dict = {
  ...en,
  access_portal: 'Ƙofar Shiga',
  choose_pathway: 'Zaɓi yadda kake son shiga tsarin OPay',
  language: 'Harshena',
  language_hint: 'Tsohon harshe shine English. Canza harshe yana shafar KUWA kai kaɗai — ba wasu ba.',
  creator: 'Mahalicci',
  creator_desc: 'Shigar admin — kalmar sirri kawai',
  play_guest: 'Yi wasa a matsayin Baƙo',
  guest_desc: 'Koyi a matsayin CDL a filin wasa',
  dh_login: 'Sa ido na DH',
  dh_desc: 'Duba duk yankuna: RM, SM, CDLM & CDL',
  full_name: 'Cikakken Suna',
  staff_code: 'Lambar Ma’aikaci',
  password: 'Kalmar sirri',
  login: 'Shiga',
  back: 'Koma baya',
  back_selection: 'Koma zaɓe',
  save_prefs: 'Ajiye zaɓina',
  prefs_saved: 'An ajiye zaɓinka',
  assist_prefs: 'Taimake ni in yi amfani da app ɗin da kyau',
  start_run: 'Fara Aikin CDL',
  feedback: 'Ra’ayi',
  music: 'Kiɗa',
};

const ff: Dict = {
  ...en,
  access_portal: 'Damal Naatgol',
  choose_pathway: 'Suɓo no njiɗ-ɗaa naatde e yuɓɓo OPay',
  language: 'Ɗemngal Am',
  language_hint: 'Ɗemngal gadanol ko English. Waylude ɗemngal ina yilli MA TAN — wonaa yimɓe goɗɗiɓe.',
  creator: 'Cosɗo',
  creator_desc: 'Naatgol admin — finnde tan',
  play_guest: 'Fijo no Koɗo',
  guest_desc: 'Janngu no CDL e ladde',
  dh_login: 'Yiylotooɗo DH',
  dh_desc: 'Yiylito diiwanuuji fof: RM, SM, CDLM e CDL',
  full_name: 'Innde Timmuɗe',
  staff_code: 'Kod Gollodooɗo',
  password: 'Finnde suuriinde',
  login: 'Naatu',
  back: 'Rutto',
  back_selection: 'Rutto e suɓngo',
  save_prefs: 'Danndu suɓngo am',
  prefs_saved: 'Suɓngo maa danndaama',
  assist_prefs: 'Wallu mi huutoraade app oo no moƴƴiri',
  start_run: 'Fuɗɗo golle CDL',
  feedback: 'Jaabawol',
  music: 'Gimɗi',
  wrong_password: 'Finnde moƴƴaani. Eto kadi.',
};

const efi: Dict = {
  ...en,
  access_portal: 'Usụn Adụn',
  choose_pathway: 'Sio nte ayanadụn ke OPay',
  language: 'Usem Mi',
  language_hint: 'Usem ntọt ke English. Ndiwak usem enyene fi nkpo — idịghe mme mfen.',
  creator: 'Andibot',
  play_guest: 'Tọ mme asan',
  dh_login: 'DH Se',
  full_name: 'Enyịn eke kpukpru',
  staff_code: 'Code andikama',
  password: 'Ikọ sebed',
  login: 'Dụn',
  back: 'San̄a ke edem',
  save_prefs: 'Nịm mme mfo',
  prefs_saved: 'Mme mfo enịmde',
  start_run: 'Tọ utom CDL',
  feedback: 'Ibụk',
  music: 'Ikwọ',
};

const bin: Dict = {
  ...en,
  access_portal: 'Ẹkẹn Ọghaẹ',
  choose_pathway: 'Zẹ vbe uwu ọghaẹ ye OPay',
  language: 'Urhuẹ mwẹ',
  language_hint: 'Urhuẹ odaro ọre English. To change language ọkpa ẹre ọ rhie ruẹ — ẹ i rhie emwa ọvbehe.',
  creator: 'Ọgbẹe',
  play_guest: 'Gie vbe ọghẹe',
  dh_login: 'DH Nene',
  full_name: 'Eni hia',
  staff_code: 'Kod ọgbe',
  password: 'Ẹmwẹ seẹ',
  login: 'Lae',
  back: 'Werrie',
  save_prefs: 'Mu emwi mwẹ yi',
  start_run: 'Suẹn iwinna CDL',
  feedback: 'Ọta',
  music: 'Ihuan',
};

const tiv: Dict = {
  ...en,
  access_portal: 'Nyor Ken',
  choose_pathway: 'De nahan ka nyor ken OPay',
  language: 'Zwa Awam',
  language_hint: 'Zwa shiin English. Fan zwa nahan ka a we ye — ka se mba mbagbayev ba.',
  creator: 'Or u keren',
  play_guest: 'Ya ken or u wan',
  dh_login: 'DH Seer',
  full_name: 'Ityough ki cii',
  staff_code: 'Kod or u toma',
  password: 'Ikyaa seer',
  login: 'Nyor',
  back: 'Ungwa nahan',
  save_prefs: 'Keren aya awam',
  start_run: 'Shin toma CDL',
  feedback: 'Zwa',
  music: 'Ambin',
};

const kr: Dict = {
  ...en,
  access_portal: 'Kəro Fandi',
  choose_pathway: 'Suwuro laa fandi OPay ye',
  language: 'Təlanyinə',
  language_hint: 'Təlanye English. Language change nən nəmro — wala ndio.',
  creator: 'Kəkkə',
  play_guest: 'Wuro gana',
  dh_login: 'DH Koro',
  full_name: 'Kəla cida',
  staff_code: 'Kod kəm',
  password: 'Sirrin kalma',
  login: 'Fandi',
  back: 'Kərowa',
  save_prefs: 'Gana suwuro',
  start_run: 'CDL kərowa',
  feedback: 'Magana',
  music: 'Waje',
};

const ijc: Dict = {
  ...en,
  access_portal: 'Bẹịn Tọrụ',
  choose_pathway: 'Sẹlẹ tọrụ mọ OPay',
  language: 'Ịzọn Tọbọụ',
  language_hint: 'Default ịzọn English. Language change ịkẹsẹ gẹ — kẹmọ ịdẹsẹ ịnịm.',
  creator: 'Kẹrẹmọ',
  play_guest: 'Tọrụ bẹbẹ',
  dh_login: 'DH Bẹịn',
  full_name: 'Ama pẹlẹ',
  staff_code: 'Kod wari',
  password: 'Siri tọbọụ',
  login: 'Tọrụ',
  back: 'Bụnụ',
  save_prefs: 'Dụwẹ tọbọụ',
  start_run: 'CDL tọrụ bẹịn',
  feedback: 'Tọbọụ',
  music: 'Izon kẹrẹ',
};

const nup: Dict = {
  ...en,
  access_portal: 'Egani Cincin',
  choose_pathway: 'Dan yi egani OPay',
  language: 'Ezhimì',
  language_hint: 'Ezhì default English. Ezhì change egan wó — a de egan guba.',
  creator: 'Egani kpe',
  play_guest: 'Yi guba',
  dh_login: 'DH Ebo',
  full_name: 'Yèbo cin',
  staff_code: 'Kod egan',
  password: 'Kalma siri',
  login: 'Cincin',
  back: 'Bo egan',
  save_prefs: 'Dan egan mi',
  start_run: 'CDL bo egan',
  feedback: 'Ebo',
  music: 'Gulu',
};

const fr: Dict = {
  ...en,
  access_portal: 'Portail d’accès',
  choose_pathway: 'Choisissez comment entrer dans le système OPay',
  language: 'Ma langue',
  language_hint: 'Par défaut : anglais. Changer la langue n’affecte QUE votre session.',
  creator: 'Créateur',
  creator_desc: 'Accès admin — mot de passe uniquement',
  play_guest: 'Jouer en invité',
  guest_desc: 'S’entraîner comme CDL sur le simulateur',
  dh_login: 'Supervision DH',
  dh_desc: 'Voir toutes les régions : RM, SM, CDLM & CDL',
  full_name: 'Nom complet',
  staff_code: 'Code agent',
  password: 'Mot de passe',
  login: 'Connexion',
  back: 'Retour',
  back_selection: 'Retour aux options',
  save_prefs: 'Enregistrer mes préférences',
  prefs_saved: 'Préférences enregistrées',
  assist_prefs: 'Aidez-moi à mieux utiliser l’appli',
  start_run: 'Démarrer la mission CDL',
  feedback: 'Retour',
  music: 'Musique',
};

const es: Dict = {
  ...en,
  access_portal: 'Portal de acceso',
  choose_pathway: 'Elige cómo entrar al sistema OPay',
  language: 'Mi idioma',
  language_hint: 'Por defecto: inglés. Cambiar el idioma solo te afecta a TI.',
  creator: 'Creador',
  creator_desc: 'Acceso admin — solo contraseña',
  play_guest: 'Jugar como invitado',
  guest_desc: 'Entrena como CDL en el simulador',
  dh_login: 'Supervisión DH',
  dh_desc: 'Ver todas las regiones: RM, SM, CDLM y CDL',
  full_name: 'Nombre completo',
  staff_code: 'Código de personal',
  password: 'Contraseña',
  login: 'Iniciar sesión',
  back: 'Volver',
  back_selection: 'Volver a opciones',
  save_prefs: 'Guardar mis preferencias',
  prefs_saved: 'Preferencias guardadas',
  assist_prefs: 'Ayúdame a usar mejor la app',
  start_run: 'Iniciar misión CDL',
  feedback: 'Comentarios',
  music: 'Música',
};

const zh: Dict = {
  ...en,
  access_portal: '登录入口',
  choose_pathway: '选择进入 OPay 外勤系统的方式',
  language: '我的语言',
  language_hint: '默认英语。更改语言只影响您自己，不影响其他人。',
  creator: '创建者',
  creator_desc: '管理员入口 — 仅需密码',
  play_guest: '访客进入',
  guest_desc: '以 CDL 身份进行外勤训练',
  dh_login: 'DH 监管',
  dh_desc: '查看全部区域：RM、SM、CDLM 与 CDL',
  full_name: '全名',
  staff_code: '员工编号',
  password: '密码',
  login: '登录',
  back: '返回',
  back_selection: '返回主选项',
  save_prefs: '保存我的偏好',
  prefs_saved: '已为您保存偏好',
  assist_prefs: '帮助我更好地使用本应用',
  start_run: '开始 CDL 外勤',
  feedback: '反馈',
  music: '音乐',
};

const zhCN: Dict = { ...zh, language: '我的中文', access_portal: '访问门户' };

const TABLES: Record<AppLanguage, Dict> = {
  en,
  yo,
  ig,
  ha,
  ff,
  efi,
  bin,
  tiv,
  kr,
  ijc,
  nup,
  fr,
  es,
  zh,
  'zh-CN': zhCN,
};

export function t(lang: AppLanguage, key: string): string {
  return TABLES[lang]?.[key] || TABLES.en[key] || key;
}

export const LANG_STORAGE_KEY = 'opay_app_language_default_en';
export const USER_PREFS_KEY = 'opay_user_prefs_v2';

export interface UserAssistPrefs {
  language: AppLanguage;
  largeText: boolean;
  reduceMotion: boolean;
  soundOn: boolean;
  showTips: boolean;
  slowerPace: boolean;
  updatedAt: string;
}

export function defaultPrefs(): UserAssistPrefs {
  return {
    language: 'en',
    largeText: false,
    reduceMotion: false,
    soundOn: true,
    showTips: true,
    slowerPace: false,
    updatedAt: new Date().toISOString(),
  };
}

export function loadUserPrefs(userKey: string): UserAssistPrefs {
  try {
    // Inline safe storage for i18n (avoid circular import with browserCompat)
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(USER_PREFS_KEY);
    } catch {
      try {
        raw = window.sessionStorage.getItem(USER_PREFS_KEY);
      } catch {
        raw = null;
      }
    }
    if (!raw) return defaultPrefs();
    const all = JSON.parse(raw) as Record<string, UserAssistPrefs>;
    return { ...defaultPrefs(), ...(all[userKey] || {}) };
  } catch {
    return defaultPrefs();
  }
}

export function saveUserPrefs(userKey: string, prefs: UserAssistPrefs) {
  try {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(USER_PREFS_KEY);
    } catch {
      raw = null;
    }
    const all = raw ? (JSON.parse(raw) as Record<string, UserAssistPrefs>) : {};
    all[userKey] = { ...prefs, updatedAt: new Date().toISOString() };
    const payload = JSON.stringify(all);
    try {
      window.localStorage.setItem(USER_PREFS_KEY, payload);
    } catch {
      try {
        window.sessionStorage.setItem(USER_PREFS_KEY, payload);
      } catch {
        // ignore private-mode failures
      }
    }
  } catch {
    // ignore
  }
}
