import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, RefreshCw, X, UserCheck, Lock, Mail, Phone, Copy } from 'lucide-react';
import { soundManager } from '../utils/sound';

export interface CDLUserAccount {
  id: string;
  name: string;
  cdlCode: string; // e.g. OPay-CDL-LAG-014
  email: string;
  phone: string;
  region: string;
  state: string;
  role: 'CDL' | 'CDLM' | 'SM' | 'RM';
  tier: string;
  status: 'Active' | 'Locked (Failed Logins)' | 'Password Reset Pending';
  lastResetDate?: string;
  tempPassword?: string;
}

export const INITIAL_CDL_ACCOUNTS: CDLUserAccount[] = [
  {
    id: 'u1',
    name: 'Ibrahim Danjuma',
    cdlCode: 'OPAY-CDL-KAN-102',
    email: 'i.danjuma@opay-field.ng',
    phone: '+234 803 219 4481',
    region: 'North-West',
    state: 'Kano State',
    role: 'CDL',
    tier: 'Bronze 2',
    status: 'Locked (Failed Logins)',
  },
  {
    id: 'u2',
    name: 'Blessing Okon',
    cdlCode: 'OPAY-CDL-RIV-045',
    email: 'b.okon@opay-field.ng',
    phone: '+234 812 770 1933',
    region: 'South-South',
    state: 'Rivers State',
    role: 'CDL',
    tier: 'Silver 1',
    status: 'Password Reset Pending',
  },
  {
    id: 'u3',
    name: 'Taiwo Adeyemi',
    cdlCode: 'OPAY-CDL-LAG-289',
    email: 't.adeyemi@opay-field.ng',
    phone: '+234 901 445 8820',
    region: 'South-West',
    state: 'Lagos State',
    role: 'CDL',
    tier: 'Gold 1',
    status: 'Active',
  },
  {
    id: 'u4',
    name: 'Shafiu Murtala',
    cdlCode: 'OPAY-CDLM-KAD-007',
    email: 's.murtala@opay-field.ng',
    phone: '+234 806 551 2290',
    region: 'North-West',
    state: 'Kaduna State',
    role: 'CDLM',
    tier: 'Gold 3',
    status: 'Active',
  },
  {
    id: 'u5',
    name: 'Chinedu Eze',
    cdlCode: 'OPAY-CDL-EN-088',
    email: 'c.eze@opay-field.ng',
    phone: '+234 802 991 3004',
    region: 'South-East',
    state: 'Enugu State',
    role: 'CDL',
    tier: 'Warning 2',
    status: 'Locked (Failed Logins)',
  }
];

interface PasswordResetPortalProps {
  onClose: () => void;
}

export const PasswordResetPortal: React.FC<PasswordResetPortalProps> = ({ onClose }) => {
  const [accounts, setAccounts] = useState<CDLUserAccount[]>(INITIAL_CDL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<CDLUserAccount | null>(INITIAL_CDL_ACCOUNTS[0]);
  const [customPassword, setCustomPassword] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);
  const [requirePasswordChangeOnLogin, setRequirePasswordChangeOnLogin] = useState(true);

  // Quick search filter
  const filtered = accounts.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cdlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSecureTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let res = 'OPay#';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handlePerformReset = (isRandom: boolean) => {
    if (!selectedUser) return;
    const finalPassword = isRandom ? generateSecureTempPassword() : (customPassword.trim() || generateSecureTempPassword());

    soundManager.playCollect(1.3);

    const updated = accounts.map((acc) => {
      if (acc.id === selectedUser.id) {
        return {
          ...acc,
          status: 'Active' as const,
          tempPassword: finalPassword,
          lastResetDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return acc;
    });

    setAccounts(updated);
    setSelectedUser((prev) => prev ? {
      ...prev,
      status: 'Active',
      tempPassword: finalPassword,
      lastResetDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : null);

    setCustomPassword('');
    setResetSuccessNotice(`Password reset successfully for ${selectedUser.name}! Temporary Key: ${finalPassword}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    alert(`Copied temporary credentials: ${text}\nReady to dispatch to CDL via official WhatsApp group.`);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl w-full max-w-3xl max-h-[95vh] max-h-[95dvh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Creator / Supervisor Admin Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  CDL &amp; Field Staff Account Recovery Console
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase border border-emerald-500/40">
                  Creator / Admin Mode
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Instantly resolve field login lockouts, dispatch temporary credentials, and clear failed attempt counters
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

        {/* Success Banner */}
        {resetSuccessNotice && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetSuccessNotice}</span>
            </div>
            <button
              onClick={() => setResetSuccessNotice(null)}
              className="text-emerald-400 hover:underline text-[11px] font-semibold cursor-pointer shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body: Left User Directory, Right Actions */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left Column: CDL User Directory (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                Search Field Agent (Name, Code, State):
              </label>
              <input
                type="text"
                placeholder="e.g. Ibrahim, OPay-CDL-KAN, Lagos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {filtered.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                const isLocked = user.status.includes('Locked') || user.status.includes('Pending');

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setResetSuccessNotice(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-white truncate">{user.name}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{user.cdlCode}</span>
                      <span className="font-mono text-neutral-300">{user.state}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9.5px] text-neutral-400 font-medium">Tier: {user.tier}</span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                          isLocked
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Account Investigation & Reset Execution (7 cols) */}
          <div className="md:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
            {selectedUser ? (
              <div className="space-y-3.5">
                {/* Agent Header Card */}
                <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-black text-white text-sm sm:text-base">{selectedUser.name}</h4>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      ID: {selectedUser.cdlCode} • {selectedUser.role} ({selectedUser.tier})
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedUser.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>

                {/* Contact & Verification details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-mono text-neutral-200 truncate">{selectedUser.phone}</span>
                  </div>
                  <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-mono text-neutral-200 truncate">{selectedUser.email}</span>
                  </div>
                </div>

                {/* Last Reset Alert if applicable */}
                {selectedUser.tempPassword && (
                  <div className="p-2.5 bg-neutral-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Active Temporary Password:</div>
                      <div className="text-sm font-black font-mono text-white tracking-widest">{selectedUser.tempPassword}</div>
                      <div className="text-[9.5px] text-neutral-500">Issued at {selectedUser.lastResetDate}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`Agent: ${selectedUser.name}\nCode: ${selectedUser.cdlCode}\nTemp Password: ${selectedUser.tempPassword}\nPortal: https://opay-field.internal`)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy Credentials</span>
                    </button>
                  </div>
                )}

                {/* Reset Execution Panel */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Manual Password Assignment (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-generate secure OPay# key"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="forceChange"
                      checked={requirePasswordChangeOnLogin}
                      onChange={(e) => setRequirePasswordChangeOnLogin(e.target.checked)}
                      className="rounded border-neutral-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="forceChange" className="text-[11px] text-neutral-400 cursor-pointer">
                      Enforce "Must Change Password on First Field Login"
                    </label>
                  </div>
                </div>

                {/* Reset Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handlePerformReset(true)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Generate Random Key
                  </button>

                  <button
                    onClick={() => handlePerformReset(false)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Unlock &amp; Reset Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-500 text-xs">
                Select a CDL from the directory list on the left to review status and issue password reset credentials.
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-4 p-2 bg-neutral-900/60 border border-neutral-800/80 rounded-lg flex items-center gap-2 text-[10px] text-neutral-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Creator Security Protocol: Dispatched temporary passwords expire in 24 hours if unused in the field.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <div className="text-neutral-400 text-[11px]">
            Authorised for Regional Managers, State Managers &amp; Operations Supervisors.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
          >
            Close Recovery Console
          </button>
        </div>
      </div>
    </div>
  );
};
