'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

function getDashboardMeta(pathname: string) {
  if (pathname.startsWith('/dashboards/tractor-drivers')) {
    return {
      title: 'Tractor Driver Dashboard',
      dashboardHref: '/dashboards/tractor-drivers',
      showNavTabs: false,
    };
  }
  if (pathname.startsWith('/dashboards/harvester-drivers')) {
    return {
      title: 'Harvester Driver Dashboard',
      dashboardHref: '/dashboards/harvester-drivers',
      showNavTabs: false,
    };
  }
  return {
    title: 'Fertilizer Supplier Dashboard',
    dashboardHref: '/dashboards/fertilizer-suppliers',
    showNavTabs: false,
  };
}

export default function ProviderTopBar() {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession();
  const meta = getDashboardMeta(pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={meta.dashboardHref} className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900">Helaketha Agri</p>
                <p className="truncate text-xs text-slate-500">Agricultural Excellence</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <p className="hidden max-w-[220px] truncate text-xs font-medium text-slate-600 sm:block">
              {session?.user?.name ?? session?.user?.email ?? 'Provider'}
            </p>
            <button
              type="button"
              onClick={async () => {
                const idToken = (session as any)?.idToken;
                await signOut({ redirect: false });
                const hint = idToken ? `?id_token_hint=${encodeURIComponent(idToken)}` : '';
                window.location.href = `/api/auth/signout-clean${hint}`;
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 sm:px-4 sm:text-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        {meta.showNavTabs ? (
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={meta.dashboardHref}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                pathname.startsWith(meta.dashboardHref)
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              My Dashboard
            </Link>
            <span className="ml-1 inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:text-sm">
              {meta.title}
            </span>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
