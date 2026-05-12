import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import ngfLogo from "@/assets/ngf-logo.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — NGF Futures Lab" }] }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) return setError(err.message);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <img src={ngfLogo} alt="NGF" className="h-9 w-auto object-contain" />
          <div className="font-display">NGF Futures Lab</div>
        </Link>
        <h1 className="font-display text-3xl">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a link to set a new one.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="font-semibold text-primary">Email sent</div>
            <p className="mt-1 text-muted-foreground">
              If an account exists for {email}, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-primary" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
