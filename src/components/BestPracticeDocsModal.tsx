import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Users, DollarSign } from 'lucide-react';
import { CDLM_MENTORS, FieldMentor } from '../types/cdlPolicy';

interface BestPracticeDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BestPracticeDocsModal: React.FC<BestPracticeDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cdlm' | 'screening' | 'vfo' | 'policy'>('cdlm');
  const [selectedCDLM, setSelectedCDLM] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md safe-top safe-bottom">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] max-h-[94dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <BookOpen className="w-5 h-5 text-neutral-950 font-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                CDLM Best Practices &amp; Field Playbook
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  OFFICIAL
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Consolidated field-tested wisdom from top 6 CDL Managers across all regions
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

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('cdlm')}
            className={`py-3 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cdlm'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 6 CDLM Managers
          </button>
          <button
            onClick={() => setActiveTab('screening')}
            className={`py-3 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'screening'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Merchant Screening &amp; Storming
          </button>
          <button
            onClick={() => setActiveTab('vfo')}
            className={`py-3 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vfo'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> VFO Prep &amp; Personal Disbursal
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`py-3 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'policy'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> 12 Sub-levels &amp; Commission
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'cdlm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CDLM_MENTORS.map((cdlm: FieldMentor, idx: number) => (
                  <button
                    key={cdlm.name}
                    onClick={() => setSelectedCDLM(idx)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedCDLM === idx
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="text-[10px] text-amber-400 font-mono font-bold">
                      CDLM #{idx + 1}
                    </div>
                    <div className="font-extrabold text-xs truncate">{cdlm.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{cdlm.signatureTactic}</div>
                  </button>
                ))}
              </div>

              {/* Selected CDLM Detail Card */}
              {CDLM_MENTORS[selectedCDLM] && (
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase font-bold text-amber-400">
                        CDLM Submission Showcase • {CDLM_MENTORS[selectedCDLM].location}
                      </div>
                      <h3 className="text-base font-black text-white">
                        {CDLM_MENTORS[selectedCDLM].name}
                      </h3>
                    </div>
                    <span className="text-2xl">
                      {selectedCDLM === 0
                        ? '📋'
                        : selectedCDLM === 1
                        ? '🔄'
                        : selectedCDLM === 2
                        ? '💬'
                        : selectedCDLM === 3
                        ? '🛡'
                        : selectedCDLM === 4
                        ? '🤝'
                        : '🏆'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-bold">
                    Primary Tactic: {CDLM_MENTORS[selectedCDLM].signatureTactic}
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Proven field-tested operational approach from {CDLM_MENTORS[selectedCDLM].name} deployed across {CDLM_MENTORS[selectedCDLM].location} to boost verified disbursement rates and lower non-performing loans.
                  </p>

                  <div>
                    <div className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5">
                      Key Takeaway &amp; Field Rule:
                    </div>
                    <div className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      <span>{CDLM_MENTORS[selectedCDLM].fieldRule}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> 1. Market Selection &amp; Storming
                </h4>
                <p className="text-neutral-300">
                  Do not focus solely on state capitals. Major commercial clusters, rural market centers, and bustling junction stalls represent some of the highest-repayment merchant loan opportunities.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                    <strong>✓ Prioritize:</strong> FMCG, fast-turnover food provision, chemist/pharmacy, daily market traders with steady customer footfall.
                  </div>
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-200">
                    <strong>✗ Avoid:</strong> Ghost shops, businesses with sporadic operating days, empty stalls, or merchants with unverified physical locations.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 2. Whitelisted Sheets &amp; Footfall Observation
                </h4>
                <p className="text-neutral-300">
                  Always start your morning by reviewing the daily Whitelisted Sheets. Combine digital pre-qualification with <em>direct physical observation</em> of the merchant's customer volume before initiating the pitch.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vfo' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Thorough VFO Preparation (Shafiu Murtala Model)
                </h4>
                <p className="text-neutral-300">
                  Incomplete documentation is the #1 cause of merchant loan rejections. Ensure all CAC registration, verified tenancy/shop lease agreements, bank utility bills, and BVN checks are assembled <em>prior</em> to the Verification Officer visit.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Personal Disbursement for High-Value Loans
                </h4>
                <p className="text-neutral-300">
                  For loan values exceeding ₦1,000,000, conduct personal disbursal visits. This builds deep merchant trust, minimizes default risk, and dramatically cuts loan application drop-offs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-400" /> 4 Tiers &amp; 12 Sub-levels
                </h4>
                <p className="text-neutral-300">
                  The new policy is structured into 4 distinct tiers (Gold, Silver, Bronze, Warning) with 3 sub-levels each.
                </p>
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-center p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                    <span className="font-bold">Gold Tier (G3, G2, G1)</span>
                    <span className="font-mono text-[11px]">&gt;500 Potential POS • &gt;70% Std • &gt;50% Exc</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-400/10 border border-slate-400/20 text-slate-200">
                    <span className="font-bold">Silver Tier (S3, S2, S1)</span>
                    <span className="font-mono text-[11px]">&gt;150-200 Potential • &gt;45-50% Std</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-amber-600/10 border border-amber-600/20 text-amber-300">
                    <span className="font-bold">Bronze Tier (B3, B2, B1)</span>
                    <span className="font-mono text-[11px]">&gt;35-55 Potential • &gt;25% Std • &gt;15% Exc</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span className="font-bold">Warning Tier (W3, W2, W1)</span>
                    <span className="font-mono text-[11px]">1 month to improve or exit / merge / Direct team</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Zero-Tolerance Compliance Rule:</strong> Volume manipulation, ghost merchants, or kickback extortion results in immediate observation downgrade or contract termination regardless of POS count.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-between items-center text-xs">
          <span className="text-neutral-400">
            Source: OPay CDLM Best Practice Sharing (6 Submissions)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer transition-colors"
          >
            Close Playbook
          </button>
        </div>
      </div>
    </div>
  );
};
