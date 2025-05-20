"use client";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, LockKeyhole, PersonStanding, User } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SettingsDataProvider } from "./account/context/settingsData";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split("/")[pathname.split("/").length - 1] || "";

  const menu = [
    {
      name: "Compte",
      subText:
        "Nom d'utilisateur, email, nom, prénom, numéro, Photo de profile",
      link: "account",
      icon: User,
    },
    {
      name: "Sécurité",
      subText: "Mot de passe, Paramètres de connexion",
      link: "security",
      icon: LockKeyhole,
    },
    {
      name: "Notification",
      subText: "Paramètre de notification, notifications de connexion",
      link: "notification",
      icon: Bell,
    },
    {
      name: "accéssibilité",
      subText: "Langue de l'application, Monnaie préférée",
      link: "accessibility",
      icon: PersonStanding,
    },
  ];

  return (
    <SettingsDataProvider>
      <div className="grid grid-cols-1 min-h-screen xl:px-56 md:grid-cols-6 gap-3">
        {/* Colonne sticky */}
        <div className="col-span-1 md:col-span-2 h-screen sticky top-10 self-start">
          <div className="divide-y truncate divide-neutral-200">
            {menu.map((el, i) => {
              const Icon = el.icon;
              return (
                <div key={i} className="w-full">
                  <Link
                    href={el.link}
                    className={cn(
                      "text-gray-800 py-4 text-base font-medium flex items-center justify-start truncate max-w-full overflow-x-hidden hover:bg-muted px-2",
                      basePath === el.link && "bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <div>
                      {el.name}
                      <p className="text-muted-foreground capitalize text-xs font-normal w-full truncate">
                        {el.subText}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne de contenu */}
        <div className="col-span-1 md:col-span-4">
          <CardBodyContent>{children}{children}</CardBodyContent>
        </div>
      </div>
    </SettingsDataProvider>

  );
}
