"use client";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ReactCountryFlag from "react-country-flag";
import { switchLang } from "../languageSwitcher";

const LANGS = [
  { code: "fr", label: "FR", flag: "fr" },
  { code: "en", label: "EN", flag: "gb" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language;


  return (
    <Select value={current} onValueChange={(e) => switchLang(e)}>
      <SelectTrigger className="w-full max-w-28 sm:max-w-xs bg-transparent outline-none border-none focus-visible:outline-none ring-0 focus-visible:ring-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map(({ code, label,flag }) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <ReactCountryFlag countryCode={flag.toUpperCase()} svg style={{ width: "0.9em", height: "0.9em" }} />
              <span>{label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
