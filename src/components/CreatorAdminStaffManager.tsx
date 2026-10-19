import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  X, 
  Check, 
  AlertTriangle,
  Briefcase,
  Search
} from 'lucide-react';
import { 
  StaffAccount, 
  StaffRole, 
  OPAY_REGIONS, 
  OPAY_STATES_BY_REGION, 
  STAFF_ROLES,
  getAllNigeriaStateNames,
  findSMInChargeOfState,
  findRMInChargeOfRegionOrState
} from '../types/staffDatabase';
import { soundManager } from '../utils/sound';

interface CreatorAdminStaffManagerProps {
  isOpen: boolean;
  onClose: () => void;
  staffDatabase: StaffAccount[];
  onManualAccountCreated: (createdAccount: StaffAccount) => void;
}

export const CreatorAdminStaffManager: React.FC<CreatorAdminStaffManagerProps> = ({
  isOpen,
  onClose,
  staffDatabase,
  onManualAccountCreated,
}) => {
  const [role, setRole] = useState<StaffRole>('CDL');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [loginId, setLoginId] = useState('');
  const [loginName, setLoginName] = useState('');
  const [region, setRegion] = useState('South West');
  const [state, setState] = useState('Lagos North'); // Defaulting with Lagos North & South partition
  const [password, setPassword] = useState('Opay#Master2026');
  const [exceptionReason, setExceptionReason] = useState('Verified legitimate account / organizational exception approval.');

  // SM Supervised States multi-selection:
  const [smSupervisedStates, setSmSupervisedStates] = useState<string[]>(['Lagos North', 'Lagos South']);

  // RM Multi-assignment state:
  const [assignedRegions, setAssignedRegions] = useState<string[]>(['South West', 'South South']);
  const [assignedStates, setAssignedStates] = useState<string[]>(['Lagos North', 'Lagos South', 'Ogun', 'Rivers']);
  const [supervisedRMs, setSupervisedRMs] = useState<string>('Tariere Briggs (Delta/Rivers), Nnamdi Eze (Aba)');

  // Quick State Filter for 36 States picker
  const [stateFilter, setStateFilter] = useState('');

  // Confirmation Review Dialog step
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const allNigerianStates = getAllNigeriaStateNames();
  const availableStates = OPAY_STATES_BY_REGION[region] || [];

  const matchedSM = findSMInChargeOfState(state, staffDatabase);
  const matchedRM = findRMInChargeOfRegionOrState(region, state, staffDatabase);

  const handleRegionChange = (newReg: string) => {
    setRegion(newReg);
    const newStates = OPAY_STATES_BY_REGION[newReg] || [];
    if (newStates.length > 0) {
      setState(newStates[0]);
    }
  };

  const toggleAssignedRegion = (reg: string) => {
    if (assignedRegions.includes(reg)) {
      if (assignedRegions.length > 1) {
        setAssignedRegions(assignedRegions.filter(r => r !== reg));
      }
    } else {
      setAssignedRegions([...assignedRegions, reg]);
    }
  };

  const toggleAssignedState = (st: string) => {
    if (assignedStates.includes(st)) {
      if (assignedStates.length > 1) {
        setAssignedStates(assignedStates.filter(s => s !== st));
      }
    } else {
      setAssignedStates([...assignedStates, st]);
    }
  };

  const toggleSMSupervisedState = (st: string) => {
    if (smSupervisedStates.includes(st)) {
      if (smSupervisedStates.length > 1) {
        setSmSupervisedStates(smSupervisedStates.filter(s => s !== st));
      }
    } else {
      setSmSupervisedStates([...smSupervisedStates, st]);
    }
  };

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginName.trim()) {
      alert('Please fill in both Login ID and Login Name.');
      return;
    }
    setShowConfirmationStep(true);
  };

  const handleFinalConfirmCreate = () => {
    const newAcc: StaffAccount = {
      id: `usr-admin-${Date.now().toString().slice(-5)}`,
      loginId: loginId.trim().toUpperCase(),
      loginName: loginName.trim(),
      role,
      gender,
      password: password || 'Opay#Master2026',
      ...(role !== 'DH' ? { region, state } : {}),
      // SM level: supervised states
      ...(role === 'SM' ? {
        supervisedStates: smSupervisedStates,
        assignedRMId: matchedRM?.loginId,
        assignedRMName: matchedRM ? `${matchedRM.loginName} (RM)` : undefined,
      } : {}),
      // CDLM & CDL placement:
      ...((role === 'CDL' || role === 'CDLM') ? {
        assignedSMId: matchedSM?.loginId,
        assignedSMName: matchedSM ? `${matchedSM.loginName} (SM)` : undefined,
        assignedRMId: matchedRM?.loginId,
        assignedRMName: matchedRM ? `${matchedRM.loginName} (RM)` : undefined,
      } : {}),
      // RM level:
      ...(role === 'RM' ? {
        assignedRegions,
        assignedStates,
        supervisedRMs: supervisedRMs ? supervisedRMs.split(',').map(s => s.trim()) : [],
      } : {}),
      tier: role === 'DH' ? 'Executive' : role === 'RM' ? 'Gold 3' : role === 'SM' ? 'Gold 3' : role === 'CDLM' ? 'Gold 2' : 'Bronze 1',
      status: 'Exception Approved',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Creator/Admin Manual Creation',
      approvalNotes: exceptionReason,
    };

    soundManager.playStampApproval();
    onManualAccountCreated(newAcc);
    setSuccessMessage(`Account ${newAcc.loginId} successfully verified & created by Creator/Admin!`);
    setShowConfirmationStep(false);

    // Reset input
    setLoginId('');
    setLoginName('');
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="bg-neutral-900 border border-amber-500/50 rounded-3xl w-full max-w-2xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Creator / Admin Account Override Console</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Configure SM states, CDLM/CDL placements under SMs &amp; RMs, and multi-regional RM assignments
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

        {/* Success Alert */}
        {successMessage && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: CREATOR CONFIRMATION REVIEW SCREEN */}
        {/* ========================================================= */}
        {showConfirmationStep ? (
          <div className="py-2 space-y-4 animate-in fade-in">
            <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Confirm Staff Account Creation (Creator Override)</span>
              </div>

              {/* Exact format from requirements */}
              {role === 'DH' ? (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 font-mono text-xs">
                  <div className="text-purple-400 font-bold font-sans text-sm pb-1 mb-1 border-b border-neutral-800">
                    Create DH Account
                  </div>
                  <div>Login ID: <strong className="text-white">{loginId.toUpperCase()}</strong></div>
                  <div>Name: <strong className="text-white">{loginName}</strong></div>
                  <div>Role: <strong className="text-purple-300">DH (Department Head)</strong></div>
                  <div>Region: <span className="text-neutral-400">Not Required</span></div>
                  <div>State: <span className="text-neutral-400">Not Required</span></div>
                </div>
              ) : role === 'RM' ? (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 font-mono text-xs">
                  <div className="text-amber-400 font-bold font-sans text-sm pb-1 mb-1 border-b border-neutral-800">
                    Create RM Account
                  </div>
                  <div>Login ID: <strong className="text-white">{loginId.toUpperCase()}</strong></div>
                  <div>Name: <strong className="text-white">{loginName}</strong></div>
                  <div>Role: <strong className="text-amber-300">RM (Regional Manager)</strong></div>
                  <div>Assigned Regions: <strong className="text-white">{assignedRegions.join(', ')}</strong></div>
                  <div>Assigned States: <strong className="text-white">{assignedStates.join(', ')}</strong></div>
                  <div>Supervises: <strong className="text-white">{supervisedRMs || 'RM Staff List'}</strong></div>
                </div>
              ) : role === 'SM' ? (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 font-mono text-xs">
                  <div className="text-teal-400 font-bold font-sans text-sm pb-1 mb-1 border-b border-neutral-800">
                    Create SM Account
                  </div>
                  <div>Login ID: <strong className="text-white">{loginId.toUpperCase()}</strong></div>
                  <div>Name: <strong className="text-white">{loginName}</strong></div>
                  <div>Role: <strong className="text-teal-300">SM (State Manager)</strong></div>
                  <div>Primary Region: <strong className="text-white">{region}</strong></div>
                  <div>Supervised States: <strong className="text-white">{smSupervisedStates.join(', ')}</strong></div>
                  <div>Reporting to RM: <strong className="text-white">{matchedRM ? matchedRM.loginName : 'Babatunde Adeleke (RM)'}</strong></div>
                </div>
              ) : (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 font-mono text-xs">
                  <div className="text-emerald-400 font-bold font-sans text-sm pb-1 mb-1 border-b border-neutral-800">
                    Create Staff Account ({role})
                  </div>
                  <div>Login ID: <strong className="text-white">{loginId.toUpperCase()}</strong></div>
                  <div>Name: <strong className="text-white">{loginName}</strong></div>
                  <div>Region: <strong className="text-white">{region}</strong></div>
                  <div>State: <strong className="text-white">{state}</strong></div>
                  <div>Assigned SM: <strong className="text-white">{matchedSM ? matchedSM.loginName : 'Default SM'}</strong></div>
                  <div>Assigned RM: <strong className="text-white">{matchedRM ? matchedRM.loginName : 'Default RM'}</strong></div>
                  <div>Role: <strong className="text-emerald-300">{role}</strong></div>
                </div>
              )}
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-300">
              <span className="font-bold text-neutral-200">Admin Verification Note:</span> {exceptionReason}
            </div>

            {/* Confirmation Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmationStep(false)}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer border border-neutral-700"
              >
                [Cancel]
              </button>

              <button
                type="button"
                onClick={handleFinalConfirmCreate}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                [Confirm &amp; Create Account]
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STEP 1: FORM INPUT FOR CREATOR / ADMIN MANUAL CREATION */
          /* ========================================================= */
          <form onSubmit={handleReviewClick} className="py-3 space-y-4">
            {/* Role & Gender Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assign Staff Role:</span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {STAFF_ROLES.map(r => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        role === r.role
                          ? 'bg-amber-500/25 border-amber-400 text-white font-bold shadow-md'
                          : 'bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-xs">{r.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Assign Gender:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      gender === 'female'
                        ? 'bg-pink-500/25 border-pink-400 text-white font-bold shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>👩🏾‍💼</span>
                    <span className="text-xs">Female</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      gender === 'male'
                        ? 'bg-blue-500/25 border-blue-400 text-white font-bold shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>👨🏾‍💼</span>
                    <span className="text-xs">Male</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Login ID / Staff ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'DH' ? 'e.g. DH12345' : role === 'RM' ? 'e.g. RM12345' : 'e.g. OP12345'}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Login Name / Staff Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'DH' ? 'e.g. Jane Smith' : role === 'RM' ? 'e.g. Michael Ade' : 'e.g. John Doe'}
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Region & State for normal staff (Not required for DH) */}
            {role !== 'DH' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Primary Operating Region:
                  </label>
                  <select
                    value={region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {OPAY_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                    <span>Primary State:</span>
                    <span className="text-[10px] text-amber-400 font-mono">36 States + Lagos N/S</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <optgroup label={`States in ${region}`}>
                      {availableStates.map(st => (
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
              </div>
            )}

            {/* SM LEVEL: ADD STATES UNDER THEM */}
            {role === 'SM' && (
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-teal-500/40 space-y-2.5">
                <div className="text-xs font-bold text-teal-300 flex items-center justify-between">
                  <span>States Supervised Under This SM:</span>
                  <span className="text-[10px] text-teal-400 font-mono">{smSupervisedStates.length} Selected</span>
                </div>

                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Filter state from 36 states..."
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-neutral-900 rounded-lg">
                  {allNigerianStates
                    .filter(s => s.toLowerCase().includes(stateFilter.toLowerCase()))
                    .map(st => {
                      const isAssigned = smSupervisedStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleSMSupervisedState(st)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-teal-500/25 border-teal-400 text-white font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {isAssigned ? '✓ ' : ''}{st}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Special RM Multi-Region & Multi-State Setup */}
            {role === 'RM' && (
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-amber-500/40 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>RM Multi-Regional Supervisory Jurisdiction:</span>
                  <span className="text-[10px] text-neutral-400">Section 7 &amp; 8 Hierarchy Control</span>
                </div>

                {/* Multiple Assigned Regions */}
                <div>
                  <div className="text-[11px] text-neutral-300 mb-1">Assigned Supervisory Regions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {OPAY_REGIONS.map(reg => {
                      const isAssigned = assignedRegions.includes(reg);
                      return (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => toggleAssignedRegion(reg)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-amber-500/30 border-amber-400 text-white font-bold'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          {isAssigned ? '✓ ' : ''}{reg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multiple Assigned States */}
                <div>
                  <div className="text-[11px] text-neutral-300 mb-1">Assigned States:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-neutral-900 rounded-lg">
                    {allNigerianStates.slice(0, 16).map(st => {
                      const isAssigned = assignedStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleAssignedState(st)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-amber-500/30 border-amber-400 text-white font-bold'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          {isAssigned ? '✓ ' : ''}{st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Supervised RMs */}
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-0.5">
                    Supervised Underlying RMs:
                  </label>
                  <input
                    type="text"
                    value={supervisedRMs}
                    onChange={(e) => setSupervisedRMs(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Password input */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Assigned Temporary / Master Password:
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Reason for Manual Creation / Override */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Creator Verification &amp; Exception Reason:
              </label>
              <textarea
                rows={2}
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Submit to Review */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>REVIEW &amp; CONFIRM OVERRIDE CREATION →</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Accounts Quick Inspection Directory */}
        <div className="mt-5 pt-3.5 border-t border-neutral-800 text-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Existing Staff Accounts in Database ({staffDatabase.length}):</span>
            <span className="text-[10px] text-emerald-400 font-mono">Database Composite Protection Active</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[10.5px]">
            {staffDatabase.map(acc => (
              <div key={acc.id} className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">{acc.loginId}</strong> — {acc.loginName} ({acc.role})
                  {acc.role !== 'DH' && <span className="text-neutral-500 ml-1.5">• {acc.state}, {acc.region}</span>}
                  {acc.role === 'SM' && acc.supervisedStates && (
                    <span className="text-teal-400/90 ml-1.5">[SM: {acc.supervisedStates.join(', ')}]</span>
                  )}
                  {acc.role === 'RM' && acc.assignedRegions && (
                    <span className="text-amber-400/80 ml-1.5">[RM: {acc.assignedRegions.join('+')}]</span>
                  )}
                </div>
                <span className="text-emerald-400/90 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10">
                  {acc.createdBy === 'Creator/Admin Manual Creation' ? 'Admin Override' : 'Registered'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
