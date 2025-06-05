"use client";
import * as React from "react";
import { Backdrop, CircularProgress, Divider, TextField } from "@mui/material";
import { Switch } from "@/components/ui/switch";
import { usePermission } from "@/context/PermissionContext";
import SlideContainer from "@/components/SlideWrapper/SlideWrapper";
import { parseAsInteger, useQueryState } from "nuqs";
import OTPInput from "@/components/OTPInput";
import { encryptParam } from "@/utils/encryptURL";
import useForm, { Field, initializeFormValues } from "@/utils/useFormHook";
import { useTranslation } from "react-i18next";
import { capitalizeFirstLetter, maskEmail } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { instance } from "@/components/fetch";

export default function Page() {
  const { user } = usePermission();
  const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(0))
  const [page, setPage] = useQueryState('page')
  const [password, setPassword] = useQueryState('gpts')
  const [loading, setLoading] = React.useState(false)
  const { t: tCommon } = useTranslation('common')
  const { t: tWords } = useTranslation('words')
  const [error, setError] = React.useState(null)

  const handleComplete = async (code: string) => {
    try {
      const res = await instance.post(`/confirm-password-change/`, { code }, { withCredentials: true })
      setError(null)
      window.location.assign('/settings/security')
    } catch (error) {
      console.log(error);
      if (error.response.data.error == "invalid_new_password") {
        setStep(0)
      }
      setError(error.response.data.error)
    }
  };

  const fields: Field[] = [
    {
      label: "previous password",
      name: 'old_password',
      type: 'password',
      required: true,
    },
    {
      label: "new password",
      name: 'new_password',
      type: 'password',
      required: true
    },
    {
      label: "confirm password",
      name: 'confirm_password',
      type: 'password',
      required: true
    }
  ]

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
    setFieldValue,
  } = useForm(initializeFormValues(fields));

  const requestOpt = async () => {
    setLoading(true)
    try {
      if (values.new_password != values.confirm_password) {
        setFieldError('new_password', capitalizeFirstLetter(tCommon('password_not_match')))
        return setFieldError('confirm_password', capitalizeFirstLetter(tCommon('password_not_match')))
      }
      const res = await instance.post(`/request-password-change-code/`, values, { withCredentials: true })
      setStep(1)
      setPage('passwordModify')
      setError(null)
    } catch (error: any) {
      setError(error.response.data.error)
    } finally {
      setLoading(false)
    }
  }

  console.log(user)

  return (
    <div className="space-y-5 ">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!user}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h3 className="text-3xl font-semibold text-neutral-900">Sécurité</h3>
      <Divider />
      <SlideContainer currentIndex={step}>
        <div className="space-y-5">
          {error &&
            <span className="bg-red-100 border-red-600 border  rounded p-2 block text-base font-medium text-red-600 text-center">
              {tCommon(`${error}`)}
            </span>
          }
          <form onSubmit={(e) => handleSubmit(e, requestOpt)} autoComplete="off">
            <div className="space-y-4 grid grid-cols-1">
              {fields.map((field, index) => (
                <div className="" key={index.toString()}>
                  <label htmlFor="name" className="font-normal mb-1">{capitalizeFirstLetter(tWords(`${field.label}`))}</label>
                  <TextField
                    type={field.type}
                    id={field.name}
                    required
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    name={field.name}
                    error={
                      !!errors[field.name] &&
                      values[field.name] !== ""
                    }
                    helperText={
                      values[field.name] !== "" && errors[field.name]
                    }
                  />
                </div>
              ))}
              <Button type="submit" className="bg-green-500 hover:bg-green-600 transition" disabled={loading}>
                {!loading ? capitalizeFirstLetter(tWords('modify')) : `${capitalizeFirstLetter(tCommon('please wait'))}...`}
              </Button>
            </div>
          </form>
          <Divider />
          <div className="flex rounded-lg border p-3 shadow-sm">
            <div className="">
              <p className="text-base font-semibold text-neutral-900">
                Demander un code de connexion
              </p>
              <span className="text-muted-foreground text-sm font-normal w-3/4 block">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas
                officia aliquam iste. Culpa minus, aspernatur debitis amet
                praesentium ducimus deleniti dignissimos voluptas quam aut officia
                nesciunt sapiente non ipsum sit.
              </span>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          {error &&
            <span className="bg-red-100 border-red-600 border  rounded p-2 block text-base font-medium w-full text-red-600 text-center">
              {tCommon(`${error}`)}
            </span>
          }
          <div className="space-y-5 max-w-[320px]">
            <h2 className="text-3xl font-semibold text-[#222f3e]">{tCommon('email_verification_text')}</h2>
            <span className="text-muted-foreground text-sm font-normal block">{capitalizeFirstLetter(tCommon('email_verification_subtext', { email: maskEmail(user?.email) }))}</span>
            <OTPInput length={6} onComplete={handleComplete} />
            <div className="flex">
              <p>{capitalizeFirstLetter(tCommon('not_received_code'))}</p>
            </div>
            {/* <Button className="w-full bg-indigo-500 hover:bg-indigo-600" onClick={handleComplete}>
              {capitalizeFirstLetter(tWords('confirm'))}
            </Button> */}
          </div>
        </div>
      </SlideContainer>
    </div>
  );
}
