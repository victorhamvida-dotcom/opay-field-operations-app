import React from 'react';
import { CDLSubLevel } from '../types/cdlPolicy';
import { Shield, TrendingUp, Sparkles, Building2, Server, FileQuestion } from 'lucide-react';

interface GameHUDProps {
  score: number;
  cashDisbursed: number;
  tacticsProgress: number;
  combo: number;
  shields: number;
  cdlTier: CDLSubLevel;
  whitelistedHits: number;
  potentialPOS: number;
  stdRatio: string;
  excRatio: string;
  elapsedSeconds: number;
  onPauseToggle: () => void;
  isPaused: boolean;
  onOpenHierarchyGuide: () => void;
  onOpenPOSHub: () => void;
  onOpenQuiz: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  cashDisbursed,
  tacticsProgress,
  combo,
  shields,
  cdlTier,
  whitelistedHits,
  potentialPOS,
  stdRatio,
  excRatio,
  elapsedSeconds,
  onPauseToggle,
  isPaused,
  onOpenHierarchyGuide,
  onOpenPOSHub,
  onOpenQuiz,
}) => {
  const isWarningTier = cdlTier.includes('Warning');
  const isGoldTier = cdlTier.includes('Gold');
  const isSilverTier = cdlTier.includes('Silver');

  let tierColor = 'text-amber-600 border-amber-600/40 bg-amber-600/10';
  if (isWarningTier) tierColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse';
  if (isSilverTier) tierColor = 'text-slate-300 border-slate-400/40 bg-slate-400/10';
  if (isGoldTier) tierColor = 'text-amber-400 border-amber-400/40 bg-amber-400/10';

  return (
    <div className="w-full game-stage mx-auto mb-2 select-none min-w-0">
      {/* Top HUD Box */}
      <div className="bg-neutral-900/90 backdrop-blur-md border border-emerald-500/20 rounded-xl p-2.5 sm:p-3 shadow-lg">
        {/* Tier & Operational buttons */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-800">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-neutral-400 hidden xs:inline">Field Tier:</span>
            <div className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black border truncate ${tierColor}`}>
              CDL {cdlTier}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={onOpenPOSHub}
              className="px-1.5 sm:px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Deploy POS & Improve Tier"
            >
              <Server className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Deploy</span>
            </button>
            <button
              onClick={onOpenHierarchyGuide}
              className="px-1.5 sm:px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Hierarchy & Tiers"
            >
              <Building2 className="w-3 h-3 text-neutral-400" />
            </button>
            <button
              onClick={onOpenQuiz}
              className="px-1.5 sm:px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Policy Exam"
            >
              <FileQuestion className="w-3 h-3 text-neutral-400" />
            </button>
            <button
              onClick={onPauseToggle}
              className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold cursor-pointer transition-colors min-w-[36px]"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>

        {/* Live POS Deployment Metrics Bar */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-neutral-950/80 rounded-lg border border-neutral-800 mb-2 text-[11px]">
          <div>
            <span className="text-neutral-400 text-[9.5px] block leading-none">Potential POS:</span>
            <strong className="text-white font-mono">{potentialPOS} Terminals</strong>
          </div>
          <div>
            <span className="text-neutral-400 text-[9.5px] block leading-none">Standard Ratio:</span>
            <strong className="text-cyan-400 font-mono">{stdRatio}% (&gt;₦920)</strong>
          </div>
          <div>
            <span className="text-neutral-400 text-[9.5px] block leading-none">Excellent Ratio:</span>
            <strong className="text-amber-400 font-mono">{excRatio}% (&gt;₦1.4k)</strong>
          </div>
        </div>

        {/* Primary Metrics: Disbursed Portfolio & Score */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Disbursed Loan Volume
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ₦{cashDisbursed.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-neutral-400">
              Verified Approach Score
            </div>
            <div className="text-lg font-bold text-emerald-300 font-mono">
              {score.toLocaleString()} <span className="text-xs text-neutral-400">PTS</span>
            </div>
            <div className="text-[11px] font-mono text-amber-400">
              ⏱ {Math.floor(elapsedSeconds / 60)}:{(Math.floor(elapsedSeconds) % 60).toString().padStart(2, '0')}
              <span className="text-neutral-500"> • {elapsedSeconds > 5 ? Math.round(score / (elapsedSeconds / 60)).toLocaleString() : 0}/min</span>
            </div>
          </div>
        </div>

        {/* 6 CDLM Tactics Progress Meter */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-300 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              CDLM Best Practices: <span className="text-emerald-400 font-bold">{tacticsProgress}/6</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              FMCG Hits: <strong className="text-emerald-400">{whitelistedHits}</strong>
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isUnlocked = idx < tacticsProgress;
              const isNext = idx === tacticsProgress;
              return (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                      : isNext
                      ? 'bg-amber-400/80 animate-pulse'
                      : 'bg-neutral-800'
                  }`}
                  title={`Tactic #${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Secondary indicators: Shields & Combo multiplier */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-1 text-neutral-300">
            <span className="text-[11px] text-neutral-400 mr-1">Compliance Shields:</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <Shield
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < shields
                      ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                      : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {combo > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-bounce">
                🔥 {combo}x COMBO!
              </span>
            )}
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Only Right Approaches Score
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
