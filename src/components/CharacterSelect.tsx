import React, { useMemo, useRef, useEffect, useState } from 'react';
import { PLAYABLE_CHARACTERS, PlayableCharacter, CharacterId, Gender, drawHumanCharacter } from '../types/careerRun';
import { soundManager } from '../utils/sound';
import { Play, Sparkles, ChevronRight } from 'lucide-react';

interface CharacterSelectProps {
  onConfirm: (character: PlayableCharacter) => void;
  onOpenTactics?: () => void;
  highScore?: number;
  preferredGender?: Gender | 'all';
}

function AvatarCanvas({ character, active }: { character: PlayableCharacter; active?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.save();
      ctx.translate(c.width / 2, c.height * 0.78);
      drawHumanCharacter(ctx, character, {
        bob: Math.sin(t * 3) * 2,
        legPhase: active ? Math.sin(t * 6) * 8 : Math.sin(t * 2) * 3,
        scale: 1.15,
      });
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [character, active]);
  return <canvas ref={ref} width={120} height={140} className="w-full h-auto" />;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onConfirm,
  onOpenTactics,
  highScore = 0,
  preferredGender = 'all',
}) => {
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>(preferredGender);
  const filtered = useMemo(
    () =>
      PLAYABLE_CHARACTERS.filter((c) => (genderFilter === 'all' ? true : c.gender === genderFilter)),
    [genderFilter]
  );
  const [selected, setSelected] = useState<CharacterId>(filtered[0]?.id || PLAYABLE_CHARACTERS[0].id);
  const hero = PLAYABLE_CHARACTERS.find((c) => c.id === selected) || filtered[0] || PLAYABLE_CHARACTERS[0];

  useEffect(() => {
    if (!filtered.some((c) => c.id === selected) && filtered[0]) setSelected(filtered[0].id);
  }, [filtered, selected]);

  return (
    <div className="absolute inset-0 z-30 bg-neutral-950/95 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-y-auto overscroll-contain p-3 sm:p-5 flex flex-col">
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" />
          OPay Career Run
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Choose Your Field Hero</h2>
        <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
          Human male &amp; female agents. Run the money lane, answer right to get rich — wrong answers can end in sack, merge, BD team, or resign.
        </p>
        {highScore > 0 && (
          <div className="mt-2 text-[11px] text-amber-300 font-mono">Personal best: {highScore.toLocaleString()} PTS</div>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-3">
        {([
          ['all', 'All'],
          ['female', 'Female'],
          ['male', 'Male'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              soundManager.playTabSwitch();
              setGenderFilter(id);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer ${
              genderFilter === id
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {filtered.map((c) => {
          const active = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                soundManager.playUiTap();
                setSelected(c.id);
              }}
              className={`rounded-2xl border p-2 text-left cursor-pointer transition-all ${
                active
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-600'
              }`}
            >
              <div
                className="rounded-xl overflow-hidden mb-1.5"
                style={{ background: `linear-gradient(180deg, ${c.color}33, #0a0a0a)` }}
              >
                <AvatarCanvas character={c} active={active} />
              </div>
              <div className="text-xs font-black text-white truncate">{c.name}</div>
              <div className="text-[10px] truncate" style={{ color: c.accent }}>
                {c.title}
              </div>
              <div className="text-[9px] text-neutral-500 mt-0.5 capitalize">{c.gender}</div>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-2xl border p-3 sm:p-4 mb-3"
        style={{ borderColor: `${hero.color}66`, background: `linear-gradient(135deg, ${hero.color}18, #0a0a0a)` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-24 h-28 rounded-2xl overflow-hidden shrink-0"
            style={{ background: `${hero.color}22` }}
          >
            <AvatarCanvas character={hero} active />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-black text-white">
              {hero.name}{' '}
              <span className="text-sm font-semibold" style={{ color: hero.accent }}>
                · {hero.title}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              {hero.vibe} · <span className="capitalize text-neutral-300">{hero.gender}</span>
            </div>
            <p className="text-xs text-neutral-200 mt-2 leading-relaxed">{hero.story}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300">
                Start ₦{hero.startCash.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300">
                Speed ×{hero.speedBonus.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300">
                Answer ×{hero.luckBonus.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playUiOpen();
            soundManager.startMusic('field_storm');
            onConfirm(hero);
          }}
          className="w-full py-3.5 rounded-xl font-black text-sm text-neutral-950 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(16,185,129,0.45)]"
          style={{ background: `linear-gradient(90deg, ${hero.color}, ${hero.accent})` }}
        >
          <Play className="w-4 h-4 fill-neutral-950" />
          RUN AS {hero.name.toUpperCase()}
          <ChevronRight className="w-4 h-4" />
        </button>
        {onOpenTactics && (
          <button type="button" onClick={onOpenTactics} className="w-full py-2 text-[11px] font-semibold text-neutral-400 hover:text-white cursor-pointer">
            Review CDL tactics / policy before running
          </button>
        )}
      </div>
    </div>
  );
};
