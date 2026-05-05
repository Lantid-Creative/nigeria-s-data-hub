import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import ngfLogo from "@/assets/ngf-logo.png";

const NAV = [
  { to: "/about", label: "About" },
  { to: "/methodology", label: "Methodology" },
  { to: "/snri", label: "SNRI" },
  { to: "/states", label: "States" },
  { to: "/research", label: "Research" },
  { to: "/press", label: "Press" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
          <img src={ngfLogo} alt="Nigeria Governors' Forum" className="h-9 w-auto object-contain" />
          <div className="leading-tight">
            <div className="font-display text-base text-foreground">NGF Futures Lab</div>
          </div>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground font-medium" }}
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-primary hidden sm:inline-flex">
            <Link to="/login">State Login <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" /></Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 md:px-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-foreground font-medium" }}
                className="py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground sm:hidden">
              State Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
