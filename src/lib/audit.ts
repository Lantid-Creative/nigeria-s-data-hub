import { supabase } from "@/integrations/supabase/client";

export async function logEvent(
  action: string,
  entity: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  try {
    await supabase.rpc("log_event", {
      _action: action,
      _entity: entity,
      _entity_id: entityId ?? null,
      _metadata: metadata as never,
    });
  } catch (e) {
    // non-blocking
    console.warn("audit log failed", e);
  }
}
