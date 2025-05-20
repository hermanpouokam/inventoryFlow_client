/* eslint-disable @next/next/no-img-element */
"use client";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  OutlinedInput,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { FormEvent, useState } from "react";
import getFormData from "@/components/functions";
import { login } from "@/components/auth";
import { setCookie } from "nookies";
import { LONG_LIFE_DURATION, userErrors } from "@/utils/constants";
import { useRouter } from "next/navigation";
import logo from "@/assets/img/logo.png";
import CircuitBackground from '@/components/CircuitBackground'
export default function Signin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [inputsValue, setInputsValue] = useState();
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const [error, setError] = useState(null);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);
      setInputsValue(data);
      if (isEmpty) return;
      const response = await login({ ...data });
      if (response.status) {
        
      }
      const { access, refresh } = response.data;
      setCookie(null, "access_token", response.data.access, {
        maxAge: LONG_LIFE_DURATION,
        path: "/",
        secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
      });
      setCookie(null, "refresh_token", response.data..refresh, {
        maxAge: LONG_LIFE_DURATION,
        path: "/",
        secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
        sameSite: "strict",
      });
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("next");

      if (response) {
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (error) {
      const code = error.response.data.code;
      setError(userErrors[code]);
      setLoading(false);
    } finally {
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-stone-100 overflow-hidden">
      <CircuitBackground />
      <main className="flex flex-col items-center min-h-screen justify-center p-5">
        <div className="sm:p-16 p-5 rounded relative bg-white border border-neutral-200">
          {loading && (
            <div className="absolute top-0 left-0 right-0 w-full  h-full bg-[rgba(255,255,255,.2 )] z-[999] animate-in">
              <LinearProgress color="primary" />
            </div>
          )}
          {error && (
            <h3 className="text-red-500 bg-red-100  text-center font-medium p-3 rounded border border-red-500 mb-5">
              {error}
            </h3>
          )}
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="InventoryFlow"
              src={logo.src}
              className="w-auto h-6 mx-auto"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Connectez vous à votre compte
            </h2>
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={onSubmit} method="POST" className="space-y-4">
              <div>
                <div className="mt-2">
                  <TextField
                    name="username"
                    fullWidth
                    id="outlined-basic"
                    size="small"
                    label="Nom d'utilisateur"
                    variant="outlined"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  ></label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    name="password"
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                </FormControl>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Se connecter
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Pas encore membre ?{" "}
              <a
                href="signup"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Commencez un essai de 30 jours
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
