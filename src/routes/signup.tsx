import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock } from "lucide-react";
import ngfLogo from "@/assets/ngf-logo.png";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create account — NGF Futures Lab" },
      { name: "description", content: "Create an account for the NGF Futures Lab platform." },
    ],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Minimum 8 characters").max(72),
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  async function googleSignup() {
    const r: any = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r?.error) {
      setError(typeof r.error === "string" ? r.error : (r.error as Error).message);
      return;
    }
    if (r?.redirected) return;
    navigate({ to: "/state" });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground md:block">
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={ngfLogo} alt="NGF" className="h-9 w-auto rounded bg-white object-contain p-0.5" />
            <div className="font-display text-base">NGF Futures Lab</div>
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-3xl leading-tight">Request your workspace.</h2>
            <p className="mt-3 text-sm text-white/70">
              Accounts are reviewed and provisioned by the NGF Secretariat. After
              signup you'll be assigned a role and state by an administrator.
            </p>
          </div>
          <div className="text-xs text-white/60">© 2026 NGF Secretariat</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={ngfLogo} alt="NGF" className="h-9 w-auto object-contain" />
              <div className="font-display">NGF Futures Lab</div>
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" /> New account
          </span>
          <h1 className="mt-4 font-display text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your official email. We'll send a verification link.
          </p>

          {done ? (
            <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
              <div className="font-semibold text-primary">Check your inbox</div>
              <p className="mt-1 text-muted-foreground">
                We sent a verification link to <span className="font-medium">{email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <Link to="/login" className="mt-3 inline-flex text-xs text-primary hover:underline">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <Button type="button" variant="outline" className="mt-6 w-full" onClick={googleSignup}>
                <GoogleMark /> Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Official email</Label>
                  <Input id="email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full bg-primary" disabled={loading}>
                  {loading ? "Creating…" : <>Create account <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                </Button>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
