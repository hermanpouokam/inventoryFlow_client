/* eslint-disable @next/next/no-img-element */
"use client";
import { TextField, LinearProgress } from "@mui/material";
import { inputs } from "./inputs";
import { FormEvent, useCallback, useLayoutEffect, useState } from "react";
import getFormData from "@/components/functions";
import { getUserData, registerEnterprise } from "@/components/auth";
import { useRouter } from "next/navigation";
import PhoneNumberField from "@/components/CountryPicker";
import logo from "@/assets/img/logo.png";
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
import { Button } from "@/components/ui/button";
import userImg from "@/assets/img/user.png";
import { LogOut } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { clearStorageAndCookies } from "../functions";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { PhoneInput } from "@/components/phoneInput";
import { useTranslation } from "react-i18next";
import CardBodyContent from "@/components/CardContent";
import { Input } from "../page";

export default function CreateEnterprise() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<{
    number: string;
    country: string;
  } | null>(null);
  const { t: tAuth } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");



  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);
      if (isEmpty) return setLoading(false);
      const response = await registerEnterprise({
        ...data,
        phone: phoneNumber?.number,
        country: phoneNumber?.country,
      });

      if (response) {
        window.location.assign("/signup/select_plan/");
      }
    } catch (error) {
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
    } finally {
      // setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const getUser = async () => {
    const res: User = await getUserData();
    setUser(res);
  };
  useLayoutEffect(() => {
    getUser();

    if (from && ["signin", "signup"].includes(from)) {
      setError(
        tAuth("enterprise.already_connected")
      );
    } else if (
      from &&
      ["dashboard", "sell", "buy", "enterprise"].includes(from)
    ) {
      setError(
        tAuth("enterprise.create_required")
      );
    }
  }, []);

  const handlePhoneNumberChange = useCallback((newValue) => {
    setPhoneNumber(newValue);
  }, []);

  return (
    <div className="w-screen">
      <nav className="backdrop-blur-md z-[999] bg-card/50 shadow fixed w-full">
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
              <DropdownMenuContent align="end" className="w-56 z-[99999] bg-card">
                <DropdownMenuLabel>
                  {user?.name} {user?.surname}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={clearStorageAndCookies}>
                    {tAuth("disconnect")}
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
      <main className="flex min-h-screen flex-col items-center justify-center p-10">
        {error && (
          <p className="border max-w-[720px] border-red-500 mb-4 p-3 rounded bg-red-200 text-red-500">
            {error}
          </p>
        )}
        <CardBodyContent className="sm:p-10 mt-10 max-w-md ">

          <div className="slide-in-from-right-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                alt="inventoryflow"
                src={logo.src}
                className="w-auto h-6 mx-auto"
              />
              <h2 className="mt-5 text-center text-xl font-bold leading-9 tracking-tight">
                {tAuth("create_enterprise_title")}
              </h2>
              <h5 className="mt-2 text-center text-sm text-muted-foreground">
                {tAuth("create_enterprise_subtitle")}
              </h5>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={onSubmit} method="POST" className="space-y-3">
                {inputs.map((input) => {
                  if (input.name == "phone") {
                    return (
                      <PhoneInput
                        label={tAuth("phone number")}
                        name="phone"
                        defaultCountry="CM"
                        key={input.name}
                        required
                        hint={tAuth("enterprise.phone_hint")}
                        onChange={(val) => {
                          if (val?.isValid) handlePhoneNumberChange(val)
                        }}
                      />
                    );
                  } else {
                    return (
                      <div key={input.name}>
                        <Input
                          name={input.name}
                          type={"text"}
                          placeholder={tAuth(input.label)}
                          label={tAuth(`enterprise.${input.name}`)}
                          autoComplete={input.name}
                        />
                      </div>
                    );
                  }
                })}

                <div>
                  <Button
                    type="submit"
                    className="flex w-full gap-3"
                    variant={'primary'}
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {!loading ? tCommon("continue") : tCommon('please wait')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardBodyContent>
      </main>
    </div>
  );
}
