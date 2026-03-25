import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  tokenIsFertilizerSupplier,
  tokenIsHarvesterDriver,
  tokenIsTractorDriver,
} from "@/lib/keycloakRoleMatch";

function normalizeRoles(token: any): string[] {
  const roles = (token?.roles as string[] | undefined) ?? [];
  return roles.map((r) => (r || "").toLowerCase());
}

function isAdmin(token: any): boolean {
  return normalizeRoles(token).includes("admin");
}

function isFarmer(token: any): boolean {
  const roles = normalizeRoles(token);
  if (roles.includes("farmer")) return true;
  const name = (token?.name ?? "").toString().toLowerCase();
  const email = (token?.email ?? "").toString().toLowerCase();
  return `${name} ${email}`.includes("farmer");
}

function isTractorDriver(token: any): boolean {
  return tokenIsTractorDriver(token);
}

function isHarvesterDriver(token: any): boolean {
  return tokenIsHarvesterDriver(token);
}

function isFertilizerSupplier(token: any): boolean {
  return tokenIsFertilizerSupplier(token);
}

const USER_DASHBOARDS = {
  farmer: "/dashboards/farmers",
  tractor: "/dashboards/tractor-drivers",
  harvester: "/dashboards/harvester-drivers",
  fertilizer: "/dashboards/fertilizer-suppliers",
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public home "/" - if admin is logged in, always redirect to admin dashboard.
  if (pathname === "/") {
    if (token && isAdmin(token)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Not signed in → send to NextAuth sign-in page for protected routes
  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Legacy user dashboard URLs -> new /dashboards/* structure
  const oldDashboardToNew: Record<string, string> = {
    "/farmers/dashboard": USER_DASHBOARDS.farmer,
    "/tractor-drivers/dashboard": USER_DASHBOARDS.tractor,
    "/harvester-drivers/dashboard": USER_DASHBOARDS.harvester,
    "/fertilizer-suppliers/dashboard": USER_DASHBOARDS.fertilizer,
  };
  const legacyTarget = oldDashboardToNew[pathname];
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, req.url));
  }

  // Legacy admin management routes → redirect to /admin/* (for all users including admin)
  const legacyAdminPaths = ["/farmers", "/tractor-drivers", "/harvester-drivers", "/fertilizer-suppliers", "/services"];
  if (!pathname.startsWith("/dashboards/") && legacyAdminPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const adminPath = pathname.replace(/^\/(farmers|tractor-drivers|harvester-drivers|fertilizer-suppliers|services)(.*)$/, "/admin/$1$2");
    if (adminPath !== pathname) return NextResponse.redirect(new URL(adminPath, req.url));
  }

  // Admin can access everything
  if (isAdmin(token)) return NextResponse.next();

  // Farmer dashboard is farmer-only
  if (pathname.startsWith(USER_DASHBOARDS.farmer)) {
    if (isFarmer(token)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Tractor driver dashboard
  if (pathname.startsWith(USER_DASHBOARDS.tractor)) {
    if (isTractorDriver(token)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Harvester driver dashboard
  if (pathname.startsWith(USER_DASHBOARDS.harvester)) {
    if (isHarvesterDriver(token)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Fertilizer supplier dashboard
  if (pathname.startsWith(USER_DASHBOARDS.fertilizer)) {
    if (isFertilizerSupplier(token)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes: non-admins go to their dashboard (avoid redirect loop)
  if (pathname.startsWith("/admin")) {
    if (isFarmer(token)) return NextResponse.redirect(new URL(USER_DASHBOARDS.farmer, req.url));
    if (isTractorDriver(token)) return NextResponse.redirect(new URL(USER_DASHBOARDS.tractor, req.url));
    if (isHarvesterDriver(token)) return NextResponse.redirect(new URL(USER_DASHBOARDS.harvester, req.url));
    if (isFertilizerSupplier(token)) return NextResponse.redirect(new URL(USER_DASHBOARDS.fertilizer, req.url));
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/dashboards/:path*",
    "/farmers",
    "/farmers/:path*",
    "/tractor-drivers",
    "/tractor-drivers/:path*",
    "/harvester-drivers",
    "/harvester-drivers/:path*",
    "/fertilizer-suppliers",
    "/fertilizer-suppliers/:path*",
    "/services",
    "/services/:path*",
  ],
};