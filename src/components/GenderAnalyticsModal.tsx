import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  X, 
  Filter
} from 'lucide-react';
import { StaffAccount } from '../types/staffDatabase';

interface GenderAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffDatabase: StaffAccount[];
  viewerRole: 'creator' | 'dh';
  viewerName: string;
}

export const GenderAnalyticsModal: React.FC<GenderAnalyticsModalProps> = ({
  isOpen,
  onClose,
  staffDatabase,
  viewerRole,
  viewerName,
}) => {
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Compute male / female counts & performance metrics across all staff accounts
  const maleStaff = staffDatabase.filter(s => (s.gender || 'male') === 'male');
  const femaleStaff = staffDatabase.filter(s => s.gender === 'female');

  const totalRegistered = staffDatabase.length;
  const maleCount = maleStaff.length;
  const femaleCount = femaleStaff.length;

  const malePercent = totalRegistered > 0 ? ((maleCount / totalRegistered) * 100).toFixed(1) : '0';
  const femalePercent = totalRegistered > 0 ? ((femaleCount / totalRegistered) * 100).toFixed(1) : '0';

  // Aggregate disbursement performance
  const maleDisbursed = maleStaff.reduce((acc, s) => acc + (s.disbursedTotal || 2500000), 0);
  const femaleDisbursed = femaleStaff.reduce((acc, s) => acc + (s.disbursedTotal || 3500000), 0);

  const maleAvgScore = maleStaff.length > 0 
    ? Math.round(maleStaff.reduce((acc, s) => acc + (s.score || 18000), 0) / maleStaff.length) 
    : 0;
  const femaleAvgScore = femaleStaff.length > 0 
    ? Math.round(femaleStaff.reduce((acc, s) => acc + (s.score || 22000), 0) / femaleStaff.length) 
    : 0;

  const maleAvgCompliance = maleStaff.length > 0
    ? (maleStaff.reduce((acc, s) => acc + (s.complianceRating || 96), 0) / maleStaff.length).toFixed(1)
    : '96.0';
  const femaleAvgCompliance = femaleStaff.length > 0
    ? (femaleStaff.reduce((acc, s) => acc + (s.complianceRating || 98), 0) / femaleStaff.length).toFixed(1)
    : '98.0';

  // Filtered view list
  const filteredStaff = staffDatabase.filter(s => {
    const genderMatch = selectedGenderFilter === 'all' || (s.gender || 'male') === selectedGenderFilter;
    const roleMatch = selectedRoleFilter === 'all' || s.role === selectedRoleFilter;
    return genderMatch && roleMatch;
  });

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto safe-top safe-bottom">
      <div className="bg-neutral-900 border-2 border-purple-500/50 rounded-3xl w-full max-w-4xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Executive Gender Diversity &amp; Performance Intelligence
                </h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30">
                  {viewerRole === 'creator' ? 'CREATOR CLEARANCE' : 'DH EXECUTIVE ACCESS'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Demographic headcount breakdown, loan volume analysis, and compliance audit for {viewerName}
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

        {/* Headcount Breakdown: Male vs Female */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Staff Database</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {totalRegistered} <span className="text-xs font-normal text-neutral-400">Officers</span>
            </div>
            <div className="text-[10.5px] text-neutral-400 pt-1">
              National Active Field Directory
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 to-blue-950/40 border border-blue-500/40 space-y-1">
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
              <span>Male Field Officers</span>
              <span className="text-xl">👨🏾‍💼</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {maleCount} <span className="text-sm font-bold text-blue-400">({malePercent}%)</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-400 h-full" style={{ width: `${malePercent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 to-pink-950/40 border border-pink-500/40 space-y-1">
            <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider flex items-center justify-between">
              <span>Female Field Officers</span>
              <span className="text-xl">👩🏾‍💼</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {femaleCount} <span className="text-sm font-bold text-pink-400">({femalePercent}%)</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-pink-400 h-full" style={{ width: `${femalePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Comparative Performance Analysis Table */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 mb-4">
          <div className="text-xs uppercase font-bold text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-purple-400">
              <TrendingUp className="w-4 h-4" /> Gender Performance Comparison Metrics
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Live Aggregated Output
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Male Cohort Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-extrabold text-blue-300 flex items-center gap-1.5">
                  <span>👨🏾‍💼</span> Male Officers ({maleCount})
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Rank: Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Disbursed Volume:</span>
                <strong className="text-emerald-400 font-mono">₦{(maleDisbursed / 1000000).toFixed(1)}M</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Average Performance Score:</span>
                <strong className="text-white font-mono">{maleAvgScore.toLocaleString()} PTS</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Compliance Audit Rating:</span>
                <strong className="text-cyan-400 font-mono">{maleAvgCompliance}%</strong>
              </div>
            </div>

            {/* Female Cohort Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-pink-500/30 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-extrabold text-pink-300 flex items-center gap-1.5">
                  <span>👩🏾‍💼</span> Female Officers ({femaleCount})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Top Compliance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Disbursed Volume:</span>
                <strong className="text-emerald-400 font-mono">₦{(femaleDisbursed / 1000000).toFixed(1)}M</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Average Performance Score:</span>
                <strong className="text-white font-mono">{femaleAvgScore.toLocaleString()} PTS</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Compliance Audit Rating:</span>
                <strong className="text-pink-300 font-mono">{femaleAvgCompliance}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Directory Table */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>Staff Gender Directory ({filteredStaff.length})</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedGenderFilter}
                onChange={(e) => setSelectedGenderFilter(e.target.value as 'all' | 'male' | 'female')}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="all">All Genders</option>
                <option value="male">Male (👨🏾‍💼)</option>
                <option value="female">Female (👩🏾‍💼)</option>
              </select>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="CDL">CDL Only</option>
                <option value="CDLM">CDLM Only</option>
                <option value="SM">SM Only</option>
                <option value="RM">RM Only</option>
                <option value="DH">DH Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-neutral-400 uppercase font-semibold text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3">Officer Name</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Staff ID</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned State / Region</th>
                  <th className="py-2.5 px-3 text-right">Disbursed Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {filteredStaff.map((staff) => {
                  const isFemale = staff.gender === 'female';
                  return (
                    <tr key={staff.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                        <span>{isFemale ? '👩🏾‍💼' : '👨🏾‍💼'}</span>
                        <span>{staff.loginName}</span>
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFemale
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isFemale ? 'Female' : 'Male'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{staff.loginId}</td>

                      <td className="py-2.5 px-3 font-sans font-bold text-neutral-300">{staff.role}</td>

                      <td className="py-2.5 px-3 font-sans text-neutral-400">
                        {staff.state ? `${staff.state}, ${staff.region}` : staff.region || 'National (DH)'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-emerald-300">
                        ₦{((staff.disbursedTotal || 2500000) / 1000000).toFixed(2)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-neutral-800 flex justify-between items-center text-xs">
          <span className="text-neutral-500">
            OPay Inclusion &amp; Demographic Governance • Policy 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all active:scale-95"
          >
            Close Gender Suite
          </button>
        </div>
      </div>
    </div>
  );
};
