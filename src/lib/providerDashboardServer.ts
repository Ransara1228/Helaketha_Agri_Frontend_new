const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

/** Same shape as API list payloads; use on the client when refreshing `/api/services`. */
export function unwrapApiList(data: unknown): unknown[] {
  return unwrapList(data);
}

export function coerceRecordId(record: unknown, keys: string[]): number {
  if (!record || typeof record !== "object") return 0;
  const o = record as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

export async function fetchBackendList(path: string, session: unknown): Promise<unknown[]> {
  const s = session as { accessToken?: string; idToken?: string } | null | undefined;
  try {
    const accessToken = s?.accessToken || s?.idToken;
    const response = await fetch(`${BACKEND_API_URL}/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return unwrapList(data);
  } catch {
    return [];
  }
}

export function decodeJwtPayload(token: string | undefined): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function expandIdentityStrings(raw: string): string[] {
  const t = raw.trim().toLowerCase();
  if (!t) return [];
  const singleSpaced = t.replace(/\s+/g, " ").trim();
  const noSpace = t.replace(/\s+/g, "");
  const compact = t.replace(/[\s._-]+/g, "");
  return [...new Set([t, singleSpaced, noSpace, compact])].filter((v) => v.length > 0);
}

function addHintsFromString(hints: Set<string>, raw: string) {
  for (const v of expandIdentityStrings(raw)) hints.add(v);
}

function addHintsFromJwtPayload(hints: Set<string>, payload: Record<string, unknown> | null) {
  if (!payload) return;
  const email = String(payload.email ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const preferred = String(payload.preferred_username ?? "").trim();
  const gn = String(payload.given_name ?? "").trim();
  const fn = String(payload.family_name ?? "").trim();
  const combined = [gn, fn].filter(Boolean).join(" ").trim();

  addHintsFromString(hints, email);
  addHintsFromString(hints, name);
  addHintsFromString(hints, preferred);
  addHintsFromString(hints, combined);
  if (email.includes("@")) addHintsFromString(hints, email.split("@")[0]);
}

export function getProviderIdentityHints(session: unknown): Set<string> {
  const s = session as {
    user?: { email?: string | null; name?: string | null };
    idToken?: string;
    accessToken?: string;
  } | null | undefined;
  const hints = new Set<string>();
  addHintsFromString(hints, String(s?.user?.email ?? ""));
  addHintsFromString(hints, String(s?.user?.name ?? ""));
  const email = String(s?.user?.email ?? "").trim();
  if (email.includes("@")) addHintsFromString(hints, email.split("@")[0]);

  addHintsFromJwtPayload(hints, decodeJwtPayload(s?.idToken));
  addHintsFromJwtPayload(hints, decodeJwtPayload(s?.accessToken));

  return hints;
}

export type ProviderMatchRow = { email?: string; name?: string; username?: string };

export function resolveProviderRow<T extends ProviderMatchRow>(rows: T[], hints: Set<string>): T | null {
  const rowCandidateSet = (row: T): Set<string> => {
    const out = new Set<string>();
    for (const field of [row.email, row.name, row.username]) {
      for (const v of expandIdentityStrings(String(field ?? ""))) out.add(v);
    }
    return out;
  };

  for (const row of rows) {
    const candidates = rowCandidateSet(row);
    for (const h of hints) {
      if (candidates.has(h)) return row;
    }
  }
  return null;
}
