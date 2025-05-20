"use client";
import { getUserData } from "@/components/auth";
import { Backdrop, CircularProgress, Divider, TextField } from "@mui/material";
import React, { FormEvent, useCallback, useState } from "react";
import { useSettingsData } from "./context/settingsData";
import { Button } from "@/components/ui/button";
import getFormData from "@/components/functions";
import { Check, CheckCircle } from "lucide-react";
import PhoneNumberField from "@/components/CountryPicker";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import { cn } from "@/lib/utils";
import userProfile from "@/assets/img/user.png";
import { usePermission } from "@/context/PermissionContext";

export default function Page() {
  const { user } = usePermission()
  const [phoneNumber, setPhoneNumber] = useState<{
    number: string | undefined;
    country: string | undefined;
  } | null>({
    number: user?.number,
    country: user?.country,
  });


  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // setLoading(true);
      const { data, isEmpty } = getFormData(e.currentTarget);

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePhoneNumberChange = useCallback((newValue: any) => {
    console.log("ParentComponent received new value:", newValue);
    setPhoneNumber(newValue);
  }, []);

  const handleChangeEmail = () => { };

  const fields = [
    {
      name: "name",
      label: "Nom",
      defaultValue: user?.name,
      required: true,
      type: "text",
    },
    {
      name: "surnname",
      defaultValue: user?.surname,
      required: true,
      label: "Prénom",
      type: "text",
    },
    {
      name: "username",
      defaultValue: user?.username,
      required: true,
      label: "Nom d'utilisateur",
      type: "text",
    },
  ];

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldError,
    resetForm,
    setFieldValue,
  } = useForm(initializeFormValues(fields));

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!user}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="space-y-5"></div>
      <h3 className="text-3xl font-semibold text-neutral-900">Compte</h3>
      <div className="">
        <h6 className="text-base text-muted-foreground font-medium">
          Photo de profile
        </h6>
        <img
          src={user?.img ?? userProfile.src}
          alt="user profile"
          className="w-24 h-24"
        />
        <Button variant={"default"}>Changer de photo</Button>
        <Button disabled={!user?.img} variant={"destructive"}>
          {" "}
          Supprimer la photo
        </Button>
      </div>

      <div className="grid grid-cols-2 items-center gap-1.5">
        {/* {fields.map((field) => {
            return (
              <div className={cn(field.name == "username" && "col-span-2")}>
                <label htmlFor={field.name}>{field.label}</label>
                <TextField
                  type={field.type}
                  id={field.name}
                  value={values[field.name]}
                  required
                  error={!!errors[field.name]}
                  helperText={errors[field.name] && errors[field.name]}
                  fullWidth
                  size="small"
                  onChange={(e) => handleChange(e)}
                  name={field.name}
                  placeholder={`Entrez votre ${field.label}`}
                />
              </div>
            );
          })} */}
        <div className="">
          <label htmlFor="name">Nom</label>
          <TextField
            type="text"
            id="name"
            defaultValue={user?.name}
            required
            fullWidth
            size="small"
            name="name"
            placeholder="Entrez votre nom"
          />
        </div>
        <div className="">
          <label htmlFor="surname">Prénom</label>
          <TextField
            type="text"
            defaultValue={user?.surname}
            id="surname"
            required
            name="surname"
            fullWidth
            size="small"
            placeholder="Entrez votre prénom"
          />
        </div>
      </div>
      <div className="">
        <label htmlFor="username">Nom d&apos;utilisateur</label>
        <TextField
          type="text"
          id="username"
          name="username"
          required
          defaultValue={user?.username}
          fullWidth
          size="small"
          placeholder="Entrez votre prénom"
        />
      </div>
      <div>
        <label htmlFor="name" className="mt-3">Email</label>
        <div className="flex items-center">
          <TextField
            type="email"
            id="name"
            disabled={user?.user_configurations_details.email_verified}
            defaultValue={user?.email}
            required
            fullWidth
            size="small"
            name="email"
            className="flex-1"
            placeholder="Entrez votre nom"
          />
          <div className="text-green-700 gap-2 flex items-center px-4 text-base font-semibold">
            <CheckCircle className="h-4 w-4" /> Verifié
          </div>
        </div>
      </div>
      <div className=" flex items-center justify-start">
        <p className="text-muted-foreground font-medium">Numero de téléphone</p>
        <p className="text-base font-medium">{user?.number}</p>
        <Button variant={"link"} className="text-blue-600 hover:text-blue-700">
          Modifier
        </Button>
        {/* <PhoneNumberField
          key={phoneNumber?.number}
          value={phoneNumber?.number}
          onChange={handlePhoneNumberChange}
        /> */}
      </div>
      <form autoComplete="off" onSubmit={onSubmit} className="w-full space-y-4">
        <Button
          variant={"default"}
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  );
}
