import React, { useState } from 'react';
import { MERCHANT_ENCOUNTERS, MerchantEncounter, CDLSubLevel } from '../types/cdlPolicy';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Store, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';

interface MerchantEncounterModalProps {
  currentTier: CDLSubLevel;
  onDecisionMade: (result: {
    points: number;
    cashDisbursed: number;
    isCorrect: boolean;
    tierImpact: 'upgrade' | 'downgrade' | 'warning' | 'none';
    encounterTitle: string;
  }) => void;
  onClose: () => void;
}

export const MerchantEncounterModal: React.FC<MerchantEncounterModalProps> = ({
  currentTier,
  onDecisionMade,
  onClose,
}) => {
  // Select encounter
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const encounter: MerchantEncounter = MERCHANT_ENCOUNTERS[encounterIndex % MERCHANT_ENCOUNTERS.length];

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null) return;
    setSubmitted(true);
    const chosen = encounter.options[selectedOptionIndex];

    if (chosen.isCorrect) {
      soundManager.playRightApproach();
      soundManager.playDisbursementCash();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      soundManager.playWrongApproach();
    }
  };

  const handleContinue = () => {
    if (selectedOptionIndex === null) return;
    const chosen = encounter.options[selectedOptionIndex];

    onDecisionMade({
      points: chosen.points,
      cashDisbursed: chosen.cashDisbursed,
      isCorrect: chosen.isCorrect,
      tierImpact: chosen.tierImpact,
      encounterTitle: encounter.merchantName,
    });

    // Advance to next or close
    if (encounterIndex + 1 < MERCHANT_ENCOUNTERS.length) {
      setEncounterIndex(encounterIndex + 1);
      setSelectedOptionIndex(null);
      setSubmitted(false);
    } else {
      onClose();
    }
  };

  const selectedChoice = selectedOptionIndex !== null ? encounter.options[selectedOptionIndex] : null;

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl w-full max-w-xl modal-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Frontline Field Encounter #{encounterIndex + 1} of {MERCHANT_ENCOUNTERS.length}
              </div>
              <h3 className="font-black text-white text-sm sm:text-base">
                CDL Merchant Loan Pitch &amp; Screening
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Your CDL Tier</div>
            <div className="text-xs font-black text-emerald-400 font-mono">{currentTier}</div>
          </div>
        </div>

        {/* Merchant Dossier Card */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 modal-card-body">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-1.5">
                  {encounter.merchantName}
                </h4>
                <div className="text-xs font-semibold text-emerald-400">{encounter.businessType}</div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                  encounter.whitelistedStatus.includes('Whitelisted')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {encounter.whitelistedStatus}
              </span>
            </div>

            {/* Field Observation Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 font-semibold block text-[10px]">Location &amp; Footfall:</span>
                <span className="text-neutral-200">{encounter.footfallObservation}</span>
              </div>
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 font-semibold block text-[10px]">Loan History:</span>
                <span className="text-amber-300 font-medium">{encounter.existingLoanStatus}</span>
              </div>
            </div>

            {/* Merchant Dialogue / Objection */}
            <div className="p-3 rounded-lg bg-neutral-900 border-l-4 border-amber-400 text-xs text-neutral-200 italic">
              <span className="font-bold text-amber-400 not-italic block mb-0.5">Merchant Statement:</span>
              {encounter.merchantObjection}
            </div>
          </div>

          {/* Action Options Prompt */}
          <div>
            <div className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Choose the Correct CDL / CDLM Loan Disbursement Strategy:</span>
            </div>

            <div className="space-y-2">
              {encounter.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                let borderClass = 'border-neutral-800 bg-neutral-950 hover:border-neutral-700';

                if (isSelected) {
                  borderClass = 'border-emerald-400 bg-emerald-950/40 ring-1 ring-emerald-400';
                }

                if (submitted) {
                  if (opt.isCorrect) {
                    borderClass = 'border-emerald-500 bg-emerald-950/60 ring-2 ring-emerald-400';
                  } else if (isSelected && !opt.isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-950/60 ring-2 ring-rose-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${borderClass}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-neutral-200 leading-relaxed font-medium">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Feedback Banner after Submit */}
          {submitted && selectedChoice && (
            <div
              className={`p-3.5 rounded-xl border text-xs animate-in fade-in duration-200 ${
                selectedChoice.isCorrect
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {selectedChoice.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>CORRECT DISBURSEMENT TACTIC! (+{selectedChoice.points} PTS)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>INCORRECT APPROACH! ZERO DISBURSEMENT AWARDED</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed mb-2 text-neutral-200">{selectedChoice.explanation}</p>
              {selectedChoice.cashDisbursed > 0 && (
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  Successfully Disbursed: ₦{selectedChoice.cashDisbursed.toLocaleString()}!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          {!submitted ? (
            <>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-semibold cursor-pointer"
              >
                Skip / Return
              </button>
              <button
                disabled={selectedOptionIndex === null}
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all"
              >
                CONFIRM FIELD DECISION
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={handleContinue}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
              >
                {encounterIndex + 1 < MERCHANT_ENCOUNTERS.length ? 'NEXT MERCHANT SCENARIO' : 'FINISH ENCOUNTERS'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
