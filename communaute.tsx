import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgressGoal } from "@/components/progress-goal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovedMembers, useFolderSettings } from "@/hooks/use-community";
import { initials } from "@/lib/community";

export const Route = createFileRoute("/communaute")({
  head: () => ({
    meta: [
      { title: "La communauté — COMMUNITY 1K FOLDER" },
      {
        name: "description",
        content:
          "Découvre les membres approuvés du dossier de contacts communautaire, avec leur nom et leur pays.",
      },
      { property: "og:title", content: "La communauté du 1K Folder" },
      {
        property: "og:description",
        content: "Les membres approuvés du dossier de contacts communautaire.",
      },
    ],
  }),
  component: Community,
});

function Community() {
  const { data: members, isLoading } = useApprovedMembers();
  const { data: settings } = useFolderSettings();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members ?? [];
    return (members ?? []).filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) || (m.country ?? "").toLowerCase().includes(q),
    );
  }, [members, query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Communauté</p>
      <div className="mt-3 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Membres approuvés</h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Seuls les nom et pays sont affichés. Les numéros WhatsApp et adresses e-mail restent
            privés et ne circulent que dans le Folder.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <ProgressGoal
            approved={members?.length ?? 0}
            goal={settings?.member_goal ?? 1000}
            compact
          />
        </div>
      </div>

      <div className="relative mt-8 max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre ou un pays…"
          className="pl-9"
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          : filtered.map((m) => (
              <div
                key={m.id}
                className="surface-card flex items-center gap-4 rounded-2xl border border-border/70 p-4 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 font-display text-sm text-primary">
                  {initials(m.full_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{m.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.country}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-primary">
                    <BadgeCheck className="size-3.5" />
                    Membre approuvé
                  </span>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && filtered.length === 0 ? (
        <div className="surface-card mt-8 rounded-3xl border border-border/70 p-10 text-center">
          <p className="font-display text-xl">
            {query ? "Aucun membre trouvé" : "Le Folder est encore vide"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {query
              ? "Essaie un autre nom ou un autre pays."
              : "Sois parmi les premiers à rejoindre la communauté."}
          </p>
          {!query ? (
            <Button asChild className="mt-6 font-semibold">
              <Link to="/rejoindre">Rejoindre le Folder</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
