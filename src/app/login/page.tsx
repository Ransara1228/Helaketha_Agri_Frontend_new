import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import {
  sessionIsFertilizerSupplier,
  sessionIsHarvesterDriver,
  sessionIsTractorDriver,
} from "@/lib/keycloakRoleMatch";

function getDashboardForRole(session: any): string {
  const rawLower = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());

  // Priority: admin first so admin credentials always land in admin home.
  if (rawLower.some((r) => r === "admin")) return "/admin";
  if (rawLower.some((r) => r === "farmer")) return "/dashboards/farmers";
  if (sessionIsTractorDriver(session)) return "/dashboards/tractor-drivers";
  if (sessionIsHarvesterDriver(session)) return "/dashboards/harvester-drivers";
  if (sessionIsFertilizerSupplier(session)) return "/dashboards/fertilizer-suppliers";

  // Fallback: if no roles in token, infer from identity string.
  const name = ((session?.user as any)?.name ?? "") as string;
  const email = ((session?.user as any)?.email ?? "") as string;
  const combined = `${name} ${email}`.toLowerCase();
  if (combined.includes("admin")) return "/admin";
  if (combined.includes("farmer")) return "/dashboards/farmers";

  return "/admin";
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const dashboard = getDashboardForRole(session);
  redirect(dashboard);
}
