import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Confidentialité — COMMUNITY 1K FOLDER" },
      {
        name: "description",
        content:
          "Comment les données des membres du COMMUNITY 1K FOLDER sont collectées, utilisées et protégées.",
      },
      { property: "og:title", content: "Confidentialité — COMMUNITY 1K FOLDER" },
      {
        property: "og:description",
        content: "Collecte, usage et protection des données des membres.",
      },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    title: "Données collectées",
    body: "Nom complet, pays, indicatif et numéro WhatsApp, adresse e-mail, date d'inscription et statut de la demande.",
  },
  {
    title: "Usage des données",
    body: "Le numéro WhatsApp sert exclusivement à construire le Folder de contacts partagé avec les membres approuvés. L'adresse e-mail sert à t'envoyer les informations et le fichier de contacts liés au service.",
  },
  {
    title: "Affichage public",
    body: "La page Communauté n'affiche que le nom, le pays et le badge de validation. Les numéros et adresses e-mail ne sont jamais publiés sur le site.",
  },
  {
    title: "Consentement",
    body: "Aucune inscription n'est possible sans cocher la case de consentement expliquant le partage du numéro dans le Folder.",
  },
  {
    title: "Sécurité",
    body: "L'espace administrateur est protégé par e-mail et mot de passe. Les règles d'accès de la base de données empêchent tout accès public aux données sensibles.",
  },
  {
    title: "Retrait",
    body: "Tu peux demander à tout moment le retrait de ton contact du Folder en contactant l'administration via WhatsApp ou par e-mail.",
  },
];

function Privacy() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Confidentialité</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Protection des données</h1>
      <div className="mt-10 space-y-4">
        {SECTIONS.map((s) => (
          <section key={s.title} className="surface-card rounded-2xl border border-border/70 p-6">
            <h2 className="text-lg">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
