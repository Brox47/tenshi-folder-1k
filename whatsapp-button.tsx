import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function WhatsAppButton() {
  const { data } = useQuery({
    queryKey: ["folder-settings-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase
        .from("folder_settings")
        .select("whatsapp_link")
        .eq("id", 1)
        .maybeSingle();
      return data?.whatsapp_link ?? "";
    },
  });

  if (!data) return null;

  return (
    <a
      href={data}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="glow fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.34 4.95L2 22l5.23-1.37a9.9 9.9 0 0 0 4.81 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.02a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.56 3.71-8.27 8.27-8.27 4.56 0 8.27 3.71 8.27 8.27 0 4.56-3.71 8.16-8.34 8.16Zm4.53-6.11c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
      </svg>
    </a>
  );
}
