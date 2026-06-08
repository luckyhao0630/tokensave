"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "zh", label: "中", flag: "🇨🇳" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
  const nextLang = languages.find((l) => l.code !== i18n.language) || languages[1];

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1"
      onClick={() => i18n.changeLanguage(nextLang.code)}
    >
      <Globe className="w-4 h-4" />
      <span>{nextLang.flag}</span>
    </Button>
  );
}
