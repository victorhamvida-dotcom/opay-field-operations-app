import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Check, 
  Clock, 
  Calendar, 
  History, 
  Play, 
  Layers, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Cpu,
  PlusCircle,
  Target,
  UploadCloud
} from 'lucide-react';
import { 
  PolicyVersionSnapshot, 
  SimulationGameMode, 
  PolicyGeneratedItem,
  GameRecommendation,
  OFFICIAL_GAME_MODES,
  analyzeDocumentAndRecommendGames, 
  getSavedPolicySnapshots, 
  saveNewPolicySnapshot, 
  rollbackToVersionSnapshot, 
  getActivePolicySnapshot 
} from '../types/policyGameEngine';
import { soundManager } from '../utils/sound';

interface PolicyAIEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'Creator' | 'DH';
  userName: string;
  onApplyNewGameConfig: (snapshot: PolicyVersionSnapshot, isNewGame: boolean) => void;
  onLaunchGameDirectly?: (mode: SimulationGameMode) => void;
}

export const PolicyAIEngineModal: React.FC<PolicyAIEngineModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName,
  onApplyNewGameConfig,
  onLaunchGameDirectly,
}) => {
  // Navigation tabs: 'document_analyzer' | 'seven_game_catalog' | 'creator_studio' | 'version_history' | 'active_preview'
  const [activeTab, setActiveTab] = useState<'document_analyzer' | 'seven_game_catalog' | 'creator_studio' | 'version_history' | 'active_preview'>('document_analyzer');
  
  // Real-time Clock display
  const [currentRealTime, setCurrentRealTime] = useState(new Date());
  
  // Form input state
  const [policyInputText, setPolicyInputText] = useState('');
  const [customVersionName, setCustomVersionName] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState<SimulationGameMode>('market_stormer');
  
  // AI analysis output preview with 7 game recommendations
  const [analysisResult, setAnalysisResult] = useState<{
    suggestedTitle: string;
    extractedKeywords: string[];
    recommendations: GameRecommendation[];
    topRecommendedMode: SimulationGameMode;
    generatedItems: PolicyGeneratedItem[];
    expertModernCritique: string;
  } | null>(null);

  // Version history & active snapshot
  const [snapshots, setSnapshots] = useState<PolicyVersionSnapshot[]>([]);
  const [activeSnapshot, setActiveSnapshot] = useState<PolicyVersionSnapshot>(() => getActivePolicySnapshot());
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Creator Studio: Custom Game Builder State
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'Action Runner' | 'Deep Underwriting' | 'Crisis Survival' | 'Speed Time-Attack' | 'Strategy & Math' | 'Roleplay Duel' | 'Forensic Audit'>('Roleplay Duel');
  const [newGameTagline, setNewGameTagline] = useState('');
  const [newGameRules, setNewGameRules] = useState('');
  const [customGamesList, setCustomGamesList] = useState<{ id: string; title: string; category: string; rules: string }[]>(() => {
    try {
      const saved = localStorage.getItem('opay_creator_custom_games_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Real-time clock update (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load history on open
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = () => {
    const history = getSavedPolicySnapshots();
    const active = getActivePolicySnapshot();
    setSnapshots(history);
    setActiveSnapshot(active);
  };

  if (!isOpen) return null;

  // Real-time formatted strings (Day, Month, Year, HH:MM:SS AM/PM)
  const liveDateStr = currentRealTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const liveTimeStr = currentRealTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const liveYear = currentRealTime.getFullYear();

  // Run AI analysis & game matching on uploaded/pasted text
  const handleAnalyzeText = () => {
    if (!policyInputText.trim()) {
      alert('Please paste a policy clause, SOP, or training document first.');
      return;
    }
    soundManager.playCollect(1.4);
    const result = analyzeDocumentAndRecommendGames(policyInputText);
    setAnalysisResult(result);
    setSelectedGameMode(result.topRecommendedMode);
    if (!customVersionName) {
      setCustomVersionName(`V${(snapshots.length + 1).toFixed(1)} - ${result.suggestedTitle.slice(0, 36)}`);
    }
  };

  // Option A: Upgrade the current game with new rules
  const handleUpgradeCurrentGame = () => {
    if (!analysisResult) return;
    saveAndDispatch(false, 'Live Game Upgraded with New Policy Directives!');
  };

  // Option B: Start a completely fresh game run with new policy
  const handleStartNewGame = () => {
    if (!analysisResult) return;
    saveAndDispatch(true, 'New Game Run Initialized with Fresh Policy Directives!');
  };

  const saveAndDispatch = (startFresh: boolean, toastMsg: string) => {
    if (!analysisResult) return;

    const newSnapshot = saveNewPolicySnapshot({
      versionName: customVersionName.trim() || `V${(snapshots.length + 1).toFixed(1)} - ${analysisResult.suggestedTitle}`,
      policyTitle: analysisResult.suggestedTitle,
      rawPolicyText: policyInputText.trim(),
      mode: selectedGameMode,
      authorName: userName,
      authorRole: userRole,
      generatedItemsCount: analysisResult.generatedItems.length,
      items: analysisResult.generatedItems,
      recommendations: analysisResult.recommendations,
      appliedAsActive: true,
      notes: analysisResult.expertModernCritique,
    });

    soundManager.playTierUpgradeFanfare();
    refreshData();
    setActionSuccessNotice(toastMsg);
    onApplyNewGameConfig(newSnapshot, startFresh);
    setTimeout(() => {
      setActionSuccessNotice(null);
      onClose();
    }, 1800);
  };

  // Rollback to a past date & time snapshot
  const handleRollback = (targetVersionId: string) => {
    const rolled = rollbackToVersionSnapshot(targetVersionId);
    if (rolled) {
      soundManager.playStampApproval();
      refreshData();
      setActionSuccessNotice(`System successfully rolled back to ${rolled.versionName} (${rolled.dateDisplay} ${rolled.timeDisplay})`);
      onApplyNewGameConfig(rolled, true);
      setTimeout(() => setActionSuccessNotice(null), 3500);
    }
  };

  // Creator Studio: Add New Custom Game Mode
  const handleCreateCustomGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim() || !newGameRules.trim()) {
      alert('Please provide a Title and Training Rules for the new game.');
      return;
    }

    const newCustomGame = {
      id: `custom-game-${Date.now()}`,
      title: newGameTitle.trim(),
      category: newGameCategory,
      rules: newGameRules.trim(),
    };

    const updated = [newCustomGame, ...customGamesList];
    setCustomGamesList(updated);
    try {
      localStorage.setItem('opay_creator_custom_games_v1', JSON.stringify(updated));
    } catch {}

    soundManager.playStampApproval();
    setActionSuccessNotice(`New Game Type "${newCustomGame.title}" successfully added to Platform Catalog!`);
    setNewGameTitle('');
    setNewGameTagline('');
    setNewGameRules('');
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-2xl z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto safe-top safe-bottom">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-emerald-500/50 rounded-3xl w-full max-w-5xl p-5 sm:p-7 text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto my-auto">
        
        {/* ==================================================== */}
        {/* HEADER WITH REAL-TIME DATE, TIME & YEAR TRACKER */}
        {/* ==================================================== */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  OPay Policy AI Game Synthesizer &amp; Multi-Game Studio
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  {userRole.toUpperCase()} CLEARANCE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Upload or paste any SOP/Policy → AI recommends best of 7 game types • Rollback across time • Creator Game Builder
              </p>
            </div>
          </div>

          {/* Real-Time Live Clock Badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
              <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE REAL-TIME AUDIT</span>
              </div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  {liveDateStr}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300 font-mono">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {liveTimeStr}
                </span>
                <span className="text-[10px] bg-neutral-800 px-1 rounded text-neutral-400 font-mono">
                  {liveYear}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notice */}
        {actionSuccessNotice && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-xs sm:text-sm text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 pt-3 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('document_analyzer');
            }}
            className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'document_analyzer'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Document Analyzer &amp; DH Game Suggestions</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('seven_game_catalog');
            }}
            className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seven_game_catalog'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Catalog of 7 Game Types</span>
          </button>

          {/* Exclusive Creator Studio Tab */}
          {userRole === 'Creator' && (
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('creator_studio');
              }}
              className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'creator_studio'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-amber-500/70 hover:text-amber-300'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Creator Studio (Build New Games)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('version_history');
            }}
            className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'version_history'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>4. Real-Time Version History &amp; Rollback ({snapshots.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('active_preview');
            }}
            className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'active_preview'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5. Active Policy Snapshot</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: DOCUMENT ANALYZER & DH GAME SUGGESTIONS */}
        {/* ==================================================== */}
        {activeTab === 'document_analyzer' && (
          <div className="py-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1 text-xs">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload or Paste Policy Document / SOP:</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                When you or the Department Head upload a directive, our engine analyzes the criteria and automatically suggests which of the <strong>7 distinct game modes</strong> is best suited to train officers on this document.
              </p>
            </div>

            {/* Document Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Paste SOP, Memo or Credit Guidelines Text:</span>
                <span className="text-[10px] text-neutral-500 font-mono">{policyInputText.length} characters</span>
              </label>
              <textarea
                rows={5}
                placeholder="Paste any SOP, merchant loan directive, or tiering policy text here..."
                value={policyInputText}
                onChange={(e) => setPolicyInputText(e.target.value)}
                className="w-full bg-neutral-950 border-2 border-neutral-800 focus:border-emerald-400 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none font-sans"
              />
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500 text-[11px]">Test-run Sample Documents:</span>
              <button
                type="button"
                onClick={() => setPolicyInputText(`OPAY FMCG MARKET STORMING & SWEEP PROTOCOL:
• Field CDLs must execute market-to-market sweeps in high-density junctions.
• Prioritize provision stores, chemist shops, and bakeries with continuous customer footfall.
• Avoid empty kiosks and dead stalls to prevent default risks.`)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-300 text-[11px] cursor-pointer"
              >
                Sample 1: Market Storming SOP
              </button>

              <button
                type="button"
                onClick={() => setPolicyInputText(`VFO PREPARATION & ANTI-FRAUD INSPECTION STANDARD:
• Inspect applicant CAC certificate, 2-year shop tenancy agreement, and utility bills before VFO arrival.
• Zero tolerance for artificial volume stacking or kickback extortion.
• Violations trigger immediate warning tier tribunal demotion.`)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-purple-300 text-[11px] cursor-pointer"
              >
                Sample 2: VFO & Anti-Fraud Audit
              </button>

              <button
                type="button"
                onClick={() => setPolicyInputText(`SALES OBJECTION HANDLING & MERCHANT PSYCHOLOGY:
• Open by understanding working capital needs before mentioning loan product interest rates.
• Address religious or interest rate doubts by explaining inventory turnover profits.
• Utilize satisfied borrower referral evangelism to build authentic community trust.`)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 text-[11px] cursor-pointer"
              >
                Sample 3: Sales Objection Script
              </button>
            </div>

            {/* Analyze & Suggest Button */}
            <button
              type="button"
              onClick={handleAnalyzeText}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>ANALYZE DOCUMENT &amp; SUGGEST BEST GAMES FOR THIS TEST</span>
            </button>

            {/* AI SUGGESTIONS DISPLAY FOR DH & CREATOR */}
            {analysisResult && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 space-y-4 animate-in fade-in">
                
                {/* Expert Modern Critique (Honest Feedback on Game Design) */}
                <div className="p-3 bg-neutral-900 border border-amber-500/40 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Creator Modern Design Critique &amp; Feedback:</span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                    {analysisResult.expertModernCritique}
                  </p>
                </div>

                {/* Top Suggested Game Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">
                      Suggested Game for this Document:
                    </span>
                    <h4 className="text-base font-black text-white">{analysisResult.suggestedTitle}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {analysisResult.extractedKeywords.map(k => (
                      <span key={k} className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* The 7 Game Options Ranked by Match Score % */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                    <span>Ranked Game Mode Compatibility (Best Fit First):</span>
                    <span className="text-[10px] text-neutral-500">Pick any to deploy for this test</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysisResult.recommendations.map((rec) => {
                      const isSelected = selectedGameMode === rec.gameMode;
                      return (
                        <div
                          key={rec.gameMode}
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedGameMode(rec.gameMode);
                          }}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-neutral-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{rec.gameIcon}</span>
                              <span>{rec.gameTitle}</span>
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              rec.matchScore >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {rec.matchScore}% Match
                            </span>
                          </div>

                          <p className="text-[11px] text-neutral-400 leading-tight mb-2">
                            {rec.whyThisGameFits}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-800">
                            <span>Category: <strong className="text-neutral-300">{rec.category}</strong></span>
                            {isSelected && (
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3 stroke-[3]" /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Version Name Input */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Version Name &amp; Audit Tag:
                  </label>
                  <input
                    type="text"
                    value={customVersionName}
                    onChange={(e) => setCustomVersionName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                {/* THE 2 ACTIONS REQUIRED IN PROMPT: UPGRADE GAME OR START NEW GAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleUpgradeCurrentGame}
                    className="p-3 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border-2 border-teal-400 text-teal-200 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span>UPGRADE ACTIVE GAME (Keep Player Progress)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewGame}
                    className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-neutral-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-neutral-950" />
                    <span>START NEW GAME WITH SELECTED MODE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CATALOG OF 7 OFFICIAL GAME TYPES */}
        {/* ==================================================== */}
        {activeTab === 'seven_game_catalog' && (
          <div className="py-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1 text-xs">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                <Layers className="w-3.5 h-3.5" />
                <span>The 7 Official Simulation Game Formats:</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Each game format trains a specific set of operational skills. The Department Head (DH) and Creator can choose any format to test their teams or let the AI suggest the best fit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {OFFICIAL_GAME_MODES.map((mode, idx) => (
                <div
                  key={mode.id}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mode.icon}</span>
                        <div>
                          <h4 className="text-sm font-black text-white">{idx + 1}. {mode.name}</h4>
                          <span className="text-[10px] font-bold" style={{ color: mode.accentColor }}>
                            {mode.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
                        {mode.badge}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                      {mode.description}
                    </p>

                    <div className="mt-3 p-2 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-neutral-400">Tested Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {mode.primarySkillsTested.map(s => (
                          <span key={s} className="text-[9.5px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-500">
                      Format {idx + 1}/7
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCollect(1.2);
                        setSelectedGameMode(mode.id);
                        onLaunchGameDirectly?.(mode.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Launch Mode</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CREATOR STUDIO (POWER TO BUILD & ADD NEW GAMES) */}
        {/* ==================================================== */}
        {activeTab === 'creator_studio' && userRole === 'Creator' && (
          <div className="py-4 space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Creator Game Builder &amp; Engine Expansion Studio:</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                As the Creator (**Hamzat Victor Chisom**), you have executive authority to design, engineer, and add new game types to the platform beyond the 7 presets.
                New games you register will immediately become available in the catalog and will be recommended to Department Heads when they upload matching SOP documents.
              </p>
            </div>

            <form onSubmit={handleCreateCustomGame} className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3.5 text-xs">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Engineer a New Simulation Game Format:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Game Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Village Tech Stormer / Alaba Market Negotiation"
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Game Category / Archetype:
                  </label>
                  <select
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Action Runner">Action Runner</option>
                    <option value="Deep Underwriting">Deep Underwriting</option>
                    <option value="Crisis Survival">Crisis Survival</option>
                    <option value="Speed Time-Attack">Speed Time-Attack</option>
                    <option value="Strategy & Math">Strategy & Math</option>
                    <option value="Roleplay Duel">Roleplay Duel</option>
                    <option value="Forensic Audit">Forensic Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Tagline &amp; Core Hook:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rapid credit underwriting with real-time merchant trust meters"
                  value={newGameTagline}
                  onChange={(e) => setNewGameTagline(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Training Rules, Hazards &amp; Reward Mechanics:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the operational rules, right decisions, penalty traps and scoring formulas for this custom game..."
                  value={newGameRules}
                  onChange={(e) => setNewGameRules(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>SAVE &amp; REGISTER CUSTOM GAME TO PLATFORM</span>
              </button>
            </form>

            {/* Custom Creator Games Registered List */}
            {customGamesList.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-neutral-300">
                  Custom Games Engineered by Creator ({customGamesList.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customGamesList.map(cg => (
                    <div key={cg.id} className="p-3 rounded-xl bg-neutral-950 border border-amber-500/30 text-xs space-y-1">
                      <div className="font-black text-amber-300">{cg.title}</div>
                      <div className="text-[10px] text-neutral-400 uppercase font-mono">{cg.category}</div>
                      <p className="text-[11px] text-neutral-300">{cg.rules}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: REAL-TIME VERSION HISTORY & TIME-TRAVEL ROLLBACK */}
        {/* ==================================================== */}
        {activeTab === 'version_history' && (
          <div className="py-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <History className="w-3.5 h-3.5" />
                <span>Real-Time Audit Timeline &amp; Rollback:</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Every policy update made by Creator or DH is permanently tracked with <strong>Real-Time Date, Time (AM/PM) and Year</strong>. 
                If an update introduces unwanted difficulty or mistakes, click <strong>&quot;Rollback to This Version&quot;</strong> to restore that exact working state immediately.
              </p>
            </div>

            <div className="space-y-3">
              {snapshots.map((snap) => {
                const isActive = snap.appliedAsActive || snap.versionId === activeSnapshot.versionId;
                return (
                  <div
                    key={snap.versionId}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isActive
                        ? 'bg-neutral-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black font-mono">
                        ACTIVE IN SIMULATOR
                      </span>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2 pr-24">
                      <div>
                        <div className="font-black text-sm text-white flex items-center gap-2">
                          <span>{snap.versionName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                            {snap.mode.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                          {snap.policyTitle}
                        </div>
                      </div>
                    </div>

                    {/* Real-Time Date, Time, Year Tracking Stamp */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-neutral-800/80 my-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-mono">Date Tracked:</span>
                        <strong className="text-neutral-200 font-mono">{snap.dateDisplay}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-mono">Exact Time:</span>
                        <strong className="text-amber-300 font-mono">{snap.timeDisplay}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-mono">Calendar Year:</span>
                        <strong className="text-neutral-300 font-mono">{snap.year}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-mono">Author:</span>
                        <span className="text-white font-bold">{snap.authorName} ({snap.authorRole})</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400 line-clamp-2 my-1 font-mono">
                      {snap.rawPolicyText}
                    </div>

                    {/* Rollback Actions */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[10.5px] text-neutral-500">
                        {snap.generatedItemsCount} Generated Game Rules
                      </span>

                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleRollback(snap.versionId)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ROLLBACK TO THIS VERSION</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4 stroke-[3]" /> Currently Operating
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: ACTIVE POLICY SNAPSHOT */}
        {/* ==================================================== */}
        {activeTab === 'active_preview' && (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                    Currently Operating in Live Simulator
                  </span>
                  <h4 className="text-base font-black text-white">{activeSnapshot.versionName}</h4>
                  <p className="text-xs text-neutral-300 mt-0.5">{activeSnapshot.policyTitle}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-amber-300 font-mono font-bold block">{activeSnapshot.dateDisplay} • {activeSnapshot.timeDisplay}</span>
                  <span className="text-neutral-500 text-[10px]">Year {activeSnapshot.year}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {activeSnapshot.rawPolicyText}
              </div>

              <div>
                <div className="text-xs font-bold text-neutral-300 mb-2">Active Field Approvals &amp; Penalty Cards:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {activeSnapshot.items.map(it => (
                    <div key={it.id} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{it.icon}</span>
                        <div>
                          <div className="font-bold text-white text-[11px]">{it.title}</div>
                          <div className="text-[9.5px] text-neutral-400">{it.subText}</div>
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${it.value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {it.value > 0 ? `+${it.value}` : it.value} PTS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-xs">
          <span className="text-neutral-500">
            Real-Time Audit: Logged by {userName} ({userRole})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
          >
            Close Engine
          </button>
        </div>
      </div>
    </div>
  );
};
