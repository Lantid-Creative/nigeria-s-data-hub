import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "ngf_staff" | "state_user" | "partner";

export type UserRole = {
  role: AppRole;
  state_code: string | null;
};

export type Profile = {
  id: string;
  full_name: string;
  title: string | null;
  state_code: string | null;
  avatar_url: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: UserRole[];
  loading: boolean;
  primaryRole: AppRole | null;
  stateCode: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProfileAndRoles(uid: string) {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,title,state_code,avatar_url").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role,state_code").eq("user_id", uid),
    ]);
    setProfile(p as Profile | null);
    setRoles((r ?? []) as UserRole[]);
  }

  useEffect(() => {
    // Set listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => loadProfileAndRoles(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    // Then existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfileAndRoles(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const primaryRole: AppRole | null =
    roles.find((r) => r.role === "ngf_staff")?.role ??
    roles.find((r) => r.role === "state_user")?.role ??
    roles[0]?.role ??
    null;

  const stateCode =
    roles.find((r) => r.role === "state_user")?.state_code ?? profile?.state_code ?? null;

  const value: AuthContextValue = {
    session,
    user,
    profile,
    roles,
    loading,
    primaryRole,
    stateCode,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async refresh() {
      if (user) await loadProfileAndRoles(user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
