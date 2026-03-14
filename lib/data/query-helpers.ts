import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];

type TableClient = ReturnType<SupabaseServerClient["from"]>;

export function fromTable<T extends TableName>(
  supabase: SupabaseServerClient,
  table: T,
): TableClient {
  return supabase.from(table as never) as TableClient;
}

export function asRows<T extends TableName>(data: unknown): TableRow<T>[] {
  return (data ?? []) as TableRow<T>[];
}

export function asRow<T extends TableName>(data: unknown): TableRow<T> | null {
  return data ? (data as TableRow<T>) : null;
}
