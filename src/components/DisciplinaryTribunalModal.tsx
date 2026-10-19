import React, { useState } from 'react';
import { 
  AlertTriangle, 
  UserX, 
  Users, 
  ArrowRight, 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import { soundManager } from '../utils/sound';

export type PenaltyFateOption = 
  | 'sacked'
  | 'merge_big_cdl'
  | 'join_bd_team'
  | 'sell_merchants_resign';

interface DisciplinaryTribunalModalProps {
  score: number;
  cashDisbursed: number;
  reason: string;
  cdlTier: string;
  onSelectResolution: (fate: PenaltyFateOption, details: string) => void;
  onRestartNewCareer: () => void;
}

export const DisciplinaryTribunalModal: React.FC<DisciplinaryTribunalModalProps> = ({
  score,
  cashDisbursed,
  reason,
  cdlTier,
  onSelectResolution,
  onRestartNewCareer,
}) => {
  const [chosenOption, setChosenOption] = useState<PenaltyFateOption | null>(null);
  const [resolutionConfirmed, setResolutionConfirmed] = useState(false);
  const [resolutionDetails, setResolutionDetails] = useState('');

  const handleChooseFate = (option: PenaltyFateOption, title: string) => {
    setChosenOption(option);
    setResolutionDetails(title);
    setResolutionConfirmed(true);
    soundManager.playPolicyBuzzer();
    onSelectResolution(option, title);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-2xl z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto safe-top safe-bottom">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-2 border-rose-500/60 rounded-3xl w-full max-w-lg p-5 sm:p-7 text-white shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Banner Alert */}
        <div className="text-center mb-4">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto mb-2.5 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40 mb-1">
            Section 8 Official Warning Tier Protocol
          </span>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            OPay Disciplinary Tribunal
          </h2>
          <p className="text-xs text-rose-200 mt-0.5">
            Compliance threshold breached: Your field portfolio collapsed into Warning Tier.
          </p>
        </div>

        {/* Portfolio Failure Briefing */}
        <div className="p-3.5 bg-neutral-950 rounded-2xl border border-rose-900/60 space-y-2 mb-4 text-xs">
          <div className="flex justify-between items-center text-neutral-400 pb-1.5 border-b border-neutral-900">
            <span>Breach Trigger:</span>
            <strong className="text-rose-400 font-sans">{reason}</strong>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="p-2 rounded bg-neutral-900/80">
              <span className="text-[10px] text-neutral-500 block">Final Score:</span>
              <strong className="text-white font-mono text-xs sm:text-sm">{score.toLocaleString()} PTS</strong>
            </div>
            <div className="p-2 rounded bg-neutral-900/80">
              <span className="text-[10px] text-neutral-500 block">Final Standing:</span>
              <strong className="text-amber-400 font-mono text-xs sm:text-sm">{cdlTier}</strong>
            </div>
            <div className="p-2 rounded bg-neutral-900/80">
              <span className="text-[10px] text-neutral-500 block">Disbursed Balance:</span>
              <strong className="text-rose-300 font-mono text-xs sm:text-sm truncate block">₦{cashDisbursed.toLocaleString()}</strong>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            &quot;If a CDL enters the Warning Tier, the CDL has one month to improve. If performance fails, the account may be closed. The CDL has 4 official options.&quot; (OPay New CDL Policy)
          </p>
        </div>

        {/* Option Resolution Details when selected */}
        {resolutionConfirmed && chosenOption ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-neutral-950 border border-amber-500/40 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Resolution Enacted: {resolutionDetails}
              </div>
              
              {chosenOption === 'sacked' && (
                <p className="text-neutral-300 leading-relaxed">
                  Your CDL portal credentials and merchant terminal binding have been terminated by OPay State Management. Outstanding commissions are forfeited under non-compliance clause.
                </p>
              )}
              {chosenOption === 'merge_big_cdl' && (
                <p className="text-neutral-300 leading-relaxed">
                  Your active merchant book has been assigned to a neighboring <strong>Gold 3 CDL</strong> in your market cluster. You transition into an apprentice CDL sub-agent earning 35% revenue share.
                </p>
              )}
              {chosenOption === 'join_bd_team' && (
                <p className="text-neutral-300 leading-relaxed">
                  You have been reassigned to <strong>OPay Direct POS Business Development (BD) Team</strong>. Your daily quota shifts to deploying standard retail terminals with guaranteed basic allowance.
                </p>
              )}
              {chosenOption === 'sell_merchants_resign' && (
                <p className="text-neutral-300 leading-relaxed">
                  Your active portfolio of qualifying FMCG merchants has been liquidated through the CDL buyout window. Accrued buyout value has been credited and your field contract gracefully concluded.
                </p>
              )}
            </div>

            <button
              onClick={onRestartNewCareer}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-neutral-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>START NEW CDL FIELD RUN</span>
            </button>
          </div>
        ) : (
          /* The 4 Official Policy Resolution Options */
          <div className="space-y-2.5 mb-2">
            <div className="text-[11px] uppercase font-bold text-neutral-400 px-1">
              Select Your Resolution Pathway:
            </div>

            {/* Option A: Merge Dashboard with a Big CDL */}
            <button
              onClick={() => handleChooseFate('merge_big_cdl', 'Merge Dashboard with a Big CDL')}
              className="w-full p-3 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800 border-2 border-emerald-500/40 hover:border-emerald-400 text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-emerald-300">
                    Option 1: Merge Dashboard with a Big CDL
                  </div>
                  <div className="text-[10.5px] text-neutral-400">
                    Surrender autonomy to join a Gold 3 senior partner team
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400" />
            </button>

            {/* Option B: Join Direct POS / BD Team */}
            <button
              onClick={() => handleChooseFate('join_bd_team', 'Join OPay Direct POS / BD Team')}
              className="w-full p-3 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800 border-2 border-cyan-500/40 hover:border-cyan-400 text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-cyan-300">
                    Option 2: Join OPay Direct POS / BD Team
                  </div>
                  <div className="text-[10.5px] text-neutral-400">
                    Pivot to full-time direct sales with guaranteed basic stipend
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400" />
            </button>

            {/* Option C: Sell Merchant Portfolio & Resign */}
            <button
              onClick={() => handleChooseFate('sell_merchants_resign', 'Sell Merchants & Resign gracefully')}
              className="w-full p-3 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800 border-2 border-amber-500/40 hover:border-amber-400 text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-amber-300">
                    Option 3: Sell Merchant Portfolio &amp; Resign
                  </div>
                  <div className="text-[10.5px] text-neutral-400">
                    Liquidate qualifying terminals via Nov–Dec buyout window
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400" />
            </button>

            {/* Option D: Outright Sacked by OPay (The Hardest Consequence) */}
            <button
              onClick={() => handleChooseFate('sacked', 'Permanent Termination / Sacked by OPay')}
              className="w-full p-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border-2 border-rose-500/60 hover:border-rose-400 text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-300 group-hover:text-rose-200">
                    Option 4: Outright Dismissal (Sacked by OPay)
                  </div>
                  <div className="text-[10.5px] text-neutral-400">
                    Full contract termination, terminal seizure &amp; blacklisting
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        )}

        <div className="text-[10px] text-neutral-500 text-center mt-3 pt-2 border-t border-neutral-900">
          Enforced by OPay Channel Development Policy (Aug–Nov 2026 Guidelines)
        </div>
      </div>
    </div>
  );
};
