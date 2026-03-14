'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import AdminTopBar from './AdminTopBar';
import FarmerTopBar from './FarmerTopBar';
import ProviderTopBar from './ProviderTopBar';

const DASHBOARD_ROUTES = ['/dashboards/farmers', '/dashboards/tractor-drivers', '/dashboards/harvester-drivers', '/dashboards/fertilizer-suppliers'];

function isAdminManagementRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (DASHBOARD_ROUTES.some((r) => pathname.startsWith(r))) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isMainHomeRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/' || pathname === '/main-home';
}

function isFarmerDashboardRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/dashboards/farmers' || pathname.startsWith('/dashboards/farmers/');
}

function isProviderDashboardRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === '/dashboards/tractor-drivers' ||
    pathname.startsWith('/dashboards/tractor-drivers/') ||
    pathname === '/dashboards/harvester-drivers' ||
    pathname.startsWith('/dashboards/harvester-drivers/') ||
    pathname === '/dashboards/fertilizer-suppliers' ||
    pathname.startsWith('/dashboards/fertilizer-suppliers/')
  );
}

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';

  // Always use admin shell on /admin routes so top navbar never appears there.
  const useAdminLayout = isAdminManagementRoute(pathname);
  const useMainHomeOnlyLayout = isMainHomeRoute(pathname);
  const useFarmerDashboardLayout = isFarmerDashboardRoute(pathname);
  const useProviderDashboardLayout = isProviderDashboardRoute(pathname);

  if (useAdminLayout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50/30">
        <AdminTopBar />
        <div className="min-h-[calc(100vh-90px)] overflow-auto">{children}</div>
      </div>
    );
  }

  // Main home page uses its own internal header/nav.
  if (useMainHomeOnlyLayout) {
    return <>{children}</>;
  }

  if (useFarmerDashboardLayout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50/30">
        <FarmerTopBar />
        <div className="min-h-[calc(100vh-90px)] overflow-auto">{children}</div>
      </div>
    );
  }

  if (useProviderDashboardLayout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50/30">
        <ProviderTopBar />
        <div className="min-h-[calc(100vh-90px)] overflow-auto">{children}</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
