"use client";
import { Backdrop, CircularProgress, TextField } from "@mui/material";
import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import getFormData from "@/components/functions";
import { Check, CheckCircle, X } from "lucide-react";
import PhoneNumberField from "@/components/CountryPicker";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import { usePermission } from "@/context/PermissionContext";
import { instance } from "@/components/fetch";
import { useToast } from "@/components/ui/use-toast";
import useDebounce from "@/utils/useDebounce";
import { useTranslation } from "react-i18next";
import Profile from "./Profile";

export default function Page() {
  const { user } = usePermission()
  const [phoneNumber, setPhoneNumber] = useState<{
    number: string | undefined;
    country: string | undefined;
  } | null>({
    number: user?.number,
    country: user?.country,
  });
  const { toast } = useToast()
  const [sendingEmail, setSendingEmail] = useState(false)
  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameExists, setUsernameExists] = useState(false);
  const debouncedUsername = useDebounce(username, 500);
  const { t: tCommon } = useTranslation('common')
  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameExists(false);
      return;
    }

    instance.get('/user/check-exists/', { params: { username: debouncedUsername } })
      .then(response => {
        setUsernameExists(response.data.username_exists);
      })
      .catch(() => {
        setUsernameExists(false);
      });
  }, [debouncedUsername]);

  const sendVerifyEmail = async () => {
    setSendingEmail(true)
    try {
      const res = await instance.post(`/send-verification-email/`, { email: user?.email }, { withCredentials: true })
      if (res.statusText === 'ok') {
        toast({
          title: "Succès",
          description: `Email envoyé avec succès. S'il n'est pas présent dans la boite de reception, recherchez dans les spams.`,
          variant: "success",
          className: "bg-green-600 border-green-600 text-white",
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Une erreur est survenue. Vérifiez votre connexion et réessayez.`,
        variant: "success",
        className: "bg-red-600 border-red-600 text-white",
        icon: <Check className="mr-2" />,
      });
    } finally {
      setSendingEmail(false)
    }
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, isEmpty } = getFormData(e.currentTarget);
      if (isEmpty) {
        return
      }
      if (user && Object.keys(data).every(key => user[key] === data[key])) {
        return
      }
      const res = await instance.put(`/user/update-info/`, data, { withCredentials: true })
      if (res.status == 200) {
        toast({
          title: "Succès",
          description: tCommon(`user_update_success`),
          variant: "success",
          className: "bg-green-600 border-green-600 text-white",
          icon: <Check className="mr-2" />,
        });
        window.location.reload()
      }
    } catch (error) {
      console.log('error', error.response.data.username);
      toast({
        title: "Erreur",
        description: error.response.data.username ? tCommon(`error_username_exist`) : tCommon(`unknown_error`),
          className: "bg-red-600 border-red-600 text-white",
        variant: 'destructive',
        icon: <X className="mr-2" />,

      })
    }
  };

  const handlePhoneNumberChange = useCallback((newValue: any) => {
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
    <div className="">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!user}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="divide-y [&>*]:py-5 divide-gray-300">
        <h3 className="text-3xl font-semibold text-neutral-900">Compte</h3>
        <Profile />
        <form autoComplete="off" onSubmit={onSubmit} >
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center gap-1.5 ">
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
            <div className="sm:col-span-1 md:col-span-2">
              <label htmlFor="username">Nom d&apos;utilisateur</label>
              <TextField
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                // defaultValue={user?.username}
                fullWidth
                size="small"
                placeholder="Entrez votre prénom"
              />
              {user?.username != username ? usernameExists ? (
                <p className="text-red-400 text-sm font-medium mt-1">{tCommon(`error_username_exist`).split('.')[0]}</p>
              ) : null : null}
            </div>
          </div>
          <div className="w-full mt-4 border-none">
            <Button
              variant={"default"}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
        <div>
          <label htmlFor="name" className="mt-3">Email</label>
          <div className="flex items-start gap-2">
            <TextField
              type="email"
              id="name"
              disabled={user?.user_configurations_details?.email_verified}
              defaultValue={user?.email}
              required
              fullWidth
              size="small"
              name="email"
              className="flex-1"
              placeholder="Entrez votre nom"
              helperText="Une fois votre e-email verifié vous ne pouvez plus modifier"
            />
            {user?.user_configurations_details?.email_verified ?
              <div className="text-green-700 gap-2 flex items-center px-4 text-base font-semibold">
                <CheckCircle className="h-4 w-4" /> Verifié
              </div>
              :
              <Button onClick={sendVerifyEmail} disabled={sendingEmail} className="bg-indigo-500 hover:bg-indigo-600">
                {sendingEmail ?
                  "Envoie du lien..." : "Envoyer le lien"
                }

              </Button>
            }
          </div>
        </div>

        <div className="space-y-3">
          <div className=" flex items-center justify-start">
            <p className="text-muted-foreground font-medium">Numero de téléphone</p>
            <Button variant={"link"} className="text-blue-600 hover:text-blue-700">
              Modifier
            </Button>
          </div>
          <PhoneNumberField
            key={phoneNumber?.number}
            value={phoneNumber?.number}
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>
    </div>
  );
}
