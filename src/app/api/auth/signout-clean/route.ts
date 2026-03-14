import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const issuer = process.env.KEYCLOAK_ISSUER || "http://localhost:8090/realms/helakatha-agri-realm";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const idTokenHint = request.nextUrl.searchParams.get("id_token_hint");

  const clearCookies = (res: NextResponse) => {
    res.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
    res.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  };

  // Keycloak requires id_token_hint for RP-Initiated Logout
  if (idTokenHint) {
    const params = new URLSearchParams();
    params.set("post_logout_redirect_uri", baseUrl);
    params.set("id_token_hint", idTokenHint);
    const res = NextResponse.redirect(`${issuer}/protocol/openid-connect/logout?${params.toString()}`);
    clearCookies(res);
    return res;
  }

  const res = NextResponse.redirect(baseUrl);
  clearCookies(res);
  return res;
}
