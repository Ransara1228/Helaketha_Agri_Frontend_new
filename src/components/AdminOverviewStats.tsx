'use client';

type AdminOverviewStatsProps = {
  registeredUsers: number;
  allAuthUsers: number;
};

export default function AdminOverviewStats({
  registeredUsers,
  allAuthUsers,
}: AdminOverviewStatsProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Management Modules</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">5+</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Users</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{registeredUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">All Auth Users</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{allAuthUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Role Access</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">Admin Only</p>
        </div>
      </div>
    </div>
  );
}
