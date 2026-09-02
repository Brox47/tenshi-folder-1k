import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileDown, FolderOpen, ShieldCheck, UserPlus } from "lucide-react";

import { ProgressGoal } from "@/components/progress-goal";
import { Button } from "@/components/ui/button";
import { useApprovedCount, useFolderSettings } from "@/hooks/use-community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COMMUNITY 1K FOLDER — 1 000 contacts, un seul dossier" },
      {
        name: "description",
        content:
          "Inscris-toi, sois validé par l'administration et rejoins le dossier de contacts WhatsApp de la communauté. Objectif : 1 000 membres.",
      },
      { property: "og:title", content: "COMMUNITY 1K FOLDER" },
      {
        property: "og:description",
        content: "Un seul dossier de contacts WhatsApp, construit membre après membre.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    icon: UserPlus,
    title: "Tu t'inscris",
    text: "Nom, pays, numéro WhatsApp et e-mail via un formulaire sécurisé.",
  },
  {
    icon: ShieldCheck,
    title: "L'admin vérifie",
    text: "Chaque demande passe en attente, puis est approuvée ou refusée.",
  },
  {
    icon: FolderOpen,
    title: "Ajout au Folder",
    text: "Une fois approuvé, ton contact entre automatiquement dans le Folder unique.",
  },
  {
    icon: FileDown,
    title: "Fichier VCF à jour",
    text: "Le fichier de contacts est régénéré et distribué aux membres autorisés.",
  },
];

function Home() {
  const { data: settings } = useFolderSettings();
  const { data: approved } = useApprovedCount();
  const goal = settings?.member_goal ?? 1000;
  const count = approved ?? 0;

  return (
    <>
      <section className="surface-hero relative overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="animate-rise">
              <p className="eyebrow">{settings?.folder_name ?? "COMMUNITY 1K FOLDER"}</p>
              <h1 className="mt-4 font-display text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-7xl">
                Un seul dossier.
                <br />
                <span className="text-primary">Mille contacts.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
                Inscris-toi, laisse l'administration valider ta demande, et ton contact rejoint le
                Folder communautaire partagé avec tous les membres approuvés.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="font-semibold">
                  <Link to="/rejoindre">
                    Rejoindre le Folder
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/communaute">Voir la communauté</Link>
                </Button>
              </div>

              <div className="mt-12 max-w-md">
                <ProgressGoal approved={count} goal={goal} />
              </div>
            </div>

            <div className="surface-card glow animate-rise rounded-3xl border border-border/70 p-7 sm:p-9">
              <p className="eyebrow">Le Folder</p>
              <p className="mt-6 font-display text-5xl leading-none sm:text-6xl">
                {settings?.contact_prefix ?? "T.S"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Chaque membre approuvé est enregistré sous ce préfixe, dans un format uniforme.
              </p>

              <div className="mt-8 space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 font-mono text-xs text-muted-foreground">
                <p>BEGIN:VCARD</p>
                <p>VERSION:3.0</p>
                <p className="text-foreground">
                  FN:{settings?.contact_prefix ?? "T.S"} Jean Pierre
                </p>
                <p className="text-foreground">TEL:+509********</p>
                <p>END:VCARD</p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                <span>Contacts</span>
                <span className="text-primary">{count.toLocaleString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="eyebrow">Comment ça marche</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl sm:text-4xl">
            De l'inscription au dossier de contacts, en quatre étapes.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="surface-card rounded-2xl border border-border/70 p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Confidentialité</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Ton numéro est partagé uniquement dans le Folder.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[
                "Les numéros et e-mails ne sont jamais affichés publiquement sur le site.",
                "Seuls les membres approuvés apparaissent sur la page Communauté, avec nom et pays.",
                "Ton consentement explicite est requis avant toute inscription.",
                "L'espace administrateur est protégé par e-mail et mot de passe.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8">
              <Link to="/confidentialite">Lire la politique complète</Link>
            </Button>
          </div>

          <div className="surface-card rounded-3xl border border-border/70 p-8">
            <p className="text-sm text-muted-foreground">Objectif communautaire</p>
            <div className="mt-4">
              <ProgressGoal approved={count} goal={goal} compact />
            </div>
            <Button asChild size="lg" className="mt-8 w-full font-semibold">
              <Link to="/rejoindre">
                Rejoindre maintenant
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
