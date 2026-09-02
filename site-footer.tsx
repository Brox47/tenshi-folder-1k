import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md">
          COMMUNITY 1K FOLDER — un seul dossier de contacts, construit membre après membre.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/rejoindre" className="transition-colors hover:text-foreground">
            Rejoindre
          </Link>
          <Link to="/communaute" className="transition-colors hover:text-foreground">
            Communauté
          </Link>
          <Link to="/confidentialite" className="transition-colors hover:text-foreground">
            Confidentialité
          </Link>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
