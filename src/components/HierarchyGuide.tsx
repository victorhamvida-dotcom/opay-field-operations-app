import React, { useState } from 'react';
import { ORG_HIERARCHY, OrgRole, CDLM_MENTORS, CDLSubLevel } from '../types/cdlPolicy';
import { Users, Sparkles, X, Target, TrendingUp } from 'lucide-react';

interface HierarchyGuideProps {
  currentTier: CDLSubLevel;
  onClose?: () => void;
}

export const HierarchyGuide: React.FC<HierarchyGuideProps> = ({ currentTier, onClose }) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'mentors' | 'tiers'>('hierarchy');
  const [selectedRole, setSelectedRole] = useState<OrgRole>('CDL');
  const hierarchyOrder: OrgRole[] = ['RM', 'SM', 'CDLM', 'CDL'];

  return (
    <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              OPay Field Operations & CDL Policy Architecture
            </h3>
            <p className="text-xs text-neutral-400">
              Field Command Hierarchy • CDLM Best Practices • 4 Tiers & 12 Sub-levels
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 my-3 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'hierarchy'
              ? 'bg-emerald-500 text-neutral-950 shadow-md'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          1. Field Chain of Command (RM → SM → CDLM → CDL)
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'mentors'
              ? 'bg-emerald-500 text-neutral-950 shadow-md'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          2. Six CDLM Best Practice Mentors
        </button>
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'tiers'
              ? 'bg-emerald-500 text-neutral-950 shadow-md'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          3. 4 Tiers & 12 Sub-Levels Policy
        </button>
      </div>

      {/* Tab 1: Hierarchy */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300">
            <span className="font-bold text-emerald-400">Governance Principle:</span> Success in merchant loan deployment flows down from strategic RM targets, statewide SM market storming, CDLM coaching/VFO readiness, down to on-ground CDL merchant encounters.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {hierarchyOrder.map((role) => {
              const info = ORG_HIERARCHY[role];
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-emerald-400">{info.role}</span>
                    <span className="text-[10px] text-neutral-500">Tier #{hierarchyOrder.indexOf(role) + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">{info.title}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Role Detailed Card */}
          <div className="bg-neutral-950 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                {ORG_HIERARCHY[selectedRole].title} ({selectedRole})
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Reports To: {ORG_HIERARCHY[selectedRole].reportsTo}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="font-semibold text-neutral-400">Directly Supervises: </span>
                <span className="text-white font-bold">{ORG_HIERARCHY[selectedRole].supervises}</span>
              </div>
              <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="font-semibold text-neutral-400">Field Responsibility: </span>
                <span className="text-neutral-200">{ORG_HIERARCHY[selectedRole].coreDuty}</span>
              </div>
            </div>

            {selectedRole === 'CDL' && (
              <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                <strong>Field Rule:</strong> CDLs are the frontline face of OPay! CDLs directly pitch merchants, verify footfall in physical FMCG shops, perform VFO document checks, and maintain POS terminal turnover.
              </div>
            )}
            {selectedRole === 'CDLM' && (
              <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                <strong>Field Rule:</strong> CDLMs manage teams of CDLs! CDLMs supply whitelisted lead sheets, run real-time WhatsApp coaching rooms, personally conduct high-value disbursement visits, and enforce compliance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 6 CDLM Mentors */}
      {activeTab === 'mentors' && (
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            Field-tested best practice submissions consolidated from 6 high-performing CDL Managers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {CDLM_MENTORS.map((mentor, idx) => (
              <div
                key={idx}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    CDLM {mentor.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{mentor.location}</span>
                </div>
                <div className="text-xs font-semibold text-amber-300 mb-1.5">
                  {mentor.signatureTactic}
                </div>
                <div className="text-[11px] text-neutral-300 bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 leading-snug">
                  "{mentor.fieldRule}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tiers & Sub-levels */}
      {activeTab === 'tiers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs">
            <div>
              <span className="text-neutral-400">Your Current In-Game Standing: </span>
              <span className="font-bold text-emerald-400">{currentTier}</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono">
              4 Main Tiers • 12 Sub-Levels • 90-Day New Protection
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
              <div className="font-bold text-amber-400 mb-0.5">GOLD TIER</div>
              <div className="text-[10px] text-neutral-400">Gold 1, Gold 2, Gold 3</div>
              <div className="text-[10px] text-neutral-300 mt-1">Up to &gt;500 Potential POS &amp; 10 Loans/mo</div>
            </div>
            <div className="bg-slate-400/10 border border-slate-400/30 rounded-xl p-2.5">
              <div className="font-bold text-slate-300 mb-0.5">SILVER TIER</div>
              <div className="text-[10px] text-neutral-400">Silver 1, Silver 2, Silver 3</div>
              <div className="text-[10px] text-neutral-300 mt-1">&gt;100 to &gt;200 POS &amp; 4-6 Loans/mo</div>
            </div>
            <div className="bg-amber-700/10 border border-amber-700/30 rounded-xl p-2.5">
              <div className="font-bold text-amber-600 mb-0.5">BRONZE TIER</div>
              <div className="text-[10px] text-neutral-400">Bronze 1, Bronze 2, Bronze 3</div>
              <div className="text-[10px] text-neutral-300 mt-1">&gt;30 to &gt;70 POS &amp; 2-3 Loans/mo</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
              <div className="font-bold text-rose-400 mb-0.5">WARNING TIER</div>
              <div className="text-[10px] text-neutral-400">Warning 1, Warning 2, Warning 3</div>
              <div className="text-[10px] text-rose-300 mt-1">1 Month to improve or account closure</div>
            </div>
          </div>

          {/* Quick Metrics Reference Table */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs overflow-x-auto">
            <div className="font-bold text-white mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Core Metric Equation: POS Volume + POS Quality + Loan Performance + Compliance
            </div>
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-1">Level</th>
                  <th className="py-1">Potential POS (&gt;30d, &gt;₦300)</th>
                  <th className="py-1">Standard (&gt;₦920)</th>
                  <th className="py-1">Excellent (&gt;₦1,400)</th>
                  <th className="py-1">Avg Loans (3mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                <tr>
                  <td className="py-1 font-bold text-amber-400">Gold 3</td>
                  <td>&gt;500 POS</td>
                  <td>&gt;70%</td>
                  <td>&gt;50%</td>
                  <td className="text-emerald-400 font-bold">10 loans/mo</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-amber-300">Gold 1</td>
                  <td>&gt;300 POS</td>
                  <td>&gt;55%</td>
                  <td>&gt;40%</td>
                  <td>7 loans/mo</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-slate-300">Silver 2</td>
                  <td>&gt;150 POS</td>
                  <td>&gt;45%</td>
                  <td>&gt;30%</td>
                  <td>5 loans/mo</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-amber-600">Bronze 1</td>
                  <td>&gt;30 POS (&gt;35 new)</td>
                  <td>&gt;25%</td>
                  <td>&gt;15%</td>
                  <td>2 loans/mo</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-rose-400">Warning 1</td>
                  <td>Other / Below std</td>
                  <td>&lt;1%</td>
                  <td>&lt;0.5%</td>
                  <td>0 loans/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
