import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero, PageShell } from "@/components/site/PageBits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — NGF Futures Lab" },
      { name: "description", content: "Get in touch with the NGF Futures Lab for partnerships, media enquiries or to request a briefing for your state." },
      { property: "og:title", content: "Contact the NGF Futures Lab" },
      { property: "og:description", content: "Partnerships, media enquiries, or request a briefing for your state." },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
  }),
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  organisation: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Invalid email").max(255),
  topic: z.string().trim().min(1, "Select a topic").max(80),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageShell>
        <PageHero
          eyebrow="Contact"
          title="Talk to the Lab."
          lede="Partnerships, media enquiries, or request a briefing for your state. The Secretariat replies within five working days."
        />
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-5">
              <ContactItem icon={Mail} title="Email" body={<a href="mailto:lab@nggovernorsforum.org" className="hover:text-foreground">lab@nggovernorsforum.org</a>} />
              <ContactItem icon={Phone} title="Phone" body="+234 (0)9 461 7000" />
              <ContactItem icon={MapPin} title="Address" body={<>NGF Secretariat, Plot 1009 Bourdillon Drive,<br />Maitama, Abuja, FCT, Nigeria</>} />
            </div>
            <Card className="lg:col-span-3 shadow-soft">
              <CardContent className="p-6 md:p-8">
                {sent ? (
                  <div className="py-10 text-center">
                    <div className="font-display text-xl">Thank you.</div>
                    <p className="mt-2 text-sm text-muted-foreground">Your message has reached the Secretariat. We'll respond within five working days.</p>
                  </div>
                ) : (
                  <form
                    className="grid gap-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as HTMLFormElement);
                      const parsed = contactSchema.safeParse({
                        name: fd.get("name"),
                        organisation: fd.get("org") || undefined,
                        email: fd.get("email"),
                        topic: fd.get("topic"),
                        message: fd.get("msg"),
                      });
                      if (!parsed.success) {
                        toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
                        return;
                      }
                      setBusy(true);
                      const { error } = await supabase.from("contact_messages").insert(parsed.data);
                      setBusy(false);
                      if (error) return toast.error(error.message);
                      setSent(true);
                      toast.success("Message sent to the NGF Secretariat.");
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="name" label="Full name" required><Input id="name" name="name" required autoComplete="name" maxLength={120} /></Field>
                      <Field id="org" label="Organisation"><Input id="org" name="org" autoComplete="organization" maxLength={160} /></Field>
                    </div>
                    <Field id="email" label="Email" required><Input id="email" name="email" type="email" required autoComplete="email" maxLength={255} /></Field>
                    <Field id="topic" label="Topic" required>
                      <select id="topic" name="topic" required className="h-10 rounded-md border bg-background px-3 text-sm">
                        <option value="">Select…</option>
                        <option>Request a briefing</option>
                        <option>Partnership / collaboration</option>
                        <option>Media enquiry</option>
                        <option>Data access</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field id="msg" label="Message" required><Textarea id="msg" name="msg" required rows={5} maxLength={2000} /></Field>
                    <Button type="submit" disabled={busy} className="bg-primary justify-self-start">
                      <Send className="mr-1.5 h-4 w-4" /> {busy ? "Sending…" : "Send message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </div>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}

function ContactItem({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-soft">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
        <div className="mt-1 text-sm text-foreground">{body}</div>
      </div>
    </div>
  );
}
