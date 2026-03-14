'use client';

type AdminManagementHeaderProps = {
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

export default function AdminManagementHeader({
  badge,
  title,
  description,
  actionLabel,
  onAction,
}: AdminManagementHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-800 p-8 text-white shadow-2xl">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <p className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
        {badge}
      </p>
      <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm text-emerald-50/90 md:text-base">{description}</p>

      <div className="mt-6">
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-emerald-50"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
