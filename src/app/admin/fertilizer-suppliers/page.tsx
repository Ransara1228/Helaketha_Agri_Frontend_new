import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import FertilizerSuppliersClientPage from "../fertilizer-supplier-page";

export default async function AdminFertilizerSuppliersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  return <FertilizerSuppliersClientPage />;
}
