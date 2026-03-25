/** Keycloak often emits `harvester-driver` or `harvester_driver`; normalize for comparisons. */
export function compactRole(r: string): string {
  return (r || "").toLowerCase().replace(/[\s_-]+/g, "");
}

export function sessionCompactRoles(session: unknown): string[] {
  const s = session as {
    roles?: string[];
    user?: { role?: string };
  } | null | undefined;
  const fromArray = (s?.roles ?? []).map((r) => compactRole(String(r)));
  const fromUser = s?.user?.role ? [compactRole(String(s.user.role))] : [];
  return [...fromArray, ...fromUser].filter(Boolean);
}

export function tokenCompactRoles(token: unknown): string[] {
  const t = token as { roles?: string[] } | null | undefined;
  return (t?.roles ?? []).map((r) => compactRole(String(r))).filter(Boolean);
}

export function sessionIsHarvesterDriver(session: unknown): boolean {
  return sessionCompactRoles(session).some(
    (r) => r === "harvesterdriver" || (r.includes("harvester") && r.includes("driver"))
  );
}

export function tokenIsHarvesterDriver(token: unknown): boolean {
  return tokenCompactRoles(token).some(
    (r) => r === "harvesterdriver" || (r.includes("harvester") && r.includes("driver"))
  );
}

export function sessionIsTractorDriver(session: unknown): boolean {
  return sessionCompactRoles(session).some(
    (r) => r === "tractordriver" || (r.includes("tractor") && r.includes("driver"))
  );
}

export function tokenIsTractorDriver(token: unknown): boolean {
  return tokenCompactRoles(token).some(
    (r) => r === "tractordriver" || (r.includes("tractor") && r.includes("driver"))
  );
}

export function sessionIsFertilizerSupplier(session: unknown): boolean {
  return sessionCompactRoles(session).some(
    (r) =>
      r === "fertilizersupplier" ||
      (r.includes("fertilizer") && r.includes("supplier"))
  );
}

export function tokenIsFertilizerSupplier(token: unknown): boolean {
  return tokenCompactRoles(token).some(
    (r) =>
      r === "fertilizersupplier" ||
      (r.includes("fertilizer") && r.includes("supplier"))
  );
}
