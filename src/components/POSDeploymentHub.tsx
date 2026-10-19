import React, { useState } from 'react';
import { CDLPortfolioState, calculateCDLTier, CDL_TIER_TABLE } from '../types/cdlFullEngine';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Server, ArrowUpCircle, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, X } from 'lucide-react';

interface POSDeploymentHubProps {
  portfolio: CDLPortfolioState;
  onDeployPOS: (impact: {
    potentialChange: number;
    standardChange: number;
    excellentChange: number;
    cost: number;
    earningsBonus: number;
    complianceDelta: number;
    type: 'fmcg_excellent' | 'standard_retail' | 'low_dormant' | 'terminal_stacking_trap';
  }) => void;
  onClose: () => void;
}

export const POSDeploymentHub: React.FC<POSDeploymentHubProps> = ({
  portfolio,
  onDeployPOS,
  onClose,
}) => {
  const currentTier = calculateCDLTier(portfolio);
  const stdRatio = portfolio.potentialPOS > 0 ? ((portfolio.standardPOS / portfolio.potentialPOS) * 100).toFixed(1) : '0';
  const excRatio = portfolio.potentialPOS > 0 ? ((portfolio.excellentPOS / portfolio.potentialPOS) * 100).toFixed(1) : '0';

  // Find next tier target
  const currentIdx = CDL_TIER_TABLE.findIndex((t) => t.subLevel === currentTier);
  const nextTarget = currentIdx < CDL_TIER_TABLE.length - 1 ? CDL_TIER_TABLE[currentIdx + 1] : null;

  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const handleAction = (type: 'fmcg_excellent' | 'standard_retail' | 'low_dormant' | 'terminal_stacking_trap') => {
    if (type === 'fmcg_excellent') {
      soundManager.playPosDeploy();
      soundManager.playTierUp();
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      onDeployPOS({
        potentialChange: 15,
        standardChange: 15,
        excellentChange: 12,
        cost: 30000,
        earningsBonus: 65000,
        complianceDelta: 5,
        type,
      });
      setLastActionMessage('✅ SUCCESS: Deployed 15 Terminals to Whitelisted FMCG Supermarkets! Both Standard and Excellent ratios surged.');
    } else if (type === 'standard_retail') {
      soundManager.playPosDeploy();
      onDeployPOS({
        potentialChange: 10,
        standardChange: 8,
        excellentChange: 2,
        cost: 20000,
        earningsBonus: 35000,
        complianceDelta: 2,
        type,
      });
      setLastActionMessage('✅ Deployed 10 Terminals to Busy Retail Shops. Standard POS ratio strengthened.');
    } else if (type === 'low_dormant') {
      soundManager.playWrongApproach();
      onDeployPOS({
        potentialChange: 8,
        standardChange: 1,
        excellentChange: 0,
        cost: 15000,
        earningsBonus: 5000,
        complianceDelta: -2,
        type,
      });
      setLastActionMessage('⚠️ CAUTION: Deployed to Low-Footfall Kiosks. Low monthly revenue drags down your Standard/Excellent ratios!');
    } else if (type === 'terminal_stacking_trap') {
      soundManager.playWrongApproach();
      soundManager.playTierDown();
      onDeployPOS({
        potentialChange: 25,
        standardChange: 0,
        excellentChange: 0,
        cost: 40000,
        earningsBonus: 0,
        complianceDelta: -30,
        type,
      });
      setLastActionMessage('❌ AUDIT VIOLATION: Stacked 25 Unbound/Dormant Terminals without real transactions! Audit penalty applied to compliance.');
    }
  };

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl w-full max-w-2xl modal-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                P.E.A.K. Field Management System
              </div>
              <h3 className="font-black text-white text-base sm:text-lg">
                POS Deployment &amp; Tier Upgrade Command Hub
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 modal-card-body">
          {/* Current Tier & Formula Status Banner */}
          <div className="bg-neutral-950 border border-emerald-500/30 rounded-xl p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-800">
              <div>
                <span className="text-xs text-neutral-400">Current Assessed Tier: </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {currentTier}
                </span>
                {portfolio.daysOnboarded <= 90 && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    🛡️ New CDL 90-Day Protection Active
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-300">
                Compliance Score: <strong className={portfolio.complianceScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}>{portfolio.complianceScore}%</strong>
              </div>
            </div>

            {/* Live 5 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Potential POS (&gt;30d, &gt;₦300):</span>
                <strong className="text-white text-sm font-mono">{portfolio.potentialPOS} Terminals</strong>
              </div>
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Standard Ratio (&gt;₦920):</span>
                <strong className="text-cyan-400 text-sm font-mono">{stdRatio}% ({portfolio.standardPOS})</strong>
              </div>
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Excellent Ratio (&gt;₦1,400):</span>
                <strong className="text-amber-400 text-sm font-mono">{excRatio}% ({portfolio.excellentPOS})</strong>
              </div>
              <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">3-Mo Avg Loan Sales:</span>
                <strong className="text-emerald-400 text-sm font-mono">{portfolio.recentLoansSold} Loans / mo</strong>
              </div>
            </div>

            {/* Next Target Checklist */}
            {nextTarget && (
              <div className="mt-3 p-2.5 bg-neutral-900/70 border border-neutral-800 rounded-lg flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                  Target: Upgrade to {nextTarget.subLevel}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Needs: <strong>{nextTarget.minPotentialPOS} POS</strong> • <strong>{nextTarget.minStandardRatio}% Std</strong> • <strong>{nextTarget.minExcellentRatio}% Exc</strong> • <strong>{nextTarget.minMonthlyLoans} Loans</strong>
                </span>
              </div>
            )}
          </div>

          {/* Action Message feedback */}
          {lastActionMessage && (
            <div className="p-3 bg-neutral-950 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 animate-in fade-in">
              {lastActionMessage}
            </div>
          )}

          {/* Deployment Strategic Choices */}
          <div>
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Choose Your POS Deployment &amp; Portfolio Optimization Strategy:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Whitelisted FMCG */}
              <button
                onClick={() => handleAction('fmcg_excellent')}
                className="p-3 bg-neutral-950 hover:bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-left cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Whitelisted FMCG Supermarket Sweep
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug mb-2">
                  Deploy to verified high-footfall FMCG retailers. Boosts both Potential POS count and drives &gt;₦1,400 monthly revenue for high Excellent ratio!
                </p>
                <div className="text-[10px] text-neutral-400 flex items-center gap-2 border-t border-neutral-900 pt-1.5">
                  <span className="text-emerald-400 font-bold">+15 POS (+12 Exc)</span>
                  <span>•</span>
                  <span>+₦65k Weekly Incentive</span>
                </div>
              </button>

              {/* Option 2: Standard Busy Commercial Retail */}
              <button
                onClick={() => handleAction('standard_retail')}
                className="p-3 bg-neutral-950 hover:bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">
                    General Commercial Market Storming
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                    SOLID TURNOVER
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug mb-2">
                  Deploy to electronics, auto-spare parts, and wholesale grains. Generates steady &gt;₦920 monthly transactions to elevate Standard POS ratio.
                </p>
                <div className="text-[10px] text-neutral-400 flex items-center gap-2 border-t border-neutral-900 pt-1.5">
                  <span className="text-cyan-400 font-bold">+10 POS (+8 Std)</span>
                  <span>•</span>
                  <span>+₦35k Commission</span>
                </div>
              </button>

              {/* Option 3: Low footfall kiosks (Hazard) */}
              <button
                onClick={() => handleAction('low_dormant')}
                className="p-3 bg-neutral-950 hover:bg-amber-950/30 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Deploy to Low-Traffic Roadside Kiosks
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                    RATIO DRAG RISK
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug mb-2">
                  Adds raw POS count but merchants generate &lt;₦300/mo. Low revenue dilutes your Standard and Excellent percentages!
                </p>
                <div className="text-[10px] text-rose-400 flex items-center gap-2 border-t border-neutral-900 pt-1.5">
                  <span>Dilutes Tier Ratios</span>
                  <span>•</span>
                  <span>-2% Compliance</span>
                </div>
              </button>

              {/* Option 4: Stacking dead terminals (Severe Violation) */}
              <button
                onClick={() => handleAction('terminal_stacking_trap')}
                className="p-3 bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-rose-400">
                    Artificially Stack Unbound Terminals
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    POLICY VIOLATION
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug mb-2">
                  Attempt to inflate inventory numbers with dormant terminals. Triggers immediate policy downgrade and risk of warning tier!
                </p>
                <div className="text-[10px] text-rose-400 font-bold flex items-center gap-2 border-t border-neutral-900 pt-1.5">
                  <span>-30% Compliance</span>
                  <span>•</span>
                  <span>Warning Tier Strike</span>
                </div>
              </button>
            </div>
          </div>

          {/* Three Earning Channels Explanation (CDL New Policy §9.2) */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs">
            <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Three Earning Channels for High-Tier CDLs:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-300 mt-2">
              <div className="p-2 bg-neutral-900 rounded-lg">
                <span className="font-bold text-emerald-400 block">Every Day:</span>
                Base Commission based on daily active merchant turnover.
              </div>
              <div className="p-2 bg-neutral-900 rounded-lg">
                <span className="font-bold text-amber-400 block">Every Monday:</span>
                High-Quality POS Incentive from qualifying Standard &amp; Excellent terminals.
              </div>
              <div className="p-2 bg-neutral-900 rounded-lg">
                <span className="font-bold text-cyan-400 block">Every Month:</span>
                New Deployment Reward for expanding verified active merchant network.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Remember: <strong className="text-white">POS Volume + POS Quality + Loan Sales + Compliance = Gold Tier.</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer shadow-md"
          >
            Apply to Field Run
          </button>
        </div>
      </div>
    </div>
  );
};
