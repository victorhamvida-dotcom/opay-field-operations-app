import React, { useEffect, useState } from 'react';
import {
  MUSIC_PLAYLIST,
  MusicPlaybackState,
  MusicTrackId,
  soundManager,
} from '../utils/sound';
import {
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ListMusic,
} from 'lucide-react';

interface MusicPlayerProps {
  compact?: boolean;
  onClose?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ compact = false, onClose }) => {
  const [state, setState] = useState<MusicPlaybackState>(soundManager.getMusicState());
  const [showList, setShowList] = useState(!compact);

  useEffect(() => {
    return soundManager.onMusicState(setState);
  }, []);

  const togglePlay = () => {
    soundManager.unlock();
    soundManager.playUiTap();
    if (state.playing) {
      soundManager.setMusicEnabled(false);
    } else {
      soundManager.startMusic(state.trackId);
    }
  };

  const selectTrack = (id: MusicTrackId) => {
    soundManager.unlock();
    soundManager.playTabSwitch();
    soundManager.selectTrack(id);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900/90 border border-neutral-700">
        <button
          onClick={togglePlay}
          className="p-1 rounded-md hover:bg-neutral-800 text-emerald-400 cursor-pointer"
          title={state.playing ? 'Pause music' : 'Play music'}
        >
          {state.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <div className="min-w-0 max-w-[110px]">
          <div className="text-[10px] font-bold text-white truncate leading-tight">
            {state.track.title}
          </div>
          <div className="text-[9px] text-neutral-500 truncate">{state.track.bpm} BPM</div>
        </div>
        <button
          onClick={() => {
            soundManager.playUiTap();
            soundManager.nextTrack();
          }}
          className="p-1 rounded-md hover:bg-neutral-800 text-neutral-300 cursor-pointer"
          title="Next track"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      <div className="p-3 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-white">Field Ops Music Deck</div>
            <div className="text-[10px] text-neutral-400">Playlist keeps runs &amp; study modes lively</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              soundManager.playUiClose();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Now playing */}
      <div className="p-4 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div
          className="rounded-xl p-3 border mb-3"
          style={{ borderColor: `${state.track.color}55`, background: `${state.track.color}15` }}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: state.track.color }}>
            Now Playing
          </div>
          <div className="text-base font-black text-white mt-0.5">{state.track.title}</div>
          <div className="text-xs text-neutral-300 mt-0.5">{state.track.mood}</div>
          <div className="text-[10px] text-neutral-400 mt-1 font-mono">{state.track.bpm} BPM</div>
        </div>

        {/* Transport */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            onClick={() => {
              soundManager.playUiTap();
              soundManager.prevTrack();
            }}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 cursor-pointer shadow-[0_0_18px_rgba(16,185,129,0.45)]"
          >
            {state.playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              soundManager.playUiTap();
              soundManager.nextTrack();
            }}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volumes */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Music2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="w-14 text-neutral-400">Music</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.musicVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                soundManager.setMusicVolume(v);
                setState(soundManager.getMusicState());
              }}
              className="flex-1 accent-emerald-500"
            />
            <button
              onClick={() => {
                soundManager.setMusicEnabled(!state.musicEnabled);
                if (!state.musicEnabled) soundManager.startMusic(state.trackId);
              }}
              className="p-1 text-neutral-300 cursor-pointer"
              title="Mute music"
            >
              {state.musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="w-14 text-neutral-400">SFX</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.sfxVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                soundManager.setSfxVolume(v);
                soundManager.setSfxEnabled(v > 0.01);
                setState(soundManager.getMusicState());
              }}
              className="flex-1 accent-cyan-500"
            />
            <button
              onClick={() => {
                const next = !state.sfxEnabled;
                soundManager.setSfxEnabled(next);
                if (next) soundManager.playUiTap();
                setState(soundManager.getMusicState());
              }}
              className="p-1 text-neutral-300 cursor-pointer"
              title="Mute SFX"
            >
              {state.sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="border-t border-neutral-800">
        <button
          onClick={() => {
            soundManager.playTabSwitch();
            setShowList((v) => !v);
          }}
          className="w-full px-4 py-2 text-left text-xs font-bold text-neutral-300 hover:bg-neutral-800/60 cursor-pointer flex items-center justify-between"
        >
          <span>Playlist ({MUSIC_PLAYLIST.length} tracks)</span>
          <span className="text-neutral-500">{showList ? 'Hide' : 'Show'}</span>
        </button>
        {showList && (
          <div className="max-h-48 overflow-y-auto divide-y divide-neutral-800/80">
            {MUSIC_PLAYLIST.map((track) => {
              const active = track.id === state.trackId;
              return (
                <button
                  key={track.id}
                  onClick={() => selectTrack(track.id)}
                  className={`w-full text-left px-4 py-2.5 cursor-pointer transition-colors ${
                    active ? 'bg-emerald-500/10' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${active ? 'text-emerald-300' : 'text-white'}`}>
                        {active && state.playing ? '▶ ' : ''}
                        {track.title}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">{track.mood}</div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">{track.bpm}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
