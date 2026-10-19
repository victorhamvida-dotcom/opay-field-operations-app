import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  ArrowRight, 
  AlertTriangle,
  Briefcase,
  Check,
  Search,
  Building2
} from 'lucide-react';
import { 
  StaffRole, 
  StaffAccount, 
  OPAY_REGIONS, 
  OPAY_STATES_BY_REGION, 
  STAFF_ROLES, 
  checkStaffDuplicate,
  getAllNigeriaStateNames,
  findSMInChargeOfState,
  findRMInChargeOfRegionOrState
} from '../types/staffDatabase';
import { soundManager } from '../utils/sound';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffDatabase: StaffAccount[];
  onRegisterSuccess: (newAccount: StaffAccount) => void;
  onSelectExistingLogin: (account: StaffAccount) => void;
  onContactAdmin: () => void;
}

export const StaffRegistrationModal: React.FC<StaffRegistrationModalProps> = ({
  isOpen,
  onClose,
  staffDatabase,
  onRegisterSuccess,
  onSelectExistingLogin,
  onContactAdmin,
}) => {
  const [role, setRole] = useState<StaffRole>('CDL');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [loginId, setLoginId] = useState('');
  const [loginName, setLoginName] = useState('');
  const [region, setRegion] = useState('South West');
  const [state, setState] = useState('Lagos North'); // Defaulting with Lagos North & South partition
  const [password, setPassword] = useState('');

  // SM Specific Multi-State Supervision:
  // For SM registration, they select all states under them (e.g., Lagos North, Lagos South)
  const [smSupervisedStates, setSmSupervisedStates] = useState<string[]>(['Lagos North', 'Lagos South']);

  // RM Multi-Assignment fields (supports multiple regions & states)
  const [assignedRegions, setAssignedRegions] = useState<string[]>(['South West']);
  const [assignedStates, setAssignedStates] = useState<string[]>(['Lagos North', 'Lagos South', 'Ogun']);
  const [supervisedRMsInput, setSupervisedRMsInput] = useState('');

  // Quick State Search Filter
  const [stateSearchFilter, setStateSearchFilter] = useState('');

  // Conflict / Duplicate State Screens
  const [duplicateStatus, setDuplicateStatus] = useState<
    | null
    | { type: 'exact'; message: string; existing: StaffAccount }
    | { type: 'conflict'; message: string; existing: StaffAccount }
  >(null);

  if (!isOpen) return null;

  // Full comprehensive 36 states + FCT (including Lagos North & Lagos South)
  const allNigerianStates = getAllNigeriaStateNames();
  
  // Available states for selected region (with Lagos split into Lagos North & Lagos South)
  const regionalStates = OPAY_STATES_BY_REGION[region] || [];

  // Hierarchy Lookup:
  // For CDL or CDLM, find which SM is in charge of this state and which RM is in charge of this region
  const matchedSM = findSMInChargeOfState(state, staffDatabase);
  const matchedRM = findRMInChargeOfRegionOrState(region, state, staffDatabase);

  const handleRegionChange = (newReg: string) => {
    setRegion(newReg);
    const newStates = OPAY_STATES_BY_REGION[newReg] || [];
    if (newStates.length > 0) {
      setState(newStates[0]);
    }
  };

  const handleAssignedRegionToggle = (reg: string) => {
    if (assignedRegions.includes(reg)) {
      if (assignedRegions.length > 1) {
        setAssignedRegions(assignedRegions.filter(r => r !== reg));
      }
    } else {
      setAssignedRegions([...assignedRegions, reg]);
    }
  };

  const handleAssignedStateToggle = (st: string) => {
    if (assignedStates.includes(st)) {
      if (assignedStates.length > 1) {
        setAssignedStates(assignedStates.filter(s => s !== st));
      }
    } else {
      setAssignedStates([...assignedStates, st]);
    }
  };

  const handleSMStateToggle = (st: string) => {
    if (smSupervisedStates.includes(st)) {
      if (smSupervisedStates.length > 1) {
        setSmSupervisedStates(smSupervisedStates.filter(s => s !== st));
      }
    } else {
      setSmSupervisedStates([...smSupervisedStates, st]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateStatus(null);

    if (!loginId.trim()) {
      alert('Please enter your Staff / Login ID.');
      return;
    }
    if (!loginName.trim()) {
      alert('Please enter your Staff / Login Name.');
      return;
    }

    // Role-specific payload for background authentication / duplicate check
    const payload = {
      loginId: loginId.trim().toUpperCase(),
      loginName: loginName.trim(),
      role,
      ...(role !== 'DH' ? { region, state } : {}),
    };

    // Intelligent background check against existing staff database
    const checkResult = checkStaffDuplicate(payload, staffDatabase);

    if (checkResult.status === 'exact_match') {
      soundManager.playPolicyBuzzer();
      setDuplicateStatus({
        type: 'exact',
        message: checkResult.message,
        existing: checkResult.existingAccount,
      });
      return;
    }

    if (checkResult.status === 'partial_conflict') {
      soundManager.playPolicyBuzzer();
      setDuplicateStatus({
        type: 'conflict',
        message: checkResult.message,
        existing: checkResult.existingAccount,
      });
      return;
    }

    // No conflict - Create new account in staff database
    soundManager.playStampApproval();
    const newAcc: StaffAccount = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      loginId: payload.loginId,
      loginName: payload.loginName,
      role,
      gender,
      password: password || 'opay2026',
      ...(role !== 'DH' ? { region, state } : {}),
      // SM level: save all states under them
      ...(role === 'SM' ? {
        supervisedStates: smSupervisedStates,
        assignedRMId: matchedRM ? matchedRM.loginId : undefined,
        assignedRMName: matchedRM ? `${matchedRM.loginName} (${matchedRM.role})` : undefined,
      } : {}),
      // CDLM & CDL placement: link to in-charge SM and RM
      ...((role === 'CDL' || role === 'CDLM') ? {
        assignedSMId: matchedSM ? matchedSM.loginId : undefined,
        assignedSMName: matchedSM ? `${matchedSM.loginName} (SM)` : undefined,
        assignedRMId: matchedRM ? matchedRM.loginId : undefined,
        assignedRMName: matchedRM ? `${matchedRM.loginName} (RM)` : undefined,
      } : {}),
      // RM level: multi-regions and multi-states
      ...(role === 'RM' ? {
        assignedRegions,
        assignedStates,
        supervisedRMs: supervisedRMsInput ? supervisedRMsInput.split(',').map(s => s.trim()) : [],
      } : {}),
      tier: role === 'DH' ? 'Executive' : role === 'RM' ? 'Gold 3' : role === 'SM' ? 'Gold 3' : role === 'CDLM' ? 'Gold 2' : 'Bronze 1',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Self-Registration',
    };

    onRegisterSuccess(newAcc);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl w-full max-w-xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* ========================================================= */}
        {/* VIEW 1: EXACT MATCH DETECTED */}
        {/* ========================================================= */}
        {duplicateStatus?.type === 'exact' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black text-white">Existing Account Found</h3>
                <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                  An account already exists with these staff details.
                </p>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Please use your original account to log in. If you believe there is an issue with your existing account, please contact the administrator.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Existing Staff Profile On Record:</div>
              <div className="flex justify-between py-1 border-b border-neutral-800/80">
                <span className="text-neutral-400">Login ID:</span>
                <span className="font-mono text-emerald-400 font-bold">{duplicateStatus.existing.loginId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/80">
                <span className="text-neutral-400">Staff Name:</span>
                <span className="font-bold text-white">{duplicateStatus.existing.loginName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/80">
                <span className="text-neutral-400">Role &amp; Tier:</span>
                <span className="text-amber-300">{duplicateStatus.existing.role} ({duplicateStatus.existing.tier})</span>
              </div>
              {duplicateStatus.existing.role !== 'DH' && (
                <>
                  <div className="flex justify-between py-1 border-b border-neutral-800/80">
                    <span className="text-neutral-400">Region:</span>
                    <span className="text-white">{duplicateStatus.existing.region}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">State:</span>
                    <span className="text-white">{duplicateStatus.existing.state}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSelectExistingLogin(duplicateStatus.existing)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 text-center"
              >
                Return to Login With This Account
              </button>

              <button
                type="button"
                onClick={onContactAdmin}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer border border-neutral-700 transition-all text-center"
              >
                Contact Administrator / Creator
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDuplicateStatus(null)}
              className="w-full py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              ← Edit Registration Details
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: PARTIAL MATCH / CONFLICT DETECTED */}
        {/* ========================================================= */}
        {duplicateStatus?.type === 'conflict' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black text-white">Staff Information Requires Verification</h3>
                <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                  We found an existing staff record with some matching information.
                </p>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Please verify your Login ID, Name, Region and State where applicable. DH accounts do not require Region or State. If you are registering as DH, verify your Login ID and Name.
                </p>
                <p className="text-xs text-amber-300/90 mt-1 font-semibold">
                  If you believe your information is correct but the system is showing this warning, please contact the administrator.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Existing Staff Record:</div>
                <div>ID: <strong className="font-mono text-emerald-400">{duplicateStatus.existing.loginId}</strong></div>
                <div>Name: <strong className="text-white">{duplicateStatus.existing.loginName}</strong></div>
                <div>Role: <strong className="text-neutral-300">{duplicateStatus.existing.role}</strong></div>
                {duplicateStatus.existing.role !== 'DH' && (
                  <div>Location: <strong className="text-neutral-300">{duplicateStatus.existing.state}, {duplicateStatus.existing.region}</strong></div>
                )}
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-amber-500/40 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-amber-400">Your Submitted Input:</div>
                <div>ID: <strong className="font-mono text-emerald-400">{loginId.toUpperCase()}</strong></div>
                <div>Name: <strong className="text-white">{loginName}</strong></div>
                <div>Role: <strong className="text-neutral-300">{role}</strong></div>
                {role !== 'DH' && (
                  <div>Location: <strong className="text-neutral-300">{state}, {region}</strong></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateStatus(null)}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer border border-neutral-700 transition-all text-center"
              >
                ← Correct My Details
              </button>

              <button
                type="button"
                onClick={onContactAdmin}
                className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 text-center"
              >
                Request Creator Verification
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: MAIN REGISTRATION FORM */}
        {/* ========================================================= */}
        {!duplicateStatus && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span>Staff Registration &amp; Account Setup</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Hierarchy Placement: DH → RM → SM → CDLM → CDL
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Role & Gender Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Staff Role:</span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {STAFF_ROLES.map(r => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        role === r.role
                          ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-md'
                          : 'bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{r.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Choice: Male or Female */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Choose Gender:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
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
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
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

            {/* Field Requirement Guideline */}
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
              {role === 'DH' ? (
                <div className="text-purple-300 flex items-center gap-1.5">
                  <span className="font-bold">DH Account Note:</span> Department Head accounts only require Login ID and Name. Region and State are omitted.
                </div>
              ) : role === 'SM' ? (
                <div className="text-teal-300 flex items-center gap-1.5">
                  <span className="font-bold">SM Account Requirement:</span> Add all states under your supervision (e.g. Lagos North &amp; Lagos South).
                </div>
              ) : role === 'CDLM' ? (
                <div className="text-purple-300 flex items-center gap-1.5">
                  <span className="font-bold">CDLM Hierarchy Placement:</span> Choose your assigned state to automatically be placed under the right State Manager (SM) and Regional Manager (RM).
                </div>
              ) : role === 'RM' ? (
                <div className="text-amber-300 flex items-center gap-1.5">
                  <span className="font-bold">RM Account Note:</span> RMs can supervise multiple regions, states and underlying RMs.
                </div>
              ) : (
                <div className="text-emerald-300 flex items-center gap-1.5">
                  <span className="font-bold">CDL Required 4 Fields:</span> Login ID + Login Name + Region + State
                </div>
              )}
            </div>

            {/* Core Identification Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  1. Login ID / Staff ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'DH' ? 'e.g. DH12345' : 'e.g. OP12345'}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  2. Login Name / Staff Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'DH' ? 'e.g. Jane Smith' : 'e.g. John Doe'}
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Region & State (REQUIRED FOR NORMAL STAFF, OMITTED FOR DH) */}
            {role !== 'DH' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    3. Region:
                  </label>
                  <select
                    value={region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {OPAY_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                    <span>4. State Assignment:</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-normal">
                      Includes Lagos North &amp; South
                    </span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <optgroup label={`States in ${region}`}>
                      {regionalStates.map(st => (
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

            {/* AUTOMATED HIERARCHY MAPPING BANNER (FOR CDL & CDLM) */}
            {(role === 'CDL' || role === 'CDLM') && (
              <div className="p-3 bg-neutral-950 rounded-2xl border border-purple-500/30 space-y-1.5 text-xs">
                <div className="text-[11px] font-bold text-purple-300 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Automated Supervisory Hierarchy for {state}:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">In-Charge State Manager (SM):</span>
                    <strong className="text-white">{matchedSM ? `${matchedSM.loginName} (${matchedSM.loginId})` : 'Chinyere Okafor (Default SM)'}</strong>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">In-Charge Regional Manager (RM):</span>
                    <strong className="text-white">{matchedRM ? `${matchedRM.loginName} (${matchedRM.loginId})` : 'Babatunde Adeleke (Default RM)'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* SM LEVEL REGISTRATION: ADD STATES UNDER THEM (SECTION FROM USER PROMPT) */}
            {role === 'SM' && (
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-teal-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>States Under Your Supervision (Pick All Applicable):</span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono">
                    {smSupervisedStates.length} Selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Filter state from 36 states..."
                    value={stateSearchFilter}
                    onChange={(e) => setStateSearchFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* State Pickers List */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-900/60 rounded-xl border border-neutral-800">
                  {allNigerianStates
                    .filter(s => s.toLowerCase().includes(stateSearchFilter.toLowerCase()))
                    .map(st => {
                      const isSelected = smSupervisedStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleSMStateToggle(st)}
                          className={`text-[10.5px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-teal-500/25 border-teal-400 text-white font-bold shadow-sm'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-teal-400" />}
                          <span>{st}</span>
                        </button>
                      );
                    })}
                </div>

                {/* Reporting RM */}
                <div className="p-2 rounded bg-neutral-900 text-[11px] text-neutral-300 flex items-center justify-between">
                  <span>Reporting to Regional Manager (RM):</span>
                  <strong className="text-amber-300 font-sans">{matchedRM ? matchedRM.loginName : 'Babatunde Adeleke (RM)'}</strong>
                </div>
              </div>
            )}

            {/* RM Multi-Region & Multi-State Hierarchy Configuration */}
            {role === 'RM' && (
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-amber-500/30 space-y-2.5">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>RM Multi-Regional Jurisdictions:</span>
                  <span className="text-[10px] text-neutral-400">Multiple selections supported</span>
                </div>

                {/* Multiple Regions */}
                <div>
                  <div className="text-[11px] text-neutral-400 mb-1">Assigned Supervisory Regions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {OPAY_REGIONS.map(reg => {
                      const isAssigned = assignedRegions.includes(reg);
                      return (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => handleAssignedRegionToggle(reg)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-amber-500/25 border-amber-400 text-white font-bold'
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
                  <div className="text-[11px] text-neutral-400 mb-1">Assigned Key States (from 36 States + FCT):</div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-neutral-900 rounded-lg">
                    {allNigerianStates.slice(0, 15).map(st => {
                      const isAssigned = assignedStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleAssignedStateToggle(st)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-amber-500/25 border-amber-400 text-white font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          {isAssigned ? '✓ ' : ''}{st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Supervised RMs list */}
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-0.5">
                    Supervised Underlying RMs (Optional comma-separated):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tariere Briggs (Rivers), Nnamdi Eze (Aba)"
                    value={supervisedRMsInput}
                    onChange={(e) => setSupervisedRMsInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Password input */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Password / Access Passcode:
              </label>
              <input
                type="password"
                placeholder="Choose personal password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            {/* Submission Actions */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-neutral-950 font-black text-sm cursor-pointer shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>VERIFY IDENTITY &amp; CREATE ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10.5px] text-neutral-500 text-center leading-relaxed">
              Before creation, our background authentication verifies duplicate staff IDs, role constraints and existing records.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
