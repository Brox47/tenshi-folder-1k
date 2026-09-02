import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface FolderSettings {
  folder_name: string;
  contact_prefix: string;
  member_goal: number;
  whatsapp_link: string;
}

export function useFolderSettings() {
  return useQuery<FolderSettings>({
    queryKey: ["folder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folder_settings")
        .select("folder_name, contact_prefix, member_goal, whatsapp_link")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? {
          folder_name: "COMMUNITY 1K FOLDER",
          contact_prefix: "T.S",
          member_goal: 1000,
          whatsapp_link: "",
        }
      );
    },
  });
}

export function useApprovedMembers() {
  return useQuery({
    queryKey: ["approved-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, country, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useApprovedCount() {
  return useQuery({
    queryKey: ["approved-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");
      if (error) throw error;
      return count ?? 0;
    },
  });
}
