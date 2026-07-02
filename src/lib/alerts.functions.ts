import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TinSchema = z.object({
  tin: z.string().regex(/^[0-9]{12}$/, "TIN must be 12 digits"),
  label: z.string().trim().max(60).optional().nullable(),
});

const IdSchema = z.object({ id: z.string().uuid() });

type AuditDB = {
  zones: string[];
  circles: string[];
  data: Record<string, [number, number, string, string, number?]>;
};

let _dbCache: AuditDB | null = null;
async function loadAuditDB(request: Request): Promise<AuditDB> {
  if (_dbCache) return _dbCache;
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/data/audit.json`);
  if (!res.ok) throw new Error("Failed to load audit dataset");
  _dbCache = (await res.json()) as AuditDB;
  return _dbCache;
}

export const listWatchedTins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("watched_tins")
      .select("id, tin, label, created_at, last_checked_at, matched_at, matched_source")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addWatchedTin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TinSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const db = await loadAuditDB(req as unknown as Request);
    const row = db.data[data.tin];
    const matched = !!row;
    const now = new Date().toISOString();

    const { data: inserted, error } = await context.supabase
      .from("watched_tins")
      .insert({
        user_id: context.userId,
        tin: data.tin,
        label: data.label ?? null,
        last_checked_at: now,
        matched_at: matched ? now : null,
        matched_source: matched ? (row?.[4] ?? 0) : null,
      })
      .select("id, tin, label, created_at, last_checked_at, matched_at, matched_source")
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("You're already watching this TIN.");
      throw new Error(error.message);
    }

    return {
      row: inserted,
      immediateMatch: matched
        ? {
            zone: db.zones[row![0]],
            circle: db.circles[row![1]],
            submission_type: row![2],
            assessment_year: row![3],
            source: (row![4] ?? 0) as number,
          }
        : null,
    };
  });

export const removeWatchedTin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("watched_tins").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recheckAllWatchedTins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const db = await loadAuditDB(req as unknown as Request);

    const { data: rows, error } = await context.supabase
      .from("watched_tins")
      .select("id, tin, matched_at")
      .is("matched_at", null);
    if (error) throw new Error(error.message);

    let newlyMatched = 0;
    const now = new Date().toISOString();
    for (const r of rows ?? []) {
      const hit = db.data[r.tin];
      if (hit) {
        await context.supabase
          .from("watched_tins")
          .update({ matched_at: now, matched_source: hit[4] ?? 0, last_checked_at: now })
          .eq("id", r.id);
        newlyMatched++;
      } else {
        await context.supabase
          .from("watched_tins")
          .update({ last_checked_at: now })
          .eq("id", r.id);
      }
    }
    return { checked: rows?.length ?? 0, newlyMatched };
  });