import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import FarmerDashboardClient from "./FarmerDashboardClient";

function isFarmer(session: any): boolean {
  const roles = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());
  if (roles.some((r) => r === "farmer")) return true;
  const name = ((session?.user as any)?.name ?? "") as string;
  const email = ((session?.user as any)?.email ?? "") as string;
  return `${name} ${email}`.toLowerCase().includes("farmer");
}

function ensureFarmer(session: any) {
  if (!session) redirect("/api/auth/signin");
  if (!isFarmer(session)) redirect("/admin");
}

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

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
    const session = await getServerSession(authOptions);
    const accessToken =
      (session as any)?.accessToken ||
      (session as any)?.idToken;
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

export default async function FarmerDashboardPage() {
  const session = await getServerSession(authOptions);
  ensureFarmer(session);

  const [tractorRaw, harvesterRaw, fertilizerRaw, farmersRaw] = await Promise.all([
    fetchList("tractor-drivers"),
    fetchList("harvester-drivers"),
    fetchList("fertilizer-suppliers"),
    fetchList("farmers"),
  ]);

  const tractorDrivers = tractorRaw.map((item) => ({
    id: toNumber(item?.tractorDriverId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email),
    machineQuantity: toNumber(item?.machineQuantity ?? item?.availableMachines),
    pricePerAcre: toNumber(item?.pricePerAcre ?? item?.price),
  }));

  const harvesterDrivers = harvesterRaw.map((item) => ({
    id: toNumber(item?.harvesterDriverId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email),
    availableMachines: toNumber(item?.availableMachines ?? item?.machineQuantity),
    pricePerAcre: toNumber(item?.pricePerAcre ?? item?.price),
  }));

  const fertilizerSuppliers = fertilizerRaw.map((item) => ({
    id: toNumber(item?.supplierId ?? item?.id),
    name: toText(item?.name),
    phone: toText(item?.phone),
    email: toText(item?.email),
    fertilizerType: toText(item?.fertilizerType),
    stockQuantityLiters: toNumber(item?.stockQuantityLiters ?? item?.stockQuantity),
    pricePerLiter: toNumber(item?.pricePerLiter ?? item?.price),
  }));

  const sessionEmail = ((session?.user as any)?.email ?? "").toLowerCase();
  const matchedFarmer = farmersRaw.find(
    (f) => ((f?.email as string | undefined) ?? "").toLowerCase() === sessionEmail
  );
  const defaultFarmerId = toNumber(matchedFarmer?.farmerId ?? matchedFarmer?.id);
  const userLabel =
    ((session?.user as any)?.name as string | undefined) ??
    ((session?.user as any)?.email as string | undefined) ??
    "Farmer";

  return (
    <FarmerDashboardClient
      userLabel={userLabel}
      defaultFarmerId={defaultFarmerId}
      tractorDrivers={tractorDrivers}
      harvesterDrivers={harvesterDrivers}
      fertilizerSuppliers={fertilizerSuppliers}
    />
  );
}
