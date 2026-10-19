import React, { useMemo, useState } from 'react';
import {
  StaffAccount,
  StaffRole,
  StaffGender,
  NigeriaRegion,
  NIGERIA_REGIONS,
  loadStaffRegistry,
  saveStaffRegistry,
  creatorCreateStaff,
  checkStaffDuplicate,
  normalizeId,
  getAllNigeriaStates,
  getStatesForRegion,
  checkNigeriaGeoUpdateOncePerDay,
  computeGenderAnalytics,
} from '../types/staffRegistry';
import { soundManager } from '../utils/sound';
import {
  X,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  Search,
  Users,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CreatorStaffAdminProps {
  adminName: string;
  onClose: () => void;
}

type AdminTab = 'directory' | 'create';

export const CreatorStaffAdmin: React.FC<CreatorStaffAdminProps> = ({ adminName, onClose }) => {
  const [tab, setTab] = useState<AdminTab>('directory');
  const [registry, setRegistry] = useState<StaffAccount[]>(() => loadStaffRegistry());
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | StaffRole>('ALL');
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [loginId, setLoginId] = useState('');
  const [loginName, setLoginName] = useState('');
  const [role, setRole] = useState<StaffRole>('CDL');
  const [gender, setGender] = useState<StaffGender | ''>('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [region, setRegion] = useState<NigeriaRegion | ''>('');
  const [stateName, setStateName] = useState('');
  const [assignedRegions, setAssignedRegions] = useState<NigeriaRegion[]>([]);
  const [assignedStates, setAssignedStates] = useState<string[]>([]);
  const [supervisedRmText, setSupervisedRmText] = useState('');
  const [notes, setNotes] = useState('');
  const [forceException, setForceException] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [precheckMsg, setPrecheckMsg] = useState<string | null>(null);
  const [allStates, setAllStates] = useState<string[]>(() => getAllNigeriaStates());

  React.useEffect(() => {
    checkNigeriaGeoUpdateOncePerDay().then((r) => setAllStates(r.config.states));
  }, []);

  const statesForRegion = region ? getStatesForRegion(region) : [];

  const filtered = useMemo(() => {
    return registry
      .filter((a) => (roleFilter === 'ALL' ? true : a.role === roleFilter))
      .filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          a.loginId.toLowerCase().includes(q) ||
          a.loginName.toLowerCase().includes(q) ||
          (a.region || '').toLowerCase().includes(q) ||
          (a.state || '').toLowerCase().includes(q) ||
          (a.gender || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.loginName.localeCompare(b.loginName));
  }, [registry, query, roleFilter]);

  const genderStats = useMemo(() => computeGenderAnalytics(registry), [registry]);

  const refresh = () => setRegistry(loadStaffRegistry());

  const toggleRegion = (r: NigeriaRegion) => {
    setAssignedRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const toggleState = (s: string) => {
    setAssignedStates((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const runPrecheck = () => {
    const check = checkStaffDuplicate(
      { loginId, loginName, role, region: region || undefined, state: stateName || undefined },
      registry
    );
    if (check.verdict === 'none' || check.verdict === 'name_only') {
      setPrecheckMsg(check.verdict === 'name_only' ? 'Name exists on other IDs (allowed). No blocking conflict.' : 'No blocking conflict found.');
      return true;
    }
    setPrecheckMsg(`${check.messageTitle}\n${check.reasons.join(' · ')}`);
    return forceException && check.verdict !== 'exact';
  };

  const openConfirm = () => {
    setError(null);
    setFlash(null);
    if (!loginId.trim() || !loginName.trim() || !password.trim() || !gender) {
      setError(!gender ? 'Select Male or Female.' : 'Login ID, Login Name and Password are required.');
      soundManager.playLoginFail();
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (role !== 'DH' && role !== 'RM' && (!region || !stateName)) {
      setError('Region and State are required for this staff role.');
      return;
    }
    runPrecheck();
    setConfirmOpen(true);
    soundManager.playUiOpen();
  };

  const confirmCreate = () => {
    const result = creatorCreateStaff(
      {
        loginId,
        loginName,
        role,
        password,
        gender: gender as StaffGender,
        region: region || undefined,
        state: stateName || undefined,
        assignedRegions: role === 'RM' ? assignedRegions : undefined,
        assignedStates: role === 'RM' ? assignedStates : undefined,
        supervisedRmIds:
          role === 'RM'
            ? supervisedRmText
                .split(/[,\n]/)
                .map((s) => normalizeId(s))
                .filter(Boolean)
            : undefined,
        notes,
        forceDespiteConflict: forceException,
      },
      adminName
    );

    if (!result.ok) {
      setError(result.error);
      setConfirmOpen(false);
      soundManager.playLoginFail();
      return;
    }

    soundManager.playPasswordReset();
    setFlash(`Account created: ${result.account.loginId} — ${result.account.loginName} (${result.account.role})`);
    setConfirmOpen(false);
    setLoginId('');
    setLoginName('');
    setPassword('');
    setRegion('');
    setStateName('');
    setAssignedRegions([]);
    setAssignedStates([]);
    setSupervisedRmText('');
    setNotes('');
    setForceException(false);
    setPrecheckMsg(null);
    refresh();
    setTab('directory');
  };

  const setStatus = (accountId: string, status: StaffAccount['status']) => {
    const list = loadStaffRegistry().map((a) => (a.accountId === accountId ? { ...a, status } : a));
    saveStaffRegistry(list);
    refresh();
    soundManager.playUiTap();
  };

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl modal-card shadow-2xl">
        <div className="p-3 sm:p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Creator / Admin</div>
            <h3 className="text-base sm:text-lg font-black text-white truncate">Staff Registry &amp; Manual Account Control</h3>
            <p className="text-[11px] text-neutral-400 truncate">
              Signed in as {adminName} · DH needs no Region/State · RM supports multi-region hierarchy
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-neutral-800 text-neutral-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 sm:px-4 pt-3 flex gap-2 border-b border-neutral-800">
          <TabBtn active={tab === 'directory'} onClick={() => setTab('directory')} icon={<Users className="w-3.5 h-3.5" />} label="Directory" />
          <TabBtn active={tab === 'create'} onClick={() => setTab('create')} icon={<UserPlus className="w-3.5 h-3.5" />} label="Create Account" />
        </div>

        <div className="modal-card-body p-3 sm:p-4 space-y-3">
          {flash && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {flash}
            </div>
          )}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}

          {tab === 'directory' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5">
                  <div className="text-[10px] text-neutral-500 uppercase font-bold">Total staff</div>
                  <div className="text-lg font-black text-white font-mono">{genderStats.total}</div>
                </div>
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5">
                  <div className="text-[10px] text-cyan-400 uppercase font-bold">Male</div>
                  <div className="text-lg font-black text-cyan-300 font-mono">{genderStats.male} <span className="text-xs text-neutral-500">({genderStats.malePct}%)</span></div>
                </div>
                <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-2.5">
                  <div className="text-[10px] text-pink-400 uppercase font-bold">Female</div>
                  <div className="text-lg font-black text-pink-300 font-mono">{genderStats.female} <span className="text-xs text-neutral-500">({genderStats.femalePct}%)</span></div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5">
                  <div className="text-[10px] text-neutral-500 uppercase font-bold">Unspecified</div>
                  <div className="text-lg font-black text-neutral-300 font-mono">{genderStats.unspecified}</div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <div className="text-[11px] font-bold text-neutral-300 mb-2">Gender by role</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                  {Object.entries(genderStats.byRole).map(([roleName, g]) => (
                    <div key={roleName} className="rounded-lg bg-neutral-900 border border-neutral-800 p-2">
                      <div className="font-bold text-white mb-1">{roleName}</div>
                      <div className="text-cyan-300">♂ {g.male}</div>
                      <div className="text-pink-300">♀ {g.female}</div>
                      <div className="text-neutral-500">Total {g.total}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Login ID, name, region, state"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'ALL' | StaffRole)}
                  className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="ALL">All roles</option>
                  <option value="DH">DH</option>
                  <option value="RM">RM</option>
                  <option value="SM">SM</option>
                  <option value="CDLM">CDLM</option>
                  <option value="CDL">CDL</option>
                </select>
              </div>

              <div className="table-scroll rounded-xl border border-neutral-800">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-neutral-950 text-neutral-400">
                    <tr>
                      <th className="px-3 py-2">Login ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Gender</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Region / State</th>
                      <th className="px-3 py-2">Source</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filtered.map((a) => (
                      <tr key={a.accountId} className="hover:bg-neutral-800/40">
                        <td className="px-3 py-2 font-mono text-emerald-300 whitespace-nowrap">{a.loginId}</td>
                        <td className="px-3 py-2 font-semibold text-white whitespace-nowrap">{a.loginName}</td>
                        <td className="px-3 py-2 capitalize text-[11px]">
                          {a.gender === 'male' ? <span className="text-cyan-300">♂ Male</span> : a.gender === 'female' ? <span className="text-pink-300">♀ Female</span> : <span className="text-neutral-500">—</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-[10px]">{a.role}</span>
                        </td>
                        <td className="px-3 py-2 text-neutral-300">
                          {a.role === 'DH' ? (
                            <span className="text-neutral-500">Not required</span>
                          ) : a.role === 'RM' ? (
                            <span className="text-[11px]">
                              {(a.assignedRegions || []).join(', ') || a.region || '—'}
                              <br />
                              <span className="text-neutral-500">{(a.assignedStates || []).slice(0, 4).join(', ') || a.state || ''}</span>
                            </span>
                          ) : (
                            <span>
                              {a.region || '—'} / {a.state || '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-neutral-400 text-[10px]">
                          {a.createdBy}
                          {a.createdByAdminName ? ` · ${a.createdByAdminName}` : ''}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              a.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : a.status === 'locked'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {a.status !== 'active' && (
                              <button onClick={() => setStatus(a.accountId, 'active')} className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 text-[10px] cursor-pointer">
                                Activate
                              </button>
                            )}
                            {a.status !== 'locked' && (
                              <button onClick={() => setStatus(a.accountId, 'locked')} className="px-2 py-1 rounded bg-rose-500/15 text-rose-300 text-[10px] cursor-pointer">
                                Lock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                          No staff records match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-neutral-500">
                Registry size: {registry.length} accounts · Existing data is never wiped · Exact Login ID duplicates are blocked · Name-only matches are allowed
              </p>
            </>
          )}

          {tab === 'create' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-[11px] text-neutral-400">
                Manual creation is for verified exceptions only. Self-registration still runs automatic duplicate protection. Never silently overwrite existing staff records.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Field label="Login ID / Staff ID" value={loginId} onChange={setLoginId} placeholder="OP12345 / DH12345 / RM12345" mono />
                <Field label="Login Name / Staff Name" value={loginName} onChange={setLoginName} placeholder="John Doe" />
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 mb-1">Gender *</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setGender('male')} className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${gender === 'male' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-neutral-700 text-neutral-400'}`}>♂ Male</button>
                    <button type="button" onClick={() => setGender('female')} className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${gender === 'female' ? 'border-pink-400 bg-pink-500/15 text-pink-200' : 'border-neutral-700 text-neutral-400'}`}>♀ Female</button>
                  </div>
                </div>
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Role</span>
                  <select
                    value={role}
                    onChange={(e) => {
                      const r = e.target.value as StaffRole;
                      setRole(r);
                      if (r === 'DH') {
                        setRegion('');
                        setStateName('');
                      }
                    }}
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="CDL">CDL</option>
                    <option value="CDLM">CDLM</option>
                    <option value="SM">SM</option>
                    <option value="RM">RM</option>
                    <option value="DH">DH</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Temporary Password</span>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 pr-10 text-sm text-white"
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer p-1">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>
              </div>

              {role === 'DH' ? (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-200">
                  DH accounts do <strong>not</strong> require Region or State.
                </div>
              ) : role === 'RM' ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-amber-300">RM multi-assignment (hierarchy)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {NIGERIA_REGIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRegion(r)}
                        className={`text-left px-2 py-1.5 rounded-lg border text-[11px] cursor-pointer ${
                          assignedRegions.includes(r) ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-neutral-800 text-neutral-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                    {allStates.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleState(s)}
                        className={`text-left px-2 py-1 rounded-lg border text-[10px] cursor-pointer ${
                          assignedStates.includes(s) ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <Field
                    label="Supervised RM Login IDs (comma-separated)"
                    value={supervisedRmText}
                    onChange={setSupervisedRmText}
                    placeholder="RM-SW-02, RM-SS-01"
                    mono
                  />
                  <p className="text-[10px] text-neutral-500">RM may supervise many RMs and multiple Regions/States. Existing assignments are never silently replaced here without your review.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="block">
                      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">Region (Lagos North / Lagos South supported)</span>
                      <select
                        value={region}
                        onChange={(e) => {
                          setRegion(e.target.value as NigeriaRegion | '');
                          setStateName('');
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
                      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">State (full 36 + FCT list)</span>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">Select state</option>
                        {allStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {(role === 'SM' || role === 'CDLM') && (
                    <div>
                      <div className="text-[11px] font-bold text-neutral-300 mb-1">
                        {role === 'SM' ? 'States under this SM' : 'States under this CDLM'}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-36 overflow-y-auto">
                        {allStates.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleState(s)}
                            className={`text-left px-2 py-1 rounded-lg border text-[10px] cursor-pointer ${
                              assignedStates.includes(s) || stateName === s
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                : 'border-neutral-800 text-neutral-500'
                            }`}
                          >
                            {(assignedStates.includes(s) || stateName === s) ? '✓ ' : ''}{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!!region && statesForRegion.length > 0 && (
                    <div className="text-[10px] text-neutral-500">Region quick list also available: {statesForRegion.slice(0, 8).join(', ')}...</div>
                  )}
                </div>
              )}

              <Field label="Admin notes (optional)" value={notes} onChange={setNotes} placeholder="Verification notes / ticket reference" />

              <label className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 cursor-pointer">
                <input type="checkbox" checked={forceException} onChange={(e) => setForceException(e.target.checked)} className="mt-0.5" />
                <span className="text-[11px] text-amber-100">
                  <strong>Force create verified exception</strong> — only after you investigated a partial conflict. Still cannot create a second account with an existing Login ID (no overwrite).
                </span>
              </label>

              {precheckMsg && (
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-[11px] text-neutral-300 whitespace-pre-wrap flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  {precheckMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    runPrecheck();
                    soundManager.playUiTap();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold cursor-pointer"
                >
                  Run duplicate check
                </button>
                <button
                  type="button"
                  onClick={openConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black cursor-pointer"
                >
                  Review &amp; Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-neutral-950 p-4 space-y-3">
            <h4 className="font-black text-white text-sm">
              {role === 'DH' ? 'Create DH Account' : role === 'RM' ? 'Create RM Account' : 'Create Staff Account'}
            </h4>
            <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900 rounded-xl p-3 border border-neutral-800">
              <div>
                <span className="text-neutral-500">Login ID:</span> <strong className="font-mono text-emerald-300">{normalizeId(loginId)}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Name:</span> <strong>{loginName.trim()}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Role:</span> <strong>{role}</strong>
              </div>
              {role === 'DH' ? (
                <>
                  <div>
                    <span className="text-neutral-500">Region:</span> Not Required
                  </div>
                  <div>
                    <span className="text-neutral-500">State:</span> Not Required
                  </div>
                </>
              ) : role === 'RM' ? (
                <>
                  <div>
                    <span className="text-neutral-500">Assigned Regions:</span> {assignedRegions.join(', ') || '—'}
                  </div>
                  <div>
                    <span className="text-neutral-500">Assigned States:</span> {assignedStates.join(', ') || '—'}
                  </div>
                  <div>
                    <span className="text-neutral-500">Supervises:</span> {supervisedRmText || '—'}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-neutral-500">Region:</span> {region || '—'}
                  </div>
                  <div>
                    <span className="text-neutral-500">State:</span> {stateName || '—'}
                  </div>
                </>
              )}
              <div className="text-neutral-500 pt-1">Will be recorded as Creator-manual by {adminName}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmCreate} className="flex-1 py-2.5 rounded-xl bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer">
                Confirm &amp; Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-b-2 ${
        active ? 'border-amber-400 text-amber-300' : 'border-transparent text-neutral-400 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-neutral-400 mb-1 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 ${
          mono ? 'font-mono uppercase' : ''
        }`}
      />
    </label>
  );
}
