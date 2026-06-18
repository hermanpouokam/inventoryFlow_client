'use client'
import { LinearProgress, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import logo from "@/assets/img/logo.png";
import { useTranslation } from 'react-i18next';
import useForm, { Field, initializeFormValues } from '@/utils/useFormHook';
import { capitalizeFirstLetter, generateUUIDv4, maskEmail } from '@/utils/utils';
import { instance } from '@/components/fetch';
import SlideContainer from '@/components/SlideWrapper/SlideWrapper';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import OTPInput from '@/components/OTPInput';
import axios from 'axios';
import API_URL from '@/config';
import { randomUUID } from 'crypto';
import { decryptParam, encryptParam } from '@/utils/encryptURL';
import useTimer from '@/utils/useTimer';
import { Button } from '@/components/ui/button';
import WormsCanvas from '../worm';

export default function Page() {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(0))
    const [email, setEmail] = useQueryState('ueem', parseAsString.withDefault(''))
    const [encode, setEncode] = useQueryState('encode', parseAsString.withDefault(''))
    const { t: tCommon } = useTranslation('common')
    const { t: tWords } = useTranslation('words')
    const { isActive, resetTimer, timeLeft, stopTimer } = useTimer({
        initialTime: 30,
        onTimerEnd: () => { }
    })

    const fields: Field[] = [
        {
            name: "email",
            label: "email",
            required: true,
            type: "email",
            placeholder: capitalizeFirstLetter(tCommon('email_input_placeholder'))
        }
    ];

    const fieldsM: Field[] = [
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

    const {
        values: valuesM,
        errors: errorsM,
        handleChange: handleChangeM,
        resetForm: resetFormM,
        setFieldError: setFieldErrorM,
        handleSubmit: handleSubmitM,
    } = useForm(initializeFormValues(fieldsM));

    const requestCode = async () => {
        setLoading(true)
        try {
            const res = await instance.post(`${API_URL}/request-opt/`, values)
            setError(null)
            setEncode(generateUUIDv4(36))
            setStep(1)
            const encodedEmail = encryptParam(encodeURI(values.email.toString()))
            setEmail(encodedEmail)
            resetTimer()
        } catch (error) {
            setError(error.response.data.error)
        } finally {
            setLoading(false)
        }
    }

    const resendCode = async () => {
        setLoading(true)
        try {
            const res = await instance.post(`${API_URL}/resend-otp/`, { email: decryptParam(email) })
            setError(null)
            setEncode(generateUUIDv4(36))
            resetTimer()
        } catch (error) {
            console.log(error)
            setError(error.response.data.error)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async (code: string) => {
        setLoading(true)
        try {
            const res = await instance.post(`/verify-otp/`, { code }, { withCredentials: true })
            setError(null)
            setStep(2)
        } catch (error) {
            console.log(error);
            setError(error.response.data.error)
        } finally {
            setLoading(false)
        }
    };

    const handleConfirm = async () => {
        setLoading(true)
        if (valuesM.new_password != valuesM.confirm_password) {
            setLoading(false)
            setFieldErrorM('new_password', capitalizeFirstLetter(tCommon('password_not_match')))
            return setFieldErrorM('confirm_password', capitalizeFirstLetter(tCommon('password_not_match')))
        }
        try {
            const res = await instance.post(`/reset-password/`, { password: valuesM.confirm_password, email: decryptParam(email) }, { withCredentials: true })
            window.location.assign('/signin?from=forgot-pasword&password_reset=true&new_connection=true')
        } catch (error) {
            console.log(error)
            setError(error.response.data.details || error.response.data.error)
            setLoading(false)
        }
    }

    const Header = () => {
        return (<div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
                alt="InventoryFlow"
                src={logo.src}
                className="w-auto h-6 mx-auto"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
                {tCommon('forgot_password_text')}
            </h2>
            <h2 className="text-center mt-2  text-sm tracking-tight  text-muted-foreground">
                {tCommon('forgot_password_sub_text')}
            </h2>
        </div>)
    }
    useEffect(() => {
        document.title = tCommon('recover_password_page_title')
        stopTimer()
    }, [])

    useEffect(() => {
        if (email && !decryptParam(email)) {
            window.location.assign('/forgot-password')
        }
        console.log(decryptParam(email))
    }, [email])


    return (
        <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <WormsCanvas />

            <div className="relative w-full max-w-md z-10">
                <div className="sm:p-5 rounded-2xl backdrop-blur-sm bg-card/20 dark:bg-card/10 shadow-[1px_2px_38px_5px_rgba(0,0,0,0.20)] dark:shadow-[1px_2px_38px_5px_rgba(0,0,0,0.4)] border border-white/10">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-center text-red-400">{tCommon(error)}</p>
                        </div>
                    )}
                    <SlideContainer className='max-w-[320px] sm:max-w-[385px]' currentIndex={step}>
                        <div className="space-y-5">
                            <Header />
                            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                                <form onSubmit={(e) => handleSubmit(e, requestCode)} method="POST" className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div className="" key={index.toString()}>
                                            <div>
                                                <label htmlFor="username" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                                    {capitalizeFirstLetter(tWords(`${field.label}`))}
                                                </label>
                                                <input
                                                    id={field.name}
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    name={field.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="
                                                        w-full px-4 py-3 text-sm rounded-xl

                                                        bg-neutral-500/5 dark:bg-white/5
                                                        border border-white/10 dark:border-white/10

                                                        text-black dark:text-white
                                                        placeholder-neutral-400

                                                        focus:outline-none
                                                        focus:ring-2 focus:ring-indigo-500/40
                                                        focus:border-indigo-500

                                                        transition-all duration-200

                                                        [:-webkit-autofill]:bg-transparent
                                                        [:-webkit-autofill]:text-black
                                                        dark:[:-webkit-autofill]:text-white
                                                        [:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                                                        dark:[:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                                                    "
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className='mt-10'>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            variant={'primary'}
                                            className='w-full'
                                        >
                                            {capitalizeFirstLetter(tWords('submit'))}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="">
                            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                                <img
                                    alt="InventoryFlow"
                                    src={logo.src}
                                    className="w-auto h-6 mx-auto"
                                />
                            </div>
                            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                                <div className="space-y-5">
                                    <h2 className="text-3xl font-semibold text-[#222f3e] text-center">{tCommon('email_verification_text')}</h2>
                                    <span className="text-muted-foreground text-sm font-normal block text-center">{capitalizeFirstLetter(tCommon('email_verification_subtext', { email: maskEmail(decryptParam(email) || '') }))}</span>
                                    <OTPInput length={6} onComplete={handleComplete} />
                                    <div className="flex items-center justify-start flex-wrap gap-0">
                                        <p className='text-sm'>{capitalizeFirstLetter(tCommon('not_received_code'))}</p>
                                        <Button variant={'link'} className='text-sm text-indigo-500' onClick={resendCode} disabled={isActive}>{tCommon('ask_opt_code_text')}</Button>
                                        {isActive ? <p className='text-sm'>{timeLeft}</p> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                                <img
                                    alt="InventoryFlow"
                                    src={logo.src}
                                    className="w-auto h-6 mx-auto"
                                />
                            </div>
                            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                                <div className="space-y-5">
                                    <h2 className="text-3xl font-semibold text-primary text-center">{tCommon('new_password_text')}</h2>
                                    <span className="text-muted-foreground text-sm font-normal block text-center">{capitalizeFirstLetter(tCommon('new_password_sub_text', { email: maskEmail(email) }))}</span>
                                    <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                                        <form onSubmit={(e) => handleSubmitM(e, handleConfirm)} method="POST" className="space-y-4">
                                            {fieldsM.map((field, index) => (
                                                <div className="" key={index.toString()}>
                                                    <TextField
                                                        type={field.type}
                                                        id={field.name}
                                                        required
                                                        fullWidth
                                                        size="small"
                                                        onChange={handleChangeM}
                                                        name={field.name}
                                                        label={capitalizeFirstLetter(tWords(`${field.label}`))}
                                                        error={
                                                            !!errorsM[field.name] &&
                                                            valuesM[field.name] !== ""
                                                        }
                                                        helperText={
                                                            valuesM[field.name] !== "" && errorsM[field.name]
                                                        }
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                            <div>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    {capitalizeFirstLetter(tWords('submit'))}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SlideContainer>
                </div>
            </div>
        </main>
    )
}
