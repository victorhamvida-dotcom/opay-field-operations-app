import React, { useState } from 'react';
import { X, Volume2, Music, Sparkles, Check, Play } from 'lucide-react';
import { soundManager, MUSIC_TRACKS, MusicTrackId } from '../utils/sound';

interface AudioMusicHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: MusicTrackId;
  onTrackChange: (track: MusicTrackId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AudioMusicHub: React.FC<AudioMusicHubProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onTrackChange,
  soundEnabled,
  onToggleSound,
}) => {
  const [musicVol, setMusicVol] = useState(soundManager.musicVolume);
  const [sfxVol, setSfxVol] = useState(soundManager.sfxVolume);
  if (!isOpen) return null;

  const handleMusicVolumeChange = (v: number) => {
    setMusicVol(v);
    soundManager.setMusicVolume(v);
  };

  const handleSfxVolumeChange = (v: number) => {
    setSfxVol(v);
    soundManager.setSfxVolume(v);
  };

  const triggerSfxTest = (_sfxName: string, action: () => void) => {
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md safe-top safe-bottom">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] max-h-[94dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Music className="w-5 h-5 text-neutral-950 font-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                Soundtrack &amp; Audio Studio
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Lively background music &amp; authentic banking sound effects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Global Master Toggles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onToggleSound}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                soundEnabled
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                  : 'bg-neutral-800/40 border-neutral-700 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 text-left">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">Master Audio</div>
                  <div className="text-[10px] text-neutral-400">
                    {soundEnabled ? 'Enabled' : 'Muted'}
                  </div>
                </div>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  soundEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-neutral-600'
                }`}
              />
            </button>

            <button
              onClick={() => {
                const next = currentTrack === 'off' ? 'afrobeat' : 'off';
                onTrackChange(next);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                currentTrack !== 'off'
                  ? 'bg-teal-950/40 border-teal-500/50 text-white'
                  : 'bg-neutral-800/40 border-neutral-700 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 text-left">
                <Music className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-xs font-bold">Background Music</div>
                  <div className="text-[10px] text-neutral-400">
                    {currentTrack !== 'off' ? 'Playing' : 'Paused'}
                  </div>
                </div>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  currentTrack !== 'off' ? 'bg-teal-400 shadow-[0_0_8px_#14B8A6]' : 'bg-neutral-600'
                }`}
              />
            </button>
          </div>

          {/* Volume Sliders */}
          <div className="space-y-3 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-teal-400" /> Music Volume
                </span>
                <span className="text-teal-400 font-mono">{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> SFX Volume
                </span>
                <span className="text-emerald-400 font-mono">{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Music Track Playlist */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Select Background Music Track
            </div>
            <div className="space-y-2">
              {MUSIC_TRACKS.map((t) => {
                const isSelected = currentTrack === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      soundManager.playClick();
                      onTrackChange(t.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                        : 'bg-neutral-800/40 border-neutral-700/70 hover:bg-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-1 rounded-lg bg-neutral-900 border border-neutral-800">
                        {t.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{t.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                            {t.genre}
                          </span>
                          {t.tempo > 0 && (
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">
                              {t.tempo} BPM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{t.description}</p>
                      </div>
                    </div>

                    <div className="pl-3">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-white">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound FX Preview Console */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Gameplay Sound Effects Library (Click to Preview)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => triggerSfxTest('cash', () => soundManager.playDisbursementCash())}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  💰 Loan Cash Drop
                </div>
                <div className="text-[10px] text-neutral-400">₦ Disbursed Chime</div>
              </button>

              <button
                onClick={() => triggerSfxTest('whitelisted', () => soundManager.playWhitelistedCollect())}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-teal-400 flex items-center gap-1">
                  🏪 FMCG Whitelist
                </div>
                <div className="text-[10px] text-neutral-400">Sparkly Arpeggio</div>
              </button>

              <button
                onClick={() => triggerSfxTest('vfo', () => soundManager.playStampApproval())}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-purple-400 flex items-center gap-1">
                  📑 VFO Verified
                </div>
                <div className="text-[10px] text-neutral-400">Official Stamp Thud</div>
              </button>

              <button
                onClick={() => triggerSfxTest('fanfare', () => soundManager.playTierUpgradeFanfare())}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  🎺 Gold Tier Fanfare
                </div>
                <div className="text-[10px] text-neutral-400">Regal Horn Chord</div>
              </button>

              <button
                onClick={() => triggerSfxTest('combo', () => soundManager.playComboUp(5))}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-cyan-400 flex items-center gap-1">
                  ⚡ 5x Streak Up
                </div>
                <div className="text-[10px] text-neutral-400">Pitch Glide Pulse</div>
              </button>

              <button
                onClick={() => triggerSfxTest('hazard', () => soundManager.playPolicyBuzzer())}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left text-xs text-neutral-200 cursor-pointer active:scale-95 transition-all"
              >
                <div className="font-bold text-rose-400 flex items-center gap-1">
                  🚫 Policy Hazard
                </div>
                <div className="text-[10px] text-neutral-400">Violation Buzzer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-between items-center text-xs">
          <span className="text-neutral-400">
            Playing: <strong className="text-white">{MUSIC_TRACKS.find((t) => t.id === currentTrack)?.title}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold cursor-pointer transition-colors"
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
