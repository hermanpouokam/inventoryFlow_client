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
import { plansData, plansDataTranslate } from "@/utils/constants";
import { encryptParam } from "@/utils/encryptURL";
import { clearStorageAndCookies } from "../functions";
import { tiers } from "@/app/page";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const getUser = async () => {
    const res: User = await getUserData();
    setUser(res);
    console.log(res);
  };

  const fetchPlans = async () => {
    const res = await getPlans();
    setPlans(res);
  };

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

  if (plans.length < 1) {
    return (
      <div className="w-screen">
        <nav className="backdrop-blur-md z-[999] bg-white/30 shadow top-0 fixed w-full">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="flex w-full h-16 items-center justify-between">
              <a href="/dashboard">
                <img
                  alt="InventoryFlow"
                  src={logo.src}
                  className="w-auto h-4"
                />
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <span className="mr-1 hidden sm:block">
                      {user?.username}
                    </span>
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
                    <DropdownMenuItem>
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
        <div className="container flex justify-center items-center">
          <div
            style={{ borderTopColor: "transparent" }}
            className="w-10 h-10 border-4 border-indigo-500 border-solid rounded-full animate-spin"
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen">
      <nav className="backdrop-blur-md z-[999] bg-white/30 shadow top-0 fixed w-full">
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
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
              Selectionnez un plan
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-gray-500">
              Vous avez la possiblite de tester avec le plan gratuit pendant 30
              jours pour cela selectionnez le.
            </p>
            <div className="flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6">
              <button className="py-1 px-4 focus:outline-none">Mensuel</button>
              <button className="py-1 px-4 bg-indigo-500 text-white focus:outline-none">
                Annuel
              </button>
            </div>
          </div>
          <div className="flex flex-wrap -m-4">
            {plans.map((plan, i) => {
              const tier = tiers.find(
                (tier) => tier.id.toLowerCase() == plan.name.toLowerCase()
              );
              return (
                <div className="p-4 xl:w-1/4 md:w-1/2 w-full">
                  <div
                    className={cn(
                      "h-full p-6 rounded-lg border-2  flex flex-col relative overflow-hidden",
                      i == 2 && "border-indigo-500"
                    )}
                  >
                    {i == 2 && (
                      <span className="bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
                        POPULAR
                      </span>
                    )}
                    <h2 className="text-sm tracking-widest capitalize title-font mb-1 font-medium">
                      {plan.name}
                    </h2>
                    {Number(plan.price) > 0 ? (
                      <h1 className="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200">
                        <span className="text-lg ml-1 font-normal text-gray-500">
                          {formatteCurrency(plan.price, "XAF", "fr-FR")}/mo
                        </span>
                      </h1>
                    ) : (
                      <h1 className="text-3xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none">
                        Gratuit
                      </h1>
                    )}
                    {tier?.features.map((feature, index) => (
                      <p className="flex items-center text-gray-600 mb-2">
                        <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-green-400 text-white rounded-full flex-shrink-0">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </span>
                        {feature}
                      </p>
                    ))}

                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded"
                    >
                      Selectionner
                      <svg
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        className="w-4 h-4 ml-auto"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <p className="text-xs text-muted-foreground font-medium mt-3">
                      {tier?.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
