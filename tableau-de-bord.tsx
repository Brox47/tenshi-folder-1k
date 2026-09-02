import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  FolderOpen,
  Loader2,
  LogOut,
  Pencil,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { STATUS_LABEL, buildVcf, internationalPhone } from "@/lib/community";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — COMMUNITY 1K FOLDER" },
      {
        name: "description",
        content: "Gestion des demandes, du Folder et du fichier de contacts de la communauté.",
      },
      { property: "og:title", content: "Tableau de bord administrateur" },
      { property: "og:description", content: "Gestion des membres du Folder communautaire." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Status = "pending" | "approved" | "rejected";

interface MemberRow {
  id: string;
  full_name: string;
  country: string;
  dial_code: string;
  phone: string;
  email: string;
  status: Status;
  created_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isAdmin, loading } = useAdminAuth();
  const [filter, setFilter] = useState<"all" | Status>("pending");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      void navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  const membersQuery = useQuery({
    queryKey: ["admin-members"],
    enabled: Boolean(session && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, country, dial_code, phone, email, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemberRow[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["admin-folder-settings"],
    enabled: Boolean(session && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folder_settings")
        .select("folder_name, contact_prefix, member_goal, whatsapp_link")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    void queryClient.invalidateQueries({ queryKey: ["approved-members"] });
    void queryClient.invalidateQueries({ queryKey: ["approved-count"] });
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("members").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(
        vars.status === "approved" ? "Membre approuvé et ajouté au Folder." : "Demande refusée.",
      );
    },
    onError: () => toast.error("Action impossible."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Inscription supprimée.");
    },
    onError: () => toast.error("Suppression impossible."),
  });

  const editMutation = useMutation({
    mutationFn: async (row: MemberRow) => {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: row.full_name.trim(),
          country: row.country.trim(),
          dial_code: row.dial_code.trim(),
          phone: row.phone.replace(/[^0-9]/g, ""),
          email: row.email.trim(),
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success("Fiche mise à jour.");
    },
    onError: () => toast.error("Modification impossible."),
  });

  const members = membersQuery.data ?? [];
  const stats = useMemo(
    () => ({
      total: members.length,
      pending: members.filter((m) => m.status === "pending").length,
      approved: members.filter((m) => m.status === "approved").length,
      rejected: members.filter((m) => m.status === "rejected").length,
    }),
    [members],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => (filter === "all" ? true : m.status === filter))
      .filter(
        (m) =>
          !q ||
          m.full_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.country.toLowerCase().includes(q),
      );
  }, [members, filter, query]);

  const downloadVcf = () => {
    const approved = members.filter((m) => m.status === "approved");
    if (approved.length === 0) {
      toast.error("Aucun membre approuvé dans le Folder.");
      return;
    }
    const vcf = buildVcf(approved, settingsQuery.data?.contact_prefix ?? "T.S");
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(settingsQuery.data?.folder_name ?? "community-1k-folder")
      .toLowerCase()
      .replace(/\s+/g, "-")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${approved.length} contacts exportés.`);
  };

  if (loading || !session || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-2 font-display text-4xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {settingsQuery.data?.folder_name ?? "COMMUNITY 1K FOLDER"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4" /> Paramètres
          </Button>
          <Button size="sm" onClick={downloadVcf}>
            <Download className="size-4" /> Fichier VCF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/admin" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Inscriptions" value={stats.total} />
        <StatCard label="En attente" value={stats.pending} tone="warning" />
        <StatCard label="Approuvés" value={stats.approved} tone="primary" />
        <StatCard label="Refusés" value={stats.rejected} tone="destructive" />
        <StatCard label="Contacts Folder" value={stats.approved} icon />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tous" : STATUS_LABEL[f]}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {membersQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : visible.length === 0 ? (
          <div className="surface-card rounded-3xl border border-border/70 p-10 text-center text-sm text-muted-foreground">
            Aucune demande dans cette catégorie.
          </div>
        ) : (
          visible.map((m) => (
            <div
              key={m.id}
              className="surface-card rounded-2xl border border-border/70 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{m.full_name}</p>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.country} · {internationalPhone(m.dial_code, m.phone)} · {m.email}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Inscrit le{" "}
                    {new Date(m.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {m.status !== "approved" ? (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: m.id, status: "approved" })}
                      disabled={statusMutation.isPending}
                    >
                      <Check className="size-4" /> Approuver
                    </Button>
                  ) : null}
                  {m.status !== "rejected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => statusMutation.mutate({ id: m.id, status: "rejected" })}
                      disabled={statusMutation.isPending}
                    >
                      <X className="size-4" /> Refuser
                    </Button>
                  ) : null}
                  <Button size="icon" variant="outline" onClick={() => setEditing(m)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Supprimer définitivement ${m.full_name} ?`)) {
                        deleteMutation.mutate(m.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditDialog
        member={editing}
        onClose={() => setEditing(null)}
        onSave={(row) => editMutation.mutate(row)}
        saving={editMutation.isPending}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        initial={settingsQuery.data ?? null}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-folder-settings"] });
          void queryClient.invalidateQueries({ queryKey: ["folder-settings"] });
          void queryClient.invalidateQueries({ queryKey: ["folder-settings-whatsapp"] });
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: "primary" | "warning" | "destructive";
  icon?: boolean;
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="surface-card rounded-2xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon ? <FolderOpen className="size-4 text-primary" /> : null}
      </div>
      <p className={`mt-2 font-display text-3xl ${color}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const cls =
    status === "approved"
      ? "bg-primary/12 text-primary"
      : status === "rejected"
        ? "bg-destructive/12 text-destructive"
        : "bg-warning/12 text-warning";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${cls}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function EditDialog({
  member,
  onClose,
  onSave,
  saving,
}: {
  member: MemberRow | null;
  onClose: () => void;
  onSave: (row: MemberRow) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<MemberRow | null>(member);

  useEffect(() => setDraft(member), [member]);

  return (
    <Dialog open={Boolean(member)} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la fiche</DialogTitle>
        </DialogHeader>
        {draft ? (
          <div className="space-y-4">
            {(
              [
                ["full_name", "Nom complet"],
                ["country", "Pays"],
                ["dial_code", "Indicatif"],
                ["phone", "Numéro WhatsApp"],
                ["email", "Adresse e-mail"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                  {label}
                </Label>
                <Input
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => draft && onSave(draft)} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: {
    folder_name: string;
    contact_prefix: string;
    member_goal: number;
    whatsapp_link: string;
  } | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(initial), [initial]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase
      .from("folder_settings")
      .update({
        folder_name: draft.folder_name.trim(),
        contact_prefix: draft.contact_prefix.trim(),
        member_goal: Number(draft.member_goal) || 1000,
        whatsapp_link: draft.whatsapp_link.trim(),
      })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    toast.success("Paramètres mis à jour.");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres du Folder</DialogTitle>
        </DialogHeader>
        {draft ? (
          <div className="space-y-4">
            <SettingField
              label="Nom du Folder"
              value={draft.folder_name}
              onChange={(v) => setDraft({ ...draft, folder_name: v })}
            />
            <SettingField
              label="Préfixe des contacts"
              value={draft.contact_prefix}
              onChange={(v) => setDraft({ ...draft, contact_prefix: v })}
            />
            <SettingField
              label="Objectif de membres"
              value={String(draft.member_goal)}
              onChange={(v) => setDraft({ ...draft, member_goal: Number(v) || 0 })}
            />
            <SettingField
              label="Lien WhatsApp (bouton flottant)"
              value={draft.whatsapp_link}
              onChange={(v) => setDraft({ ...draft, whatsapp_link: v })}
            />
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs tracking-wide text-muted-foreground uppercase">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
