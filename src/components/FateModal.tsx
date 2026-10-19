import React, { useState } from 'react';
import {
  FAILURE_FATE_OPTIONS,
  CareerFate,
  RunStats,
  RICH_LABELS,
  PLAYABLE_CHARACTERS,
} from '../types/careerRun';
import { soundManager } from '../utils/sound';
import { AlertTriangle, RotateCcw, Trophy } from 'lucide-react';

interface FateModalProps {
  stats: RunStats;
  onChooseFate: (fate: CareerFate) => void;
  onRestart: () => void;
  victory?: boolean;
}

export const FateModal: React.FC<FateModalProps> = ({ stats, onChooseFate, onRestart, victory }) => {
  const [picked, setPicked] = useState<CareerFate | null>(null);
  const hero = PLAYABLE_CHARACTERS.find((c) => c.id === stats.characterId);

  if (victory) {
    return (
      <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-2 animate-bounce">{hero?.gender === 'female' ? '👩‍💼' : hero?.gender === 'male' ? '👨‍💼' : '🏆'}</div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
          <Trophy className="w-3.5 h-3.5" /> GOLD GLORY
        </div>
        <h2 className="text-2xl font-black text-white mb-1">You Made It Rich</h2>
        <p className="text-xs text-neutral-300 max-w-xs mb-4">
          {hero?.name} mastered the field run as a <strong className="text-amber-300">{RICH_LABELS[stats.richLevel]}</strong>.
          Tier {stats.cdlTier} · ₦{stats.wealth.toLocaleString()} wealth · {stats.distanceM}m
        </p>
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm mb-4 text-left">
          <Stat label="Score" value={stats.score.toLocaleString()} />
          <Stat label="Right answers" value={`${stats.rightAnswers}`} />
          <Stat label="Cash disbursed" value={`₦${stats.cashDisbursed.toLocaleString()}`} />
          <Stat label="Max combo" value={`${stats.maxCombo}x`} />
        </div>
        <button
          type="button"
          onClick={() => {
            soundManager.playUiOpen();
            onRestart();
          }}
          className="w-full max-w-sm py-3 rounded-xl bg-emerald-400 text-neutral-950 font-black text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Run Again
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-y-auto p-4 flex flex-col">
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold mb-2">
          <AlertTriangle className="w-3.5 h-3.5" /> Career Crisis
        </div>
        <h2 className="text-xl font-black text-white">Field Run Collapsed</h2>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
          {hero?.name} ({hero?.gender}) hit critical failure (wealth ₦{stats.wealth.toLocaleString()} · wrong {stats.wrongAnswers} · {stats.cdlTier}).
          Choose your OPay exit path — like the real CDL policy options.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {FAILURE_FATE_OPTIONS.map((f) => {
          const active = picked === f.id;
          const tone =
            f.tone === 'danger'
              ? 'border-rose-500/40 bg-rose-500/10'
              : f.tone === 'warn'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-cyan-500/40 bg-cyan-500/10';
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                soundManager.playUiTap();
                setPicked(f.id);
              }}
              className={`text-left rounded-2xl border p-3 cursor-pointer transition-all ${
                active ? `${tone} ring-2 ring-white/20` : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-600'
              }`}
            >
              <div className="text-lg mb-1">{f.emoji}</div>
              <div className="text-xs font-black text-white">{f.title}</div>
              <div className="text-[10px] text-neutral-400 mt-1 leading-snug">{f.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          disabled={!picked}
          onClick={() => {
            if (!picked) return;
            soundManager.playUiOpen();
            onChooseFate(picked);
          }}
          className="w-full py-3 rounded-xl bg-rose-400 disabled:opacity-40 text-neutral-950 font-black text-sm cursor-pointer"
        >
          Confirm Career Path
        </button>
        <button
          type="button"
          onClick={() => {
            soundManager.playUiTap();
            onRestart();
          }}
          className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
        >
          Ignore fate · Restart run
        </button>
      </div>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5">
      <div className="text-[10px] text-neutral-500 uppercase font-bold">{label}</div>
      <div className="text-sm font-black text-emerald-300 font-mono">{value}</div>
    </div>
  );
}
