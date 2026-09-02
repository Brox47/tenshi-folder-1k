import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, registrationSchema } from "@/lib/community";
import { useFolderSettings } from "@/hooks/use-community";

export const Route = createFileRoute("/rejoindre")({
  head: () => ({
    meta: [
      { title: "Rejoindre le Folder — COMMUNITY 1K FOLDER" },
      {
        name: "description",
        content:
          "Remplis le formulaire pour demander ton entrée dans le dossier de contacts WhatsApp de la communauté.",
      },
      { property: "og:title", content: "Rejoindre le COMMUNITY 1K FOLDER" },
      {
        property: "og:description",
        content: "Inscription en une minute, validation par l'administration.",
      },
    ],
  }),
  component: Join,
});

function Join() {
  const { data: settings } = useFolderSettings();
  const [form, setForm] = useState({
    full_name: "",
    country: "Haïti",
    dial_code: "+509",
    phone: "",
    email: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = registrationSchema.safeParse(form);
      if (!parsed.success) {
        const next: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          next[String(issue.path[0])] = issue.message;
        }
        setErrors(next);
        throw new Error("invalid");
      }
      setErrors({});
      const { error } = await supabase.from("members").insert({
        full_name: parsed.data.full_name,
        country: parsed.data.country,
        dial_code: parsed.data.dial_code,
        phone: parsed.data.phone,
        email: parsed.data.email,
        consent: true,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") {
          throw new Error("Ce numéro WhatsApp a déjà été enregistré.");
        }
        throw new Error("Impossible d'envoyer la demande. Réessaie dans un instant.");
      }
    },
    onSuccess: () => setDone(true),
    onError: (error: Error) => {
      if (error.message !== "invalid") toast.error(error.message);
    },
  });

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="surface-card animate-rise rounded-3xl border border-border/70 p-8">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Clock className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-3xl">Demande envoyée</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ta demande est en attente de validation par un administrateur. Dès qu'elle est
            approuvée, ton contact rejoint le {settings?.folder_name ?? "COMMUNITY 1K FOLDER"} et tu
            reçois les informations à l'adresse e-mail indiquée.
          </p>
          <Button
            variant="outline"
            className="mt-8"
            onClick={() => {
              setDone(false);
              setForm({
                full_name: "",
                country: "Haïti",
                dial_code: "+509",
                phone: "",
                email: "",
                consent: false,
              });
            }}
          >
            Inscrire quelqu'un d'autre
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Inscription</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Rejoindre le Folder</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Toutes les demandes sont vérifiées manuellement avant d'entrer dans le dossier de contacts.
      </p>

      <form
        className="surface-card mt-8 space-y-5 rounded-3xl border border-border/70 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Field label="Nom complet" error={errors["full_name"]}>
          <Input
            value={form.full_name}
            maxLength={80}
            placeholder="Jean Pierre"
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
        </Field>

        <Field label="Pays" error={errors["country"]}>
          <Select
            value={form.country}
            onValueChange={(value) => {
              const country = COUNTRIES.find((c) => c.name === value);
              setForm((f) => ({
                ...f,
                country: value,
                dial_code: country && country.dial !== "+" ? country.dial : f.dial_code,
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <Field label="Indicatif" error={errors["dial_code"]}>
            <Input
              value={form.dial_code}
              maxLength={6}
              inputMode="tel"
              onChange={(e) => setForm((f) => ({ ...f, dial_code: e.target.value }))}
            />
          </Field>
          <Field label="Numéro WhatsApp" error={errors["phone"]}>
            <Input
              value={form.phone}
              maxLength={15}
              inputMode="tel"
              placeholder="34 12 34 56"
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Adresse e-mail" error={errors["email"]}>
          <Input
            value={form.email}
            type="email"
            maxLength={160}
            placeholder="nom@email.com"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </Field>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
          <div className="flex gap-3">
            <Checkbox
              id="consent"
              checked={form.consent}
              onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-xs leading-relaxed text-muted-foreground">
              J'accepte que mon numéro WhatsApp soit inclus dans le Folder communautaire, que les
              autres membres autorisés puissent recevoir ma fiche contact, et que mon adresse e-mail
              soit utilisée pour l'envoi des informations liées au service.
            </Label>
          </div>
          {errors["consent"] ? (
            <p className="mt-2 text-xs text-destructive">{errors["consent"]}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Envoyer ma demande
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs tracking-wide text-muted-foreground uppercase">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
