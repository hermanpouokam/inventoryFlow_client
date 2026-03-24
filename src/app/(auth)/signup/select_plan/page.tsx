"use client";
import { getPlans, getUserData } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import React, { useLayoutEffect, useState } from "react";
import userImg from "@/assets/img/user.png";
import logo from "@/assets/img/logo.png";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { cn } from "@/lib/utils";
import { encryptParam } from "@/utils/encryptURL";
import { clearStorageAndCookies } from "../functions";
import { Pricing } from "@/app/page";
import { parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from "react-i18next";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [duration, setDuration] = useQueryState('duration', parseAsString.withDefault('monthly'))
  const { t } = useTranslation()
  const getUser = async () => {
    const res: User = await getUserData();
    setUser(res);
  };

  const fetchPlans = async () => {
    const res = await getPlans();
    setPlans(res);
  };
  const { t: tCommon } = useTranslation('common')
  useLayoutEffect(() => {
    getUser();
    fetchPlans();
  }, []);

  const handleSelectPlan = (planId: number) => {
    try {
      const encryptedId = encryptParam(encodeURI(planId.toString()));
      if (planId == 1) {
        window.location.replace("/dashboard");
      } else {
        window.location.assign(
          `/signup/checkout/?plan=${encryptedId}&selected=true&first=true`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen">
      <nav className="backdrop-blur-md z-[999] bg-background/50 shadow top-0 fixed w-full">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex w-full h-16 items-center justify-between">
            <a href="/dashboard">
              <img alt="InventoryFlow" src={logo.src} className="w-auto h-4" />
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="mr-1 hidden sm:block">{user?.username}</span>
                  <img
                    src={user?.img ?? userImg.src}
                    alt={user?.name}
                    className="w-auto h-6 mx-auto"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.name} {user?.surname}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={clearStorageAndCookies}>
                    Deconnecter
                    <DropdownMenuShortcut>
                      <LogOut className="w-4 h-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <section className="text-gray-600 body-font animate-in">
        <Pricing page="select_plan" />
      </section>
    </div>
  );
}
