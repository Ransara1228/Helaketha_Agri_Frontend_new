import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProviderDashboardClient from "@/components/ProviderDashboardClient";

function isHarvesterDriver(session: any): boolean {
  const roles = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());
  return roles.includes("harvester_driver") || roles.includes("harvester driver") || roles.includes("harvesterdriver");
}

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

type HarvesterDriverRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  username: string;
  availableMachines: number;
  pricePerAcre: number;
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

async function fetchList(path: string, accessToken?: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
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

function isHarvesterService(value: string): boolean {
  const v = (value || "").toUpperCase();
  return v.includes("HARVEST");
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

function normalizeIdentity(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function getIdentityHints(session: any): Set<string> {
  const hints = new Set<string>();
  const email = String((session?.user as any)?.email ?? "").trim().toLowerCase();
  const name = String((session?.user as any)?.name ?? "").trim().toLowerCase();
  if (email) hints.add(email);
  if (name) hints.add(name);
  const normalizedName = normalizeIdentity(name);
  if (normalizedName) hints.add(normalizedName);
  if (email.includes("@")) hints.add(email.split("@")[0]);
  const normalizedLocalPart = normalizeIdentity(email.split("@")[0] || "");
  if (normalizedLocalPart) hints.add(normalizedLocalPart);

  const idTokenPayload = decodeJwtPayload((session as any)?.idToken);
  const accessTokenPayload = decodeJwtPayload((session as any)?.accessToken);
  const tokenPayload = idTokenPayload ?? accessTokenPayload ?? null;
  const preferredUsername = String(tokenPayload?.preferred_username ?? "").trim().toLowerCase();
  const tokenEmail = String(tokenPayload?.email ?? "").trim().toLowerCase();
  const tokenName = String(tokenPayload?.name ?? "").trim().toLowerCase();
  const tokenSub = String(tokenPayload?.sub ?? "").trim().toLowerCase();
  const givenName = String(tokenPayload?.given_name ?? "").trim().toLowerCase();
  const familyName = String(tokenPayload?.family_name ?? "").trim().toLowerCase();
  const fullNameFromParts = `${givenName} ${familyName}`.trim();

  if (preferredUsername) hints.add(preferredUsername);
  if (tokenEmail) hints.add(tokenEmail);
  if (tokenName) hints.add(tokenName);
  if (tokenSub) hints.add(tokenSub);
  if (givenName) hints.add(givenName);
  if (familyName) hints.add(familyName);
  if (fullNameFromParts) hints.add(fullNameFromParts);
  const normalizedPreferred = normalizeIdentity(preferredUsername);
  const normalizedTokenName = normalizeIdentity(tokenName);
  const normalizedTokenSub = normalizeIdentity(tokenSub);
  const normalizedFullName = normalizeIdentity(fullNameFromParts);
  if (normalizedPreferred) hints.add(normalizedPreferred);
  if (normalizedTokenName) hints.add(normalizedTokenName);
  if (normalizedTokenSub) hints.add(normalizedTokenSub);
  if (normalizedFullName) hints.add(normalizedFullName);
  if (tokenEmail.includes("@")) hints.add(tokenEmail.split("@")[0]);
  const normalizedTokenLocalPart = normalizeIdentity(tokenEmail.split("@")[0] || "");
  if (normalizedTokenLocalPart) hints.add(normalizedTokenLocalPart);

  return hints;
}

function resolveProvider<T extends { email?: string; name?: string; username?: string }>(
  rows: T[],
  hints: Set<string>
): T | null {
  const hasHint = (value: string) => value && hints.has(value);

  for (const row of rows) {
    const rowEmail = String(row.email ?? "").trim().toLowerCase();
    const rowName = String(row.name ?? "").trim().toLowerCase();
    const rowUsername = String(row.username ?? "").trim().toLowerCase();
    const rowNameNormalized = normalizeIdentity(rowName);
    const rowUsernameNormalized = normalizeIdentity(rowUsername);
    const rowEmailLocalNormalized = normalizeIdentity(rowEmail.split("@")[0] || "");
    if (
      hasHint(rowEmail) ||
      hasHint(rowName) ||
      hasHint(rowUsername) ||
      hasHint(rowNameNormalized) ||
      hasHint(rowUsernameNormalized) ||
      hasHint(rowEmailLocalNormalized)
    ) {
      return row;
    }
  }

  const hintArray = Array.from(hints).filter(Boolean);
  for (const row of rows) {
    const rowNameNormalized = normalizeIdentity(row.name ?? "");
    const rowUsernameNormalized = normalizeIdentity(row.username ?? "");
    if (!rowNameNormalized && !rowUsernameNormalized) continue;
    const matched = hintArray.some((hint) => {
      const normalizedHint = normalizeIdentity(hint);
      if (!normalizedHint) return false;
      return (
        (!!rowNameNormalized &&
          (rowNameNormalized.includes(normalizedHint) || normalizedHint.includes(rowNameNormalized))) ||
        (!!rowUsernameNormalized &&
          (rowUsernameNormalized.includes(normalizedHint) || normalizedHint.includes(rowUsernameNormalized)))
      );
    });
    if (matched) return row;
  }

  return null;
}

export default async function HarvesterDriverDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!isHarvesterDriver(session)) redirect("/login");

  const accessToken = String((session as any)?.accessToken ?? (session as any)?.idToken ?? "");
  const identityHints = getIdentityHints(session);
  const [driversRaw, servicesRaw] = await Promise.all([
    fetchList("harvester-drivers", accessToken),
    fetchList("services", accessToken),
  ]);

  const drivers: HarvesterDriverRow[] = driversRaw.map((item) => ({
    id: toNumber(item?.harvesterDriverId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email, ""),
    username: toText(item?.username, ""),
    availableMachines: toNumber(item?.availableMachines ?? item?.machineQuantity),
    pricePerAcre: toNumber(item?.pricePerAcre ?? item?.price),
  }));

  const me = resolveProvider(drivers, identityHints);

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
    .filter((row) => row.bookingId > 0 && isHarvesterService(row.serviceType) && (me ? row.providerId === me.id : false))
    .sort((a, b) => b.bookingId - a.bookingId);

  return (
    <ProviderDashboardClient
      mode="harvester"
      userLabel={session.user?.name ?? session.user?.email ?? "Driver"}
      provider={me}
      initialBookings={myBookings}
    />
  );
}
