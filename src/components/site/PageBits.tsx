import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b bg-secondary/30", className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%), radial-gradient(40% 40% at 95% 90%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</span>
        )}
        <h1 className="mt-3 font-display text-3xl leading-tight text-balance md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {lede && <p className="mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">{lede}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24", className)}>
      <div className="space-y-6 text-base leading-relaxed text-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:mt-12 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-2 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a:hover]:underline">
        {children}
      </div>
    </section>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main id="main">{children}</main>;
}
