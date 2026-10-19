import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  User,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  UserPlus,
  LogIn,
  Building2,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { OPayLogo } from './OPayLogo';
import { HamvidaBrand } from './HamvidaBrand';
import {
  AppLanguage,
  LANGUAGE_OPTIONS,
  UserAssistPrefs,
  defaultPrefs,
  loadUserPrefs,
  saveUserPrefs,
  t,
} from '../i18n/translations';
import { sessionSet } from '../utils/browserCompat';
import {
  StaffAccount,
  StaffRole,
  StaffGender,
  NigeriaRegion,
  NIGERIA_REGIONS,
  DuplicateCheckResult,
  migrateLegacyDhAccounts,
  loadStaffRegistry,
  registerStaffSelf,
  authenticateStaff,
  checkStaffDuplicate,
  getAllNigeriaStates,
  getStatesForRegion,
  findSmInChargeOfState,
  findRmInChargeOfState,
  checkNigeriaGeoUpdateOncePerDay,
} from '../types/staffRegistry';

interface AuthModalProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onSuccessCreatorLogin: (creatorName: string) => void;
  onPlayAsGuest: () => void;
  onSuccessDHLogin: (dhName: string, staffCode: string) => void;
  onSuccessStaffLogin?: (account: StaffAccount) => void;
  onPrefsSaved?: (prefs: UserAssistPrefs, userKey: string) => void;
}

type AuthView =
  | 'selection'
  | 'creator_login'
  | 'staff_hub'
  | 'staff_login'
  | 'staff_register'
  | 'dh_login'
  | 'dh_register'
  | 'assist_setup'
  | 'duplicate_block'
  | 'account_help';

export const AuthModal: React.FC<AuthModalProps> = ({
  language,
  onLanguageChange,
  onSuccessCreatorLogin,
  onPlayAsGuest,
  onSuccessDHLogin,
  onSuccessStaffLogin,
  onPrefsSaved,
}) => {
  const [view, setView] = useState<AuthView>('selection');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [prefsSavedFlash, setPrefsSavedFlash] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateCheckResult | null>(null);

  const [pendingAction, setPendingAction] = useState<'creator' | 'guest' | 'dh' | 'staff' | null>(null);
  const [pendingDh, setPendingDh] = useState<{ name: string; code: string } | null>(null);
  const [pendingStaff, setPendingStaff] = useState<StaffAccount | null>(null);

  // Staff login
  const [staffLoginId, setStaffLoginId] = useState('');
  const [staffLoginPassword, setStaffLoginPassword] = useState('');

  // Staff register
  const [regRole, setRegRole] = useState<StaffRole>('CDL');
  const [regLoginId, setRegLoginId] = useState('');
  const [regLoginName, setRegLoginName] = useState('');
  const [regGender, setRegGender] = useState<StaffGender | ''>('');
  const [regRegion, setRegRegion] = useState<NigeriaRegion | ''>('');
  const [regState, setRegState] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regAssignedRegions, setRegAssignedRegions] = useState<NigeriaRegion[]>([]);
  const [regAssignedStates, setRegAssignedStates] = useState<string[]>([]);
  const [regSupervisedRms, setRegSupervisedRms] = useState('');
  const [showStaffPass, setShowStaffPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [dhGender, setDhGender] = useState<StaffGender | ''>('');

  // DH (uses registry role DH — no region/state)
  const [dhName, setDhName] = useState('');
  const [dhStaffCode, setDhStaffCode] = useState('');
  const [dhPassword, setDhPassword] = useState('');
  const [dhPassword2, setDhPassword2] = useState('');

  const [prefs, setPrefs] = useState<UserAssistPrefs>(() => defaultPrefs());

  const CREATOR_NAME = 'Hamzat Victor Chisom';
  const CREATOR_SECRET_KEY = '77075107';

  const [allStates, setAllStates] = useState<string[]>(() => getAllNigeriaStates());
  const [geoNote, setGeoNote] = useState<string>('');

  useEffect(() => {
    migrateLegacyDhAccounts();
    loadStaffRegistry(); // ensure seed if empty
    // Once-per-day Nigeria states update check (36 + FCT; expands if country adds states)
    checkNigeriaGeoUpdateOncePerDay().then((res) => {
      setAllStates(res.config.states);
      if (res.checked) setGeoNote(res.message);
    });
  }, []);

  const currentLangMeta = useMemo(
    () => LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0],
    [language]
  );
  const nigeriaLangs = LANGUAGE_OPTIONS.filter((l) => l.group === 'nigeria');
  const intlLangs = LANGUAGE_OPTIONS.filter((l) => l.group === 'international');
  const statesForRegion = regRegion ? getStatesForRegion(regRegion) : [];
  const hierarchyPreview = useMemo(() => {
    if (!regState) return null;
    const sm = findSmInChargeOfState(regState);
    const rm = findRmInChargeOfState(regState);
    return { sm, rm };
  }, [regState, regAssignedStates]);

  const go = (next: AuthView) => {
    soundManager.unlock();
    soundManager.playUiTap();
    setErrorMessage(null);
    setDuplicateInfo(null);
    setView(next);
  };

  const goBack = () => {
    soundManager.playUiClose();
    setErrorMessage(null);
    setDuplicateInfo(null);
    if (view === 'assist_setup') {
      if (pendingAction === 'creator') setView('creator_login');
      else if (pendingAction === 'dh') setView('dh_login');
      else if (pendingAction === 'staff') setView('staff_login');
      else setView('selection');
      return;
    }
    if (view === 'duplicate_block') {
      setView('staff_register');
      return;
    }
    if (view === 'account_help') {
      setView('staff_hub');
      return;
    }
    if (view === 'dh_register') {
      setView('dh_login');
      return;
    }
    if (view === 'staff_login' || view === 'staff_register') {
      setView('staff_hub');
      return;
    }
    if (view === 'staff_hub') {
      setView('selection');
      return;
    }
    setView('selection');
    setPasswordInput('');
    setStaffLoginPassword('');
    setRegPassword('');
    setRegPassword2('');
    setDhPassword('');
    setDhPassword2('');
  };

  const applyLanguageForMeOnly = (code: AppLanguage) => {
    soundManager.playTabSwitch();
    onLanguageChange(code);
    setPrefs((p) => ({ ...p, language: code }));
    sessionSet('opay_session_language', code);
  };

  const finishLogin = (
    action: 'creator' | 'guest' | 'dh' | 'staff',
    payload?: { dh?: { name: string; code: string }; staff?: StaffAccount }
  ) => {
    const userKey =
      action === 'creator'
        ? 'creator:hamzat-victor-chisom'
        : action === 'dh' && payload?.dh
        ? `dh:${payload.dh.code.toLowerCase()}`
        : action === 'staff' && payload?.staff
        ? `staff:${payload.staff.loginId.toLowerCase()}`
        : 'guest:default';

    const stored = loadUserPrefs(userKey);
    const merged: UserAssistPrefs = { ...stored, ...prefs, language };
    saveUserPrefs(userKey, merged);
    onPrefsSaved?.(merged, userKey);

    if (action === 'creator') onSuccessCreatorLogin(CREATOR_NAME);
    else if (action === 'dh' && payload?.dh) onSuccessDHLogin(payload.dh.name, payload.dh.code);
    else if (action === 'staff' && payload?.staff) {
      onSuccessStaffLogin?.(payload.staff);
      // DH role staff also opens DH analytics via parent if desired
      if (payload.staff.role === 'DH') onSuccessDHLogin(payload.staff.loginName, payload.staff.loginId);
      else onPlayAsGuest(); // field roles enter simulator as authenticated guest-equivalent for now
    } else onPlayAsGuest();
  };

  const openAssistThenEnter = (
    action: 'creator' | 'guest' | 'dh' | 'staff',
    payload?: { dh?: { name: string; code: string }; staff?: StaffAccount }
  ) => {
    const userKey =
      action === 'creator'
        ? 'creator:hamzat-victor-chisom'
        : action === 'dh' && payload?.dh
        ? `dh:${payload.dh.code.toLowerCase()}`
        : action === 'staff' && payload?.staff
        ? `staff:${payload.staff.loginId.toLowerCase()}`
        : 'guest:default';
    const stored = loadUserPrefs(userKey);
    setPrefs({ ...stored, language });
    setPendingAction(action);
    setPendingDh(payload?.dh || null);
    setPendingStaff(payload?.staff || null);
    go('assist_setup');
  };

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.unlock();
    if (passwordInput.trim() === CREATOR_SECRET_KEY) openAssistThenEnter('creator');
    else {
      soundManager.playLoginFail();
      setErrorMessage(t(language, 'wrong_creator'));
      setPasswordInput('');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.unlock();
    if (!staffLoginId.trim() || !staffLoginPassword.trim()) {
      setErrorMessage(t(language, 'fill_all_fields'));
      soundManager.playLoginFail();
      return;
    }
    const result = authenticateStaff(staffLoginId, staffLoginPassword);
    if (!result.ok) {
      setErrorMessage(result.reason);
      soundManager.playLoginFail();
      return;
    }
    soundManager.playLoginSuccess();
    if (result.account.role === 'DH') {
      openAssistThenEnter('dh', { dh: { name: result.account.loginName, code: result.account.loginId } });
    } else {
      openAssistThenEnter('staff', { staff: result.account });
    }
  };

  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.unlock();
    setErrorMessage(null);

    if (!regLoginId.trim() || !regLoginName.trim() || !regPassword.trim() || !regPassword2.trim() || !regGender) {
      setErrorMessage(!regGender ? 'Please select Male or Female.' : t(language, 'fill_all_fields'));
      soundManager.playLoginFail();
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage(t(language, 'password_too_short'));
      soundManager.playLoginFail();
      return;
    }
    if (regPassword !== regPassword2) {
      setErrorMessage(t(language, 'password_mismatch'));
      soundManager.playLoginFail();
      return;
    }
    if (regRole !== 'DH' && regRole !== 'RM' && (!regRegion || !regState)) {
      setErrorMessage('Region and State are required for this staff role.');
      soundManager.playLoginFail();
      return;
    }
    if (regRole === 'RM' && regAssignedRegions.length === 0 && !regRegion) {
      setErrorMessage('RM registration requires at least one Assigned Region (or Primary Region).');
      soundManager.playLoginFail();
      return;
    }
    if (regRole === 'RM' && regAssignedStates.length === 0 && !regState) {
      setErrorMessage('RM registration requires at least one Assigned State (or Primary State).');
      soundManager.playLoginFail();
      return;
    }

    const effectiveRegion =
      regRole === 'RM' ? regRegion || regAssignedRegions[0] || '' : regRegion;
    const effectiveState =
      regRole === 'RM' ? regState || regAssignedStates[0] || '' : regState;

    // Background check before create
    const preview = checkStaffDuplicate(
      {
        loginId: regLoginId,
        loginName: regLoginName,
        role: regRole,
        region: effectiveRegion || undefined,
        state: effectiveState || undefined,
      },
      loadStaffRegistry()
    );

    if (!preview.allowSelfRegister) {
      setDuplicateInfo(preview);
      setView('duplicate_block');
      soundManager.playLoginFail();
      return;
    }

    const result = registerStaffSelf({
      loginId: regLoginId,
      loginName: regLoginName,
      role: regRole,
      password: regPassword,
      gender: regGender as StaffGender,
      region: effectiveRegion || undefined,
      state: effectiveState || undefined,
      assignedRegions: regRole === 'RM' ? (regAssignedRegions.length ? regAssignedRegions : effectiveRegion ? [effectiveRegion as NigeriaRegion] : []) : undefined,
      assignedStates:
        regRole === 'RM'
          ? regAssignedStates.length
            ? regAssignedStates
            : effectiveState
            ? [effectiveState]
            : []
          : regRole === 'SM' || regRole === 'CDLM'
          ? regAssignedStates.length
            ? regAssignedStates
            : effectiveState
            ? [effectiveState]
            : []
          : undefined,
      supervisedRmIds:
        regRole === 'RM'
          ? regSupervisedRms
              .split(/[,\n]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    });

    if (!result.ok) {
      setDuplicateInfo(result.check);
      setView('duplicate_block');
      soundManager.playLoginFail();
      return;
    }

    soundManager.playLoginSuccess();
    if (result.account.role === 'DH') {
      openAssistThenEnter('dh', { dh: { name: result.account.loginName, code: result.account.loginId } });
    } else {
      openAssistThenEnter('staff', { staff: result.account });
    }
  };

  const handleDhLogin = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.unlock();
    if (!dhName.trim() || !dhStaffCode.trim() || !dhPassword.trim()) {
      setErrorMessage(t(language, 'fill_all_fields'));
      soundManager.playLoginFail();
      return;
    }
    // Authenticate via unified registry (Login ID = staff code)
    const result = authenticateStaff(dhStaffCode, dhPassword);
    if (!result.ok) {
      // fallback message for DH naming
      setErrorMessage(result.reason);
      soundManager.playLoginFail();
      return;
    }
    if (result.account.role !== 'DH') {
      setErrorMessage('This Login ID is not a DH account. Use Staff Login instead.');
      soundManager.playLoginFail();
      return;
    }
    // Optional name consistency check — do not block if password+ID ok, but warn if name differs
    soundManager.playLoginSuccess();
    openAssistThenEnter('dh', { dh: { name: result.account.loginName, code: result.account.loginId } });
  };

  const handleDhRegister = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.unlock();
    if (!dhName.trim() || !dhStaffCode.trim() || !dhPassword.trim() || !dhPassword2.trim() || !dhGender) {
      setErrorMessage(!dhGender ? 'Please select Male or Female.' : t(language, 'fill_all_fields'));
      soundManager.playLoginFail();
      return;
    }
    if (dhPassword.length < 6) {
      setErrorMessage(t(language, 'password_too_short'));
      soundManager.playLoginFail();
      return;
    }
    if (dhPassword !== dhPassword2) {
      setErrorMessage(t(language, 'password_mismatch'));
      soundManager.playLoginFail();
      return;
    }

    const preview = checkStaffDuplicate(
      { loginId: dhStaffCode, loginName: dhName, role: 'DH' },
      loadStaffRegistry()
    );
    if (!preview.allowSelfRegister) {
      setDuplicateInfo(preview);
      setView('duplicate_block');
      soundManager.playLoginFail();
      return;
    }

    const result = registerStaffSelf({
      loginId: dhStaffCode,
      loginName: dhName,
      role: 'DH',
      password: dhPassword,
      gender: dhGender as StaffGender,
    });
    if (!result.ok) {
      setDuplicateInfo(result.check);
      setView('duplicate_block');
      soundManager.playLoginFail();
      return;
    }
    soundManager.playLoginSuccess();
    openAssistThenEnter('dh', { dh: { name: result.account.loginName, code: result.account.loginId } });
  };

  const saveAssistAndEnter = () => {
    soundManager.playSubmit();
    setPrefsSavedFlash(true);
    setTimeout(() => setPrefsSavedFlash(false), 1200);
    if (!pendingAction) return;
    finishLogin(pendingAction, {
      dh: pendingDh || undefined,
      staff: pendingStaff || undefined,
    });
  };

  const skipAssistAndEnter = () => {
    soundManager.playUiTap();
    if (!pendingAction) return;
    finishLogin(pendingAction, {
      dh: pendingDh || undefined,
      staff: pendingStaff || undefined,
    });
  };

  return (
    <div className="modal-layer bg-[#020b07]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[min(520px,90vw)] h-[min(520px,70vh)] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[min(440px,100%)] my-auto">
        <div className="rounded-2xl sm:rounded-3xl border border-emerald-500/25 bg-neutral-950/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden max-h-[min(92dvh,920px)] flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-neutral-900">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center px-3 py-2 rounded-xl bg-white shadow-[0_0_20px_rgba(29,206,159,0.25)]">
                <OPayLogo height={26} variant="dark" />
              </div>
              {view !== 'selection' && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                  {t(language, 'back')}
                </button>
              )}
            </div>
            <div className="mt-4">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400/90 mb-1.5">
                <Sparkles className="w-3 h-3" />
                OPay Field Operations App
              </div>
              <h1 className="text-[22px] sm:text-2xl font-black text-white tracking-tight leading-none">
                {view === 'duplicate_block'
                  ? duplicateInfo?.messageTitle || 'Verification Required'
                  : t(language, 'access_portal')}
              </h1>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                {view === 'selection' && t(language, 'choose_pathway')}
                {view === 'creator_login' && t(language, 'creator_password_only')}
                {view === 'staff_hub' && 'Choose Login, Register, or Account Help for field staff'}
                {view === 'staff_login' && 'Sign in with your Login ID / Staff ID and password'}
                {view === 'staff_register' && 'Create staff account with full identity fields for your role'}
                {view === 'dh_login' && t(language, 'dh_subtitle')}
                {view === 'dh_register' && 'DH registration: Login ID + Name only (no Region/State)'}
                {view === 'assist_setup' && t(language, 'assist_prefs')}
                {view === 'duplicate_block' && 'Duplicate / conflict protection is active'}
                {view === 'account_help' && 'Need help accessing or recovering your staff account?'}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 modal-card-body">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SELECTION */}
            {view === 'selection' && (
              <div className="space-y-2.5">
                <RoleCard
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title={t(language, 'creator')}
                  desc={t(language, 'creator_desc')}
                  accent="emerald"
                  badge="Admin"
                  onClick={() => go('creator_login')}
                />
                <RoleCard
                  icon={<LogIn className="w-5 h-5" />}
                  title="Staff Login / Register"
                  desc="Full staff access: CDL · CDLM · SM · RM · Login · Register · Recovery"
                  accent="emerald"
                  badge="Option B"
                  onClick={() => go('staff_hub')}
                />
                <RoleCard
                  icon={<Eye className="w-5 h-5" />}
                  title={t(language, 'dh_login')}
                  desc="DH Login ID + Name only · No Region/State · Analytics"
                  accent="cyan"
                  badge="DH"
                  onClick={() => go('dh_login')}
                />
                <RoleCard
                  icon={<User className="w-5 h-5" />}
                  title={t(language, 'play_guest')}
                  desc={t(language, 'guest_desc')}
                  accent="neutral"
                  onClick={() => {
                    soundManager.unlock();
                    soundManager.playUiTap();
                    openAssistThenEnter('guest');
                  }}
                />
              </div>
            )}

            {/* CREATOR */}
            {view === 'creator_login' && (
              <form onSubmit={handleCreatorSubmit} className="space-y-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{t(language, 'creator_auth')}</div>
                  <div className="text-xs text-neutral-300 mt-1">{t(language, 'creator_password_only')}</div>
                </div>
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    {t(language, 'password')}
                  </span>
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-400 px-4 py-3 text-center font-mono tracking-[0.25em] text-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!passwordInput.trim()}
                  className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-neutral-950 font-black text-sm cursor-pointer"
                >
                  {t(language, 'verify_creator')}
                </button>
              </form>
            )}

            {/* STAFF HUB — Option B complete menu */}
            {view === 'staff_hub' && (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-100/90 leading-relaxed">
                  <strong className="text-emerald-300">Staff Option B</strong> covers field hierarchy roles:
                  <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-neutral-300">
                    <span>• CDL — meets merchants</span>
                    <span>• CDLM — manages CDLs</span>
                    <span>• SM — manages CDLMs</span>
                    <span>• RM — multi-region / multi-state</span>
                  </div>
                </div>

                <RoleCard
                  icon={<LogIn className="w-5 h-5" />}
                  title="Staff Login"
                  desc="Existing account · Login ID + Password"
                  accent="emerald"
                  badge="Login"
                  onClick={() => go('staff_login')}
                />
                <RoleCard
                  icon={<UserPlus className="w-5 h-5" />}
                  title="Staff Registration"
                  desc="New account · Role + ID + Name + Region + State"
                  accent="emerald"
                  badge="Register"
                  onClick={() => go('staff_register')}
                />
                <RoleCard
                  icon={<KeyRound className="w-5 h-5" />}
                  title="Account Help / Recovery"
                  desc="Forgot password · locked account · duplicate warning help"
                  accent="neutral"
                  badge="Help"
                  onClick={() => go('account_help')}
                />

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 text-[10px] text-neutral-400 space-y-1">
                  <div className="font-bold text-neutral-300">Required identity by role</div>
                  <div>CDL / CDLM / SM: Login ID + Name + Region + State</div>
                  <div>RM: Login ID + Name + multi Regions/States (+ optional supervised RMs)</div>
                  <div>DH: use DH Oversight option (no Region/State)</div>
                </div>
              </div>
            )}

            {/* STAFF LOGIN */}
            {view === 'staff_login' && (
              <form onSubmit={handleStaffLogin} className="space-y-2.5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-100">
                  Use your official <strong>Login ID / Staff ID</strong> (example: OP12345). Not your email.
                </div>
                <Field label="Login ID / Staff ID *" value={staffLoginId} onChange={setStaffLoginId} placeholder="OP12345" mono autoFocus />
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Password *</span>
                  <div className="relative">
                    <input
                      type={showStaffPass ? 'text' : 'password'}
                      value={staffLoginPassword}
                      onChange={(e) => setStaffLoginPassword(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-400 px-3 py-2.5 pr-10 text-sm text-white focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowStaffPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 p-1 cursor-pointer">
                      {showStaffPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-sm cursor-pointer">
                  Sign in to Staff Account
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => go('staff_register')} className="py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-semibold text-emerald-300 cursor-pointer">
                    Register new staff
                  </button>
                  <button type="button" onClick={() => go('account_help')} className="py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-semibold text-neutral-300 cursor-pointer">
                    Need help?
                  </button>
                </div>
              </form>
            )}

            {/* STAFF REGISTER — complete options */}
            {view === 'staff_register' && (
              <form onSubmit={handleStaffRegister} className="space-y-2.5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-100">
                  Complete all required fields for your role. Background authentication checks existing staff records before creating an account.
                </div>

                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Staff Role *</span>
                  <select
                    value={regRole}
                    onChange={(e) => {
                      const r = e.target.value as StaffRole;
                      setRegRole(r);
                      if (r === 'DH') {
                        setRegRegion('');
                        setRegState('');
                        setRegAssignedRegions([]);
                        setRegAssignedStates([]);
                        setRegSupervisedRms('');
                      }
                    }}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="CDL">CDL — Channel Development Lead (meets merchants)</option>
                    <option value="CDLM">CDLM — Channel Development Lead Manager</option>
                    <option value="SM">SM — State Manager</option>
                    <option value="RM">RM — Regional Manager (multi-region allowed)</option>
                    <option value="DH">DH — Division/District Head (no Region/State)</option>
                  </select>
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  <Field label="1. Login ID / Staff ID *" value={regLoginId} onChange={setRegLoginId} placeholder="OP12345" mono autoFocus />
                  <Field label="2. Login Name / Staff Name *" value={regLoginName} onChange={setRegLoginName} placeholder="John Doe" />
                  <div>
                    <div className="text-[11px] font-bold text-neutral-400 mb-1.5">3. Gender *</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegGender('male')}
                        className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                          regGender === 'male' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        ♂ Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegGender('female')}
                        className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                          regGender === 'female' ? 'border-pink-400 bg-pink-500/15 text-pink-200' : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        ♀ Female
                      </button>
                    </div>
                  </div>
                </div>

                {regRole === 'DH' ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-[11px] text-cyan-200 space-y-1">
                    <div><strong>DH registration fields:</strong> Login ID + Login Name only.</div>
                    <div>Region and State are <strong>not required</strong> and will not be collected.</div>
                    <div className="text-cyan-300/80">Tip: You can also register from the DH Oversight option on the main menu.</div>
                  </div>
                ) : regRole === 'RM' ? (
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-amber-100">
                      <strong>RM hierarchy:</strong> may supervise many RMs and cover multiple Regions &amp; States. Select all that apply.
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-neutral-300 mb-1.5">3. Assigned Regions * (multi-select)</div>
                      <div className="grid grid-cols-2 gap-1">
                        {NIGERIA_REGIONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setRegAssignedRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
                            }
                            className={`text-left px-2 py-1.5 rounded-lg border text-[10px] cursor-pointer ${
                              regAssignedRegions.includes(r) ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-neutral-800 text-neutral-400'
                            }`}
                          >
                            {regAssignedRegions.includes(r) ? '✓ ' : ''}{r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-neutral-300 mb-1.5">4. Assigned States * (multi-select)</div>
                      <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1">
                        {(regAssignedRegions.length
                          ? regAssignedRegions.flatMap((r) => getStatesForRegion(r))
                          : allStates
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setRegAssignedStates((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                            }
                            className={`text-left px-2 py-1 rounded-lg border text-[10px] cursor-pointer ${
                              regAssignedStates.includes(s) ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-neutral-800 text-neutral-500'
                            }`}
                          >
                            {regAssignedStates.includes(s) ? '✓ ' : ''}{s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Primary Region</span>
                        <select
                          value={regRegion}
                          onChange={(e) => {
                            setRegRegion(e.target.value as NigeriaRegion | '');
                            setRegState('');
                          }}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                        >
                          <option value="">Auto from selections</option>
                          {NIGERIA_REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Primary State</span>
                        <select
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                        >
                          <option value="">Auto from selections</option>
                          {statesForRegion.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <Field
                      label="Supervised RM Login IDs (optional, comma-separated)"
                      value={regSupervisedRms}
                      onChange={setRegSupervisedRms}
                      placeholder="RM-SW-02, RM-SS-01"
                      mono
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold text-neutral-300">
                      3 &amp; 4. Region + State (required)
                      {regRole === 'SM' && ' — SM covers state(s) under their region'}
                      {regRole === 'CDLM' && ' — CDLM is placed under the SM of their state'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Region *</span>
                        <select
                          value={regRegion}
                          onChange={(e) => {
                            setRegRegion(e.target.value as NigeriaRegion | '');
                            setRegState('');
                            setRegAssignedStates([]);
                          }}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                          required
                        >
                          <option value="">Select region</option>
                          {NIGERIA_REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <div className="text-[9px] text-neutral-500 mt-1">Lagos is split into Lagos North &amp; Lagos South</div>
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Primary State * (from full 36 + FCT list)</span>
                        <select
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                          required
                        >
                          <option value="">Select state</option>
                          {allStates.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {(regRole === 'SM' || regRole === 'CDLM') && (
                      <div>
                        <div className="text-[11px] font-bold text-neutral-300 mb-1.5">
                          {regRole === 'SM' ? 'States under this SM (multi-select)' : 'States this CDLM covers (multi-select)'}
                        </div>
                        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto pr-1">
                          {(regRegion ? [...new Set([...statesForRegion, ...allStates])] : allStates).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setRegAssignedStates((prev) =>
                                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                                )
                              }
                              className={`text-left px-2 py-1 rounded-lg border text-[10px] cursor-pointer ${
                                regAssignedStates.includes(s) || regState === s
                                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                  : 'border-neutral-800 text-neutral-500'
                              }`}
                            >
                              {(regAssignedStates.includes(s) || regState === s) ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          {regRole === 'SM'
                            ? 'SM is responsible for selected state(s). DH can see which SM owns each state.'
                            : 'CDLM is placed under the SM in charge of the selected state(s).'}
                        </p>
                      </div>
                    )}

                    {hierarchyPreview && regState && (
                      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-[11px] text-cyan-100 space-y-1">
                        <div className="font-bold text-cyan-300">Hierarchy placement preview</div>
                        <div>State: <strong>{regState}</strong></div>
                        <div>
                          SM in charge:{' '}
                          <strong>
                            {hierarchyPreview.sm
                              ? `${hierarchyPreview.sm.loginName} (${hierarchyPreview.sm.loginId})`
                              : 'Not assigned yet'}
                          </strong>
                        </div>
                        <div>
                          RM in charge of region/states:{' '}
                          <strong>
                            {hierarchyPreview.rm
                              ? `${hierarchyPreview.rm.loginName} (${hierarchyPreview.rm.loginId})`
                              : 'Not assigned yet'}
                          </strong>
                        </div>
                      </div>
                    )}

                    {geoNote && <div className="text-[9px] text-neutral-600">{geoNote}</div>}
                    <div className="text-[10px] text-neutral-500">
                      Full official list: {allStates.length} states/FCT · Lagos North &amp; Lagos South supported
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <label className="block">
                    <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Create password *</span>
                    <div className="relative">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-emerald-400"
                      />
                      <button type="button" onClick={() => setShowRegPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 cursor-pointer">
                        {showRegPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>
                  <Field label="Confirm password *" value={regPassword2} onChange={setRegPassword2} type="password" />
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-2.5 text-[10px] text-neutral-400 leading-relaxed space-y-1">
                  <div className="font-bold text-neutral-300">Before your account is created, the system checks:</div>
                  <div>• Exact match → blocked (use original login)</div>
                  <div>• Login ID conflict / partial match → verification required</div>
                  <div>• Same name only → allowed (not automatic duplicate)</div>
                  <div>• No silent overwrite of existing staff Region/State</div>
                </div>

                <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-sm cursor-pointer">
                  Create Staff Account
                </button>
                <button type="button" onClick={() => go('staff_login')} className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer">
                  Already registered? Go to Staff Login
                </button>
              </form>
            )}

            {/* ACCOUNT HELP */}
            {view === 'account_help' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-3 space-y-2 text-xs text-neutral-300">
                  <div className="font-black text-white text-sm">Staff Account Help</div>
                  <p className="leading-relaxed">
                    If registration says an account already exists, use your original Login ID to sign in.
                    Do not create a second account with the same Staff ID.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-400">
                    <li>Forgot password → contact Creator/Admin for reset</li>
                    <li>Account locked → contact Creator/Admin</li>
                    <li>Transferred Region/State → ask DH to update via Staff Transfers</li>
                    <li>Duplicate warning but you are new → Creator verifies &amp; may manually create</li>
                    <li>Same name as someone else is OK if Login ID is different</li>
                  </ul>
                </div>
                <button type="button" onClick={() => go('staff_login')} className="w-full py-3 rounded-xl bg-emerald-400 text-neutral-950 font-black text-sm cursor-pointer">
                  Return to Staff Login
                </button>
                <button type="button" onClick={() => go('staff_register')} className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 cursor-pointer">
                  Back to Staff Registration
                </button>
                <button type="button" onClick={() => go('selection')} className="w-full py-2 text-xs text-neutral-500 hover:text-white cursor-pointer">
                  Main Access Portal
                </button>
              </div>
            )}

            {/* DH LOGIN */}
            {view === 'dh_login' && (
              <form onSubmit={handleDhLogin} className="space-y-2.5">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-[11px] text-cyan-200 flex gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  DH identity: Login ID + Name. Region and State are not required.
                </div>
                <Field label={t(language, 'full_name')} value={dhName} onChange={setDhName} autoFocus placeholder="Jane Smith" />
                <Field label="Login ID / Staff ID" value={dhStaffCode} onChange={setDhStaffCode} placeholder="DH12345" mono />
                <Field label={t(language, 'password')} value={dhPassword} onChange={setDhPassword} type="password" />
                <button type="submit" className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-black text-sm cursor-pointer">
                  {t(language, 'login')}
                </button>
                <button type="button" onClick={() => go('dh_register')} className="w-full py-2 text-xs font-semibold text-cyan-300 cursor-pointer">
                  {t(language, 'register_dh')}
                </button>
              </form>
            )}

            {/* DH REGISTER */}
            {view === 'dh_register' && (
              <form onSubmit={handleDhRegister} className="space-y-2.5">
                <Field label="Login Name / Staff Name" value={dhName} onChange={setDhName} autoFocus />
                <Field label="Login ID / Staff ID" value={dhStaffCode} onChange={setDhStaffCode} mono placeholder="DH12345" />
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 mb-1.5">Gender *</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setDhGender('male')} className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${dhGender === 'male' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-neutral-700 bg-neutral-900 text-neutral-400'}`}>♂ Male</button>
                    <button type="button" onClick={() => setDhGender('female')} className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${dhGender === 'female' ? 'border-pink-400 bg-pink-500/15 text-pink-200' : 'border-neutral-700 bg-neutral-900 text-neutral-400'}`}>♀ Female</button>
                  </div>
                </div>
                <Field label={t(language, 'set_password')} value={dhPassword} onChange={setDhPassword} type="password" />
                <Field label={t(language, 'confirm_password')} value={dhPassword2} onChange={setDhPassword2} type="password" />
                <button type="submit" className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-black text-sm cursor-pointer">
                  {t(language, 'create_dh_account')}
                </button>
              </form>
            )}

            {/* DUPLICATE BLOCK */}
            {view === 'duplicate_block' && duplicateInfo && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-sm font-black text-rose-100">{duplicateInfo.messageTitle}</div>
                      <p className="text-xs text-rose-100/90 mt-2 whitespace-pre-wrap leading-relaxed">{duplicateInfo.messageBody}</p>
                    </div>
                  </div>
                </div>
                {duplicateInfo.reasons.length > 0 && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                    <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Match signals</div>
                    <ul className="text-[11px] text-neutral-300 space-y-1 list-disc pl-4">
                      {duplicateInfo.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {duplicateInfo.matchedAccounts.length > 0 && (
                  <div className="rounded-xl border border-neutral-800 p-3 text-[11px] text-neutral-400">
                    Existing record(s) reference Login ID:{' '}
                    <strong className="text-emerald-300 font-mono">
                      {duplicateInfo.matchedAccounts.map((a) => a.loginId).join(', ')}
                    </strong>
                    . Existing staff data will not be overwritten.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => go('staff_login')}
                  className="w-full py-3.5 rounded-xl bg-emerald-400 text-neutral-950 font-black text-sm cursor-pointer"
                >
                  Return to Login
                </button>
                <button type="button" onClick={goBack} className="w-full py-2 text-xs text-neutral-400 hover:text-white cursor-pointer">
                  Review registration details
                </button>
                <p className="text-[10px] text-center text-neutral-500">
                  Need a verified exception? Contact Creator/Admin for manual account approval.
                </p>
              </div>
            )}

            {/* ASSIST PREFS */}
            {view === 'assist_setup' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="text-xs font-bold text-white mb-1">{t(language, 'assist_prefs')}</div>
                  <div className="text-[11px] text-neutral-400 leading-relaxed">{t(language, 'language_hint')}</div>
                </div>
                <AssistToggle label={t(language, 'assist_large_text')} checked={prefs.largeText} onChange={(v) => setPrefs((p) => ({ ...p, largeText: v }))} />
                <AssistToggle label={t(language, 'assist_reduce_motion')} checked={prefs.reduceMotion} onChange={(v) => setPrefs((p) => ({ ...p, reduceMotion: v }))} />
                <AssistToggle label={t(language, 'assist_sound_on')} checked={prefs.soundOn} onChange={(v) => setPrefs((p) => ({ ...p, soundOn: v }))} />
                <AssistToggle label={t(language, 'assist_tips')} checked={prefs.showTips} onChange={(v) => setPrefs((p) => ({ ...p, showTips: v }))} />
                <AssistToggle label={t(language, 'assist_slow_game')} checked={prefs.slowerPace} onChange={(v) => setPrefs((p) => ({ ...p, slowerPace: v }))} />
                {prefsSavedFlash && (
                  <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {t(language, 'prefs_saved')}
                  </div>
                )}
                <button type="button" onClick={saveAssistAndEnter} className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-sm cursor-pointer">
                  {t(language, 'save_prefs')} · {t(language, 'continue')}
                </button>
                <button type="button" onClick={skipAssistAndEnter} className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer">
                  Skip for now
                </button>
              </div>
            )}
          </div>

          {/* LANGUAGE BOTTOM */}
          <div className="border-t border-neutral-900 bg-neutral-950 px-5 py-3.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playTabSwitch();
                setShowLangPanel((v) => !v);
              }}
              className="w-full flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="text-left min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">{t(language, 'language')}</div>
                <div className="text-xs font-semibold text-white truncate">
                  {currentLangMeta.nativeLabel}
                  <span className="text-neutral-500 font-normal"> · {currentLangMeta.label}</span>
                </div>
              </div>
              {showLangPanel ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {showLangPanel && (
              <div className="mt-3 space-y-3">
                <p className="text-[10px] text-neutral-500 leading-relaxed">{t(language, 'language_hint')}</p>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-1.5">{t(language, 'nigeria_languages')}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {nigeriaLangs.map((opt) => (
                      <LangChip key={opt.code} active={language === opt.code} label={opt.nativeLabel} sub={opt.label} onClick={() => applyLanguageForMeOnly(opt.code)} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 mb-1.5">{t(language, 'international_languages')}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {intlLangs.map((opt) => (
                      <LangChip key={opt.code} active={language === opt.code} label={opt.nativeLabel} sub={opt.label} onClick={() => applyLanguageForMeOnly(opt.code)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <p className="text-center text-[10px] text-neutral-600">{t(language, 'internal_security')}</p>
          <HamvidaBrand compact />
        </div>
      </div>
    </div>
  );
};

function RoleCard({
  icon,
  title,
  desc,
  badge,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  accent: 'emerald' | 'cyan' | 'neutral';
  onClick: () => void;
}) {
  const styles =
    accent === 'emerald'
      ? 'border-emerald-500/30 hover:border-emerald-400/70 hover:bg-emerald-500/5'
      : accent === 'cyan'
      ? 'border-cyan-500/30 hover:border-cyan-400/70 hover:bg-cyan-500/5'
      : 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/80';
  const iconStyles =
    accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : accent === 'cyan' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-neutral-800 text-neutral-300';

  return (
    <button type="button" onClick={onClick} className={`w-full text-left rounded-2xl border bg-neutral-900/40 p-3.5 transition-all cursor-pointer active:scale-[0.99] ${styles}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconStyles}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-white">{title}</span>
            {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-neutral-700 text-neutral-300 font-bold uppercase tracking-wide">{badge}</span>}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  mono,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-400 px-3 py-2.5 text-sm text-white focus:outline-none ${
          mono ? 'font-mono uppercase' : ''
        }`}
      />
    </label>
  );
}

function LangChip({ active, label, sub, onClick }: { active: boolean; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-1.5 text-left cursor-pointer transition-all ${
        active ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200' : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
      }`}
    >
      <div className="text-[11px] font-bold leading-tight truncate">{label}</div>
      <div className="text-[9px] text-neutral-500 truncate">{sub}</div>
    </button>
  );
}

function AssistToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        soundManager.playUiTap();
        onChange(!checked);
      }}
      className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left cursor-pointer ${
        checked ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-neutral-800 bg-neutral-900/50'
      }`}
    >
      <span className="text-xs font-semibold text-neutral-200">{label}</span>
      <span className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-emerald-400' : 'bg-neutral-700'}`}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? '18px' : '2px' }} />
      </span>
    </button>
  );
}
