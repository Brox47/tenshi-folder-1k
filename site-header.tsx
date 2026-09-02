import { Link } from "@tanstack/react-router";
import { Lock, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/rejoindre", label: "Rejoindre" },
  { to: "/communaute", label: "Communauté" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 font-display text-sm font-extrabold text-primary">
            1K
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold tracking-tight">
              COMMUNITY
            </span>
            <span className="block text-[0.65rem] tracking-[0.24em] text-muted-foreground">
              1K FOLDER
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/admin">
              <Lock className="size-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border/70 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-3 text-sm text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
