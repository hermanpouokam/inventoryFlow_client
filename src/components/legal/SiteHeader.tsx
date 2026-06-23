"use client";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";
import logo from "@/assets/img/logo.png";
import Image from "next/image";

export function SiteHeader() {
  const { t } = useTranslation("legal");
  const nav = t("nav", { returnObjects: true }) as Record<string, string>;

  return (
    <header className="fixed top-0 w-full z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold text-hero-foreground">
          <img src={logo.src} alt="logo" className="w-32 h-auto" />
        </a>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="items-center gap-1 text-sm text-muted-foreground" aria-label="Legal navigation">
            <Link
              href="?page=terms"
              className="rounded sm:px-3 px-1 py-1.5 transition-colors hover:bg-rail hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {nav.terms}
            </Link>
            <Link
              href="?page=privacy"
              className="rounded sm:px-3 px-1 py-1.5 transition-colors hover:bg-rail hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {nav.privacy}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
