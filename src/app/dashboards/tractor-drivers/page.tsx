import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProviderDashboardClient from "@/components/ProviderDashboardClient";
import {
  fetchBackendList,
  getProviderIdentityHints,
  resolveProviderRow,
} from "@/lib/providerDashboardServer";

function isTractorDriver(session: any): boolean {
  const roles = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());
  return roles.includes("tractor_driver") || roles.includes("tractor driver") || roles.includes("tractordriver");
}

type TractorDriverRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  username: string;
  machineQuantity: number;
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

function normalizeStatus(value: unknown): string {
  const raw = typeof value === "string" ? value : "Pending";
  const clean = raw.replaceAll("_", " ").trim();
  if (!clean) return "Pending";
  const upper = clean.toUpperCase();
  if (upper === "CANCELED" || upper === "CANCELLED") return "Cancelled";
  if (upper === "INPROGRESS" || upper === "IN PROGRESS") return "In Progress";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function isTractorService(value: string): boolean {
  const v = (value || "").toUpperCase();
  return v.includes("TRACTOR");
}

export default async function TractorDriverDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!isTractorDriver(session)) redirect("/login");

  const identityHints = getProviderIdentityHints(session);
  const [driversRaw, servicesRaw] = await Promise.all([
    fetchBackendList("tractor-drivers", session),
    fetchBackendList("services", session),
  ]);

  const drivers: TractorDriverRow[] = driversRaw.map((item: any) => ({
    id: toNumber(item?.tractorDriverId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email, ""),
    username: toText(item?.username, ""),
    machineQuantity: toNumber(item?.machineQuantity ?? item?.availableMachines),
    pricePerAcre: toNumber(item?.pricePerAcre ?? item?.price),
  }));

  const me = resolveProviderRow(drivers, identityHints);

  const myBookings: BookingRow[] = servicesRaw
    .map((row: any) => ({
      bookingId: toNumber(row?.bookingId ?? row?.id),
      farmerId: toNumber(row?.farmerId),
      providerId: toNumber(row?.providerId),
      serviceType: toText(row?.serviceType, ""),
      bookingDate: toText(row?.bookingDate, ""),
      bookingTime: toText(row?.bookingTime, ""),
      totalCost: toNumber(row?.totalCost),
      status: normalizeStatus(row?.status),
    }))
    .filter((row: BookingRow) => row.bookingId > 0 && isTractorService(row.serviceType) && (me ? row.providerId === me.id : false))
    .sort((a: BookingRow, b: BookingRow) => b.bookingId - a.bookingId);

  return (
    <ProviderDashboardClient
      mode="tractor"
      userLabel={session.user?.name ?? session.user?.email ?? "Driver"}
      provider={me}
      initialBookings={myBookings}
    />
  );
}
