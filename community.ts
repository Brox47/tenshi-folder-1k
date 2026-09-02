import { z } from "zod";

export const COUNTRIES: { name: string; dial: string; flag: string }[] = [
  { name: "Haïti", dial: "+509", flag: "🇭🇹" },
  { name: "France", dial: "+33", flag: "🇫🇷" },
  { name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { name: "Canada", dial: "+1", flag: "🇨🇦" },
  { name: "République dominicaine", dial: "+1809", flag: "🇩🇴" },
  { name: "Brésil", dial: "+55", flag: "🇧🇷" },
  { name: "Chili", dial: "+56", flag: "🇨🇱" },
  { name: "Mexique", dial: "+52", flag: "🇲🇽" },
  { name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { name: "RD Congo", dial: "+243", flag: "🇨🇩" },
  { name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { name: "Mali", dial: "+223", flag: "🇲🇱" },
  { name: "Guinée", dial: "+224", flag: "🇬🇳" },
  { name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { name: "Autre", dial: "+", flag: "🌍" },
];

export const registrationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Le nom complet est trop court")
    .max(80, "Le nom complet est trop long"),
  country: z.string().trim().min(2, "Choisis un pays").max(60),
  dial_code: z
    .string()
    .trim()
    .regex(/^\+\d{1,5}$/, "Indicatif invalide (ex : +509)"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9\s-]{6,15}$/, "Numéro WhatsApp invalide")
    .transform((v) => v.replace(/[\s-]/g, "")),
  email: z.string().trim().email("Adresse e-mail invalide").max(160),
  consent: z.literal(true, { message: "Le consentement est obligatoire" }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function internationalPhone(dialCode: string, phone: string) {
  return `${dialCode}${phone.replace(/[^0-9]/g, "")}`;
}

export function contactName(prefix: string, fullName: string) {
  return prefix.trim() ? `${prefix.trim()} ${fullName}` : fullName;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildVcf(
  members: { full_name: string; dial_code: string; phone: string }[],
  prefix: string,
) {
  return members
    .map((m) => {
      const fn = contactName(prefix, m.full_name);
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:;${fn};;;`,
        `FN:${fn}`,
        `TEL;TYPE=CELL:${internationalPhone(m.dial_code, m.phone)}`,
        "END:VCARD",
      ].join("\r\n");
    })
    .join("\r\n");
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};
