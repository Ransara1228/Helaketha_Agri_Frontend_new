import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import FarmersClientPage from "../FarmersClientPage";

export default async function AdminFarmersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  return <FarmersClientPage />;
}
