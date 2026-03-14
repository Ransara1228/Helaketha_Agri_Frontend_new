import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

function getDashboardForRole(session: any): string {
  const roles = ((session?.roles as string[] | undefined) ?? [])
    .concat((session?.user as any)?.role ? [(session.user as any).role] : [])
    .map((r: string) => (r || "").toLowerCase());

  // Priority: admin first so admin credentials always land in admin home.
  if (roles.some((r) => r === "admin")) return "/admin";
  if (roles.some((r) => r === "farmer")) return "/dashboards/farmers";
  if (roles.some((r) => r === "tractor_driver" || r === "tractordriver")) return "/dashboards/tractor-drivers";
  if (roles.some((r) => r === "harvester_driver" || r === "harvesterdriver")) return "/dashboards/harvester-drivers";
  if (roles.some((r) => r === "fertilizer_supplier" || r === "fertilizersupplier")) return "/dashboards/fertilizer-suppliers";

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
