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

export default function CreateEnterprise() {
  const [loading, setLoading] = useState(false);
  const [inputsValue, setInputsValue] = useState({});
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<{
    number: string;
    country: string;
  } | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);
      setInputsValue(data);
      if (isEmpty) return setLoading(false);
      const response = await registerEnterprise({
        ...data,
        plan_id: 1,
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
        "Vous etes déjà connecté(e). Entrez les informations de votre entreprise et continuer. "
      );
    } else if (
      from &&
      ["dashboard", "sell", "buy", "enterprise"].includes(from)
    ) {
      setError(
        "Veuillez créer votre entreprise pour accéder à votre tableau de bord. "
      );
    }
  }, []);

  const handlePhoneNumberChange = useCallback((newValue) => {
    setPhoneNumber(newValue);
  }, []);

  return (
    <div className="w-screen">
      <nav className="backdrop-blur-md z-[999] bg-white/30 shadow fixed w-full">
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
      <main className="flex min-h-screen flex-col items-center justify-center p-10">
        {error && (
          <p className="border max-w-[720px] border-red-500 mb-4 p-3 rounded bg-red-200 text-red-500">
            {error}
          </p>
        )}
        <div className="sm:p-12 sm:min-w-[30%] px-5 py-3 rounded relative bg-white border border-neutral-200">
          {loading && (
            <div className="absolute top-0 left-0 right-0 w-full h-full bg-[rgba(255,255,255,.2 )] z-[999] animate-in">
              <LinearProgress color="primary" />
            </div>
          )}
          <div className="slide-in-from-right-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                alt="inventoryflow"
                src={logo.src}
                className="w-auto h-6 mx-auto"
              />
              <h2 className="mt-5 text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                Créez votre entreprise
              </h2>
              <h5 className="mt-2 text-center text-sm text-neutral-500">
                Entrez les informations de votre entreprise
              </h5>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={onSubmit} method="POST" className="space-y-6">
                {inputs.map((input) => {
                  if (input.name == "phone") {
                    return (
                      <PhoneNumberField
                        key={phoneNumber?.number}
                        value={phoneNumber?.number}
                        onChange={handlePhoneNumberChange}
                      />
                    );
                  } else {
                    return (
                      <div key={input.label}>
                        <TextField
                          fullWidth
                          name={input.name}
                          id="outlined-basic"
                          size="small"
                          label={`${input.label} de l'entreprise`}
                          variant="outlined"
                          helperText={
                            input.name === "phone"
                              ? "Le pays correspondant a l'entreprise sera assigné à celui de l'entreprise."
                              : ""
                          }
                        />
                      </div>
                    );
                  }
                })}

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Continuer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
