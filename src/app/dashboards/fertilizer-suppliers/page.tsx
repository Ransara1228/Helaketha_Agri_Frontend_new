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
import { sessionIsFertilizerSupplier } from "@/lib/keycloakRoleMatch";

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
  return v.includes("FERTILIZER") || v.includes("FERTILISER");
}

export default async function FertilizerSupplierDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!sessionIsFertilizerSupplier(session)) redirect("/login");

  const identityHints = getProviderIdentityHints(session);
  const [suppliersRaw, servicesRaw] = await Promise.all([
    fetchBackendList("fertilizer-suppliers", session),
    fetchBackendList("services", session),
  ]);

  const suppliers: FertilizerSupplierRow[] = suppliersRaw.map((item: any) => ({
    id: coerceRecordId(item, ["supplierId", "supplier_id", "id"]),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email, ""),
    username: toText(item?.username, ""),
    fertilizerType: toText(item?.fertilizerType ?? item?.fertilizer_type, "General"),
    stockQuantityLiters: toNumber(
      item?.stockQuantityLiters ?? item?.stock_quantity_liters ?? item?.stockQuantity
    ),
    pricePerLiter: toNumber(item?.pricePerLiter ?? item?.price_per_liter ?? item?.price),
  }));

  const me = resolveProviderRow(suppliers, identityHints);

  const myBookings: BookingRow[] = servicesRaw
    .map((row: any) => ({
      bookingId: toNumber(row?.bookingId ?? row?.booking_id ?? row?.id),
      farmerId: toNumber(row?.farmerId ?? row?.farmer_id),
      providerId: coerceRecordId(row, [
        "providerId",
        "provider_id",
        "supplierId",
        "supplier_id",
      ]),
      serviceType: toText(row?.serviceType ?? row?.service_type, ""),
      bookingDate: toText(row?.bookingDate ?? row?.booking_date, ""),
      bookingTime: toText(row?.bookingTime ?? row?.booking_time, ""),
      totalCost: toNumber(row?.totalCost ?? row?.total_cost),
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
