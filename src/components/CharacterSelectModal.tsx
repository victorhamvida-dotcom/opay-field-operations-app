import React, { useState } from 'react';
import { Check, Sparkles, X, User } from 'lucide-react';
import { 
  RUNNER_CHARACTERS, 
  RunnerCharacter, 
  getSelectedCharacter, 
  saveSelectedCharacter 
} from '../types/characters';
import { soundManager } from '../utils/sound';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (char: RunnerCharacter) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
}) => {
  const [selectedChar, setSelectedChar] = useState<RunnerCharacter>(() => getSelectedCharacter());

  if (!isOpen) return null;

  const handlePick = (char: RunnerCharacter) => {
    setSelectedChar(char);
    saveSelectedCharacter(char.id);
    soundManager.playCollect(1.2);
    onSelectCharacter(char);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto safe-top safe-bottom">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-emerald-500/50 rounded-3xl w-full max-w-2xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Select Your OPay CDL Field Runner</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  4 FIELD PERSONAS
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Choose your avatar to run 3-lane Lagos &amp; Kano markets, catch cash and disburse loans!
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

        {/* Character Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          {RUNNER_CHARACTERS.map((char) => {
            const isSelected = selectedChar.id === char.id;
            return (
              <div
                key={char.id}
                onClick={() => handlePick(char)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                {/* Active Selection Check badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-400 text-neutral-950 flex items-center justify-center font-bold shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 border-2"
                    style={{ 
                      backgroundColor: `${char.primaryColor}25`, 
                      borderColor: char.primaryColor 
                    }}
                  >
                    {char.avatarIcon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white truncate flex items-center gap-1.5">
                      <span>{char.name}</span>
                    </h4>
                    <div className="text-[11px] font-bold" style={{ color: char.accentColor }}>
                      {char.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {char.regionOrigin}
                    </div>
                  </div>
                </div>

                {/* Tactical Perk Box */}
                <div className="mt-3 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs space-y-0.5">
                  <div className="text-[10px] uppercase font-bold flex items-center gap-1" style={{ color: char.accentColor }}>
                    <Sparkles className="w-3 h-3" />
                    <span>Special Perk: {char.perkTitle}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    {char.perkDescription}
                  </p>
                </div>

                <div className="mt-2 text-[10.5px] italic text-neutral-400">
                  {char.quote}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Selected: <strong className="text-emerald-300">{selectedChar.name}</strong> ({selectedChar.title})
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
          >
            Confirm Character &amp; Play
          </button>
        </div>
      </div>
    </div>
  );
};
