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

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [inputsValue, setInputsValue] = useState({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordVerify, setPasswordVerify] = useState({});
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);
      setInputsValue(data);
      setPasswordVerify(validatePassword(data.password));
      if (isEmpty) return setLoading(false) ;
      if (!validatePassword(data.password).isValid) {
        return;
      }
      const response = await registerUser({
        ...data,
        user_type: "admin",
        number: phoneNumber?.number,
        country: phoneNumber?.country,
      });
      if (response) {
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
      const code = error.response.data.code;
      setError(userRegErrors[code]);
      clears
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
    setPhoneNumber(newValue);
  }, []);

  return (
    <main className=" items-center justify-center px-4 sm:px-0">
      {error && (
        <h3 className="text-red-500 bg-red-100 p-3  text-center rounded border border-red-500 mb-5">
          {error}
        </h3>
      )}
      <div className="md:px-16 md:py-10 sm:px-10 px-5 py-5 rounded bg-white border relative border-neutral-200">
        {loading && (
          <div className="absolute top-0 left-0 right-0 w-full h-full bg-[rgba(255,255,255,.2 )] z-[999] animate-in">
            <LinearProgress color="primary" />
          </div>
        )}
        <div className="sm:mx-auto flex-col justify-center space-y-4 items-center sm:w-full sm:max-w-sm">
          <img
            alt="InventoryFlow"
            src={logo.src}
            className="w-auto h-6 mx-auto"
          />
          <h2 className="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
            Créez votre compte
          </h2>
          <h2 className="text-center text-sm tracking-tight text-neutral-700">
            Entrez vos informations personnelles puis continuer pour creer votre
            entreprise
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} method="POST" className="space-y-4">
            {inputs.map((input) => {
              if (input.name == "number") {
                return (
                  <>
                    <PhoneNumberField
                      key={phoneNumber?.number} 
                      value={phoneNumber?.number}
                      required={true}
                      onChange={handlePhoneNumberChange}
                    />
                  </>
                );
              }
              if (input.name == "password" || input.name == "confirmPassword") {
                return (
                  <FormControl
                    key={input.name}
                    fullWidth
                    size="small"
                    error={
                      inputsValue[input.name] == "" ||
                      inputsValue["password"] != inputsValue["confirmPassword"]
                    }
                    variant="outlined"
                  >
                    <InputLabel htmlFor="outlined-adornment-password">
                      {input.label}
                    </InputLabel>
                    <OutlinedInput
                      name={input.name}
                      fullWidth
                      onChange={(e) => onChange(e, input.name)}
                      // id="outlined-adornment-password"
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
                      label={input.label}
                    />
                    {inputsValue[input.name] == "" && (
                      <FormHelperText>Veuillez remplir ce champ</FormHelperText>
                    )}
                    {inputsValue["password"] !=
                      inputsValue["confirmPassword"] && (
                        <FormHelperText>
                          Les mot de passes ne correspondent pas
                        </FormHelperText>
                      )}
                    {input.name == "confirmPassword" &&
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
                  </FormControl>
                );
              }
              return (
                <div key={input.label}>
                  <TextField
                    fullWidth
                    name={input.name}
                    error={inputsValue[input.name] == ""}
                    helperText={
                      inputsValue[input.name] == ""
                        ? "Veuillez remplir ce champ"
                        : null
                    }
                    // id="outlined-basic"
                    size="small"
                    label={`${input.label}`}
                    variant="outlined"
                  />
                </div>
              );
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

          <p className="mt-5 text-center text-sm text-gray-500">
            Déjà membre ?{" "}
            <a
              href="signin"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
