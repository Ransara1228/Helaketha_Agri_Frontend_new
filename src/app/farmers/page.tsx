import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import FarmersClientPage from "./FarmersClientPage";

export default async function FarmersPage() {
  // Check for the user session on the server side
  const session = await getServerSession(authOptions);

  // If no session exists, redirect the user to the Keycloak sign-in page
  if (!session) {
    redirect("/api/auth/signin");
  }

  // If authenticated, render the Client Component containing your UI and logic
  return <FarmersClientPage />;
}