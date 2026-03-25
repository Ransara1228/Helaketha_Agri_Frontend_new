import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

async function refreshKeycloakToken(token: any): Promise<any> {
  try {
    const issuer = process.env.KEYCLOAK_ISSUER;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    const refreshToken = token?.refreshToken;

    if (!issuer || !clientId || !clientSecret || !refreshToken) {
      return { ...token, error: "MissingRefreshConfig" };
    }

    const tokenEndpoint = `${issuer}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: String(refreshToken),
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const refreshed = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    return {
      ...token,
      accessToken: refreshed.access_token ?? token.accessToken,
      idToken: refreshed.id_token ?? token.idToken,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt:
        typeof refreshed.expires_in === "number"
          ? Math.floor(Date.now() / 1000) + refreshed.expires_in
          : token.expiresAt,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour - short session, no long-term cookie storage
  },
  providers: [
    KeycloakProvider({
      issuer: process.env.KEYCLOAK_ISSUER,
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Store tokens (id_token needed for Keycloak logout)
        (token as any).accessToken = account.access_token;
        (token as any).refreshToken = account.refresh_token;
        (token as any).idToken = (account as any).id_token;
        (token as any).expiresAt = account.expires_at;

        // Extract roles from Keycloak - try ACCESS token first (realm roles are usually here),
        // then fall back to ID token.
        const tokensToTry = [
          (account as any).access_token,
          (account as any).id_token,
        ].filter(Boolean);

        for (const rawToken of tokensToTry) {
          try {
            const base64 = (rawToken as string).split(".")[1]
              ?.replace(/-/g, "+")
              ?.replace(/_/g, "/");
            if (!base64) continue;

            const json =
              typeof atob === "function"
                ? decodeURIComponent(
                    atob(base64)
                      .split("")
                      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                      .join("")
                  )
                : Buffer.from(base64, "base64").toString("utf-8");

            const payload = JSON.parse(json);
            const realmRoles: string[] = payload?.realm_access?.roles ?? [];
            const clientId = process.env.KEYCLOAK_CLIENT_ID!;
            const clientRoles: string[] =
              payload?.resource_access?.[clientId]?.roles ?? [];
            const allRoles = Array.from(
              new Set([...(realmRoles || []), ...(clientRoles || [])])
            );

            if (allRoles.length > 0) {
              (token as any).roles = allRoles;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      // Refresh access token shortly before expiry.
      const expiresAt = Number((token as any)?.expiresAt ?? 0);
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt > 0 && now >= expiresAt - 60) {
        return refreshKeycloakToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      // Expose tokens/roles on the session object for server/client use
      (session as any).accessToken = (token as any).accessToken;
      (session as any).idToken = (token as any).idToken;
      (session as any).roles = (token as any).roles ?? [];

      const roles = ((token as any).roles as string[] | undefined) ?? [];
      if (roles.length > 0) {
        (session.user as any).role = roles[0];
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in: never send to main home "/" — use /login for role-based routing (admins → /admin)
      try {
        const target = new URL(url, baseUrl);
        if (target.pathname === "/" || target.pathname === "") {
          return `${baseUrl}/login`;
        }
      } catch {
        if (url === "/" || url === "") return `${baseUrl}/login`;
      }
      if (url.startsWith("/")) return url;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};

export const runtime = "nodejs";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };