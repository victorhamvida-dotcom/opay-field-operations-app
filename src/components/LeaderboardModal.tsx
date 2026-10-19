import React from 'react';
import { HighScoreEntry } from '../types/tactics';
import { Trophy, X, Award, RotateCcw } from 'lucide-react';

interface LeaderboardModalProps {
  scores: (HighScoreEntry & { tier?: string; timeSeconds?: number })[];
  onClose: () => void;
  onClearScores: () => void;
}

const fmtTime = (secs?: number) => {
  if (secs === undefined) return '--:--';
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  scores,
  onClose,
  onClearScores,
}) => {
  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl w-full max-w-md modal-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">CDL Regional Leaderboard</h3>
              <p className="text-xs text-neutral-400">High-performance merchant loan achievers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ranking Rule */}
        <div className="mx-3 sm:mx-4 mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
          <strong>Ranking Rule:</strong> Higher score ranks first. Within the same 1,000-point band, the CDL who reached it in <strong>less time</strong> ranks higher.
        </div>

        {/* List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 modal-card-body">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">
              No field scores logged yet. Start a run and score verified loan disbursements!
            </div>
          ) : (
            scores.map((entry, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadge = (
                <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs font-bold font-mono">
                  {index + 1}
                </span>
              );

              if (isFirst) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-xs font-black font-mono">
                    🥇
                  </span>
                );
              } else if (isSecond) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center text-xs font-black font-mono">
                    🥈
                  </span>
                );
              } else if (isThird) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center text-xs font-black font-mono">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={index}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between ${
                    isFirst
                      ? 'bg-amber-950/20 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                      : 'bg-neutral-800/40 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {rankBadge}
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {entry.name}
                        {entry.tier && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                            {entry.tier}
                          </span>
                        )}
                        {entry.tacticsUnlocked === 6 && (
                          <span title="Full 6/6 CDLM Tactics Mastered" className="inline-flex">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span>{entry.tacticsUnlocked}/6 Tactics</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">₦{entry.disbursedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                      {entry.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      ⏱ {fmtTime(entry.timeSeconds)}
                      {entry.timeSeconds && entry.timeSeconds > 5 ? (
                        <span className="text-neutral-500"> • {Math.round(entry.score / (entry.timeSeconds / 60)).toLocaleString()}/min</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-neutral-500">{entry.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <button
            onClick={onClearScores}
            className="text-neutral-500 hover:text-neutral-300 flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Scores
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold cursor-pointer hover:bg-emerald-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
