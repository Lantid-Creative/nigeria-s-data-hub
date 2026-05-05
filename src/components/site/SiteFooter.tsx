import { Link } from "@tanstack/react-router";
import { Sparkles, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md gradient-gold" aria-hidden="true">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <div className="font-display text-base">NGF Futures Lab</div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The intelligence engine of the Nigeria Governors' Forum, measuring
            sub-national resilience and shaping the next decade of state governance.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>NGF Secretariat, Plot 1009 Bourdillon Drive,<br />Maitama, Abuja, FCT, Nigeria</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="mailto:lab@nggovernorsforum.org" className="hover:text-foreground">lab@nggovernorsforum.org</a>
            </li>
          </ul>
        </div>

        <FooterCol title="The Lab" items={[
          { to: "/about", label: "About" },
          { to: "/methodology", label: "Methodology" },
          { to: "/snri", label: "SNRI" },
          { to: "/states", label: "States Coverage" },
        ]} />
        <FooterCol title="Knowledge" items={[
          { to: "/research", label: "Research & Reports" },
          { to: "/press", label: "Press Room" },
          { to: "/contact", label: "Contact" },
        ]} />
        <FooterCol title="Access" items={[
          { to: "/login", label: "State Login" },
          { to: "/contact", label: "Request Briefing" },
        ]} extra={
          <li className="text-xs text-muted-foreground">Credentials issued by the NGF Secretariat.</li>
        } />

        <div className="md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/legal/terms" className="hover:text-foreground">Terms of Use</Link></li>
            <li><Link to="/legal/data" className="hover:text-foreground">Data Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:px-8">
          <div>© {new Date().getFullYear()} Nigeria Governors' Forum Secretariat · NGF Futures Lab</div>
          <div className="opacity-80">
            Anchored at the NGF Economic Intelligence Unit · Built with Nigeria's 36 states + FCT
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items, extra }: {
  title: string;
  items: { to: string; label: string }[];
  extra?: React.ReactNode;
}) {
  return (
    <div className="md:col-span-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it.to + it.label}>
            <Link to={it.to} className="hover:text-foreground">{it.label}</Link>
          </li>
        ))}
        {extra}
      </ul>
    </div>
  );
}
