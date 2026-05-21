import { redirect } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type WorkspacePath = "/ngf" | "/state";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function getCurrentBrowserUser(retries = 3): Promise<User | null> {
  if (typeof window === "undefined") return null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase.auth.getUser();
      return error ? session.user : data.user;
    }
    if (attempt < retries) await wait(100);
  }

  return null;
}

export async function getPostLoginPath(userId: string): Promise<WorkspacePath> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  return (roles ?? []).some((role) => role.role === "ngf_staff") ? "/ngf" : "/state";
}

export async function requireAuthenticatedUser(): Promise<User | null> {
  const user = await getCurrentBrowserUser();
  if (typeof window === "undefined") return null;
  if (!user) throw redirect({ to: "/login" });
  return user;
}

export async function requireNgfStaff() {
  const user = await requireAuthenticatedUser();
  if (!user) return;

  const path = await getPostLoginPath(user.id);
  if (path !== "/ngf") throw redirect({ to: "/state" });
}

export async function redirectAuthenticatedUser() {
  const user = await getCurrentBrowserUser(1);
  if (!user) return;

  throw redirect({ to: await getPostLoginPath(user.id) });
}