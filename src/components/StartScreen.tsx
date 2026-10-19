import React, { useState } from 'react';
import { Play, Trophy, Volume2, VolumeX, Building2, Store, FileQuestion, Sparkles, AlertTriangle, KeyRound, Music, BookOpen } from 'lucide-react';
import { CDLSubLevel } from '../types/cdlPolicy';
import { OPayLogo } from './OPayLogo';
import { HamvidaLogo } from './HamvidaLogo';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenHierarchy: () => void;
  onOpenLeaderboard: () => void;
  onOpenQuiz: () => void;
  onOpenMerchantEncounter: () => void;
  onOpenPasswordReset: () => void;
  onOpenMusicHub: () => void;
  onOpenPlaybook: () => void;
  onOpenCharacterSelect: () => void;
  onOpenBranding?: () => void;
  selectedCharacterName?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  highScore: number;
  currentTier: CDLSubLevel;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenHierarchy,
  onOpenLeaderboard,
  onOpenQuiz,
  onOpenMerchantEncounter,
  onOpenPasswordReset,
  onOpenMusicHub,
  onOpenPlaybook,
  onOpenCharacterSelect,
  onOpenBranding,
  selectedCharacterName,
  soundEnabled,
  onToggleSound,
  highScore,
  currentTier,
}) => {
  const [selectedTip, setSelectedTip] = useState(0);

  const tips = [
    {
      title: 'Rule #1: Only Right Approaches Score Points',
      desc: 'In this simulation, catching dead wooden kiosks, submitting forged utility bills, or engaging in volume manipulation yields 0 points and causes CDL tier downgrades. Only whitelisted FMCG merchants, verified VFO checks, and compliant refinancing score points!'
    },
    {
      title: 'Rule #2: Field Hierarchy Governance',
      desc: 'RM (Regional Managers) lead SMs (State Managers). SMs supervise CDLMs (Channel Development Lead Managers). CDLMs manage and coach CDLs (Channel Development Leads). CDLs meet merchants directly on the ground.'
    },
    {
      title: 'Rule #3: 4 Tiers & 12 Sub-Levels',
      desc: 'CDLs are tiered across Gold, Silver, Bronze, and Warning (3 sub-levels each = 12 total). Potential POS (>30 days, >₦300 revenue) + Standard (>₦920) + Excellent (>₦1,400) + 3-Month Average Loans Sold determine your tier!'
    },
    {
      title: 'Rule #4: 6 CDLM Field-Tested Mentors',
      desc: 'Adopt tactics from CDLMs Ikechukwu (whitelist storming), Folorunsho (immediate refinance), Philip (WhatsApp coaching), Shafiu (VFO prep & personal disbursement), Orieke (merchant evangelism), and Ilenowa (sales ROI).'
    }
  ];

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-5 z-30 text-white rounded-2xl overflow-y-auto safe-top safe-bottom">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
        <div 
          onClick={onOpenBranding}
          className="flex items-center gap-1.5 sm:gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
          title="Click to customize Company Logo & Name"
        >
          <div className="px-1.5 sm:px-2 py-1 rounded-lg bg-white flex items-center shadow-[0_0_12px_rgba(29,206,159,0.4)] shrink-0">
            <OPayLogo height={18} variant="dark" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-400 truncate">
              OPay Field Operations App
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-neutral-300 truncate">
              Merchant Loan &amp; CDL Policy Academy
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={onOpenMusicHub}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:text-white transition-colors cursor-pointer text-[11px] sm:text-xs font-bold flex items-center gap-1 touch-btn"
            aria-label="Open Music Studio"
          >
            <Music className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden xs:inline sm:inline">Soundtrack</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer touch-btn"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="my-auto py-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Mandatory Company Training Simulation
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase bg-gradient-to-br from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-2">
          OPay Merchant Loan <br />Disbursement Tactics
        </h1>

        <p className="text-xs text-neutral-300 max-w-sm mx-auto mb-3 leading-relaxed">
          Pilot your CDL Field Lead across busy FMCG markets. <strong>Only verified, compliant loan disbursement approaches award points and portfolio cash.</strong> Avoid dead kiosks and volume manipulation!
        </p>

        {/* Current Standing, Character & High Score */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <button
            onClick={onOpenCharacterSelect}
            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/50 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-emerald-400 transition-all touch-btn"
            title="Choose your OPay Runner Character"
          >
            <span>🏃🏾</span>
            <span>Runner: <strong className="text-emerald-300 font-sans">{selectedCharacterName || 'Chioma Okoye'}</strong></span>
            <span className="text-[10px] text-amber-400 underline font-normal">Change</span>
          </button>

          <div className="px-3 py-1 bg-neutral-900 border border-emerald-500/40 rounded-xl text-xs">
            <span className="text-neutral-400 mr-1">Rank:</span>
            <span className="text-amber-400 font-bold">{currentTier}</span>
          </div>

          {highScore > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-emerald-500/40 rounded-xl text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400">Best:</span>
              <span className="text-emerald-400 font-bold font-mono">{highScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onStartGame}
            className="w-full max-w-xs py-3.5 px-6 rounded-xl font-black text-sm text-neutral-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-neutral-950 group-hover:scale-110 transition-transform" />
            START CDL FIELD DISBURSEMENT RUN
          </button>

          <div className="text-[11px] text-neutral-400">
            Keys: [A][D] or Arrows + [Space] Turbo Dash • Mobile: Drag on Screen
          </div>
          <div className="text-[11px] text-neutral-300 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ = Right approach (scores)</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">✗ = Wrong approach (0 pts)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">⏱ Less time to a score = higher rank</span>
          </div>
        </div>
      </div>

      {/* Rotating Policy Tip */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-left mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Field Directive {selectedTip + 1}/4
          </span>
          <button
            onClick={() => setSelectedTip((prev) => (prev + 1) % tips.length)}
            className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
          >
            Next Directive →
          </button>
        </div>
        <div className="text-xs font-bold text-white mb-0.5">{tips[selectedTip].title}</div>
        <div className="text-[11px] text-neutral-300 leading-snug">{tips[selectedTip].desc}</div>
      </div>

      {/* Quick Access Training Modes & Creator Password Reset (Responsive 3x2 on mobile, 6x1 on desktop) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 pt-2 border-t border-neutral-900">
        <button
          onClick={onOpenPlaybook}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[9.5px] sm:text-[11px] font-semibold text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
          title="CDLM Best Practice Submissions Playbook"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">Playbook</span>
        </button>

        <button
          onClick={onOpenHierarchy}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[9.5px] sm:text-[11px] font-semibold text-neutral-200 border border-neutral-800 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate">Hierarchy</span>
        </button>

        <button
          onClick={onOpenMerchantEncounter}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[9.5px] sm:text-[11px] font-semibold text-neutral-200 border border-neutral-800 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">Scenarios</span>
        </button>

        <button
          onClick={onOpenQuiz}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[9.5px] sm:text-[11px] font-semibold text-neutral-200 border border-neutral-800 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
        >
          <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">Exam</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[9.5px] sm:text-[11px] font-semibold text-neutral-200 border border-neutral-800 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">Rankings</span>
        </button>

        <button
          onClick={onOpenPasswordReset}
          className="py-1.5 sm:py-2 px-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[9.5px] sm:text-[11px] font-semibold text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer transition-colors touch-btn"
          title="Creator / Admin Password Recovery Console"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">Reset Pass</span>
        </button>
      </div>

      {/* Official Hamvida Tech Signature Badge at Bottom of Start Screen */}
      <div className="pt-2 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-[#F6D870]/30 shadow-sm">
          <HamvidaLogo size={15} />
          <span className="text-[11.5px] font-bold text-white tracking-tight flex items-center gap-1">
            <span className="text-neutral-400 font-medium">Made by</span>
            <span className="text-[#F6D870] font-black">Hamvida Tech</span>
          </span>
        </div>
      </div>
    </div>
  );
};
