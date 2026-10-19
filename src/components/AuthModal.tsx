import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Sparkles, 
  AlertCircle, 
  KeyRound, 
  ArrowRight, 
  Globe, 
  Briefcase, 
  Check, 
  Lock,
  ArrowLeft,
  SlidersHorizontal,
  LogIn,
  UserPlus
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { OPayLogo } from './OPayLogo';
import { HamvidaLogo } from './HamvidaLogo';
import { 
  LANGUAGE_OPTIONS, 
  SupportedLanguage, 
  TRANSLATIONS 
} from '../types/languages';
import { StaffAccount } from '../types/staffDatabase';

interface AuthModalProps {
  onSuccessCreatorLogin: (creatorName: string) => void;
  onPlayAsGuest: () => void;
  onSuccessDHLogin: (dhName: string, dhCode: string) => void;
  onSuccessStaffLogin: (account: StaffAccount) => void;
  onOpenStaffRegistration: () => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  staffDatabase: StaffAccount[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccessCreatorLogin,
  onPlayAsGuest,
  onSuccessDHLogin,
  onSuccessStaffLogin,
  onOpenStaffRegistration,
  currentLanguage,
  onLanguageChange,
  staffDatabase,
}) => {
  // Navigation stack: 'selection' | 'creator_login' | 'staff_login' | 'dh_login'
  const [selectedRole, setSelectedRole] = useState<'selection' | 'creator_login' | 'staff_login' | 'dh_login'>('selection');
  
  // Creator form state
  const [passwordInput, setPasswordInput] = useState('');
  
  // Registered Staff Login form state
  const [staffLoginId, setStaffLoginId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Department Head (DH) Form State
  const [dhNameInput, setDhNameInput] = useState(() => localStorage.getItem('opay_dh_name') || '');
  const [dhCodeInput, setDhCodeInput] = useState(() => localStorage.getItem('opay_dh_code') || '');
  const [dhPasswordInput, setDhPasswordInput] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Per-User Tailored Assistance Options (Saved locally for this user's device)
  const [slowPace, setSlowPace] = useState(() => localStorage.getItem('opay_user_slow_pace') === 'true');
  const [showHelperBadges, setShowHelperBadges] = useState(() => localStorage.getItem('opay_user_badges') !== 'false');

  const CREATOR_NAME = 'Hamzat Victor Chisom';
  const CREATOR_SECRET_KEY = '77075107';

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const handleToggleSlowPace = () => {
    const next = !slowPace;
    setSlowPace(next);
    localStorage.setItem('opay_user_slow_pace', String(next));
    showSavedBanner('Play speed preference saved for your device.');
  };

  const handleToggleBadges = () => {
    const next = !showHelperBadges;
    setShowHelperBadges(next);
    localStorage.setItem('opay_user_badges', String(next));
    showSavedBanner('Visual guidance badges preference saved.');
  };

  const showSavedBanner = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  // 1. Creator Login Handler (Password only, sets Hamzat Victor Chisom)
  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === CREATOR_SECRET_KEY) {
      soundManager.playCollect(1.5);
      onSuccessCreatorLogin(CREATOR_NAME);
    } else {
      soundManager.playPolicyBuzzer();
      setErrorMessage('Incorrect Creator Access Key. Access Denied.');
      setPasswordInput('');
    }
  };

  // 2. Registered Staff Login Handler (Login ID + Password)
  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const searchId = staffLoginId.trim().toUpperCase();
    if (!searchId) {
      setErrorMessage('Please enter your Staff / Login ID.');
      return;
    }

    // Lookup in official staff database
    const found = staffDatabase.find(s => s.loginId.trim().toUpperCase() === searchId);

    if (!found) {
      soundManager.playPolicyBuzzer();
      setErrorMessage(`No account found with Login ID "${searchId}". Please verify your ID or tap "Register New Staff Account" below.`);
      return;
    }

    // If account has password, check it (default fallback accepted if none set)
    if (found.password && staffPassword.trim()) {
      if (found.password !== staffPassword.trim() && staffPassword.trim() !== 'opay2026') {
        soundManager.playPolicyBuzzer();
        setErrorMessage('Incorrect password. If you forgot your password, please contact the administrator or use your default passcode.');
        return;
      }
    }

    soundManager.playStampApproval();
    onSuccessStaffLogin(found);
  };

  // 3. Department Head (DH) Login Handler (Name + Staff Code + Password set by them)
  const handleDHSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dhNameInput.trim()) {
      setErrorMessage('Please enter your Executive Full Name.');
      return;
    }
    if (!dhCodeInput.trim()) {
      setErrorMessage('Please enter your DH Staff Code (e.g. DH-HQ-001).');
      return;
    }
    if (dhPasswordInput.trim().length < 4) {
      setErrorMessage('Please set or enter your DH Access Password (at least 4 characters).');
      return;
    }

    // Save DH credentials in session storage for persistence
    localStorage.setItem('opay_dh_name', dhNameInput.trim());
    localStorage.setItem('opay_dh_code', dhCodeInput.trim());
    localStorage.setItem('opay_dh_pwd', dhPasswordInput.trim());

    soundManager.playTierUpgradeFanfare();
    onSuccessDHLogin(dhNameInput.trim(), dhCodeInput.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-emerald-500/40 rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-7 text-white shadow-[0_0_60px_rgba(16,185,129,0.22)] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* ==================================================== */}
        {/* BRAND LOGO & CLEAN HERO HEADER */}
        {/* ==================================================== */}
        <div className="text-center mb-5">
          <div className="inline-flex px-5 py-2.5 rounded-2xl bg-white mx-auto mb-2.5 shadow-[0_0_30px_rgba(29,206,159,0.45)]">
            <OPayLogo height={34} variant="dark" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPay Field Operations &amp; National Audit</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase text-white">
            {t.portalTitle}
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5 max-w-md mx-auto">
            {t.portalSubtitle}
          </p>
        </div>

        {/* Global Save Feedback Alert */}
        {savedFeedback && (
          <div className="mb-3 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[11.5px] text-emerald-300 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedFeedback}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 1: LOGIN SELECTION GATE */}
        {/* 1. Creator (Gold) */}
        {/* 2. Registered Staff Login (CDL • CDLM • SM • RM) */}
        {/* 3. Register New Staff Account (Four-field identity verification) */}
        {/* 4. Play as Guest (Standard simulation) */}
        {/* 5. Department Head DH Executive (Audit & Reassignment) */}
        {/* ==================================================== */}
        {selectedRole === 'selection' && (
          <div className="space-y-2.5 mb-6">
            {/* 1. Creator Access Option */}
            <button
              onClick={() => {
                setSelectedRole('creator_login');
                setErrorMessage(null);
                setPasswordInput('');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border-2 border-emerald-500/70 hover:border-emerald-400 text-left transition-all cursor-pointer group hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      <span>{t.creatorBtn}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono uppercase font-bold border border-amber-500/40">
                        Hamzat Master
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Password-only access (No name or staff code needed)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* 2. Registered Staff Login (CDL • CDLM • SM • RM) */}
            <button
              onClick={() => {
                setSelectedRole('staff_login');
                setErrorMessage(null);
                setStaffPassword('');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 to-neutral-900 border-2 border-teal-500/60 hover:border-teal-400 text-left transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 group-hover:bg-teal-400 group-hover:text-neutral-950 transition-colors">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-teal-200 transition-colors flex items-center gap-2">
                      <span>STAFF LOGIN (CDL • CDLM • SM • RM)</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        Staff ID
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Log in with your assigned Staff ID &amp; passcode to sync your standing &amp; region
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-teal-300 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* 3. Register New Staff Account */}
            <button
              onClick={onOpenStaffRegistration}
              className="w-full p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/80 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      <span>REGISTER NEW STAFF ACCOUNT</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        New Account
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      4-field verification: Staff ID + Name + Region + State (DH requires no Region/State)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* 4. Play as Guest Option (CDL Field Simulator) */}
            <button
              onClick={onPlayAsGuest}
              className="w-full p-3.5 rounded-2xl bg-neutral-950/70 hover:bg-neutral-800/70 border-2 border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-neutral-200 transition-colors">
                      {t.guestBtn}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {t.guestDescription}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* 5. Department Head (DH) Executive Portal Option */}
            <button
              onClick={() => {
                setSelectedRole('dh_login');
                setErrorMessage(null);
                setDhPasswordInput('');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-neutral-900 border-2 border-purple-500/50 hover:border-purple-400 text-left transition-all cursor-pointer group hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-neutral-950 transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      <span>{t.dhBtn}</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded-full font-mono uppercase font-bold border border-purple-500/40">
                        Executive Suite
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      National inspection of RM, SM, CDLM &amp; CDL analytics + location reassignment
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2A: CREATOR PASSWORD-ONLY ENTRY SCREEN */}
        {/* ==================================================== */}
        {selectedRole === 'creator_login' && (
          <form onSubmit={handleCreatorSubmit} className="space-y-4 mb-6 animate-in fade-in duration-200">
            {/* Top Back bar */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('selection');
                setErrorMessage(null);
                setPasswordInput('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t.backBtn}</span>
            </button>

            <div className="p-3.5 bg-neutral-950 border border-emerald-500/30 rounded-2xl text-left">
              <div className="text-[11px] uppercase font-bold text-emerald-400">{t.creatorTitle}</div>
              <div className="text-xs text-neutral-300 mt-0.5">
                {t.creatorSubtitle} • Enter your private creator password below. No name or staff code needed.
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Creator Secret Passcode:</span>
              </label>
              <input
                type="password"
                autoFocus
                placeholder={t.creatorPassPlaceholder}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none font-mono tracking-widest text-center"
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={!passwordInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 disabled:opacity-40 text-neutral-950 font-black text-sm cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{t.creatorUnlock}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('selection');
                  setErrorMessage(null);
                  setPasswordInput('');
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer transition-colors"
              >
                ← {t.backBtn}
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* STEP 2B: REGISTERED STAFF LOGIN FORM (CDL, CDLM, SM, RM) */}
        {/* ==================================================== */}
        {selectedRole === 'staff_login' && (
          <form onSubmit={handleStaffLoginSubmit} className="space-y-3.5 mb-6 animate-in fade-in duration-200">
            {/* Top Back bar */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('selection');
                setErrorMessage(null);
                setStaffLoginId('');
                setStaffPassword('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t.backBtn}</span>
            </button>

            <div className="p-3.5 bg-neutral-950 border border-teal-500/40 rounded-2xl text-left">
              <div className="text-[11px] uppercase font-bold text-teal-300 flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-teal-400" />
                <span>Field Staff Authentication Portal</span>
              </div>
              <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Enter your official Staff / Login ID to access your personalized standing, portfolio metrics, and regional jurisdiction.
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Staff / Login ID (e.g., OP12345, OPAY-CDLM-FOL-01):
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Enter your Staff ID..."
                value={staffLoginId}
                onChange={(e) => {
                  setStaffLoginId(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Account Password (Optional if default):</span>
              </label>
              <input
                type="password"
                placeholder="Enter password (default: opay2026)..."
                value={staffPassword}
                onChange={(e) => {
                  setStaffPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none font-mono"
              />
            </div>

            {/* Quick Helper: Select from existing database */}
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-400 font-bold uppercase mb-1">
                Demo Quick-Fill from Staff Database:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {staffDatabase.filter(s => s.role !== 'DH').slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStaffLoginId(s.loginId);
                      setErrorMessage(null);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 hover:border-teal-400 text-teal-300 cursor-pointer"
                  >
                    {s.loginId} ({s.loginName.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={!staffLoginId.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-40 text-neutral-950 font-black text-sm cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>AUTHENTICATE &amp; START FIELD RUN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenStaffRegistration}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white cursor-pointer font-semibold underline underline-offset-2"
              >
                Don&apos;t have an account yet? Register New Staff Account
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* STEP 2C: DEPARTMENT HEAD (DH) LOGIN ENTRY SCREEN */}
        {/* ==================================================== */}
        {selectedRole === 'dh_login' && (
          <form onSubmit={handleDHSubmit} className="space-y-3.5 mb-6 animate-in fade-in duration-200">
            {/* Top Back bar */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('selection');
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t.backBtn}</span>
            </button>

            <div className="p-3.5 bg-neutral-950 border border-purple-500/40 rounded-2xl text-left">
              <div className="text-[11px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                {t.dhPortalTitle}
              </div>
              <div className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {t.dhReadonlyNotice}
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* DH Name */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                {t.dhNameLabel}:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Dr. Aliyu Mustapha"
                value={dhNameInput}
                onChange={(e) => {
                  setDhNameInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>

            {/* DH Staff Code */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                {t.dhCodeLabel}:
              </label>
              <input
                type="text"
                placeholder="e.g. DH-HQ-001 / DH-OPS-2026"
                value={dhCodeInput}
                onChange={(e) => {
                  setDhCodeInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none font-mono"
              />
            </div>

            {/* DH Password (set by them) */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.dhPassLabel} (set by you):</span>
              </label>
              <input
                type="password"
                placeholder="Choose or enter your DH passcode..."
                value={dhPasswordInput}
                onChange={(e) => {
                  setDhPasswordInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={!dhNameInput.trim() || !dhCodeInput.trim() || !dhPasswordInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 hover:from-purple-400 hover:to-indigo-300 disabled:opacity-40 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{t.dhLoginSubmit}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('selection');
                  setErrorMessage(null);
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer transition-colors"
              >
                ← {t.backBtn}
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* BOTTOM SECTION: PER-USER ASSISTANCE REQUESTS */}
        {/* ==================================================== */}
        <div className="border-t border-neutral-800 pt-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-bold flex items-center gap-1.5 text-neutral-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personalized Field Assistance (Saved for your Device)</span>
            </span>
            <span className="text-[10px] text-emerald-400/90 font-mono">
              Auto-saved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleToggleSlowPace}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                slowPace
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-white'
                  : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div>
                <div className="font-bold text-[11.5px] text-white">Gentle Drop Speed</div>
                <div className="text-[10px] text-neutral-400">Gives more time to read labels</div>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full ${slowPace ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-neutral-700'}`} />
            </button>

            <button
              type="button"
              onClick={handleToggleBadges}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                showHelperBadges
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-white'
                  : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div>
                <div className="font-bold text-[11.5px] text-white">✓ / ✗ Visual Badges</div>
                <div className="text-[10px] text-neutral-400">Instant right/wrong badge guides</div>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full ${showHelperBadges ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-neutral-700'}`} />
            </button>
          </div>

          {/* ==================================================== */}
          {/* MULTILINGUAL LANGUAGE SELECTOR (POSITIONED DOWN AT BASE) */}
          {/* ==================================================== */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
                <span>{t.selectLanguage}</span>
              </span>
              <span className="text-[10.5px] text-neutral-400 font-mono">
                Default: <strong className="text-white">English</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-0.5">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onLanguageChange(lang.code);
                      showSavedBanner(`Language set to ${lang.name} for your session.`);
                    }}
                    className={`py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-xl text-left border cursor-pointer transition-all flex items-center justify-between gap-1 touch-btn ${
                      isSelected
                        ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                        : 'bg-neutral-900/60 border-neutral-800/90 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                    }`}
                    title={`${lang.name} (${lang.nativeName}) - ${lang.region}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs shrink-0">{lang.flag}</span>
                        <span className="text-[10.5px] sm:text-[11px] font-extrabold truncate text-white">
                          {lang.name}
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[9.5px] text-neutral-400 truncate">
                        {lang.nativeName}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-neutral-500 text-center mt-2">
              {t.languageScopeNote}
            </p>
          </div>
        </div>

        {/* Footer Security Stamp & Official Made by Hamvida Tech Badge */}
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-neutral-500">
          <span>OPay Internal Security • Multi-tier Governance (DH, RM, SM, CDLM, CDL)</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-950 border border-[#F6D870]/30 shadow-sm">
            <HamvidaLogo size={14} />
            <span className="text-[11px] font-bold text-white tracking-tight">
              Made by <strong className="text-[#F6D870]">Hamvida Tech</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
