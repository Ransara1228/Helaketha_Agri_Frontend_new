import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import HarvesterDriversClientPage from "../harvesterdriver-page";

export default async function AdminHarvesterDriversPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  return <HarvesterDriversClientPage />;
}
