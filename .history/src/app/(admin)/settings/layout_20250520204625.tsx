"use client";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, LockKeyhole, PersonStanding, User } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SettingsDataProvider } from "./account/context/settingsData";
import { Input } from "@/components/ui/input";

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
      <div className="grid grid-cols-1 md:grid-cols-6 min-h-screen gap-3 xl:px-56">
        {/* Sidebar */}
        <div className="md:col-span-2">
          <div className="sticky space-y-4 top-[70px] max-h-screen overflow-auto">
            <Input />
            <div className=" divide-y-2 divide-neutral-100">
              {menu.map((el, i) => {
                const Icon = el.icon;
                return (
                  <div key={i} className="w-full">
                    <Link
                      href={el.link}
                      className={cn(
                        "text-gray-800 py-4 text-base font-medium flex items-center justify-start truncate max-w-full overflow-x-hidden hover:bg-white px-2 rounded",
                        basePath === el.link && "bg-white"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      <div className="max-w-full">
                        {el.name}
                        <p className="text-muted-foreground capitalize text-xs font-normal max-w-full truncate">
                          {el.subText}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="md:col-span-4">
          <CardBodyContent>{children}</CardBodyContent>
        </div>
      </div>
    </SettingsDataProvider>

  );
}
