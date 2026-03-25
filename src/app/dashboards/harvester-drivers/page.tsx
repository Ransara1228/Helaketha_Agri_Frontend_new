import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProviderDashboardClient from "@/components/ProviderDashboardClient";
import {
  coerceRecordId,
  fetchBackendList,
  getProviderIdentityHints,
  resolveProviderRow,
} from "@/lib/providerDashboardServer";
import { sessionIsHarvesterDriver } from "@/lib/keycloakRoleMatch";

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
  return v.includes("HARVEST") || v.includes("HARVESTER");
}

export default async function HarvesterDriverDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!sessionIsHarvesterDriver(session)) redirect("/login");

  const identityHints = getProviderIdentityHints(session);
  const [driversRaw, servicesRaw] = await Promise.all([
    fetchBackendList("harvester-drivers", session),
    fetchBackendList("services", session),
  ]);

  const drivers: HarvesterDriverRow[] = driversRaw.map((item: any) => ({
    id: coerceRecordId(item, ["harvesterDriverId", "harvester_driver_id", "id"]),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email, ""),
    username: toText(item?.username, ""),
    availableMachines: toNumber(item?.availableMachines ?? item?.machineQuantity),
    pricePerAcre: toNumber(item?.pricePerAcre ?? item?.price),
  }));

  const me = resolveProviderRow(drivers, identityHints);

  const myBookings: BookingRow[] = servicesRaw
    .map((row: any) => ({
      bookingId: toNumber(row?.bookingId ?? row?.id),
      farmerId: toNumber(row?.farmerId),
      providerId: coerceRecordId(row, [
        "providerId",
        "provider_id",
        "harvesterDriverId",
        "harvester_driver_id",
      ]),
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
