import React, { useState } from 'react';
import { OPAY_TACTICS, TacticMilestone } from '../types/tactics';
import { X, CheckCircle, Zap, Lock, Sparkles, AlertTriangle } from 'lucide-react';

interface TacticsPlaybookModalProps {
  unlockedCount: number;
  onClose: () => void;
  onStartGame?: () => void;
}

export const TacticsPlaybookModal: React.FC<TacticsPlaybookModalProps> = ({
  unlockedCount,
  onClose,
  onStartGame,
}) => {
  const [selectedTactic, setSelectedTactic] = useState<TacticMilestone>(OPAY_TACTICS[0]);

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                OPay Successful Loan Tactics Dossier
              </h3>
              <p className="text-xs text-neutral-400">
                Master all 6 algorithm-backed tactics for instant disbursement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Quick Mastery Status */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-neutral-900 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                Current In-Game Unlocks
              </div>
              <div className="text-sm font-bold text-white">
                {unlockedCount} of {OPAY_TACTICS.length} Tactics Mastered in Run
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              {Math.round((unlockedCount / OPAY_TACTICS.length) * 100)}% COMPLETE
            </div>
          </div>

          {/* Tactics List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {OPAY_TACTICS.map((item, index) => {
              const isUnlocked = index < unlockedCount;
              const isSelected = selectedTactic.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTactic(item)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-400 font-mono">
                        STEP #{item.step}
                      </span>
                      {isUnlocked && (
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">{item.shortDesc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Dive Panel on Selected Tactic */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Detailed Tactical Breakdown: {selectedTactic.title}
              </h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
              {selectedTactic.detailedProTip}
            </p>

            <div className="bg-neutral-900 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-neutral-300">
                <span className="font-bold text-amber-300">Hazard Avoidance:</span> In the arcade game, avoid red phishing hazard boxes and late penalty marks. They reduce your credit score and drain your approved cash balance.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Apply these real-world tactics to maintain flawless fintech standing.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white cursor-pointer"
            >
              Close
            </button>
            {onStartGame && (
              <button
                onClick={() => {
                  onClose();
                  onStartGame();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-neutral-950 cursor-pointer shadow-md"
              >
                Play & Catch Tactics
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
