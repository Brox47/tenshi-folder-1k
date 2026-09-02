import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Connexion administrateur — COMMUNITY 1K FOLDER" },
      {
        name: "description",
        content: "Espace réservé aux administrateurs du dossier de contacts communautaire.",
      },
      { property: "og:title", content: "Connexion administrateur" },
      { property: "og:description", content: "Accès sécurisé au tableau de bord du Folder." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: adminExists } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: async () => {
      const { data } = await supabase.rpc("admin_exists");
      return Boolean(data);
    },
  });

  useEffect(() => {
    if (!loading && session && isAdmin) {
      void navigate({ to: "/tableau-de-bord" });
    }
  }, [loading, session, isAdmin, navigate]);

  const submit = async (mode: "signin" | "signup") => {
    if (!email.trim() || password.length < 8) {
      toast.error("E-mail requis et mot de passe d'au moins 8 caractères.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        const { data: claimed } = await supabase.rpc("claim_first_admin");
        if (!claimed) {
          toast.error("Un administrateur existe déjà. Connecte-toi avec ce compte.");
          return;
        }
        toast.success("Compte administrateur créé.");
        void navigate({ to: "/tableau-de-bord" });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Connexion réussie.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connexion impossible. Vérifie tes identifiants.",
      );
    } finally {
      setBusy(false);
    }
  };

  const firstRun = adminExists === false;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="surface-card rounded-3xl border border-border/70 p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-3xl">
          {firstRun ? "Créer le compte admin" : "Connexion admin"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {firstRun
            ? "Aucun administrateur n'existe encore. Le premier compte créé devient l'administrateur du Folder."
            : "Accès réservé à l'administration du Folder."}
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(firstRun ? "signup" : "signin");
          }}
        >
          <div className="space-y-2">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              Adresse e-mail
            </Label>
            <Input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              Mot de passe
            </Label>
            <Input
              type="password"
              value={password}
              autoComplete={firstRun ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" className="w-full font-semibold" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {firstRun ? "Créer le compte" : "Se connecter"}
          </Button>
        </form>

        {session && !isAdmin && !loading ? (
          <p className="mt-6 text-xs text-destructive">
            Ce compte n'a pas les droits administrateur.
          </p>
        ) : null}
      </div>
    </div>
  );
}
