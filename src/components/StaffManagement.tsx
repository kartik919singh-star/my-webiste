import { Users, UserPlus, CheckCircle2 } from 'lucide-react';

export default function StaffManagement() {
  const staffMembers = [
    { id: '1', name: 'Admin Operator', email: 'admin@hanumant.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Rohan Desk Officer', email: 'rohan@hanumant.com', role: 'Employee', status: 'Active' },
    { id: '3', name: 'Priya Sales Agent', email: 'priya@hanumant.com', role: 'Employee', status: 'Active' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg transition-colors flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-600 dark:text-violet-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Showroom Staff & Terminal Roles
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Admin Terminal — Manage operator permissions and terminal access keys.
            </p>
          </div>
        </div>

        <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer border-none">
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-black/10 dark:border-white/10">
            <tr>
              <th className="p-4">Operator Name</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Access Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5 text-neutral-800 dark:text-neutral-200">
            {staffMembers.map((member) => (
              <tr key={member.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xs">
                    {member.name[0]}
                  </div>
                  {member.name}
                </td>
                <td className="p-4 text-neutral-500 dark:text-neutral-400">{member.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    member.role === 'Admin'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
