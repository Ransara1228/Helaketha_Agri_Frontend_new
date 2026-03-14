import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProviderDashboardClient from "@/components/ProviderDashboardClient";

function isFertilizerSupplier(session: any): boolean {
  const roles = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());
  return (
    roles.includes("fertilizer_supplier") ||
    roles.includes("fertilizer supplier") ||
    roles.includes("fertilizersupplier")
  );
}

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

type FertilizerSupplierRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  username: string;
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
};

type BookingRow = {
  bookingId: number;
  farmerId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  totalCost: number;
  status: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
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

function normalizeStatus(value: unknown): string {
  const raw = typeof value === "string" ? value : "Pending";
  const clean = raw.replaceAll("_", " ").trim();
  if (!clean) return "Pending";
  const upper = clean.toUpperCase();
  if (upper === "CANCELED" || upper === "CANCELLED") return "Cancelled";
  if (upper === "INPROGRESS" || upper === "IN PROGRESS") return "In Progress";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function isFertilizerService(value: string): boolean {
  const v = (value || "").toUpperCase();
  return v.includes("FERTILIZER");
}

function decodeJwtPayload(token: string | undefined): any | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function getIdentityHints(session: any): Set<string> {
  const hints = new Set<string>();
  const email = String((session?.user as any)?.email ?? "").trim().toLowerCase();
  const name = String((session?.user as any)?.name ?? "").trim().toLowerCase();
  if (email) hints.add(email);
  if (name) hints.add(name);
  if (email.includes("@")) hints.add(email.split("@")[0]);

  const tokenPayload = decodeJwtPayload((session as any)?.idToken);
  const preferredUsername = String(tokenPayload?.preferred_username ?? "").trim().toLowerCase();
  const tokenEmail = String(tokenPayload?.email ?? "").trim().toLowerCase();
  const tokenName = String(tokenPayload?.name ?? "").trim().toLowerCase();

  if (preferredUsername) hints.add(preferredUsername);
  if (tokenEmail) hints.add(tokenEmail);
  if (tokenName) hints.add(tokenName);
  if (tokenEmail.includes("@")) hints.add(tokenEmail.split("@")[0]);

  return hints;
}

function resolveProvider<T extends { email?: string; name?: string; username?: string }>(
  rows: T[],
  hints: Set<string>
): T | null {
  for (const row of rows) {
    const rowEmail = String(row.email ?? "").trim().toLowerCase();
    const rowName = String(row.name ?? "").trim().toLowerCase();
    const rowUsername = String(row.username ?? "").trim().toLowerCase();
    if (
      (rowEmail && hints.has(rowEmail)) ||
      (rowName && hints.has(rowName)) ||
      (rowUsername && hints.has(rowUsername))
    ) {
      return row;
    }
  }
  return null;
}

export default async function FertilizerSupplierDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!isFertilizerSupplier(session)) redirect("/login");

  const identityHints = getIdentityHints(session);
  const [suppliersRaw, servicesRaw] = await Promise.all([
    fetchList("fertilizer-suppliers"),
    fetchList("services"),
  ]);

  const suppliers: FertilizerSupplierRow[] = suppliersRaw.map((item) => ({
    id: toNumber(item?.supplierId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email, ""),
    username: toText(item?.username, ""),
    fertilizerType: toText(item?.fertilizerType, "General"),
    stockQuantityLiters: toNumber(item?.stockQuantityLiters ?? item?.stockQuantity),
    pricePerLiter: toNumber(item?.pricePerLiter ?? item?.price),
  }));

  const me = resolveProvider(suppliers, identityHints);

  const myBookings: BookingRow[] = (Array.isArray(servicesRaw) ? servicesRaw : [])
    .map((row) => ({
      bookingId: toNumber(row?.bookingId ?? row?.id),
      farmerId: toNumber(row?.farmerId),
      providerId: toNumber(row?.providerId),
      serviceType: toText(row?.serviceType, ""),
      bookingDate: toText(row?.bookingDate, ""),
      bookingTime: toText(row?.bookingTime, ""),
      totalCost: toNumber(row?.totalCost),
      status: normalizeStatus(row?.status),
    }))
    .filter((row) => row.bookingId > 0 && isFertilizerService(row.serviceType) && (me ? row.providerId === me.id : false))
    .sort((a, b) => b.bookingId - a.bookingId);

  return (
    <ProviderDashboardClient
      mode="fertilizer"
      userLabel={session.user?.name ?? session.user?.email ?? "Supplier"}
      provider={me}
      initialBookings={myBookings}
    />
  );
}
