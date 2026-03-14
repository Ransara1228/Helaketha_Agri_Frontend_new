'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';

function getRole(session: any): string | null {
  const roles = ((session as any)?.roles as string[] | undefined) ?? [];
  const userRole = (session?.user as any)?.role as string | undefined;
  const all = [...roles, userRole].filter(Boolean).map((r) => (r || "").toLowerCase());
  if (all.includes("admin")) return "admin";
  if (all.includes("farmer")) return "farmer";
  if (all.some((r) => r.includes("tractor"))) return "tractor_driver";
  if (all.some((r) => r.includes("harvester"))) return "harvester_driver";
  if (all.some((r) => r.includes("fertilizer"))) return "fertilizer_supplier";

  // Fallback when roles are not present in token/session yet.
  const name = ((session?.user as any)?.name ?? "") as string;
  const email = ((session?.user as any)?.email ?? "") as string;
  const identity = `${name} ${email}`.toLowerCase();
  if (identity.includes("admin")) return "admin";
  if (identity.includes("farmer")) return "farmer";
  return null;
}

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => {
    if (path.startsWith("/#")) return false;
    return pathname === path;
  };

  const role = session?.user ? getRole(session) : null;

  // Admin only: full management nav (all under /admin)
  const adminNavLinks = [
    { href: '/admin', label: 'Admin Home' },
    { href: '/admin/farmers', label: 'Farmers' },
    { href: '/admin/tractor-drivers', label: 'Tractor Drivers' },
    { href: '/admin/harvester-drivers', label: 'Harvester Drivers' },
    { href: '/admin/fertilizer-suppliers', label: 'Fertilizer Suppliers' },
    { href: '/admin/services', label: 'Service Bookings' },
  ];

  // Farmer only: no admin features
  const farmerNavLinks: { href: string; label: string }[] = [];

  const tractorNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboards/tractor-drivers', label: 'My Dashboard' },
  ];

  const harvesterNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboards/harvester-drivers', label: 'My Dashboard' },
  ];

  const fertilizerNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboards/fertilizer-suppliers', label: 'My Dashboard' },
  ];

  const publicNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/#solutions', label: 'Solutions' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#insights', label: 'Insights' },
  ];

  const navLinks =
    role === "admin"
      ? adminNavLinks
      : role === "farmer"
        ? farmerNavLinks
        : role === "tractor_driver"
          ? tractorNavLinks
          : role === "harvester_driver"
            ? harvesterNavLinks
            : role === "fertilizer_supplier"
              ? fertilizerNavLinks
              : publicNavLinks;

  const logoHref =
    role === "admin"
      ? "/admin"
      : role === "farmer"
        ? "/dashboards/farmers"
        : role === "tractor_driver"
          ? "/dashboards/tractor-drivers"
          : role === "harvester_driver"
            ? "/dashboards/harvester-drivers"
            : role === "fertilizer_supplier"
              ? "/dashboards/fertilizer-suppliers"
              : "/";

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100/60 bg-white/80 backdrop-blur-2xl shadow-[0_10px_30px_-18px_rgba(16,185,129,0.55)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href={session?.user ? logoHref : '/'} className="flex items-center gap-3 group">
              <div className="relative p-3.5 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl group-hover:scale-105 transition-all duration-300 shadow-[0_10px_24px_-10px_rgba(16,185,129,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/70 to-teal-600/70 rounded-2xl opacity-0 blur-xl group-hover:opacity-100 transition-opacity" />
                <svg className="relative w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2 M12 4 L12 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 2 Q10 4 11 6 Q12 8 13 6 Q14 4 12 2" fill="currentColor" opacity="0.9"/>
                  <path d="M8 5 Q7 6 7.5 7.5 Q8 9 9 8 Q9.5 7 8 5" fill="currentColor" opacity="0.7"/>
                  <path d="M16 5 Q17 6 16.5 7.5 Q16 9 15 8 Q14.5 7 16 5" fill="currentColor" opacity="0.7"/>
                  <rect x="11" y="9" width="2" height="5" fill="currentColor"/>
                  <rect x="9.5" y="14" width="5" height="1.5" fill="currentColor"/>
                  <path d="M6 11 Q12 9.5 18 11" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7"/>
                  <path d="M5 13 Q12 11.5 19 13" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
                  <path d="M4 15 Q12 13.5 20 15" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent transition-all duration-300">
                  Helaketha Agri
                </span>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Agricultural Excellence</p>
              </div>
            </Link>
            {navLinks.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 bg-white/75 backdrop-blur-xl rounded-2xl p-1.5 border border-emerald-100 shadow-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                      isActive(link.href)
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_18px_-10px_rgba(20,184,166,0.85)]'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {isActive(link.href) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent" />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-11 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : session?.user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href={logoHref ?? "/"}
                  className="px-5 py-2.5 bg-white rounded-xl border border-emerald-100 shadow-sm hover:border-emerald-200 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {session.user.name ?? session.user.email ?? "User"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const idToken = (session as any)?.idToken;
                    await signOut({ redirect: false });
                    const hint = idToken ? `?id_token_hint=${encodeURIComponent(idToken)}` : "";
                    window.location.href = `/api/auth/signout-clean${hint}`;
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/60 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  signIn('keycloak', {
                    callbackUrl: '/login',
                    redirect: true,
                    authorizationParams: { prompt: 'login' },
                  })
                }
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm shadow-[0_12px_24px_-12px_rgba(20,184,166,0.9)] hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
