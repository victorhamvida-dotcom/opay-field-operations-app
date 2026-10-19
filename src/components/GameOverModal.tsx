import React, { useState } from 'react';
import { GameStats } from './GameCanvas';
import { RotateCcw, Trophy, Award, CheckCircle, Share2, AlertCircle, Building2, Store } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onSaveScore: (name: string, score: number, tacticsUnlocked: number, disbursedAmount: number, tier: string, timeSeconds: number) => void;
  onViewHierarchy: () => void;
  onViewMerchantEncounters: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onSaveScore,
  onViewHierarchy,
  onViewMerchantEncounters,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);
  const isMastered = stats.tacticsProgress >= 6;
  const isWarningTier = stats.cdlTier.includes('Warning');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || saved) return;
    onSaveScore(playerName.trim(), stats.score, stats.tacticsProgress, stats.cashDisbursed, stats.cdlTier, stats.elapsedSeconds);
    setSaved(true);
  };

  const fmtTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };
  const ptsPerMin = stats.elapsedSeconds > 5 ? Math.round(stats.score / (stats.elapsedSeconds / 60)) : stats.score;

  const handleCopySummary = () => {
    const text = `OPay Field Ops Report: I finished as CDL [${stats.cdlTier}] with ₦${stats.cashDisbursed.toLocaleString()} disbursed loan volume and ${stats.score.toLocaleString()} PTS (${stats.tacticsProgress}/6 CDLM Tactics Mastered). Mastered FMCG screening and VFO readiness!`;
    navigator.clipboard?.writeText(text);
    alert('Field performance report copied to clipboard!');
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-center items-center p-4 sm:p-5 z-40 text-white rounded-2xl animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="w-full max-w-sm text-center">
        {/* Status Badge */}
        {isMastered ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs font-bold mb-2 animate-bounce">
            <Award className="w-4 h-4 text-amber-400" />
            GOLD STANDARD CDL! ALL 6 CDLM TACTICS MASTERED
          </div>
        ) : isWarningTier ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-300 text-xs font-bold mb-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            WARNING TIER REACHED • 30 DAYS REMEDIATION REQUIRED
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-300 text-xs font-bold mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            FIELD DISBURSEMENT MISSION CONCLUDED
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-0.5">
          {isMastered ? 'Elite CDL Qualified' : 'CDL Performance Appraisal'}
        </h2>
        <div className="text-xs text-neutral-400 mb-3">
          Final Standing: <strong className="text-emerald-400 font-mono text-sm">CDL {stats.cdlTier}</strong>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Verified Score</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {stats.score.toLocaleString()} <span className="text-[10px] text-neutral-500">PTS</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Disbursed Volume</div>
            <div className="text-base sm:text-lg font-black text-cyan-400 font-mono truncate">
              ₦{stats.cashDisbursed.toLocaleString()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">CDLM Tactics</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              {stats.tacticsProgress} / 6
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Whitelisted FMCG</div>
            <div className="text-lg font-black text-purple-400 font-mono">
              {stats.whitelistedHits} Shops
            </div>
          </div>

          <div className="bg-neutral-900 border border-amber-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-amber-400 uppercase font-semibold">⏱ Time to Score</div>
            <div className="text-lg font-black text-white font-mono">
              {fmtTime(stats.elapsedSeconds)}
            </div>
          </div>

          <div className="bg-neutral-900 border border-amber-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Speed Efficiency</div>
            <div className="text-lg font-black text-white font-mono">
              {ptsPerMin.toLocaleString()} <span className="text-[10px] text-neutral-500">PTS/min</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-neutral-500 mb-2">
          Ranking rule: same score band → the CDL who got there in <strong className="text-amber-400">less time ranks higher</strong>.
        </div>

        {/* Rule reminder */}
        <div className="p-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-[11px] text-neutral-300 mb-3 leading-snug">
          Remember: <strong>Only the right loan disbursement approaches score points!</strong> Unverified kiosks and volume manipulations result in 0 score and tier downgrades.
        </div>

        {/* Leaderboard Submission */}
        {!saved ? (
          <form onSubmit={handleSave} className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 mb-3">
            <div className="text-xs font-bold text-neutral-200 mb-1.5 flex items-center justify-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Submit CDL Record to Regional Ranking
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CDL Name / State ID"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-bold rounded-lg text-xs cursor-pointer"
              >
                Log
              </button>
            </div>
          </form>
        ) : (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Report submitted to Regional Headquarters!
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl font-black text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART CDL FIELD MISSION
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewMerchantEncounters}
              className="py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              Practice Scenarios
            </button>

            <button
              onClick={onViewHierarchy}
              className="py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Review Policy Tiers
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="py-1.5 text-neutral-400 hover:text-white text-[11px] flex items-center justify-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3 h-3" /> Copy Field Performance Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
