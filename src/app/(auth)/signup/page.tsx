/* eslint-disable @next/next/no-img-element */
"use client";
import TextField from "@mui/material/TextField";
import { inputs, passwordTest } from "./inputs";
import React, { FormEvent, useCallback, useState } from "react";
import getFormData, { validatePassword } from "@/components/functions";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { registerUser } from "@/components/auth";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { LONG_LIFE_DURATION, userRegErrors } from "@/utils/constants";
import logo from "@/assets/img/logo.png";
import PhoneNumberField from "@/components/CountryPicker";
import { clearStorageAndCookies } from "./functions";
import { PhoneInput } from "@/components/phoneInput";
import { useTranslation } from "react-i18next";
import WormsCanvas from "../worm";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Input({ label, error, className, ...props }: { label?: string; error?: boolean; className?: any, props: React.InputHTMLAttributes<HTMLInputElement> }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}

      <input
        {...props}
        className={cn(`
          w-full px-4 py-3 text-sm rounded-xl
          bg-neutral-500/5 dark:bg-white/5
          border border-zinc-500/10 dark:border-white/10

          text-black dark:text-white
          placeholder-zinc-500

          focus:outline-none
          focus:ring-2 focus:ring-indigo-500/40
          focus:border-transparent

          transition-all duration-200

          ${error ? "border-red-500/50 ring-red-500/20" : ""}
        `)}
      />
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [inputsValue, setInputsValue] = useState({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordVerify, setPasswordVerify] = useState({});
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [userSignedIn, setUserSignedIn] = useState(false)
  const { t: tAuth } = useTranslation("auth")
  const { t: tCommon } = useTranslation("common")

  const onSubmit = async (e: FormEvent<HTMLFormElement>, attempt: number = 0) => {
    e.preventDefault();
    clearStorageAndCookies('/signup')
    if (attempt > 1) {
      return setError(tAuth("signup.create_failed"));
    }

    try {
      const form = e.currentTarget;

      setLoading(true);
      const { data, isEmpty } = getFormData(form);
      setInputsValue(data);
      setPasswordVerify(validatePassword(data.password));

      if (isEmpty) {
        return setLoading(false);
      }

      if (!validatePassword(data.password).isValid) {
        return setLoading(false);
      }

      const obj = {
        ...data,
        user_type: "admin",
        number: phoneNumber?.number,
        country: phoneNumber?.country,
      }

      const response = await registerUser(obj);

      if (response) {
        setUserSignedIn(true);
        setCookie(null, "access_token", response.access, {
          maxAge: LONG_LIFE_DURATION,
          path: "/",
        });
        setCookie(null, "refresh_token", response.refresh, {
          maxAge: LONG_LIFE_DURATION,
          path: "/",
        });
        router.replace(`/signup/create_enterprise`);
      }

    } catch (error) {
      const code = error?.response?.data?.code;
      setError(tCommon(userRegErrors[code] ?? "auth_signup.errors.default"));
      if (code === 'user_not_found') {
        console.log(tAuth("signup.retrying_creation"));
        clearStorageAndCookies('/signup');

        const fakeSubmitEvent = {
          ...e,
          currentTarget: e.currentTarget,
          preventDefault: () => { },
        };

        return onSubmit(fakeSubmitEvent as FormEvent<HTMLFormElement>, attempt + 1);
      }
    } finally {
      setLoading(false);
    }
  };


  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    if (name == "password") {
      setPasswordVerify(validatePassword(e.target.value));
    }
  };

  const [phoneNumber, setPhoneNumber] = useState<{
    number: string;
    country: string;
  } | null>(null);

  const handlePhoneNumberChange = useCallback((newValue) => {
    setPhoneNumber({
      number: newValue.nationalNumber,
      country: newValue.country,
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-2">
      <WormsCanvas />

      <div className="relative w-full max-w-md z-10 space-y-5">
        <div className="text-center mb-3">
          <a href="">
            <div className="inline-flex items-center justify-center  rounded-2xl mb-4">
              <Image src={logo.src} alt={tCommon("settings_config.logo")} width={150} height={32} />
            </div>
          </a>
          <p className="text-xl font-semibold tracking-tight">
            {tAuth("create your account")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {tAuth("fill in the fields to create your account")}
          </p>
        </div>


        <div className="rounded-2xl p-8 backdrop-blur-sm bg-card/20 dark:bg-card/50 shadow-[1px_2px_30px_8px_rgba(0,0,0,0.20)] dark:shadow-[1px_2px_38px_5px_rgba(0,0,0,0.4)] border border-border/50">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-2">
            <form onSubmit={onSubmit} method="POST" className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-center text-red-400">{error}</p>
                </div>
              )}
              {inputs.map((input) => {
                if (input.name == "number") {
                  return (
                    <div key={input.name}>
                      <PhoneInput
                        label={tAuth("phone number")}
                        name="number"
                        defaultCountry="CM"
                        required
                        onChange={(val) => {
                          if (val?.isValid) handlePhoneNumberChange(val)
                        }}
                      />
                    </div>
                  );
                }
                if (input.name == "password") {
                  return (
                    <>
                      <div className="relative w-full">
                        <Input
                          name={input.name}
                          type={showPassword ? "text" : "password"}
                          placeholder={showPassword ? "@48awEB3$1" : "••••••••"}
                          label={tAuth(input.label)}
                          error={inputsValue[input.name] === ""}
                          autoComplete="current-password"
                          onChange={(e) => onChange(e, input.name)}

                        />

                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/8 text-zinc-500 hover:text-zinc-300 transition-colors"
                          aria-label={showPassword ? tCommon("auth.password_hide") : tCommon("auth.password_show")}>
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {input.name == "password" &&
                        inputsValue["password"]?.length > 0 &&
                        !passwordVerify.isValid && (
                          <ul className="list-disc">
                            {Object.keys(passwordVerify).map((key) => {
                              if (key != "isValid") {
                                return (
                                  <li
                                    className={`${passwordVerify[key]
                                      ? "text-green-700"
                                      : "text-red-600"
                                      } text-xs ml-3 mt-1 list-item`}
                                    key={key}
                                  >
                                    {passwordTest[key]}
                                  </li>
                                );
                              }
                            })}
                          </ul>
                        )}
                    </>
                  );
                }
                return (
                  <div key={input.name}>
                    <Input
                      name={input.name}
                      type={input.name === "password" ? (showPassword ? "text" : "password") : "text"}
                      placeholder={tAuth(input.label)}
                      label={tAuth(input.label)}
                      error={inputsValue[input.name] === ""}
                      autoComplete={input.name}
                    />

                    {inputsValue[input.name] === "" && (
                      <p className="text-xs text-red-500 mt-1">
                        {tAuth("please fill this field")}
                      </p>
                    )}
                  </div>
                );
              })}

              <div>
                <Button
                  type="submit"
                  disabled={loading || userSignedIn}
                  className="flex gap-2 w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {
                    userSignedIn || loading ?
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      : null
                  }
                  {
                    userSignedIn ?
                      `${tCommon('redirecting')}` :
                      loading ? tCommon("creating account") : tCommon("continue")
                  }

                </Button>
              </div>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              {tAuth("already have an account ?")}{" "}
              <a
                href="signin"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                {tAuth("signin")}
              </a>
            </p>
          </div>
        </div>
        {/* <div className="flex items-center gap-5">
          <p className="text-center text-[0.775rem] text-zinc-500 ">
            <a href="https://www.interact.com" className="text-muted-foreground font-medium uppercase hover:underline">© {new Date().getFullYear()} Interact inc</a>
          </p>
          <p className="text-center text-[0.775rem] text-zinc-500 ">
            <a href="/terms" className="text-muted-foreground font-medium uppercase hover:underline">{tCommon("auth.terms_privacy")}</a>
          </p>
        </div> */}
      </div>
    </main>
  );
}
