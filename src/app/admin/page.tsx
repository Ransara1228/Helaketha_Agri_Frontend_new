import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

type RegisteredUserRow = {
  id: number;
  name: string;
  email: string;
  module: string;
};

type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toText(value: unknown, fallback = "N/A"): string {
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
}

async function fetchList(path: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchAuthUsers(): Promise<any[]> {
  const candidatePaths = [
    "users",
    "auth/users",
    "keycloak/users",
    "admin/users",
  ];

  for (const path of candidatePaths) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/${path}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as any)?.users)) return (data as any).users;
    } catch {
      continue;
    }
  }

  return [];
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const [farmersRaw, tractorsRaw, harvestersRaw, suppliersRaw, authUsersRaw] = await Promise.all([
    fetchList("farmers"),
    fetchList("tractor-drivers"),
    fetchList("harvester-drivers"),
    fetchList("fertilizer-suppliers"),
    fetchAuthUsers(),
  ]);

  const farmers = (Array.isArray(farmersRaw) ? farmersRaw : []).map((item) => ({
    id: toNumber(item?.farmerId ?? item?.id),
    name: toText(item?.fullName ?? item?.name),
    email: toText(item?.email),
    module: "Farmers",
  }));
  const tractors = (Array.isArray(tractorsRaw) ? tractorsRaw : []).map((item) => ({
    id: toNumber(item?.tractorDriverId ?? item?.id),
    name: toText(item?.name),
    email: toText(item?.email),
    module: "Tractor Drivers",
  }));
  const harvesters = (Array.isArray(harvestersRaw) ? harvestersRaw : []).map((item) => ({
    id: toNumber(item?.harvesterDriverId ?? item?.id),
    name: toText(item?.name),
    email: toText(item?.email),
    module: "Harvester Drivers",
  }));
  const suppliers = (Array.isArray(suppliersRaw) ? suppliersRaw : []).map((item) => ({
    id: toNumber(item?.supplierId ?? item?.id),
    name: toText(item?.name),
    email: toText(item?.email),
    module: "Fertilizer Suppliers",
  }));

  const authUsers: AuthUserRow[] = (Array.isArray(authUsersRaw) ? authUsersRaw : [])
    .map((item) => {
      const firstName = toText(item?.firstName ?? "", "");
      const lastName = toText(item?.lastName ?? "", "");
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        id: toText(item?.id ?? item?.userId ?? item?.sub, "N/A"),
        username: toText(item?.username, "N/A"),
        name: fullName || toText(item?.name ?? item?.username, "N/A"),
        email: toText(item?.email, "N/A"),
      };
    })
    .filter((user) => user.id !== "N/A" || user.email !== "N/A");

  const allRegisteredUsers: RegisteredUserRow[] = [...farmers, ...tractors, ...harvesters, ...suppliers];
  const recentRegistered = allRegisteredUsers
    .filter((row) => row.id > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);
  const totalRegisteredUsers = allRegisteredUsers.length;
  const totalAuthUsers = authUsers.length;

  const adminCards = [
    {
      href: "/admin/farmers",
      label: "Farmers Management",
      description: "Register, update, and monitor farmer records in one place.",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      gradient: "from-green-500 to-emerald-600",
      count: farmers.length,
    },
    {
      href: "/admin/tractor-drivers",
      label: "Tractor Drivers",
      description: "Manage driver profiles, availability, and service readiness.",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      gradient: "from-emerald-500 to-teal-600",
      count: tractors.length,
    },
    {
      href: "/admin/harvester-drivers",
      label: "Harvester Drivers",
      description: "Control harvester operator details and platform visibility.",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      gradient: "from-cyan-500 to-blue-600",
      count: harvesters.length,
    },
    {
      href: "/admin/fertilizer-suppliers",
      label: "Fertilizer Suppliers",
      description: "Maintain supplier data, contact points, and distribution status.",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      gradient: "from-amber-500 to-orange-600",
      count: suppliers.length,
    },
    {
      href: "/admin/services",
      label: "Service Bookings",
      description: "Track requests, statuses, and fulfillment across services.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <main className="relative min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-800 p-8 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <p className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Admin Control Center
          </p>
          <h1 className="text-3xl font-extrabold md:text-4xl">Welcome back, {session.user?.name ?? session.user?.email ?? "Admin"}</h1>
          <p className="mt-3 max-w-3xl text-sm text-emerald-50/90 md:text-base">
            Manage all platform operations from one dashboard. Monitor management modules, organize provider data, and keep bookings running smoothly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/services"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-emerald-50"
            >
              Open Service Bookings
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Management Modules", value: "5+" },
            { label: "Registered Users", value: totalRegisteredUsers.toString() },
            { label: "All Auth Users", value: totalAuthUsers.toString() },
            { label: "Role Access", value: "Admin Only" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Management Systems</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Connected Modules
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {adminCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${card.gradient} p-3 text-white shadow-lg`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{card.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
                {"count" in card && typeof card.count === "number" ? (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Registered: <span className="text-slate-800">{card.count}</span>
                  </p>
                ) : null}
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Open Module
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href="/admin/farmers" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Add or Edit Farmers
              </Link>
              <Link href="/admin/tractor-drivers" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Manage Tractor Drivers
              </Link>
              <Link href="/admin/harvester-drivers" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Manage Harvester Drivers
              </Link>
              <Link href="/admin/fertilizer-suppliers" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Manage Suppliers
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Recently Registered Users</h3>
            {recentRegistered.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No registered users found from management modules.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {recentRegistered.map((user) => (
                  <li key={`${user.module}-${user.id}-${user.email}`} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {user.module}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">All Auth Users</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {totalAuthUsers} Users
            </span>
          </div>
          {authUsers.length === 0 ? (
            <p className="text-sm text-slate-500">
              Auth user endpoint is not available yet. Add a backend users API to show Keycloak users here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">Username</th>
                    <th className="px-3 py-2 text-left font-semibold">Auth ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {authUsers.slice(0, 20).map((user) => (
                    <tr key={`${user.id}-${user.email}-${user.username}`}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{user.name}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.username}</td>
                      <td className="px-3 py-2">{user.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          You are in secure admin mode. Registered users now sync live from each management system module.
        </div>
      </div>
    </main>
  );
}
