import React, { useEffect, useMemo, useState } from 'react';
import {
  SAMPLE_OFFICERS,
  OfficerMetric,
  rollupByRegion,
  nationalTotals,
} from '../types/dhAnalytics';
import { AppLanguage, t } from '../i18n/translations';
import { soundManager } from '../utils/sound';
import {
  BarChart3,
  Building2,
  AlertTriangle,
  Trophy,
  Users,
  ShieldCheck,
  LogOut,
  Search,
  Eye,
  MapPin,
  ArrowRightLeft,
  CheckCircle2,
  History,
} from 'lucide-react';
import { OPayLogo } from './OPayLogo';
import { HamvidaBrand } from './HamvidaBrand';
import {
  StaffAccount,
  NigeriaRegion,
  NIGERIA_REGIONS,
  loadStaffRegistry,
  dhUpdateStaffAssignment,
  getAllNigeriaStates,
  getStatesForRegion,
  buildHierarchyForState,
  checkNigeriaGeoUpdateOncePerDay,
  computeGenderAnalytics,
} from '../types/staffRegistry';

interface DHAnalyticsDashboardProps {
  dhName: string;
  staffCode: string;
  language: AppLanguage;
  onLogout: () => void;
  onOpenSimulatorObserve?: () => void;
  onOpenGameStudio?: () => void;
}

type RoleFilter = 'ALL' | 'RM' | 'SM' | 'CDLM' | 'CDL';
type DashTab = 'analytics' | 'transfers' | 'hierarchy' | 'gender';

export const DHAnalyticsDashboard: React.FC<DHAnalyticsDashboardProps> = ({
  dhName,
  staffCode,
  language,
  onLogout,
  onOpenSimulatorObserve,
  onOpenGameStudio,
}) => {
  const [dashTab, setDashTab] = useState<DashTab>('analytics');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  // DH transfer workspace
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [transferQuery, setTransferQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [newRegion, setNewRegion] = useState<NigeriaRegion | ''>('');
  const [newState, setNewState] = useState('');
  const [rmRegions, setRmRegions] = useState<NigeriaRegion[]>([]);
  const [rmStates, setRmStates] = useState<string[]>([]);
  const [transferReason, setTransferReason] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allStates, setAllStates] = useState<string[]>(() => getAllNigeriaStates());
  const [hierarchyState, setHierarchyState] = useState('Lagos');

  const totals = useMemo(() => nationalTotals(), []);
  const regions = useMemo(() => rollupByRegion(), []);
  const hierarchyView = useMemo(() => buildHierarchyForState(hierarchyState, staffList), [hierarchyState, staffList]);
  const genderStats = useMemo(() => computeGenderAnalytics(staffList), [staffList]);

  const refreshStaff = () => setStaffList(loadStaffRegistry());
  useEffect(() => {
    refreshStaff();
    checkNigeriaGeoUpdateOncePerDay().then((r) => setAllStates(r.config.states));
  }, []);

  const transferableStaff = useMemo(() => {
    return staffList
      .filter((a) => a.role !== 'DH')
      .filter((a) => {
        if (!transferQuery.trim()) return true;
        const q = transferQuery.toLowerCase();
        return (
          a.loginId.toLowerCase().includes(q) ||
          a.loginName.toLowerCase().includes(q) ||
          (a.region || '').toLowerCase().includes(q) ||
          (a.state || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.loginName.localeCompare(b.loginName));
  }, [staffList, transferQuery]);

  const selected = staffList.find((a) => a.accountId === selectedId) || null;
  const statesForNewRegion = newRegion ? getStatesForRegion(newRegion) : [];

  const openTransferConfirm = () => {
    setTransferError(null);
    setTransferSuccess(null);
    if (!selected) {
      setTransferError('Select a staff account first.');
      return;
    }
    if (selected.role === 'RM') {
      if (!rmRegions.length && !newRegion && !rmStates.length && !newState) {
        setTransferError('Choose the new Region(s)/State(s) for this RM.');
        return;
      }
    } else if (!newRegion || !newState) {
      setTransferError('Region and State are required for this transfer.');
      return;
    }
    if (transferReason.trim().length < 5) {
      setTransferError('Enter a real-life transfer reason (e.g. “Posted to Ogun from Lagos – March 2026”).');
      return;
    }
    setConfirmOpen(true);
    soundManager.playUiOpen();
  };

  const applyTransfer = () => {
    if (!selected) return;
    const result = dhUpdateStaffAssignment({
      targetAccountId: selected.accountId,
      dhLoginId: staffCode,
      dhName,
      newRegion: newRegion || undefined,
      newState: newState || undefined,
      newAssignedRegions: selected.role === 'RM' ? (rmRegions.length ? rmRegions : newRegion ? [newRegion] : undefined) : undefined,
      newAssignedStates: selected.role === 'RM' ? (rmStates.length ? rmStates : newState ? [newState] : undefined) : undefined,
      reason: transferReason,
    });
    setConfirmOpen(false);
    if (!result.ok) {
      setTransferError(result.error);
      soundManager.playLoginFail();
      return;
    }
    soundManager.playSubmit();
    setTransferSuccess(
      `Updated ${result.account.loginName} (${result.account.loginId}) → ${result.account.region || '—'} / ${result.account.state || '—'}`
    );
    setTransferReason('');
    setNewRegion('');
    setNewState('');
    setRmRegions([]);
    setRmStates([]);
    refreshStaff();
    setSelectedId(result.account.accountId);
  };

  const filtered: OfficerMetric[] = useMemo(() => {
    return SAMPLE_OFFICERS.filter((o) => {
      if (roleFilter !== 'ALL' && o.role !== roleFilter) return false;
      if (regionFilter !== 'ALL' && o.region !== regionFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          o.name.toLowerCase().includes(q) ||
          o.state.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [roleFilter, regionFilter, query]);

  const top = filtered.filter((o) => !o.warning).slice(0, 5);
  const watch = SAMPLE_OFFICERS.filter((o) => o.warning).sort((a, b) => a.compliance - b.compliance);

  const fmtNaira = (n: number) => {
    if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    return `₦${n.toLocaleString()}`;
  };

  return (
    <div className="app-shell bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-20 app-header-sticky">
        <div className="max-w-6xl mx-auto safe-px py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="px-2 py-1 rounded-lg bg-white shrink-0">
              <OPayLogo height={20} variant="dark" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black truncate flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                {t(language, 'dh_title')}
              </div>
              <div className="text-[11px] text-cyan-300 truncate">
                {t(language, 'welcome_dh')}: <strong>{dhName}</strong> · {staffCode} · {t(language, 'dh_read_only')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenGameStudio && (
              <button
                onClick={() => {
                  soundManager.playUiOpen();
                  onOpenGameStudio();
                }}
                className="px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold cursor-pointer"
              >
                Game Studio
              </button>
            )}
            {onOpenSimulatorObserve && (
              <button
                onClick={() => {
                  soundManager.playUiTap();
                  onOpenSimulatorObserve();
                }}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer"
              >
                {t(language, 'open_simulator_readonly')}
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playUiClose();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t(language, 'logout')}
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto safe-px pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playTabSwitch();
              setDashTab('analytics');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
              dashTab === 'analytics'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playTabSwitch();
              setDashTab('transfers');
              refreshStaff();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
              dashTab === 'transfers'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Staff Transfers
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playTabSwitch();
              setDashTab('hierarchy');
              refreshStaff();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
              dashTab === 'hierarchy'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> SM / RM Map
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playTabSwitch();
              setDashTab('gender');
              refreshStaff();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
              dashTab === 'gender'
                ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className="inline-flex items-center gap-1">Gender</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto safe-px py-4 sm:py-5 space-y-4 sm:space-y-5 w-full min-w-0">
        {dashTab === 'gender' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/5 p-4">
              <h2 className="text-sm font-black text-white">Gender Workforce &amp; Performance View</h2>
              <p className="text-xs text-neutral-300 mt-1">
                DH can see how many male and female staff are on the app, split by role, for balanced field planning.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Total on app</div>
                <div className="text-2xl font-black text-white font-mono">{genderStats.total}</div>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                <div className="text-[10px] text-cyan-400 uppercase font-bold">Male</div>
                <div className="text-2xl font-black text-cyan-300 font-mono">{genderStats.male}</div>
                <div className="text-[11px] text-neutral-400">{genderStats.malePct}% of workforce</div>
              </div>
              <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3">
                <div className="text-[10px] text-pink-400 uppercase font-bold">Female</div>
                <div className="text-2xl font-black text-pink-300 font-mono">{genderStats.female}</div>
                <div className="text-[11px] text-neutral-400">{genderStats.femalePct}% of workforce</div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Unspecified</div>
                <div className="text-2xl font-black text-neutral-300 font-mono">{genderStats.unspecified}</div>
              </div>
            </div>

            {/* simple bar */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
              <div className="text-[11px] font-bold text-neutral-300 mb-2">Workforce mix</div>
              <div className="h-4 rounded-full overflow-hidden flex bg-neutral-950">
                <div className="bg-cyan-400 h-full" style={{ width: `${genderStats.malePct}%` }} title={`Male ${genderStats.malePct}%`} />
                <div className="bg-pink-400 h-full" style={{ width: `${genderStats.femalePct}%` }} title={`Female ${genderStats.femalePct}%`} />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>♂ Male {genderStats.malePct}%</span>
                <span>♀ Female {genderStats.femalePct}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(genderStats.byRole).map(([roleName, g]) => (
                <div key={roleName} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs">
                  <div className="font-black text-white mb-2">{roleName}</div>
                  <div className="text-cyan-300">♂ {g.male}</div>
                  <div className="text-pink-300">♀ {g.female}</div>
                  <div className="text-neutral-500 mt-1">Total {g.total}</div>
                  <div className="mt-2 h-2 rounded-full overflow-hidden flex bg-neutral-950">
                    <div className="bg-cyan-400 h-full" style={{ width: `${g.total ? Math.round((g.male / g.total) * 100) : 0}%` }} />
                    <div className="bg-pink-400 h-full" style={{ width: `${g.total ? Math.round((g.female / g.total) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {dashTab === 'hierarchy' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h2 className="text-sm font-black text-white">SM / RM Hierarchy Map</h2>
              <p className="text-xs text-neutral-300 mt-1">
                Pick any of the 36 states (+ FCT). See the SM in charge of that state, the RM in charge of the region, and CDLMs/CDLs under them.
                Lagos is split into <strong>Lagos North</strong> and <strong>Lagos South</strong>.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Select State (full Nigeria list)</label>
                <select
                  value={hierarchyState}
                  onChange={(e) => setHierarchyState(e.target.value)}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                >
                  {allStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="mt-3 text-[11px] text-neutral-400">
                  Region: <strong className="text-white">{hierarchyView.region || '—'}</strong>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 space-y-2">
                <div className="text-[11px] font-bold text-cyan-300">SM in charge of state</div>
                {hierarchyView.smInCharge ? (
                  <div className="text-xs text-white">
                    <div className="font-bold">{hierarchyView.smInCharge.loginName}</div>
                    <div className="font-mono text-emerald-300">{hierarchyView.smInCharge.loginId}</div>
                    <div className="text-neutral-400 mt-1">
                      States: {(hierarchyView.smInCharge.smStates || [hierarchyView.smInCharge.state]).filter(Boolean).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">No SM assigned to this state yet.</div>
                )}
                <div className="text-[11px] font-bold text-amber-300 pt-2">RM in charge of region / states</div>
                {hierarchyView.rmInCharge ? (
                  <div className="text-xs text-white">
                    <div className="font-bold">{hierarchyView.rmInCharge.loginName}</div>
                    <div className="font-mono text-emerald-300">{hierarchyView.rmInCharge.loginId}</div>
                    <div className="text-neutral-400 mt-1">
                      Regions: {(hierarchyView.rmInCharge.assignedRegions || [hierarchyView.rmInCharge.region]).filter(Boolean).join(', ')}
                    </div>
                    <div className="text-neutral-500">
                      States: {(hierarchyView.rmInCharge.assignedStates || [hierarchyView.rmInCharge.state]).filter(Boolean).slice(0, 8).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">No RM assigned yet.</div>
                )}
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300">CDLMs in this state ({hierarchyView.cdlmsInState.length})</div>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {hierarchyView.cdlmsInState.length === 0 && <div className="text-xs text-neutral-500">None</div>}
                  {hierarchyView.cdlmsInState.map((c) => (
                    <div key={c.accountId} className="text-[11px] text-neutral-200">
                      {c.loginName} <span className="font-mono text-neutral-500">({c.loginId})</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-emerald-300 pt-1">CDLs in this state ({hierarchyView.cdlsInState.length})</div>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {hierarchyView.cdlsInState.length === 0 && <div className="text-xs text-neutral-500">None</div>}
                  {hierarchyView.cdlsInState.map((c) => (
                    <div key={c.accountId} className="text-[11px] text-neutral-200">
                      {c.loginName} <span className="font-mono text-neutral-500">({c.loginId})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {dashTab === 'transfers' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-black text-white">DH Power: Change Staff Region &amp; State</h2>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    When a staff member is posted or transferred in real life, DH can update their Region/State here.
                    Use the full 36-state + FCT list. Lagos North / Lagos South supported. Login ID never changes.
                  </p>
                </div>
              </div>
            </div>

            {transferError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">{transferError}</div>
            )}
            {transferSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {transferSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Staff picker */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <div className="p-3 border-b border-neutral-800">
                  <div className="text-xs font-bold text-white mb-2">Select staff to transfer</div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={transferQuery}
                      onChange={(e) => setTransferQuery(e.target.value)}
                      placeholder="Search Login ID, name, region, state"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-800">
                  {transferableStaff.map((a) => (
                    <button
                      key={a.accountId}
                      type="button"
                      onClick={() => {
                        setSelectedId(a.accountId);
                        setNewRegion((a.region as NigeriaRegion) || '');
                        setNewState(a.state || '');
                        setRmRegions(a.assignedRegions || []);
                        setRmStates(a.assignedStates || []);
                        setTransferError(null);
                        setTransferSuccess(null);
                        soundManager.playUiTap();
                      }}
                      className={`w-full text-left p-3 cursor-pointer transition-colors ${
                        selectedId === a.accountId ? 'bg-amber-500/10' : 'hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{a.loginName}</div>
                          <div className="text-[10px] text-emerald-300 font-mono">{a.loginId}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">{a.role}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {a.role === 'RM'
                          ? `${(a.assignedRegions || []).join(', ') || a.region || '—'} · ${(a.assignedStates || []).slice(0, 3).join(', ') || a.state || ''}`
                          : `${a.region || '—'} / ${a.state || '—'}`}
                      </div>
                    </button>
                  ))}
                  {transferableStaff.length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-500">No transferable staff found.</div>
                  )}
                </div>
              </div>

              {/* Transfer form */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
                {!selected ? (
                  <div className="text-xs text-neutral-500 py-10 text-center">Select a staff member on the left to update Region/State.</div>
                ) : (
                  <>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs">
                      <div className="text-neutral-500">Selected staff</div>
                      <div className="text-white font-bold mt-0.5">
                        {selected.loginName} <span className="text-emerald-300 font-mono font-normal">({selected.loginId})</span>
                      </div>
                      <div className="text-neutral-400 mt-1">
                        Role: <strong>{selected.role}</strong> · Current:{' '}
                        <strong>
                          {selected.region || '—'} / {selected.state || '—'}
                        </strong>
                      </div>
                    </div>

                    {selected.role === 'RM' ? (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-amber-300">RM multi-region / multi-state posting</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {NIGERIA_REGIONS.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() =>
                                setRmRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
                              }
                              className={`text-left px-2 py-1.5 rounded-lg border text-[10px] cursor-pointer ${
                                rmRegions.includes(r) ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-neutral-800 text-neutral-400'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                          {(newRegion ? getStatesForRegion(newRegion) : allStates).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRmStates((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                              className={`text-left px-2 py-1 rounded-lg border text-[10px] cursor-pointer ${
                                rmStates.includes(s) ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100' : 'border-neutral-800 text-neutral-500'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="text-[10px] text-neutral-400 font-bold">Primary Region</span>
                            <select
                              value={newRegion}
                              onChange={(e) => {
                                setNewRegion(e.target.value as NigeriaRegion | '');
                                setNewState('');
                              }}
                              className="w-full mt-1 rounded-lg bg-neutral-950 border border-neutral-700 px-2 py-2 text-xs text-white"
                            >
                              <option value="">—</option>
                              {NIGERIA_REGIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-neutral-400 font-bold">Primary State</span>
                            <select
                              value={newState}
                              onChange={(e) => setNewState(e.target.value)}
                              className="w-full mt-1 rounded-lg bg-neutral-950 border border-neutral-700 px-2 py-2 text-xs text-white"
                            >
                              <option value="">—</option>
                              {statesForNewRegion.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-[11px] font-bold text-neutral-400 mb-1 block">New Region *</span>
                          <select
                            value={newRegion}
                            onChange={(e) => {
                              setNewRegion(e.target.value as NigeriaRegion | '');
                              setNewState('');
                            }}
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                          >
                            <option value="">Select region</option>
                            {NIGERIA_REGIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold text-neutral-400 mb-1 block">New State *</span>
                          <select
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                            disabled={!newRegion}
                          >
                            <option value="">Select state</option>
                            {statesForNewRegion.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}

                    <label className="block">
                      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Transfer reason (required)</span>
                      <textarea
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        rows={3}
                        placeholder="e.g. Official posting from Lagos to Ogun effective March 2026 — approved by field ops"
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={openTransferConfirm}
                      className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-black cursor-pointer"
                    >
                      Review &amp; Apply Transfer
                    </button>

                    {!!selected.assignmentHistory?.length && (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5 mb-2">
                          <History className="w-3.5 h-3.5 text-cyan-400" />
                          Assignment history
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {[...selected.assignmentHistory].reverse().map((h) => (
                            <div key={h.id} className="text-[10px] text-neutral-400 border-b border-neutral-900 pb-1.5">
                              <div className="text-neutral-200">
                                {h.fromRegion || '—'} / {h.fromState || '—'} → {h.toRegion || '—'} / {h.toState || '—'}
                              </div>
                              <div>
                                by {h.byName} ({h.byRole}) · {new Date(h.at).toLocaleString()}
                              </div>
                              <div className="text-neutral-500">{h.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {dashTab === 'analytics' && (
        <>
        {/* National KPIs */}
        <section>
          <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            {t(language, 'national_summary')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: t(language, 'total_pos'), value: totals.potentialPOS.toLocaleString(), color: 'text-white' },
              { label: t(language, 'total_loans'), value: totals.loans3mo.toLocaleString(), color: 'text-emerald-400' },
              { label: t(language, 'portfolio_volume'), value: fmtNaira(totals.disbursedVolume), color: 'text-cyan-400' },
              { label: t(language, 'avg_compliance'), value: `${totals.avgCompliance}%`, color: 'text-amber-400' },
              { label: 'RMs / SMs', value: `${totals.rms} / ${totals.sms}`, color: 'text-white' },
              { label: 'CDLMs / CDLs', value: `${totals.cdlms} / ${totals.cdls}`, color: 'text-white' },
            ].map((k) => (
              <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">{k.label}</div>
                <div className={`text-lg font-black font-mono ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Region cards */}
        <section>
          <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            {t(language, 'all_regions')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map((r) => (
              <button
                key={r.region}
                onClick={() => {
                  soundManager.playTabSwitch();
                  setRegionFilter(r.region);
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  regionFilter === r.region
                    ? 'bg-emerald-950/40 border-emerald-500'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{r.region}</span>
                  {r.warningCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                      {r.warningCount} warning
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-neutral-300">
                  <div>POS: <strong className="text-white">{r.potentialPOS.toLocaleString()}</strong></div>
                  <div>Loans: <strong className="text-emerald-400">{r.loans3mo}</strong></div>
                  <div>Volume: <strong className="text-cyan-400">{fmtNaira(r.disbursedVolume)}</strong></div>
                  <div>Compliance: <strong className="text-amber-400">{r.avgCompliance}%</strong></div>
                </div>
                <div className="mt-2 text-[10px] text-neutral-500">
                  RM {r.rms} · SM {r.sms} · CDLM {r.cdlms} · CDL {r.cdls} · Gold {r.goldCount} / Silver {r.silverCount} / Bronze {r.bronzeCount}
                </div>
              </button>
            ))}
          </div>
          {regionFilter !== 'ALL' && (
            <button
              onClick={() => setRegionFilter('ALL')}
              className="mt-2 text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Clear region filter
            </button>
          )}
        </section>

        {/* Filters + table */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-neutral-800 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm font-black">
              <Users className="w-4 h-4 text-emerald-400" />
              {t(language, 'performance_analytics')}
            </div>
            <div className="flex flex-wrap gap-1 ml-auto">
              {(['ALL', 'RM', 'SM', 'CDLM', 'CDL'] as RoleFilter[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    soundManager.playTabSwitch();
                    setRoleFilter(role);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    roleFilter === role
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-b border-neutral-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(language, 'search_filter')}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="table-scroll">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-neutral-950 text-neutral-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'region')}</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'tier')}</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'pos')}</th>
                  <th className="px-3 py-2 font-semibold">Std%</th>
                  <th className="px-3 py-2 font-semibold">Exc%</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'loans')}</th>
                  <th className="px-3 py-2 font-semibold">Volume</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'compliance')}</th>
                  <th className="px-3 py-2 font-semibold">{t(language, 'score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filtered.map((o) => (
                  <tr key={o.id} className={o.warning ? 'bg-rose-950/20' : 'hover:bg-neutral-800/40'}>
                    <td className="px-3 py-2 font-semibold text-white whitespace-nowrap">{o.name}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 font-mono text-[10px]">{o.role}</span>
                    </td>
                    <td className="px-3 py-2 text-neutral-300 whitespace-nowrap">{o.region}</td>
                    <td className="px-3 py-2 text-amber-300 font-mono">{o.tier || '—'}</td>
                    <td className="px-3 py-2 font-mono text-white">{o.potentialPOS.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-cyan-300">{o.standardRatio}%</td>
                    <td className="px-3 py-2 font-mono text-amber-300">{o.excellentRatio}%</td>
                    <td className="px-3 py-2 font-mono text-emerald-300">{o.loans3mo}</td>
                    <td className="px-3 py-2 font-mono text-cyan-200 whitespace-nowrap">{fmtNaira(o.disbursedVolume)}</td>
                    <td className="px-3 py-2">
                      <span className={`font-mono font-bold ${o.compliance >= 90 ? 'text-emerald-400' : o.compliance >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {o.compliance}%
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-white">{o.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <h3 className="text-sm font-black flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              {t(language, 'top_performers')}
            </h3>
            <div className="space-y-2">
              {top.map((o, i) => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black flex items-center justify-center">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{o.name}</div>
                      <div className="text-[10px] text-neutral-400">{o.role} · {o.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-emerald-400">{o.score.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-500">{o.tier || o.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-neutral-900 border border-rose-500/20 rounded-2xl p-4">
            <h3 className="text-sm font-black flex items-center gap-2 mb-3 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {t(language, 'watchlist')}
            </h3>
            <div className="space-y-2">
              {watch.length === 0 ? (
                <div className="text-xs text-neutral-500">No warning-tier officers.</div>
              ) : (
                watch.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    <div>
                      <div className="text-xs font-bold text-white">{o.name}</div>
                      <div className="text-[10px] text-neutral-400">{o.role} · {o.region} · {o.tier || 'Warning'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-rose-300">{o.compliance}% compliance</div>
                      <div className="text-[10px] text-neutral-500">POS {o.potentialPOS}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              Analytics remain observational. Region/State changes are handled only in the Staff Transfers tab with full audit trail.
            </div>
          </section>
        </div>
        </>
        )}

        <div className="pt-4 pb-2 flex justify-center">
          <HamvidaBrand compact />
        </div>
      </main>

      {confirmOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-neutral-950 p-4 space-y-3">
            <h4 className="font-black text-white text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Confirm Staff Transfer
            </h4>
            <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900 rounded-xl p-3 border border-neutral-800">
              <div>
                <span className="text-neutral-500">Staff:</span>{' '}
                <strong>
                  {selected.loginName} ({selected.loginId})
                </strong>
              </div>
              <div>
                <span className="text-neutral-500">Role:</span> <strong>{selected.role}</strong>
              </div>
              <div>
                <span className="text-neutral-500">From:</span>{' '}
                <strong>
                  {selected.region || '—'} / {selected.state || '—'}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500">To:</span>{' '}
                <strong>
                  {selected.role === 'RM'
                    ? `${(rmRegions.length ? rmRegions : newRegion ? [newRegion] : []).join(', ') || '—'} / ${(rmStates.length ? rmStates : newState ? [newState] : []).slice(0, 6).join(', ') || '—'}`
                    : `${newRegion || '—'} / ${newState || '—'}`}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500">Reason:</span> {transferReason}
              </div>
              <div className="text-neutral-500 pt-1">Authorized by DH: {dhName} ({staffCode})</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyTransfer}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
