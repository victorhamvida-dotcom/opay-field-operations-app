import { useState, useEffect, useCallback } from 'react';
import { GameCanvas, GameState, GameStats } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { HierarchyGuide } from './components/HierarchyGuide';
import { MerchantEncounterModal } from './components/MerchantEncounterModal';
import { PolicyQuizModal } from './components/PolicyQuizModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { POSDeploymentHub } from './components/POSDeploymentHub';
import { AuthModal } from './components/AuthModal';
import { OPayLogo } from './components/OPayLogo';
import { PasswordResetPortal } from './components/PasswordResetPortal';
import { HighScoreEntry } from './types/tactics';
import { CDLPortfolioState, calculateCDLTier } from './types/cdlFullEngine';
import { soundManager, MusicTrackId } from './utils/sound';
import { AudioMusicHub } from './components/AudioMusicHub';
import { BestPracticeDocsModal } from './components/BestPracticeDocsModal';
import { DHAnalyticsDashboard } from './components/DHAnalyticsDashboard';
import { StaffRegistrationModal } from './components/StaffRegistrationModal';
import { CreatorAdminStaffManager } from './components/CreatorAdminStaffManager';
import { StaffAccount, INITIAL_STAFF_DATABASE } from './types/staffDatabase';
import { checkDailyNigeriaStateUpdate } from './types/nigeriaStates';
import { SupportedLanguage } from './types/languages';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { DisciplinaryTribunalModal, PenaltyFateOption } from './components/DisciplinaryTribunalModal';
import { GenderAnalyticsModal } from './components/GenderAnalyticsModal';
import { PolicyAIEngineModal } from './components/PolicyAIEngineModal';
import { PolicyVersionSnapshot, getActivePolicySnapshot } from './types/policyGameEngine';
import { getSelectedCharacter, RunnerCharacter } from './types/characters';
import { CompanyBrandingModal } from './components/CompanyBrandingModal';
import { CompanyBranding, getCompanyBranding } from './types/companyBranding';
import { HamvidaLogo } from './components/HamvidaLogo';
import { Volume2, VolumeX, Building2, Store, FileQuestion, Trophy, Server, ArrowLeft, ArrowRight, Zap, Award, KeyRound, LogOut, ShieldCheck, Music, BookOpen, Globe, Sparkles } from 'lucide-react';

const HIGH_SCORES_KEY = 'opay_cdl_merchant_loan_highscores';

export type RankedEntry = HighScoreEntry & { tier?: string; timeSeconds?: number };

const INITIAL_CDL_LEADERBOARD: RankedEntry[] = [
  { name: 'Ikechukwu Kenneth (CDLM)', score: 45500, tacticsUnlocked: 6, disbursedAmount: 5200000, date: 'Today', tier: 'Gold 3', timeSeconds: 402 },
  { name: 'Folorunsho Femi (CDLM)', score: 39800, tacticsUnlocked: 6, disbursedAmount: 4300000, date: 'Yesterday', tier: 'Gold 2', timeSeconds: 455 },
  { name: 'Philip Onaah (CDLM)', score: 31400, tacticsUnlocked: 5, disbursedAmount: 3400000, date: '2 days ago', tier: 'Gold 1', timeSeconds: 380 },
  { name: 'Shafiu Murtala (CDLM)', score: 26200, tacticsUnlocked: 5, disbursedAmount: 2800000, date: '3 days ago', tier: 'Silver 3', timeSeconds: 330 },
  { name: 'Orieke Kalu (CDLM)', score: 21800, tacticsUnlocked: 4, disbursedAmount: 2150000, date: '4 days ago', tier: 'Silver 2', timeSeconds: 310 },
  { name: 'Julius Owvie (CDLM)', score: 18500, tacticsUnlocked: 4, disbursedAmount: 1700000, date: '5 days ago', tier: 'Bronze 3', timeSeconds: 290 }
];

/**
 * Ranking rule: Higher score ranks higher. When scores are within the same
 * 1,000-point band, the CDL who reached it in LESS time ranks higher.
 */
export const rankEntries = (entries: RankedEntry[]): RankedEntry[] => {
  return [...entries].sort((a, b) => {
    const bandA = Math.floor(a.score / 1000);
    const bandB = Math.floor(b.score / 1000);
    if (bandA !== bandB) return bandB - bandA;
    const tA = a.timeSeconds ?? Number.MAX_SAFE_INTEGER;
    const tB = b.timeSeconds ?? Number.MAX_SAFE_INTEGER;
    if (tA !== tB) return tA - tB; // less time = higher rank
    return b.score - a.score;
  });
};

export const formatTime = (secs: number) => {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

export function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  
  // Real-time CDL Policy Portfolio Engine (Tracking 5 criteria from policy)
  const [portfolio, setPortfolio] = useState<CDLPortfolioState>({
    potentialPOS: 42, // Bound > 30 days & revenue > ₦300 (starts at qualifying Bronze 1)
    standardPOS: 14,  // 33% (>25% required for Bronze 1)
    excellentPOS: 8,  // 19% (>15% required for Bronze 1)
    recentLoansSold: 2, // 2 loans/mo (qualifies for Bronze 1)
    totalEarnings: 85000,
    daysOnboarded: 45, // Under 90-day protection period!
    complianceScore: 100,
    warningStrikes: 0,
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    cashDisbursed: 250000,
    tacticsProgress: 0,
    combo: 0,
    maxCombo: 0,
    streak: 0,
    shields: 1,
    cdlTier: 'Bronze 1',
    whitelistedHits: 0,
    fraudBlocks: 0,
    elapsedSeconds: 0,
  });

  // Selected Language (Igbo, Hausa, Fulani, French, Spanish, English, Mandarin Chinese, Yoruba)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('opay_lang') as SupportedLanguage) || 'en';
  });

  // Authentication session state: null = not logged in yet, 'creator', 'guest', or 'dh'
  const [authRole, setAuthRole] = useState<'creator' | 'guest' | 'dh' | null>(() => {
    return (localStorage.getItem('opay_auth_role') as 'creator' | 'guest' | 'dh') || null;
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return localStorage.getItem('opay_user_name') || 'Guest Field Officer';
  });
  const [dhStaffCode, setDhStaffCode] = useState<string>(() => {
    return localStorage.getItem('opay_dh_code') || 'DH-HQ-001';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHierarchyGuide, setShowHierarchyGuide] = useState<boolean>(false);
  const [showMerchantEncounter, setShowMerchantEncounter] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showPOSHub, setShowPOSHub] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<RankedEntry[]>([]);
  const [unlockedBanner, setUnlockedBanner] = useState<{ title: string; step: number } | null>(null);
  const [showMusicHub, setShowMusicHub] = useState<boolean>(false);
  const [showBestPracticeDocs, setShowBestPracticeDocs] = useState<boolean>(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrackId>('afrobeat');

  // Character selection state & Tribunal Warning Screen
  const [selectedCharacter, setSelectedCharacter] = useState<RunnerCharacter>(() => getSelectedCharacter());
  const [showCharacterSelect, setShowCharacterSelect] = useState<boolean>(false);
  const [showGenderAnalytics, setShowGenderAnalytics] = useState<boolean>(false);
  const [showPolicyEngine, setShowPolicyEngine] = useState<boolean>(false);
  const [companyBranding, setCompanyBranding] = useState<CompanyBranding>(() => getCompanyBranding());
  const [showBrandingModal, setShowBrandingModal] = useState<boolean>(false);
  const [activePolicyVersion, setActivePolicyVersion] = useState<string>(() => {
    return getActivePolicySnapshot().versionId;
  });
  const [tribunalTriggered, setTribunalTriggered] = useState<{ active: boolean; reason: string }>({
    active: false,
    reason: 'Portfolio Bankruptcy',
  });

  // Staff Database with Composite Duplicate Integrity (Stored in localStorage)
  const [staffDatabase, setStaffDatabase] = useState<StaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('opay_staff_database_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STAFF_DATABASE;
  });

  const [showStaffRegistration, setShowStaffRegistration] = useState<boolean>(false);
  const [showCreatorAdminManager, setShowCreatorAdminManager] = useState<boolean>(false);

  const handleCreatorLogin = (creatorName: string) => {
    setAuthRole('creator');
    setCurrentUserName(creatorName);
    localStorage.setItem('opay_auth_role', 'creator');
    localStorage.setItem('opay_user_name', creatorName);
  };

  const handlePlayAsGuest = () => {
    setAuthRole('guest');
    setCurrentUserName('Guest Field Officer');
    localStorage.setItem('opay_auth_role', 'guest');
    localStorage.setItem('opay_user_name', 'Guest Field Officer');
  };

  const handleSuccessDHLogin = (name: string, code: string) => {
    setAuthRole('dh');
    setCurrentUserName(name);
    setDhStaffCode(code);
    localStorage.setItem('opay_auth_role', 'dh');
    localStorage.setItem('opay_user_name', name);
    localStorage.setItem('opay_dh_code', code);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('opay_lang', lang);
  };

  const handleLogout = () => {
    setAuthRole(null);
    localStorage.removeItem('opay_auth_role');
    localStorage.removeItem('opay_user_name');
  };

  // Staff Account Registration & Creator Override Handlers
  const handleRegisterSuccess = (newAccount: StaffAccount) => {
    const updated = [newAccount, ...staffDatabase];
    setStaffDatabase(updated);
    try {
      localStorage.setItem('opay_staff_database_v2', JSON.stringify(updated));
    } catch {}

    // Auto log in as the newly created account
    setShowStaffRegistration(false);
    if (newAccount.role === 'DH') {
      handleSuccessDHLogin(newAccount.loginName, newAccount.loginId);
    } else {
      setAuthRole('guest'); // standard operational mode with their name and region
      setCurrentUserName(`${newAccount.loginName} (${newAccount.role} - ${newAccount.state || newAccount.region})`);
      localStorage.setItem('opay_auth_role', 'guest');
      localStorage.setItem('opay_user_name', `${newAccount.loginName} (${newAccount.role} - ${newAccount.state || newAccount.region})`);
    }
  };

  const handleSelectExistingLogin = (account: StaffAccount) => {
    setShowStaffRegistration(false);
    if (account.role === 'DH') {
      handleSuccessDHLogin(account.loginName, account.loginId);
    } else {
      setAuthRole('guest');
      setCurrentUserName(`${account.loginName} (${account.role} - ${account.state || account.region})`);
      localStorage.setItem('opay_auth_role', 'guest');
      localStorage.setItem('opay_user_name', `${account.loginName} (${account.role} - ${account.state || account.region})`);
    }
  };

  const handleCreatorManualAccountCreated = (createdAccount: StaffAccount) => {
    const updated = [createdAccount, ...staffDatabase];
    setStaffDatabase(updated);
    try {
      localStorage.setItem('opay_staff_database_v2', JSON.stringify(updated));
    } catch {}
  };

  // Department Head (DH) Authority: Relocate Staff Region & State
  const handleUpdateStaffLocation = (staffId: string, newRegion: string, newState: string, auditReason: string) => {
    const updated = staffDatabase.map((staff) => {
      if (staff.id === staffId) {
        return {
          ...staff,
          region: newRegion,
          state: newState,
          approvalNotes: `DH Location Reassignment (${new Date().toISOString().split('T')[0]}): ${auditReason}`,
        };
      }
      return staff;
    });

    setStaffDatabase(updated);
    try {
      localStorage.setItem('opay_staff_database_v2', JSON.stringify(updated));
    } catch {}
  };

  // Daily background update check for Nigerian state count
  // Runs once a day to ensure newly created states are integrated seamlessly
  useEffect(() => {
    try {
      checkDailyNigeriaStateUpdate();
    } catch {
      // Ignored
    }
  }, []);

  // Sync assessed tier from real-time portfolio equation
  useEffect(() => {
    const assessed = calculateCDLTier(portfolio);
    setStats((prev) => ({
      ...prev,
      cdlTier: assessed,
    }));
  }, [portfolio]);

  // Load high scores
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORES_KEY);
      if (saved) {
        setHighScores(rankEntries(JSON.parse(saved)));
      } else {
        setHighScores(INITIAL_CDL_LEADERBOARD);
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(INITIAL_CDL_LEADERBOARD));
      }
    } catch {
      setHighScores(INITIAL_CDL_LEADERBOARD);
    }
  }, []);

  const handleSaveScore = (name: string, score: number, tacticsUnlocked: number, disbursedAmount: number, tier: string, timeSeconds: number) => {
    const finalName = name.trim() || currentUserName;
    const newEntry: RankedEntry = {
      name: finalName,
      score,
      tacticsUnlocked,
      disbursedAmount,
      date: 'Just now',
      tier,
      timeSeconds: Math.round(timeSeconds),
    };
    const updated = rankEntries([newEntry, ...highScores]).slice(0, 10);
    setHighScores(updated);
    try {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const handleClearScores = () => {
    setHighScores([]);
    try {
      localStorage.removeItem(HIGH_SCORES_KEY);
    } catch {
      // Ignored
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (!next) {
      soundManager.stopMusic();
    } else if (gameState === 'playing' && currentMusicTrack !== 'off') {
      soundManager.startMusic(currentMusicTrack);
    }
  };

  const handleTrackChange = (track: MusicTrackId) => {
    setCurrentMusicTrack(track);
    soundManager.switchTrack(track);
  };

  const startGame = () => {
    setGameState('playing');
    setUnlockedBanner(null);
  };

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    if (finalStats.terminatedByTribunal) {
      setTribunalTriggered({
        active: true,
        reason: finalStats.tribunalReason || 'Portfolio Bankruptcy',
      });
    } else {
      setGameState('gameover');
    }
  }, []);

  const handleUnlockTactic = useCallback((tacticTitle: string, totalUnlocked: number) => {
    setUnlockedBanner({ title: tacticTitle, step: totalUnlocked });
    
    // Reward portfolio upon mastering best practices
    setPortfolio((prev) => ({
      ...prev,
      recentLoansSold: prev.recentLoansSold + 1,
      standardPOS: prev.standardPOS + 5,
      potentialPOS: prev.potentialPOS + 8,
      totalEarnings: prev.totalEarnings + 100000,
      complianceScore: Math.min(100, prev.complianceScore + 5),
    }));

    setTimeout(() => {
      setUnlockedBanner(null);
    }, 4500);
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats((prev) => ({
      ...newStats,
      cdlTier: prev.cdlTier, // Kept in sync with portfolio engine
    }));
  }, []);

  const handleTriggerEncounter = useCallback(() => {
    setGameState('paused');
    setShowMerchantEncounter(true);
  }, []);

  const handleEncounterDecision = useCallback((result: {
    points: number;
    cashDisbursed: number;
    isCorrect: boolean;
    tierImpact: 'upgrade' | 'downgrade' | 'warning' | 'none';
    encounterTitle: string;
  }) => {
    setStats((prev) => ({
      ...prev,
      score: Math.max(0, prev.score + result.points),
      cashDisbursed: Math.max(0, prev.cashDisbursed + result.cashDisbursed),
    }));

    // Update real-time portfolio metrics
    setPortfolio((prev) => {
      if (result.isCorrect) {
        return {
          ...prev,
          recentLoansSold: prev.recentLoansSold + 1,
          potentialPOS: prev.potentialPOS + 12,
          standardPOS: prev.standardPOS + 10,
          excellentPOS: prev.excellentPOS + 6,
          totalEarnings: prev.totalEarnings + 75000,
          complianceScore: Math.min(100, prev.complianceScore + 5),
        };
      } else {
        return {
          ...prev,
          complianceScore: Math.max(0, prev.complianceScore - 15),
          warningStrikes: result.tierImpact === 'downgrade' ? prev.warningStrikes + 1 : prev.warningStrikes,
        };
      }
    });
  }, []);

  const handleDeployPOS = useCallback((impact: {
    potentialChange: number;
    standardChange: number;
    excellentChange: number;
    cost: number;
    earningsBonus: number;
    complianceDelta: number;
    type: 'fmcg_excellent' | 'standard_retail' | 'low_dormant' | 'terminal_stacking_trap';
  }) => {
    setPortfolio((prev) => {
      const newPot = Math.max(0, prev.potentialPOS + impact.potentialChange);
      const newStd = Math.max(0, prev.standardPOS + impact.standardChange);
      const newExc = Math.max(0, prev.excellentPOS + impact.excellentChange);
      const newComp = Math.max(0, Math.min(100, prev.complianceScore + impact.complianceDelta));
      const newStrikes = impact.type === 'terminal_stacking_trap' ? prev.warningStrikes + 1 : prev.warningStrikes;

      return {
        ...prev,
        potentialPOS: newPot,
        standardPOS: Math.min(newPot, newStd),
        excellentPOS: Math.min(newPot, newExc),
        totalEarnings: prev.totalEarnings + impact.earningsBonus - impact.cost,
        complianceScore: newComp,
        warningStrikes: newStrikes,
      };
    });

    setStats((prev) => ({
      ...prev,
      score: impact.type !== 'terminal_stacking_trap' ? prev.score + 250 : Math.max(0, prev.score - 300),
      cashDisbursed: impact.type !== 'terminal_stacking_trap' ? prev.cashDisbursed + 500000 : prev.cashDisbursed,
    }));
  }, []);

  const handleQuizCompleted = useCallback((scoreEarned: number) => {
    setStats((prev) => ({
      ...prev,
      score: prev.score + scoreEarned,
    }));
    setPortfolio((prev) => ({
      ...prev,
      complianceScore: Math.min(100, prev.complianceScore + 10),
      totalEarnings: prev.totalEarnings + 50000,
    }));
  }, []);

  const highestScoreVal = highScores.length > 0 ? highScores[0].score : 0;
  const stdRatio = portfolio.potentialPOS > 0 ? ((portfolio.standardPOS / portfolio.potentialPOS) * 100).toFixed(0) : '0';
  const excRatio = portfolio.potentialPOS > 0 ? ((portfolio.excellentPOS / portfolio.potentialPOS) * 100).toFixed(0) : '0';

  // On-screen touch controls
  const dispatchKey = (key: string, isDown: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
        key,
        code: key === ' ' ? 'Space' : key === 'ArrowLeft' ? 'ArrowLeft' : 'ArrowRight',
        bubbles: true,
      })
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-neutral-950 font-sans pb-4">
      {/* Top Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20 safe-top">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setShowBrandingModal(true)}
              className="px-2 py-1 rounded-lg bg-white shadow-[0_0_15px_rgba(29,206,159,0.35)] flex items-center hover:scale-105 transition-transform cursor-pointer"
              title="Click to customize Company Logo & App Name"
            >
              <OPayLogo height={22} variant="dark" customBranding={companyBranding} />
            </button>
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setShowBrandingModal(true)}>
              <div className="font-extrabold text-[11px] sm:text-sm tracking-tight text-white truncate flex items-center gap-1.5">
                <span>{companyBranding.companyName.toUpperCase()}</span>
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] text-emerald-400 font-semibold flex items-center gap-1 sm:gap-1.5 truncate">
                {authRole === 'creator' ? (
                  <span className="inline-flex items-center gap-0.5 text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30 truncate">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    Creator: {currentUserName}
                  </span>
                ) : (
                  <span className="text-neutral-400 truncate">
                    User: {currentUserName}
                  </span>
                )}
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">12 Sub-levels (Aug 2026 Policy)</span>
              </div>
            </div>
          </div>

          {/* Action Tabs with responsive overflow containment */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto py-0.5 max-w-[55vw] sm:max-w-none">
            <button
              onClick={() => setShowPOSHub(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Deploy POS & Improve Tier"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Deploy POS</span>
            </button>

            <button
              onClick={() => setShowHierarchyGuide(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Hierarchy & Tiers"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Hierarchy</span>
            </button>

            <button
              onClick={() => setShowBestPracticeDocs(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="CDLM Best Practices & Field Playbook"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Playbook</span>
            </button>

            <button
              onClick={() => setShowCharacterSelect(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Select 3D Runner Character"
            >
              <span className="text-xs">🏃🏾</span>
              <span className="hidden sm:inline">Runner</span>
            </button>

            <button
              onClick={() => setShowMusicHub(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 animate-pulse"
              title="Music & Soundtrack Studio"
            >
              <Music className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Music</span>
            </button>

            <button
              onClick={() => setShowMerchantEncounter(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Merchant Scenarios"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>

            <button
              onClick={() => setShowQuiz(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Policy Exam"
            >
              <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Exam</span>
            </button>

            {/* Policy AI Synthesizer & Game Control (Accessible to Creator & DH) */}
            {(authRole === 'creator' || authRole === 'dh') && (
              <button
                onClick={() => setShowPolicyEngine(true)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/40 hover:to-teal-500/40 text-emerald-300 border border-emerald-400/60 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                title="Creator & DH Power: Paste Policy & Synthesize Game Rules + Real-Time History Rollback"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Policy AI Engine</span>
              </button>
            )}

            {/* Gender Diversity & Performance Analysis (Accessible to Creator & DH) */}
            {(authRole === 'creator' || authRole === 'dh') && (
              <button
                onClick={() => setShowGenderAnalytics(true)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Gender Headcount & Performance Analysis"
              >
                <span>👩🏾‍💼/👨🏾‍💼</span>
                <span className="hidden sm:inline">Gender Stats</span>
              </button>
            )}

            {/* Company Branding & Logo Settings */}
            <button
              onClick={() => setShowBrandingModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Customize Company Logo & Name"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Branding</span>
            </button>

            {/* Creator / Admin Override Account Console (Restricted to Creator Role) */}
            {authRole === 'creator' && (
              <button
                onClick={() => setShowCreatorAdminManager(true)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                title="Creator / Admin: Manual Staff Account Override & Hierarchy Setup"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Staff Override</span>
              </button>
            )}

            <button
              onClick={() => setShowPasswordReset(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Creator / Admin: Reset CDL Passwords"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset Pass</span>
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Quick Language Switcher Button in Header */}
            <button
              onClick={() => {
                const order: SupportedLanguage[] = ['en', 'yo', 'ha', 'ig', 'ff', 'fr', 'es', 'zh'];
                const nextIdx = (order.indexOf(currentLanguage) + 1) % order.length;
                handleLanguageChange(order[nextIdx]);
              }}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Cycle Operational Language (English, Yoruba, Hausa, Igbo, Fulfulde, French, Spanish, Chinese)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase text-[10px] font-mono">{currentLanguage}</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer active:scale-95 transition-all"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Switch Account / Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 py-1.5 w-full max-w-xl mx-auto relative">
        {/* Floating Unlock Banner */}
        {unlockedBanner && gameState === 'playing' && (
          <div className="absolute top-16 left-4 right-4 z-20 bg-emerald-950/95 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)] rounded-xl p-3 flex items-center gap-3 animate-bounce">
            <div className="p-2 rounded-lg bg-emerald-500 text-neutral-950 font-black">
              #{unlockedBanner.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold text-emerald-300">
                CDLM Best Practice Mastered!
              </div>
              <div className="text-xs font-bold text-white truncate">{unlockedBanner.title}</div>
            </div>
          </div>
        )}

        {/* HUD */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <GameHUD
            score={stats.score}
            cashDisbursed={stats.cashDisbursed}
            tacticsProgress={stats.tacticsProgress}
            combo={stats.combo}
            shields={stats.shields}
            cdlTier={stats.cdlTier}
            whitelistedHits={stats.whitelistedHits}
            potentialPOS={portfolio.potentialPOS}
            stdRatio={stdRatio}
            excRatio={excRatio}
            elapsedSeconds={stats.elapsedSeconds}
            onPauseToggle={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
            isPaused={gameState === 'paused'}
            onOpenHierarchyGuide={() => setShowHierarchyGuide(true)}
            onOpenPOSHub={() => setShowPOSHub(true)}
            onOpenQuiz={() => setShowQuiz(true)}
          />
        )}

        {/* Canvas & Overlay Stack */}
        <div className="relative w-full max-w-[480px]">
          <GameCanvas
            gameState={gameState}
            onGameOver={handleGameOver}
            onUnlockTactic={handleUnlockTactic}
            onStatsUpdate={handleStatsUpdate}
            soundEnabled={soundEnabled}
            onTriggerEncounter={handleTriggerEncounter}
            activePolicyVersion={activePolicyVersion}
          />

          {/* Start Screen */}
          {gameState === 'start' && (
            <StartScreen
              onStartGame={startGame}
              onOpenHierarchy={() => setShowHierarchyGuide(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenQuiz={() => setShowQuiz(true)}
              onOpenMerchantEncounter={() => setShowMerchantEncounter(true)}
              onOpenPasswordReset={() => setShowPasswordReset(true)}
              onOpenMusicHub={() => setShowMusicHub(true)}
              onOpenPlaybook={() => setShowBestPracticeDocs(true)}
              onOpenCharacterSelect={() => setShowCharacterSelect(true)}
              onOpenBranding={() => setShowBrandingModal(true)}
              selectedCharacterName={selectedCharacter.name}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              highScore={highestScoreVal}
              currentTier={stats.cdlTier}
            />
          )}

          {/* Pause Modal */}
          {gameState === 'paused' && !showMerchantEncounter && (
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 rounded-2xl text-center">
              <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
                ⏸️
              </div>
              <h2 className="text-xl font-black uppercase text-white mb-1">Field Operation Paused</h2>
              <p className="text-xs text-neutral-400 mb-5 max-w-xs leading-relaxed">
                Deploy terminals to boost your Standard/Excellent ratios, take the policy exam, or resume market storming.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => setGameState('playing')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  ▶ RESUME DISBURSEMENT RUN
                </button>
                <button
                  onClick={() => setShowPOSHub(true)}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer"
                >
                  Open POS Deployment &amp; Tier Upgrade Hub
                </button>
                <button
                  onClick={() => setShowMusicHub(true)}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-teal-400" />
                  <span>Soundtrack &amp; Music Player</span>
                </button>
                <button
                  onClick={() => setShowBestPracticeDocs(true)}
                  className="w-full py-2 rounded-xl font-semibold text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>CDLM Best Practices Playbook</span>
                </button>
                <button
                  onClick={() => setShowHierarchyGuide(true)}
                  className="w-full py-2 rounded-xl font-semibold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer"
                >
                  Hierarchy &amp; 12 Sub-Levels Guide
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="w-full py-2 rounded-xl font-semibold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer"
                >
                  Take CDL Policy Exam (Aug 2026)
                </button>
                <button
                  onClick={() => setGameState('start')}
                  className="w-full py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {gameState === 'gameover' && (
            <GameOverModal
              stats={stats}
              onRestart={startGame}
              onSaveScore={handleSaveScore}
              onViewHierarchy={() => setShowHierarchyGuide(true)}
              onViewMerchantEncounters={() => setShowMerchantEncounter(true)}
            />
          )}
        </div>

        {/* Mobile Touch Controls - Ergonomic for 1-hand & 2-hand phone play */}
        <div className="w-full max-w-[480px] mt-1.5 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2 px-1 safe-bottom">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onMouseDown={() => dispatchKey('ArrowLeft', true)}
              onMouseUp={() => dispatchKey('ArrowLeft', false)}
              onTouchStart={(e) => {
                e.preventDefault();
                dispatchKey('ArrowLeft', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                dispatchKey('ArrowLeft', false);
              }}
              className="w-12 sm:w-14 h-10 sm:h-11 rounded-xl bg-neutral-900 border border-emerald-500/30 text-white flex items-center justify-center font-bold active:bg-emerald-600 transition-colors select-none shadow-md touch-btn cursor-pointer"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
            </button>

            <button
              onMouseDown={() => dispatchKey('ArrowRight', true)}
              onMouseUp={() => dispatchKey('ArrowRight', false)}
              onTouchStart={(e) => {
                e.preventDefault();
                dispatchKey('ArrowRight', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                dispatchKey('ArrowRight', false);
              }}
              className="w-12 sm:w-14 h-10 sm:h-11 rounded-xl bg-neutral-900 border border-emerald-500/30 text-white flex items-center justify-center font-bold active:bg-emerald-600 transition-colors select-none shadow-md touch-btn cursor-pointer"
              aria-label="Move Right"
            >
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          <button
            onMouseDown={() => dispatchKey(' ', true)}
            onMouseUp={() => dispatchKey(' ', false)}
            onTouchStart={(e) => {
              e.preventDefault();
              dispatchKey(' ', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              dispatchKey(' ', false);
            }}
            className="flex-1 h-10 sm:h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center gap-1.5 font-bold text-xs active:bg-emerald-500 active:text-neutral-950 transition-all select-none shadow-md touch-btn cursor-pointer"
            aria-label="Turbo Dash"
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">TURBO DASH</span>
          </button>
        </div>
      </main>

      {/* Operational Policy & Official Hamvida Tech Signature Footer */}
      <footer className="max-w-4xl mx-auto px-4 text-center mt-2 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-neutral-400">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Easy Way to Remember:
          </span>
          <span className="text-neutral-200">
            <strong>POS Volume + POS Quality + Loan Performance + Compliance = Tier Advancement!</strong>
          </span>
        </div>

        {/* Official "Made by Hamvida Tech" Signature Banner */}
        <div className="pt-1 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-[#F6D870]/40 shadow-[0_0_15px_rgba(246,216,112,0.15)] hover:border-[#F6D870] transition-colors">
            <HamvidaLogo size={18} />
            <span className="text-xs font-extrabold text-white tracking-tight flex items-center gap-1">
              <span className="text-neutral-400 font-medium">Made by</span>
              <span className="text-[#F6D870] font-black">Hamvida Tech</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Initial Access Gate: Creator vs Registered Staff vs New Registration vs Guest vs DH */}
      {!authRole && (
        <AuthModal
          onSuccessCreatorLogin={handleCreatorLogin}
          onPlayAsGuest={handlePlayAsGuest}
          onSuccessDHLogin={handleSuccessDHLogin}
          onSuccessStaffLogin={handleSelectExistingLogin}
          onOpenStaffRegistration={() => setShowStaffRegistration(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          staffDatabase={staffDatabase}
        />
      )}

      {/* Staff Registration Modal with Intelligent Duplicate Account Check */}
      <StaffRegistrationModal
        isOpen={showStaffRegistration}
        onClose={() => setShowStaffRegistration(false)}
        staffDatabase={staffDatabase}
        onRegisterSuccess={handleRegisterSuccess}
        onSelectExistingLogin={handleSelectExistingLogin}
        onContactAdmin={() => {
          setShowStaffRegistration(false);
          setShowPasswordReset(true);
        }}
      />

      {/* Creator / Admin Manual Override Staff Account Console */}
      <CreatorAdminStaffManager
        isOpen={showCreatorAdminManager}
        onClose={() => setShowCreatorAdminManager(false)}
        staffDatabase={staffDatabase}
        onManualAccountCreated={handleCreatorManualAccountCreated}
      />

      {/* Full Department Head (DH) Performance Oversight & Location Reassignment Dashboard */}
      {authRole === 'dh' && (
        <DHAnalyticsDashboard
          dhName={currentUserName}
          dhStaffCode={dhStaffCode}
          staffDatabase={staffDatabase}
          onUpdateStaffLocation={handleUpdateStaffLocation}
          onOpenGenderAnalytics={() => setShowGenderAnalytics(true)}
          onOpenPolicyEngine={() => setShowPolicyEngine(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Gender Diversity & Performance Analysis Modal (Accessible to Creator & DH) */}
      <GenderAnalyticsModal
        isOpen={showGenderAnalytics}
        onClose={() => setShowGenderAnalytics(false)}
        staffDatabase={staffDatabase}
        viewerRole={authRole === 'creator' ? 'creator' : 'dh'}
        viewerName={currentUserName}
      />

      {/* Policy AI Game Synthesizer, 7 Game Modes & Real-Time History Rollback Modal (Creator & DH) */}
      <PolicyAIEngineModal
        isOpen={showPolicyEngine}
        onClose={() => setShowPolicyEngine(false)}
        userRole={authRole === 'creator' ? 'Creator' : 'DH'}
        userName={currentUserName}
        onApplyNewGameConfig={(snapshot: PolicyVersionSnapshot, isNewGame: boolean) => {
          setActivePolicyVersion(snapshot.versionId);
          if (isNewGame) {
            startGame();
          }
        }}
        onLaunchGameDirectly={(mode) => {
          setShowPolicyEngine(false);
          if (mode === 'market_stormer' || mode === 'speed_disbursement') {
            startGame();
          } else if (mode === 'merchant_dossier' || mode === 'objection_duel') {
            setShowMerchantEncounter(true);
          } else if (mode === 'tribunal_survival') {
            setTribunalTriggered({ active: true, reason: 'High-Stakes Warning Tier Defense Scenario' });
          } else if (mode === 'terminal_empire') {
            setShowPOSHub(true);
          } else if (mode === 'vfo_forensics') {
            setShowQuiz(true);
          } else {
            startGame();
          }
        }}
      />

      {/* Modals */}
      {showPasswordReset && (
        <PasswordResetPortal
          onClose={() => setShowPasswordReset(false)}
        />
      )}

      {showPOSHub && (
        <POSDeploymentHub
          portfolio={portfolio}
          onDeployPOS={handleDeployPOS}
          onClose={() => setShowPOSHub(false)}
        />
      )}

      {showHierarchyGuide && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <HierarchyGuide
            currentTier={stats.cdlTier}
            onClose={() => setShowHierarchyGuide(false)}
          />
        </div>
      )}

      {showMerchantEncounter && (
        <MerchantEncounterModal
          currentTier={stats.cdlTier}
          onDecisionMade={handleEncounterDecision}
          onClose={() => {
            setShowMerchantEncounter(false);
            if (gameState === 'paused') setGameState('playing');
          }}
        />
      )}

      {showQuiz && (
        <PolicyQuizModal
          currentTier={stats.cdlTier}
          onQuizCompleted={handleQuizCompleted}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          scores={highScores}
          onClose={() => setShowLeaderboard(false)}
          onClearScores={handleClearScores}
        />
      )}

      {/* Audio & Music Soundtrack Studio */}
      <AudioMusicHub
        isOpen={showMusicHub}
        onClose={() => setShowMusicHub(false)}
        currentTrack={currentMusicTrack}
        onTrackChange={handleTrackChange}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Official CDLM Best Practice Field Playbook */}
      <BestPracticeDocsModal
        isOpen={showBestPracticeDocs}
        onClose={() => setShowBestPracticeDocs(false)}
      />

      {/* Selectable Character Runner Modal */}
      <CharacterSelectModal
        isOpen={showCharacterSelect}
        onClose={() => setShowCharacterSelect(false)}
        onSelectCharacter={(char) => {
          setSelectedCharacter(char);
          setShowCharacterSelect(false);
        }}
      />

      {/* Company Branding & Logo Customizer Modal */}
      <CompanyBrandingModal
        isOpen={showBrandingModal}
        onClose={() => setShowBrandingModal(false)}
        onUpdateBranding={(newBranding) => {
          setCompanyBranding(newBranding);
        }}
      />

      {/* Disciplinary Warning Tier Tribunal (Section 8 Options Modal) */}
      {tribunalTriggered.active && (
        <DisciplinaryTribunalModal
          score={stats.score}
          cashDisbursed={stats.cashDisbursed}
          cdlTier={stats.cdlTier}
          reason={tribunalTriggered.reason}
          onSelectResolution={(_fate: PenaltyFateOption, _details: string) => {
            // Handled inside modal, then player can restart
          }}
          onRestartNewCareer={() => {
            setTribunalTriggered({ active: false, reason: '' });
            startGame();
          }}
        />
      )}
    </div>
  );
}

export default App;
