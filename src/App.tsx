import { useState, useEffect, useCallback } from 'react';
import { GameHUD } from './components/GameHUD';
import { CharacterSelect } from './components/CharacterSelect';
import { CareerRunCanvas, CareerGameState, FieldQuestion, submitCareerAnswer } from './components/CareerRunCanvas';
import { FateModal } from './components/FateModal';
import { PlayableCharacter, RunStats, CharacterId, CareerFate, RICH_LABELS } from './types/careerRun';
import { HierarchyGuide } from './components/HierarchyGuide';
import { MerchantEncounterModal } from './components/MerchantEncounterModal';
import { PolicyQuizModal } from './components/PolicyQuizModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { POSDeploymentHub } from './components/POSDeploymentHub';
import { AuthModal } from './components/AuthModal';
import { OPayLogo } from './components/OPayLogo';
import { HamvidaBrand } from './components/HamvidaBrand';
import { PasswordResetPortal } from './components/PasswordResetPortal';
import { FeedbackBoard } from './components/FeedbackBoard';
import { MusicPlayer } from './components/MusicPlayer';
import { DHAnalyticsDashboard } from './components/DHAnalyticsDashboard';
import { CreatorStaffAdmin } from './components/CreatorStaffAdmin';
import { PolicyGameStudio } from './components/PolicyGameStudio';
import { migrateLegacyDhAccounts } from './types/staffRegistry';
import { loadActiveConfig, GameRuntimeConfig } from './types/gameVersioning';
import { HighScoreEntry } from './types/tactics';
import { CDLPortfolioState, calculateCDLTier } from './types/cdlFullEngine';
import { AppLanguage, UserAssistPrefs, defaultPrefs } from './i18n/translations';
import { DH_SESSION_KEY } from './types/dhAnalytics';
import { soundManager } from './utils/sound';
import { storageGet, storageSet, storageRemove, sessionGet, sessionSet } from './utils/browserCompat';
import { Volume2, VolumeX, Building2, Store, FileQuestion, Trophy, Server, ArrowLeft, ArrowRight, Zap, Award, KeyRound, LogOut, ShieldCheck, MessageSquarePlus, Music2, Users, Sparkles } from 'lucide-react';

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
  const [gameState, setGameState] = useState<CareerGameState>('start');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayableCharacter | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<FieldQuestion | null>(null);
  const [chosenFate, setChosenFate] = useState<CareerFate | null>(null);
  
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

  const [stats, setStats] = useState<RunStats>({
    score: 0,
    wealth: 200000,
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
    distanceM: 0,
    rightAnswers: 0,
    wrongAnswers: 0,
    characterId: 'chioma_hustle',
    richLevel: 0,
  });

  // Authentication session: null | creator | guest | dh
  const [authRole, setAuthRole] = useState<'creator' | 'guest' | 'dh' | null>(() => {
    return (storageGet('opay_auth_role') as 'creator' | 'guest' | 'dh') || null;
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return storageGet('opay_user_name') || 'Guest Field Officer';
  });
  const [dhStaffCode, setDhStaffCode] = useState<string>(() => {
    try {
      const s = storageGet(DH_SESSION_KEY);
      return s ? JSON.parse(s).staffCode || '' : '';
    } catch {
      return '';
    }
  });
  // Default language is always English until THIS user chooses otherwise
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (sessionGet('opay_session_language') as AppLanguage) || 'en';
  });
  const [userPrefs, setUserPrefs] = useState<UserAssistPrefs>(() => defaultPrefs());
  const [userPrefsKey, setUserPrefsKey] = useState<string>('guest:default');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHierarchyGuide, setShowHierarchyGuide] = useState<boolean>(false);
  const [showMerchantEncounter, setShowMerchantEncounter] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showPOSHub, setShowPOSHub] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);
  const [showStaffAdmin, setShowStaffAdmin] = useState<boolean>(false);
  const [showGameStudio, setShowGameStudio] = useState<boolean>(false);
  const [activeGameConfig, setActiveGameConfig] = useState<GameRuntimeConfig>(() => loadActiveConfig());
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showMusicDeck, setShowMusicDeck] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<RankedEntry[]>([]);
  const [unlockedBanner, setUnlockedBanner] = useState<{ title: string; step: number } | null>(null);

  const handleCreatorLogin = (creatorName: string) => {
    soundManager.unlock();
    soundManager.playLoginSuccess();
    setAuthRole('creator');
    setCurrentUserName(creatorName);
    storageSet('opay_auth_role', 'creator');
    storageSet('opay_user_name', creatorName);
    // Start a confident creator track
    setTimeout(() => soundManager.startMusic('gold_tier_groove'), 250);
  };

  const handlePlayAsGuest = () => {
    soundManager.unlock();
    soundManager.playUiOpen();
    setAuthRole('guest');
    setCurrentUserName('Guest Field Officer');
    storageSet('opay_auth_role', 'guest');
    storageSet('opay_user_name', 'Guest Field Officer');
    storageRemove(DH_SESSION_KEY);
    setTimeout(() => soundManager.startMusic('market_pulse'), 250);
  };

  const handleDHLogin = (dhName: string, staffCode: string) => {
    soundManager.unlock();
    setAuthRole('dh');
    setCurrentUserName(dhName);
    setDhStaffCode(staffCode);
    storageSet('opay_auth_role', 'dh');
    storageSet('opay_user_name', dhName);
    storageSet(DH_SESSION_KEY, JSON.stringify({ name: dhName, staffCode }));
    setTimeout(() => soundManager.startMusic('compliance_calm'), 250);
  };

  const handleLogout = () => {
    setAuthRole(null);
    setDhStaffCode('');
    storageRemove('opay_auth_role');
    storageRemove('opay_user_name');
    storageRemove(DH_SESSION_KEY);
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    // Session-only: does not force language onto other users/devices
    setLanguage(lang);
    sessionSet('opay_session_language', lang);
  };

  const handlePrefsSaved = (prefs: UserAssistPrefs, userKey: string) => {
    setUserPrefs(prefs);
    setUserPrefsKey(userKey);
    setLanguage(prefs.language || 'en');
    soundManager.setSfxEnabled(prefs.soundOn);
    sessionSet('opay_session_language', prefs.language || 'en');
    sessionSet('opay_user_prefs_key', userKey);
  };

  // Sync assessed tier from real-time portfolio equation
  useEffect(() => {
    const assessed = calculateCDLTier(portfolio);
    setStats((prev) => ({
      ...prev,
      cdlTier: assessed,
    }));
  }, [portfolio]);

  // Preserve existing data; migrate legacy DH accounts into unified staff registry
  // Also run once-daily Nigeria states geography check (36 + FCT; expands if updated)
  useEffect(() => {
    migrateLegacyDhAccounts();
    import('./types/nigeriaGeography').then(({ checkNigeriaGeoUpdateOncePerDay }) => {
      checkNigeriaGeoUpdateOncePerDay().catch(() => {
        // offline-safe
      });
    });
  }, []);

  // Load high scores
  useEffect(() => {
    try {
      const saved = storageGet(HIGH_SCORES_KEY);
      if (saved) {
        setHighScores(rankEntries(JSON.parse(saved)));
      } else {
        setHighScores(INITIAL_CDL_LEADERBOARD);
        storageSet(HIGH_SCORES_KEY, JSON.stringify(INITIAL_CDL_LEADERBOARD));
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
    storageSet(HIGH_SCORES_KEY, JSON.stringify(updated));
  };

  const handleClearScores = () => {
    setHighScores([]);
    storageRemove(HIGH_SCORES_KEY);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSfxEnabled(next);
    if (next) soundManager.playUiTap();
  };

  const startGame = () => {
    soundManager.unlock();
    soundManager.playUiOpen();
    setChosenFate(null);
    setActiveQuestion(null);
    setGameState('start');
    setUnlockedBanner(null);
  };

  const beginRunWithCharacter = (character: PlayableCharacter) => {
    setSelectedCharacter(character);
    setStats((prev) => ({
      ...prev,
      characterId: character.id,
      wealth: character.startCash,
      cashDisbursed: character.startCash,
      score: 0,
      tacticsProgress: 0,
      combo: 0,
      wrongAnswers: 0,
      rightAnswers: 0,
      distanceM: 0,
      richLevel: 0,
      cdlTier: 'Bronze 1',
    }));
    soundManager.startMusic('field_storm');
    setGameState('playing');
  };

  const handleGameOver = useCallback((finalStats: RunStats) => {
    setStats(finalStats);
    setActiveQuestion(null);
    setGameState('fate');
    soundManager.playGameOver();
  }, []);

  const handleVictory = useCallback((finalStats: RunStats) => {
    setStats({ ...finalStats, fate: 'gold_glory' });
    setActiveQuestion(null);
    setGameState('victory');
    soundManager.playVictory();
    soundManager.startMusic('victory_cashout');
    setPortfolio((prev) => ({
      ...prev,
      recentLoansSold: prev.recentLoansSold + 2,
      totalEarnings: prev.totalEarnings + finalStats.wealth,
      complianceScore: Math.min(100, prev.complianceScore + 10),
    }));
  }, []);

  const handleStatsUpdate = useCallback((newStats: RunStats) => {
    setStats(newStats);
    if (newStats.tacticsProgress > 0 && newStats.tacticsProgress !== stats.tacticsProgress) {
      setUnlockedBanner({ title: `Checkpoint ${newStats.tacticsProgress}/6`, step: newStats.tacticsProgress });
      setTimeout(() => setUnlockedBanner(null), 2500);
    }
  }, [stats.tacticsProgress]);

  const handleTriggerQuestion = useCallback((q: FieldQuestion) => {
    setActiveQuestion(q);
    soundManager.playUiOpen();
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

  // DH users land on analytics only
  if (authRole === 'dh') {
    return (
      <>
        <DHAnalyticsDashboard
          dhName={currentUserName}
          staffCode={dhStaffCode}
          language={language}
          onLogout={handleLogout}
          onOpenSimulatorObserve={() => {
            // Observe as guest without losing DH session record — soft switch
            setAuthRole('guest');
            storageSet('opay_auth_role', 'guest');
          }}
          onOpenGameStudio={() => setShowGameStudio(true)}
        />
        {showGameStudio && (
          <PolicyGameStudio
            actorRole="DH"
            actorName={currentUserName}
            actorId={dhStaffCode}
            onClose={() => {
              soundManager.playUiClose();
              setShowGameStudio(false);
            }}
            onConfigActivated={(cfg) => setActiveGameConfig(cfg)}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={`app-shell bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-neutral-950 font-sans ${
        userPrefs.largeText ? 'text-assist-lg' : ''
      } ${userPrefs.reduceMotion ? 'motion-reduce' : ''}`}
      data-user-prefs={userPrefsKey}
      data-slower-pace={userPrefs.slowerPace ? '1' : '0'}
    >
      {/* Top Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20 app-header-sticky">
        <div className="max-w-5xl mx-auto safe-px py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="px-1.5 sm:px-2 py-1 rounded-lg bg-white shadow-[0_0_15px_rgba(29,206,159,0.35)] flex items-center shrink-0">
              <OPayLogo height={18} variant="dark" className="sm:hidden" />
              <span className="hidden sm:inline-flex">
                <OPayLogo height={22} variant="dark" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-[11px] xs:text-xs sm:text-sm tracking-tight text-white truncate">
                <span className="sm:hidden">OPay Field Operations</span>
                <span className="hidden sm:inline">OPAY FIELD OPERATIONS APP</span>
              </div>
              <div className="text-[9px] text-violet-300/90 truncate hidden sm:block">
                Live mode: {activeGameConfig.title}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 min-w-0">
                {authRole === 'creator' ? (
                  <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/20 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/30 truncate max-w-[52vw] sm:max-w-none">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Creator: {currentUserName}</span>
                  </span>
                ) : (
                  <span className="text-neutral-400 truncate max-w-[52vw] sm:max-w-none">
                    User: {currentUserName}
                  </span>
                )}
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline uppercase tracking-wide text-neutral-500">{language}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto no-scrollbar max-w-[48%] sm:max-w-none">
            <button
              onClick={() => setShowPOSHub(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Deploy POS & Improve Tier"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Deploy POS</span>
            </button>

            <button
              onClick={() => setShowHierarchyGuide(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Hierarchy & Tiers"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Hierarchy</span>
            </button>

            <button
              onClick={() => setShowMerchantEncounter(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 hidden xs:flex"
              title="Merchant Scenarios"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Scenarios</span>
            </button>

            <button
              onClick={() => setShowQuiz(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Policy Exam"
            >
              <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Exam</span>
            </button>

            <button
              onClick={() => {
                soundManager.playUiOpen();
                setShowMusicDeck(true);
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Music playlist & volumes"
            >
              <Music2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Music</span>
            </button>

            <button
              onClick={() => {
                soundManager.playUiOpen();
                setShowFeedback(true);
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Leave or review feedback"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Feedback</span>
            </button>

            {authRole === 'creator' && (
              <>
                <button
                  onClick={() => {
                    soundManager.playUiOpen();
                    setShowGameStudio(true);
                  }}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Policy → Game Studio + Version History"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  <span className="hidden lg:inline">Game Studio</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playUiOpen();
                    setShowStaffAdmin(true);
                  }}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Creator / Admin: Staff Registry"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Staff Admin</span>
                </button>
                <button
                  onClick={() => setShowPasswordReset(true)}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Creator / Admin: Reset CDL Passwords"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Reset Pass</span>
                </button>
              </>
            )}

            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer active:scale-95 transition-all shrink-0"
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
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Switch Account / Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center safe-px py-2 w-full max-w-xl mx-auto relative min-w-0">
        {/* Floating Unlock Banner */}
        {unlockedBanner && gameState === 'playing' && (
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-20 bg-emerald-950/95 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)] rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 animate-bounce">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500 text-neutral-950 font-black text-sm shrink-0">
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
            cashDisbursed={stats.wealth}
            tacticsProgress={stats.tacticsProgress}
            combo={stats.combo}
            shields={stats.shields}
            cdlTier={stats.cdlTier}
            whitelistedHits={stats.rightAnswers}
            potentialPOS={portfolio.potentialPOS}
            stdRatio={stdRatio}
            excRatio={excRatio}
            elapsedSeconds={stats.elapsedSeconds}
            onPauseToggle={() => {
              if (gameState === 'playing') {
                soundManager.playPause();
                setGameState('paused');
              } else {
                soundManager.playResume();
                soundManager.startMusic('field_storm');
                setGameState('playing');
              }
            }}
            isPaused={gameState === 'paused'}
            onOpenHierarchyGuide={() => {
              soundManager.playUiOpen();
              setShowHierarchyGuide(true);
            }}
            onOpenPOSHub={() => {
              soundManager.playUiOpen();
              setShowPOSHub(true);
            }}
            onOpenQuiz={() => {
              soundManager.playUiOpen();
              soundManager.startMusic('compliance_calm');
              setShowQuiz(true);
            }}
          />
        )}

        {/* Canvas & Overlay Stack */}
        <div className="relative game-stage w-full min-w-0">
          <CareerRunCanvas
            gameState={gameState === 'fate' ? 'gameover' : gameState}
            characterId={(selectedCharacter?.id || stats.characterId) as CharacterId}
            soundEnabled={soundEnabled}
            onStatsUpdate={handleStatsUpdate}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onTriggerQuestion={handleTriggerQuestion}
          />

          {/* Character Select / Start */}
          {gameState === 'start' && (
            <CharacterSelect
              highScore={highestScoreVal}
              onConfirm={beginRunWithCharacter}
              onOpenTactics={() => setShowHierarchyGuide(true)}
            />
          )}

          {/* In-run question gate */}
          {activeQuestion && gameState === 'playing' && (
            <div className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-md rounded-xl p-3 sm:p-4 flex flex-col justify-end sm:justify-center">
              <div className="bg-neutral-900 border border-amber-400/40 rounded-2xl p-4 shadow-2xl max-w-md mx-auto w-full">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Field Decision Gate</div>
                <h3 className="text-sm font-black text-white mb-3 leading-snug">{activeQuestion.prompt}</h3>
                <div className="space-y-2">
                  {activeQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        submitCareerAnswer(opt.correct);
                        setActiveQuestion(null);
                        if (opt.correct) {
                          setPortfolio((prev) => ({
                            ...prev,
                            recentLoansSold: prev.recentLoansSold + 1,
                            complianceScore: Math.min(100, prev.complianceScore + 3),
                          }));
                        } else {
                          setPortfolio((prev) => ({
                            ...prev,
                            complianceScore: Math.max(0, prev.complianceScore - 8),
                            warningStrikes: prev.warningStrikes + (opt.correct ? 0 : 0),
                          }));
                        }
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-emerald-400 text-xs text-neutral-100 cursor-pointer"
                    >
                      <span className="font-mono text-emerald-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pause Modal */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 rounded-2xl text-center">
              <h2 className="text-xl font-black uppercase text-white mb-1">Run Paused</h2>
              <p className="text-xs text-neutral-400 mb-5 max-w-xs">Catch your breath. Resume the money lane or open tools.</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => {
                    soundManager.playResume();
                    soundManager.startMusic('field_storm');
                    setGameState('playing');
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-neutral-950 cursor-pointer"
                >
                  ▶ RESUME CAREER RUN
                </button>
                <button onClick={() => setShowPOSHub(true)} className="w-full py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer">
                  POS Hub
                </button>
                <button onClick={() => setGameState('start')} className="w-full py-2 rounded-xl text-xs text-neutral-400 cursor-pointer">
                  Character Select
                </button>
              </div>
            </div>
          )}

          {/* Fate / Victory */}
          {(gameState === 'fate' || gameState === 'victory') && (
            <FateModal
              stats={stats}
              victory={gameState === 'victory'}
              onRestart={startGame}
              onChooseFate={(fate) => {
                setChosenFate(fate);
                setStats((prev) => ({ ...prev, fate }));
                setGameState('gameover');
              }}
            />
          )}

          {gameState === 'gameover' && chosenFate && (
            <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl mb-2">
                {chosenFate === 'sacked' ? '⛔' : chosenFate === 'merge_big_cdl' ? '🤝' : chosenFate === 'join_bd_team' ? '🏢' : '🚪'}
              </div>
              <h2 className="text-xl font-black text-white mb-1">
                {chosenFate === 'sacked'
                  ? 'Sacked by OPay'
                  : chosenFate === 'merge_big_cdl'
                  ? 'Merged with Big CDL'
                  : chosenFate === 'join_bd_team'
                  ? 'Joined BD / Direct POS Team'
                  : 'Sold Merchants & Resigned'}
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mb-2">
                Final wealth ₦{stats.wealth.toLocaleString()} · {RICH_LABELS[stats.richLevel]} · {stats.distanceM}m · Score {stats.score.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-500 max-w-sm mb-4">
                This mirrors real CDL New Policy exit options after Warning-tier collapse or repeated failure.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleSaveScore(
                    selectedCharacter?.name || currentUserName,
                    stats.score,
                    stats.tacticsProgress,
                    stats.cashDisbursed,
                    stats.cdlTier,
                    stats.elapsedSeconds
                  );
                  startGame();
                }}
                className="w-full max-w-sm py-3 rounded-xl bg-emerald-400 text-neutral-950 font-black text-sm cursor-pointer"
              >
                Save Run &amp; Choose New Character
              </button>
            </div>
          )}
        </div>

        {/* Mobile Touch Controls + Mini Music Deck */}
        <div className="w-full game-stage mt-2 flex flex-col gap-2 safe-pb">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
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
                className="w-12 sm:w-14 h-11 rounded-xl bg-neutral-900 border border-emerald-500/30 text-white flex items-center justify-center font-bold active:bg-emerald-600 transition-colors select-none shadow-md"
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
                className="w-12 sm:w-14 h-11 rounded-xl bg-neutral-900 border border-emerald-500/30 text-white flex items-center justify-center font-bold active:bg-emerald-600 transition-colors select-none shadow-md"
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
              className="flex-1 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center gap-1.5 font-bold text-[11px] sm:text-xs active:bg-emerald-500 active:text-neutral-950 transition-all select-none shadow-md cursor-pointer"
              aria-label="Turbo Dash"
            >
              <Zap className="w-4 h-4 text-amber-400" />
            <span>JUMP / DASH</span>
          </button>
          </div>

          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <MusicPlayer compact />
            </div>
            <button
              onClick={() => {
                soundManager.playUiOpen();
                setShowMusicDeck(true);
              }}
              className="px-2.5 sm:px-3 h-9 rounded-lg bg-neutral-900 border border-emerald-500/30 text-[10px] sm:text-[11px] font-semibold text-emerald-300 cursor-pointer hover:bg-neutral-800 shrink-0"
            >
              Music Deck
            </button>
          </div>
          <div className="text-[10px] text-center text-neutral-500">
            Lanes ← → · Jump Space/Center · Get rich with ✓ answers · Wrong answers = poor path / fate options
          </div>
        </div>
      </main>

      {/* Operational Policy Strip + Company credit */}
      <footer className="max-w-4xl mx-auto safe-px text-center mt-3 safe-pb">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-[11px] text-neutral-400 compact-landscape-hide mb-3">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Easy Way to Remember:
          </span>
          <span className="text-neutral-200">
            <strong>POS Volume + POS Quality + Loan Performance + Compliance = Tier Advancement!</strong>
          </span>
        </div>
        <div className="border-t border-neutral-900 pt-3 pb-1">
          <HamvidaBrand />
        </div>
      </footer>

      {/* Initial Access Gate: Creator / DH / Guest + Language */}
      {!authRole && (
        <AuthModal
          language={language}
          onLanguageChange={handleLanguageChange}
          onSuccessCreatorLogin={handleCreatorLogin}
          onPlayAsGuest={handlePlayAsGuest}
          onSuccessDHLogin={handleDHLogin}
          onPrefsSaved={handlePrefsSaved}
        />
      )}

      {/* Modals */}
      {showMusicDeck && (
        <div className="modal-layer">
          <div className="w-full max-w-md">
            <MusicPlayer onClose={() => setShowMusicDeck(false)} />
          </div>
        </div>
      )}

      {showFeedback && (
        <FeedbackBoard
          isCreator={authRole === 'creator'}
          currentUserName={currentUserName}
          onClose={() => {
            soundManager.playUiClose();
            setShowFeedback(false);
          }}
        />
      )}

      {showStaffAdmin && authRole === 'creator' && (
        <CreatorStaffAdmin
          adminName={currentUserName}
          onClose={() => {
            soundManager.playUiClose();
            setShowStaffAdmin(false);
          }}
        />
      )}

      {showGameStudio && authRole === 'creator' && (
        <PolicyGameStudio
          actorRole="Creator"
          actorName={currentUserName}
          actorId="creator"
          onClose={() => {
            soundManager.playUiClose();
            setShowGameStudio(false);
          }}
          onConfigActivated={(cfg) => {
            setActiveGameConfig(cfg);
          }}
        />
      )}

      {showPasswordReset && authRole === 'creator' && (
        <PasswordResetPortal
          onClose={() => setShowPasswordReset(false)}
        />
      )}

      {showPOSHub && (
        <POSDeploymentHub
          portfolio={portfolio}
          onDeployPOS={handleDeployPOS}
          onClose={() => {
            soundManager.playUiClose();
            setShowPOSHub(false);
          }}
        />
      )}

      {showHierarchyGuide && (
        <div className="modal-layer">
          <div className="w-full max-w-3xl modal-card">
            <div className="modal-card-body p-0">
              <HierarchyGuide
                currentTier={stats.cdlTier}
                onClose={() => {
                  soundManager.playUiClose();
                  setShowHierarchyGuide(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showMerchantEncounter && (
        <MerchantEncounterModal
          currentTier={stats.cdlTier}
          onDecisionMade={handleEncounterDecision}
          onClose={() => {
            soundManager.playUiClose();
            setShowMerchantEncounter(false);
            if (gameState === 'paused') {
              soundManager.startMusic('field_storm');
              setGameState('playing');
            }
          }}
        />
      )}

      {showQuiz && (
        <PolicyQuizModal
          currentTier={stats.cdlTier}
          onQuizCompleted={handleQuizCompleted}
          onClose={() => {
            soundManager.playUiClose();
            if (gameState === 'playing') soundManager.startMusic('field_storm');
            setShowQuiz(false);
          }}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          scores={highScores}
          onClose={() => setShowLeaderboard(false)}
          onClearScores={handleClearScores}
        />
      )}
    </div>
  );
}

export default App;
