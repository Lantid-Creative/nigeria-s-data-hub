import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, ShieldCheck, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Stubbed role-based redirect. Real auth comes when backend is wired:
  // server validates credentials, returns role, we route accordingly.
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const isNgf = /@ngf\.|@nggovernorsforum/i.test(email);
      navigate({ to: isNgf ? "/ngf" : "/state" });
    }, 600);
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
            <div className="grid h-9 w-9 place-items-center rounded-md bg-gold text-gold-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base">NGF Futures Lab</div>
              <div className="text-[10px] uppercase tracking-widest opacity-70">Nigeria Governors' Forum</div>
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
              <div className="grid h-9 w-9 place-items-center rounded-md gradient-gold">
                <Sparkles className="h-5 w-5 text-gold-foreground" />
              </div>
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
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <Input
                id="password" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-primary" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>}
            </Button>
          </form>

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
