import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TractorDriversClientPage from "../TractorDriversClientPage";

export default async function AdminTractorDriversPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  return <TractorDriversClientPage />;
}
