/* eslint-disable @next/next/no-img-element */
"use client";
import React, { FormEvent, useState } from "react";
import getFormData from "@/components/functions";
import { login } from "@/components/auth";
import { setCookie } from "nookies";
import { LONG_LIFE_DURATION, userErrors } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { clearStorageAndCookies } from "../signup/functions";
import { useTranslation } from "react-i18next";
import WormsCanvas from "../worm";
import Image from "next/image";
import logo from "@/assets/img/logo.png";

export default function Signin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const { t: tCommon } = useTranslation('common')
  const [error, setError] = useState(null);

  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearStorageAndCookies('/signin')
    try {
      setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);
      if (isEmpty) return setLoading(false);
      const response = await login({ ...data as any });
      if (response) {
        const { access, refresh } = response;
        setCookie(null, "access_token", response.access, {
          maxAge: LONG_LIFE_DURATION,
          path: "/",
          secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
        });
        setCookie(null, "refresh_token", response.refresh, {
          maxAge: LONG_LIFE_DURATION,
          path: "/",
          secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
          sameSite: "strict",
        });
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("next");

        if (response) {
          setError(null)
          if (redirect) {
          window.location.replace(redirect);
          } else {
          window.location.replace("/dashboard");
          }
        }
      } else {

      }
    } catch (error: any) {
      const code = error.response.data.code as keyof typeof userErrors;
      setError(userErrors[code] as any);
      setLoading(false);
    } finally {
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <WormsCanvas />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-10">
          <a href="/">
            <div className="inline-flex items-center justify-center  rounded-2xl mb-4  ">
              <Image src={logo.src} alt="Logo Interact" width={150} height={32} />
            </div>
          </a>
          <h1 className="text-2xl font-semibold tracking-tight">{tCommon("auth_signin.welcome")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{tCommon("auth_signin.subtitle")}</p>
        </div>

        <div className="rounded-2xl p-8 backdrop-blur-sm bg-card/20 dark:bg-card/60 shadow-[1px_2px_38px_5px_rgba(0,0,0,0.20)] dark:shadow-[1px_2px_38px_5px_rgba(0,0,0,0.4)] border border-white/10" >
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-center text-red-400">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {tCommon('username')}
              </label>
              <input
                id="username"
                type="text"
                placeholder="johndoe"
                name="username"
                required
                className="
                  w-full px-4 py-3 text-sm rounded-xl
                  bg-neutral-500/5 dark:bg-white/5
                  border border-zinc-500/10 dark:border-white/10

                  text-black dark:text-white
                  placeholder-zinc-500

                  focus:outline-none
                  focus:ring-2 focus:ring-indigo-500/40
                  focus:border-transparent

                  transition-all duration-200
                "
              />

            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon("auth.password")}
                </label>
                <a href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">{tCommon("auth_signin.forgot_password")}</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  name="password"
                  placeholder="•••••••••••"
                  required
                  className=" w-full px-4 py-3 text-sm rounded-xl
                    bg-neutral-500/5 dark:bg-white/5
                    border border-zinc-500/10 dark:border-white/10

                    text-black dark:text-white
                    placeholder-zinc-500

                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500/40
                    focus:border-transparent

                    transition-all duration-200
                  "
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
            </div>



            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tCommon("auth_signin.loading")}
                </>
              ) : tCommon("auth_signin.submit")}
            </button>
          </form>
          <p className="text-center text-sm text-zinc-500 my-5">
            {tCommon("auth_signin.no_account")} {" "}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">{tCommon("auth_signin.create_account")}</a>
          </p>
        </div>
        <div className="flex items-center gap-5">
          <p className="text-center text-[0.775rem] text-zinc-500 mt-6">
            <a href="https://www.interact.com" target="_blank" className="text-muted-foreground font-medium uppercase hover:underline">© {new Date().getFullYear()} Interact inc</a>
          </p>
          <p className="text-center text-[0.775rem] text-zinc-500 mt-6">
            <a href="/terms" className="text-muted-foreground font-medium uppercase hover:underline">{tCommon("auth.terms_privacy")}</a>
          </p>
        </div>

      </div>
    </main>
  );
}
