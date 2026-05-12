import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import ngfLogo from "@/assets/ngf-logo.png";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — NGF Futures Lab" },
      { name: "description", content: "Secure access for state governments to the NGF Futures Lab platform." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err, userId } = await signIn(email, password);
    if (err || !userId) {
      setError(err ?? "Sign in failed");
      setLoading(false);
      return;
    }
    // Resolve role with a single query (no extra getUser round-trip)
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", userId);
    const isNgf = (roles ?? []).some((r) => r.role === "ngf_staff");
    navigate({ to: isNgf ? "/ngf" : "/state" });
  }

  async function googleSignIn() {
    setError(null);
    const r: any = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r?.error) {
      setError(typeof r.error === "string" ? r.error : (r.error as Error).message);
      return;
    }
    if (r?.redirected) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isNgf = (roles ?? []).some((r) => r.role === "ngf_staff");
    navigate({ to: isNgf ? "/ngf" : "/state" });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Illustration panel */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground md:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(50% 40% at 30% 20%, color-mix(in oklab, var(--gold) 50%, transparent), transparent 70%), radial-gradient(40% 40% at 80% 90%, color-mix(in oklab, white 25%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={ngfLogo} alt="Nigeria Governors' Forum" className="h-9 w-auto rounded bg-white object-contain p-0.5" />
            <div className="leading-tight">
              <div className="font-display text-base">NGF Futures Lab</div>
            </div>
          </Link>

          <div className="max-w-md">
            {/* Flat geometric illustration: data constellation */}
            <svg viewBox="0 0 400 280" className="h-auto w-full">
              <defs>
                <linearGradient id="ln" x1="0" x2="1">
                  <stop offset="0" stopColor="oklch(0.85 0.16 90)" stopOpacity="0.9" />
                  <stop offset="1" stopColor="oklch(0.85 0.16 90)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* connecting lines */}
              {[
                [60, 60, 200, 120], [200, 120, 340, 70], [200, 120, 110, 220],
                [200, 120, 320, 210], [60, 60, 110, 220], [340, 70, 320, 210],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#ln)" strokeWidth="1.2" />
              ))}
              {/* nodes */}
              {[[60,60,8],[340,70,8],[110,220,8],[320,210,8],[200,120,16]].map(([cx,cy,r],i)=>(
                <g key={i}>
                  <circle cx={cx} cy={cy} r={Number(r)+6} fill="oklch(0.85 0.16 90 / 0.18)" />
                  <circle cx={cx} cy={cy} r={r} fill="oklch(0.85 0.16 90)" />
                </g>
              ))}
              {/* abstract bars */}
              <g transform="translate(40,250)">
                {[14,22,10,28,18,24,16,30].map((h,i)=>(
                  <rect key={i} x={i*16} y={-h} width="10" height={h} rx="2" fill="white" opacity="0.55" />
                ))}
              </g>
            </svg>
            <h2 className="mt-8 font-display text-3xl leading-tight">
              Anticipatory governance, <span className="italic text-gold">built with the states.</span>
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Submit your reporting cycle, see your dashboard, benchmark against peers,
              and shape the national resilience picture.
            </p>
          </div>

          <div className="text-xs text-white/60">
            © 2026 NGF Secretariat · Economic Intelligence Unit
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={ngfLogo} alt="Nigeria Governors' Forum" className="h-9 w-auto object-contain" />
              <div className="font-display">NGF Futures Lab</div>
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" /> Restricted access
          </span>
          <h1 className="mt-4 font-display text-3xl">Sign in to your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For authorised state government officials. Credentials are issued by the
            NGF Secretariat — there is no public sign-up.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <Input
                id="email" type="email" required autoComplete="email"
                placeholder="name@kadunastate.gov.ng"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input
                id="password" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-primary" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={googleSignIn}>
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
          </div>

          <div className="mt-4 rounded-md border border-dashed bg-secondary/40 p-3 text-[11px] text-muted-foreground">
            <div className="font-semibold text-foreground">Demo credentials</div>
            <div>State · <code>state@kadunastate.gov.ng</code></div>
            <div>NGF · <code>ngf@nggovernorsforum.org</code></div>
            <div>Password · <code>Demo1234!</code></div>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-md border bg-secondary/30 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Sessions are encrypted and audited. Suspected unauthorised access?
              Contact the NGF Secretariat IT desk.
            </span>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
