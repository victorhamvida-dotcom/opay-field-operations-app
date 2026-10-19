import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  LogOut, 
  DollarSign, 
  Briefcase, 
  Layers, 
  ChevronRight, 
  Filter,
  MapPin,
  Check,
  X,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { NATIONAL_REGIONS_AUDIT, RMReport, SMReport, CDLMReport } from '../types/dhAnalytics';
import { 
  StaffAccount, 
  OPAY_REGIONS, 
  OPAY_STATES_BY_REGION, 
  getAllNigeriaStateNames,
  findSMInChargeOfState,
  findRMInChargeOfRegionOrState
} from '../types/staffDatabase';
import { OPayLogo } from './OPayLogo';
import { HamvidaLogo } from './HamvidaLogo';
import { soundManager } from '../utils/sound';

interface DHAnalyticsDashboardProps {
  dhName: string;
  dhStaffCode: string;
  staffDatabase: StaffAccount[];
  onUpdateStaffLocation: (staffId: string, newRegion: string, newState: string, auditReason: string) => void;
  onOpenGenderAnalytics: () => void;
  onOpenPolicyEngine: () => void;
  onLogout: () => void;
}

export const DHAnalyticsDashboard: React.FC<DHAnalyticsDashboardProps> = ({
  dhName,
  dhStaffCode,
  staffDatabase,
  onUpdateStaffLocation,
  onOpenGenderAnalytics,
  onOpenPolicyEngine,
  onLogout,
}) => {
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number>(0);
  const [selectedSMIndex, setSelectedSMIndex] = useState<number>(0);
  const [selectedCDLMIndex, setSelectedCDLMIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewLevel, setActiveViewLevel] = useState<'regional' | 'state' | 'cdlm' | 'cdl' | 'reassignment'>('regional');

  // Staff Reassignment Dialog State
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [targetRegion, setTargetRegion] = useState<string>('South West');
  const [targetState, setTargetState] = useState<string>('Lagos North');
  const [reassignReason, setReassignReason] = useState<string>('Official field relocation approved by Department Head.');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentRegion: RMReport = NATIONAL_REGIONS_AUDIT[selectedRegionIndex] || NATIONAL_REGIONS_AUDIT[0];
  const currentSM: SMReport = currentRegion.stateManagers[selectedSMIndex] || currentRegion.stateManagers[0];
  const currentCDLM: CDLMReport = currentSM.cdlms[selectedCDLMIndex] || currentSM.cdlms[0];

  // Aggregated National Numbers across all 5 RM Regions
  const nationalTotalDisbursed = NATIONAL_REGIONS_AUDIT.reduce((acc, r) => acc + r.totalDisbursementPortfolio, 0);
  const nationalActiveMerchants = NATIONAL_REGIONS_AUDIT.reduce((acc, r) => acc + r.activeMerchantsCount, 0);
  const nationalAvgNPL = (NATIONAL_REGIONS_AUDIT.reduce((acc, r) => acc + r.nplRate, 0) / NATIONAL_REGIONS_AUDIT.length).toFixed(2);
  const nationalAvgGrowth = (NATIONAL_REGIONS_AUDIT.reduce((acc, r) => acc + r.overallGrowthMoM, 0) / NATIONAL_REGIONS_AUDIT.length).toFixed(1);

  // Field CDLs from active selected CDLM
  const filteredCDLs = currentCDLM ? currentCDLM.cdlTeam.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.tier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Filter staff in the staff database for location management (excludes DH who don't have region/state)
  const reassignableStaff = staffDatabase.filter(s => 
    s.role !== 'DH' && (
      s.loginName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.state && s.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.region && s.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const allNigerianStates = getAllNigeriaStateNames();

  const handleOpenReassignModal = (staff: StaffAccount) => {
    setEditingStaff(staff);
    const initReg = staff.region || 'South West';
    setTargetRegion(initReg);
    const validStates = OPAY_STATES_BY_REGION[initReg] || [];
    setTargetState(staff.state && validStates.includes(staff.state) ? staff.state : (validStates[0] || 'Lagos North'));
    setReassignReason('Official field relocation approved by Department Head.');
  };

  const handleRegionChange = (newReg: string) => {
    setTargetRegion(newReg);
    const states = OPAY_STATES_BY_REGION[newReg] || [];
    if (states.length > 0) {
      setTargetState(states[0]);
    }
  };

  const handleExecuteReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!reassignReason.trim()) {
      alert('Please provide an official justification for the DH jurisdictional reassignment.');
      return;
    }

    soundManager.playStampApproval();
    onUpdateStaffLocation(editingStaff.id, targetRegion, targetState, reassignReason.trim());
    setSuccessToast(`Officer ${editingStaff.loginName} (${editingStaff.loginId}) successfully transferred to ${targetState}, ${targetRegion} by DH decree.`);
    setEditingStaff(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-12 selection:bg-purple-500 selection:text-neutral-950 safe-top safe-bottom">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-white rounded-lg shadow-[0_0_15px_rgba(29,206,159,0.3)]">
              <OPayLogo height={22} variant="dark" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                EXECUTIVE DEPARTMENT HEAD (DH) NATIONAL INTELLIGENCE SUITE
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  GOVERNANCE &amp; REASSIGNMENT
                </span>
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Executive: <strong className="text-purple-300">{dhName}</strong></span>
                <span>•</span>
                <span>Staff Code: <strong className="text-neutral-200 font-mono">{dhStaffCode}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Hierarchy Oversight: DH → RM → SM → CDLM → CDL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onOpenPolicyEngine}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 text-emerald-300 border border-emerald-400/50 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer touch-btn shadow-sm"
              title="DH Executive Power: Paste Policy & Synthesize Simulator Game Mode"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Policy AI Synthesizer</span>
            </button>

            <button
              onClick={onOpenGenderAnalytics}
              className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-btn"
              title="DH Diversity & Gender-Based Performance Analysis"
            >
              <span>👩🏾‍💼/👨🏾‍💼</span>
              <span>Gender Analytics</span>
            </button>

            <button
              onClick={() => setActiveViewLevel('reassignment')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-btn ${
                activeViewLevel === 'reassignment'
                  ? 'bg-purple-500 text-neutral-950 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
              }`}
              title="Department Head Power: Relocate Staff Region & State"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Jurisdiction Relocation ({reassignableStaff.length})</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer touch-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Success Feedback Alert */}
        {successToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-xs sm:text-sm text-emerald-200 flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* National Performance KPIs Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-purple-950/40 border border-purple-500/30 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-semibold flex items-center justify-between">
              <span>National Portfolio</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              ₦{(nationalTotalDisbursed / 1000000).toFixed(1)}M
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              ↑ +{nationalAvgGrowth}% MoM Expansion
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-emerald-950/40 border border-emerald-500/30 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-semibold flex items-center justify-between">
              <span>Active Merchants</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {nationalActiveMerchants.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              FMCG &amp; Retail Whitelist Stores
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-teal-950/40 border border-teal-500/30 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-semibold flex items-center justify-between">
              <span>Portfolio NPL Rate</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-1">
              {nationalAvgNPL}%
            </div>
            <div className="text-[11px] text-teal-400/80 mt-1">
              Benchmark Target: &lt; 2.5%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-amber-950/40 border border-amber-500/30 shadow-lg">
            <div className="text-xs text-neutral-400 uppercase font-semibold flex items-center justify-between">
              <span>DH Governance Authority</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              5 Regions / 36 States + Lagos N/S
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">
              {staffDatabase.length} Registered Accounts Managed
            </div>
          </div>
        </section>

        {/* Drill-Down Hierarchy Navigation Bar */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto py-1 max-w-full">
            <span className="text-neutral-400 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Audit View:
            </span>
            <button
              onClick={() => setActiveViewLevel('regional')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeViewLevel === 'regional'
                  ? 'bg-purple-500 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              1. Regional Managers (RM)
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <button
              onClick={() => setActiveViewLevel('state')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeViewLevel === 'state'
                  ? 'bg-purple-500 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              2. State Managers (SM)
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <button
              onClick={() => setActiveViewLevel('cdlm')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeViewLevel === 'cdlm'
                  ? 'bg-purple-500 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              3. CDL Managers (CDLM)
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <button
              onClick={() => setActiveViewLevel('cdl')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeViewLevel === 'cdl'
                  ? 'bg-purple-500 text-neutral-950 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              4. Field Officers (CDL)
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <button
              onClick={() => setActiveViewLevel('reassignment')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                activeViewLevel === 'reassignment'
                  ? 'bg-amber-400 text-neutral-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>5. Change Staff Region &amp; State</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff name, ID, state or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* VIEW 5: DH STAFF REGION & STATE REASSIGNMENT MANAGEMENT */}
        {/* Shows: Staff, Role, Current State/Region, Supervising SM and RM */}
        {/* ========================================================= */}
        {activeViewLevel === 'reassignment' ? (
          <section className="bg-neutral-900 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl space-y-0 animate-in fade-in">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Department Head (DH) Staff Location &amp; Jurisdiction Reassignment Console
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      The DH can see which State Manager (SM) is in charge of each state and which Regional Manager (RM) is in charge of the region and underlying states.
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                {reassignableStaff.length} Officers Eligible for Relocation
              </span>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-semibold text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-3">Staff Member / ID</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Assigned State</th>
                    <th className="py-2.5 px-3">Assigned Region</th>
                    <th className="py-2.5 px-3">In-Charge State Manager (SM)</th>
                    <th className="py-2.5 px-3">In-Charge Regional Manager (RM)</th>
                    <th className="py-2.5 px-3 text-right">DH Executive Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {reassignableStaff.map((staff) => {
                    const matchedSM = staff.state ? findSMInChargeOfState(staff.state, staffDatabase) : undefined;
                    const matchedRM = (staff.region && staff.state) ? findRMInChargeOfRegionOrState(staff.region, staff.state, staffDatabase) : undefined;

                    return (
                      <tr key={staff.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-white">
                          <div>{staff.loginName}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{staff.loginId}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            staff.role === 'RM' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : staff.role === 'SM'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              : staff.role === 'CDLM'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {staff.role}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-emerald-300 font-sans font-bold">
                          {staff.role === 'SM' && staff.supervisedStates && staff.supervisedStates.length > 0 ? (
                            <div>
                              <div className="text-white">{staff.state} (Primary)</div>
                              <div className="text-[10px] text-teal-400 font-normal">Supervises: {staff.supervisedStates.join(', ')}</div>
                            </div>
                          ) : (
                            staff.state || '—'
                          )}
                        </td>

                        <td className="py-3 px-3 text-white font-sans font-semibold">
                          {staff.role === 'RM' && staff.assignedRegions && staff.assignedRegions.length > 0 ? (
                            <div>
                              <div>{staff.region}</div>
                              <div className="text-[10px] text-amber-400 font-normal">Regions: {staff.assignedRegions.join(', ')}</div>
                            </div>
                          ) : (
                            staff.region || '—'
                          )}
                        </td>

                        {/* In-charge SM */}
                        <td className="py-3 px-3 font-sans text-neutral-300">
                          {staff.role === 'SM' ? (
                            <span className="text-teal-400 font-bold">Self (State Manager)</span>
                          ) : staff.role === 'RM' ? (
                            <span className="text-neutral-500">Supervises SM Units</span>
                          ) : matchedSM ? (
                            <div>
                              <span className="text-teal-300 font-bold">{matchedSM.loginName}</span>
                              <div className="text-[10px] text-neutral-500 font-mono">{matchedSM.loginId}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-500">Unassigned SM</span>
                          )}
                        </td>

                        {/* In-charge RM */}
                        <td className="py-3 px-3 font-sans text-neutral-300">
                          {staff.role === 'RM' ? (
                            <span className="text-amber-400 font-bold">Self (Regional Manager)</span>
                          ) : matchedRM ? (
                            <div>
                              <span className="text-amber-300 font-bold">{matchedRM.loginName}</span>
                              <div className="text-[10px] text-neutral-500 font-mono">{matchedRM.loginId}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-500">Unassigned RM</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => handleOpenReassignModal(staff)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer touch-btn"
                          >
                            Change Region/State →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <>
            {/* 1. Regional Managers (RM) Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Regional Managers (RM) Portfolio Performance &amp; State Jurisdictions
                </h3>
                <span className="text-xs text-neutral-400">Click a Region to inspect State Managers &amp; CDLMs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {NATIONAL_REGIONS_AUDIT.map((rm, idx) => {
                  const isSelected = selectedRegionIndex === idx;
                  return (
                    <div
                      key={rm.id}
                      onClick={() => {
                        setSelectedRegionIndex(idx);
                        setSelectedSMIndex(0);
                        setSelectedCDLMIndex(0);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-900 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                          : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                          {rm.id}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">+{rm.overallGrowthMoM}% MoM</span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white mt-2 truncate">{rm.name}</h4>
                      <p className="text-xs text-neutral-400 truncate">{rm.regionName}</p>

                      <div className="mt-2 text-[10.5px] text-amber-300/80">
                        States: {rm.statesCovered.join(', ')}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-neutral-800/80 space-y-1 text-xs">
                        <div className="flex justify-between text-neutral-300">
                          <span className="text-neutral-500 text-[11px]">Disbursed:</span>
                          <strong className="text-white font-mono">₦{(rm.totalDisbursementPortfolio / 1000000).toFixed(1)}M</strong>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="text-neutral-500 text-[11px]">NPL Rate:</span>
                          <strong className="text-emerald-400 font-mono">{rm.nplRate}%</strong>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="text-neutral-500 text-[11px]">Active Merchants:</span>
                          <span className="text-neutral-200 font-mono">{rm.activeMerchantsCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. State Managers (SM) & CDLM Drilldown */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* State Manager Info Card */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="text-xs uppercase font-bold text-neutral-400 flex items-center justify-between">
                  <span>State Manager (SM) Oversight</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                    {currentSM.id}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">{currentSM.name}</h4>
                  <p className="text-xs text-neutral-400">Jurisdiction: {currentSM.state} ({currentSM.region})</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">State Volume</div>
                    <div className="text-sm font-black text-white font-mono mt-0.5">
                      ₦{(currentSM.monthlyDisbursementVolume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Compliance Score</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                      {currentSM.complianceRating}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 space-y-1 pt-1">
                  <div>• Supervises: <strong className="text-white">{currentSM.cdlmsCount} CDLM Units</strong></div>
                  <div>• Active POS Terminals: <strong className="text-white font-mono">{currentSM.totalActivePOS} Terminals</strong></div>
                </div>
              </div>

              {/* CDLM Manager Showcase */}
              <div className="lg:col-span-2 p-4 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    Active CDL Manager (CDLM): {currentCDLM.name}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {currentCDLM.id}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong>Core Field Tactic:</strong> {currentCDLM.primaryTactic}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">CDL Field Reps</div>
                    <div className="text-sm font-black text-white font-mono">{currentCDLM.cdlsSupervised} Officers</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Disbursed (Month)</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      ₦{(currentCDLM.totalDisbursedMonth / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">VFO Pass Rate</div>
                    <div className="text-sm font-black text-purple-400 font-mono">{currentCDLM.vfoPassRate}%</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Refinance Rate</div>
                    <div className="text-sm font-black text-teal-400 font-mono">{currentCDLM.refinanceRate}%</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Granular CDL Field Officer Audit Table */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl space-y-0">
              <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Underlying CDL Officer Performance Roster ({currentCDLM.name}&apos;s Team)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Audit metrics: Potential POS, Standard Ratio (&gt;30d, &gt;₦920/mo), Excellent Ratio (&gt;₦1,400/mo), Average Monthly Loans
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Showing {filteredCDLs.length} CDLs
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-semibold text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Officer Name / ID</th>
                      <th className="py-2.5 px-3">CDL Tier</th>
                      <th className="py-2.5 px-3">Potential POS</th>
                      <th className="py-2.5 px-3">Standard Ratio (&gt;₦920)</th>
                      <th className="py-2.5 px-3">Excellent Ratio (&gt;₦1.4k)</th>
                      <th className="py-2.5 px-3">Avg Loans/Mo</th>
                      <th className="py-2.5 px-3">Total Disbursed</th>
                      <th className="py-2.5 px-3">Compliance</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {filteredCDLs.map((cdl) => {
                      const isGold = cdl.tier.includes('Gold');
                      const isSilver = cdl.tier.includes('Silver');
                      const isWarning = cdl.tier.includes('Warning');

                      return (
                        <tr key={cdl.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-3 font-sans font-bold text-white">
                            <div>{cdl.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{cdl.id} • Joined {cdl.joinedDate}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGold
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : isSilver
                                ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                                : isWarning
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-600/20 text-amber-300 border border-amber-600/30'
                            }`}>
                              {cdl.tier}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-bold text-neutral-200">{cdl.potentialPOS} POS</td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${cdl.standardRatio}%` }} />
                              </div>
                              <span className="font-bold text-white">{cdl.standardRatio}%</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400" style={{ width: `${cdl.excellentRatio}%` }} />
                              </div>
                              <span className="font-bold text-white">{cdl.excellentRatio}%</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-bold text-amber-400">{cdl.avgMonthlyLoans} / mo</td>

                          <td className="py-3 px-3 font-bold text-emerald-300">
                            ₦{(cdl.disbursedTotal / 1000000).toFixed(2)}M
                          </td>

                          <td className="py-3 px-3">
                            <span className={`font-bold ${cdl.complianceScore >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {cdl.complianceScore}%
                            </span>
                          </td>

                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cdl.status === 'Top Performer'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : cdl.status === 'Warning'
                                ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}>
                              {cdl.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Regional Strategy & Policy Guidance Note */}
        <section className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-neutral-300 space-y-2">
          <div className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Executive Department Head (DH) Governance Directive
          </div>
          <p className="leading-relaxed">
            As Department Head, evaluate your CDL Managers not on raw gross counts, but on <strong>portfolio health (NPL &lt; 1.5%), Standard ratio (&gt; 40%)</strong>, and <strong>refinancing conversion efficiency</strong>. When market expansions or field transfers occur in real life, utilize the <strong>Change Staff Region &amp; State</strong> authority above to keep the company database completely aligned with reality.
          </p>
        </section>

        {/* Official Hamvida Tech Signature Bar at Bottom of DH Suite */}
        <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 border-t border-neutral-900 gap-2">
          <span>OPay National Field Operations Executive Dashboard • Confidential Supervisory Tool</span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-[#F6D870]/30 shadow-sm">
            <HamvidaLogo size={15} />
            <span className="text-[11.5px] font-bold text-white tracking-tight flex items-center gap-1">
              <span className="text-neutral-400 font-medium">Made by</span>
              <span className="text-[#F6D870] font-black">Hamvida Tech</span>
            </span>
          </div>
        </footer>
      </main>

      {/* ========================================================= */}
      {/* POPUP MODAL: DH STAFF LOCATION REASSIGNMENT FORM */}
      {/* ========================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto safe-top safe-bottom">
          <div className="bg-neutral-900 border border-amber-500/50 rounded-3xl w-full max-w-lg p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">DH Executive Reassignment</h4>
                  <p className="text-xs text-neutral-400">Transfer officer to a new operational Region and State</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReassignment} className="py-3.5 space-y-4 text-xs">
              {/* Target Staff Summary */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Officer Name:</span>
                  <strong className="text-white font-sans text-sm">{editingStaff.loginName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Login ID / Staff Code:</span>
                  <strong className="text-emerald-400 font-mono">{editingStaff.loginId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Staff Role:</span>
                  <span className="text-amber-300 font-bold">{editingStaff.role}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-400">Current Assignment:</span>
                  <span className="text-neutral-300 font-bold">{editingStaff.state || 'N/A'}, {editingStaff.region || 'N/A'}</span>
                </div>
              </div>

              {/* New Region Select */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Select New Operating Region:
                </label>
                <select
                  value={targetRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {OPAY_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              {/* New State Select from 36 States + Lagos N/S */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                  <span>Select New Operating State:</span>
                  <span className="text-[10px] text-amber-400 font-mono">Includes Lagos North &amp; South</span>
                </label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <optgroup label={`States in ${targetRegion}`}>
                    {(OPAY_STATES_BY_REGION[targetRegion] || []).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All 36 States + FCT (Nigeria)">
                    {allNigerianStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* DH Justification Reason */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  DH Executive Reassignment Justification (Audit Logged):
                </label>
                <textarea
                  rows={2}
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Relocated to supervise expanding Dawanau FMCG cluster..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This will update the officer&apos;s region and state in the official staff database across all OPay systems immediately.
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer border border-neutral-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  Confirm &amp; Update Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
