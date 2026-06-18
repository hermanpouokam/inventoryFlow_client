"use client"

import { useState, useMemo, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import {
    parsePhoneNumberFromString,
    AsYouType,
    CountryCode,
    getExampleNumber,
    getCountryCallingCode,
    isSupportedCountry,
} from "libphonenumber-js"
import examples from "libphonenumber-js/examples.mobile.json"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { COUNTRY_NAMES } from "@/utils/countries"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import ReactCountryFlag from "react-country-flag"

type Country = {
    code: CountryCode
    name: string
    flag: string
    dialCode: string
}

function getFlagEmoji(countryCode: string): string {
    const codePoints = [...countryCode.toUpperCase()].map(
        (c) => 0x1f1e6 + c.charCodeAt(0) - 65
    )
    return String.fromCodePoint(...codePoints)
}

const ALL_COUNTRIES: Country[] = Object.entries(COUNTRY_NAMES)
    .filter(([code]) => isSupportedCountry(code))
    .map(([code, name]) => {
        let dialCode = ""
        try { dialCode = `+${getCountryCallingCode(code as CountryCode)}` } catch { }
        return { code: code as CountryCode, name, flag: getFlagEmoji(code), dialCode }
    })
    .filter((c) => c.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))


export type PhoneValue = {
    country: CountryCode
    dialCode: string
    nationalNumber: string
    internationalNumber: string
    isValid: boolean
    isPossible: boolean
    formatNational: string
    formatInternational: string
}

export type PhoneInputProps = {
    value?: string
    defaultCountry?: CountryCode
    onChange?: (value: PhoneValue | null) => void
    onBlur?: () => void
    disabled?: boolean
    error?: string
    label?: string
    hint?: string
    required?: boolean
    name?: string
    id?: string
    className?: string
    placeholder?: string
    autoFocus?: boolean
    // Quand fourni, le dropdown n'affiche QUE ces codes pays
    choosedCountry?: string[]
}


function getPlaceholder(countryCode: CountryCode): string {
    try {
        const example = getExampleNumber(countryCode, examples)
        return example ? example.formatNational() : ""
    } catch {
        return ""
    }
}

function getMaxNationalLength(countryCode: CountryCode): number {
    try {
        const example = getExampleNumber(countryCode, examples)
        if (example) return example.nationalNumber.length
    } catch { }
    return 15
}

function formatAsYouType(value: string, countryCode: CountryCode): string {
    if (!value) return ""
    const formatter = new AsYouType(countryCode)
    return formatter.input(value)
}

function parseValue(nationalNumber: string, country: Country): PhoneValue | null {
    if (!nationalNumber) return null
    const raw = nationalNumber.replace(/\D/g, "")
    if (!raw) return null
    const full = `${country.dialCode}${raw}`
    const parsed = parsePhoneNumberFromString(full, country.code)
    return {
        country: country.code,
        dialCode: country.dialCode,
        nationalNumber: raw,
        internationalNumber: parsed?.number?.toString() ?? full,
        isValid: parsed?.isValid() ?? false,
        isPossible: parsed?.isPossible() ?? false,
        formatNational: parsed?.formatNational() ?? raw,
        formatInternational: parsed?.formatInternational() ?? full,
    }
}

export type CountryDropdownRef = {
    open: () => void
    close: () => void
    focusSearch: () => void
}

const CountryDropdown = forwardRef<CountryDropdownRef, {
    selected: Country
    onSelect: (c: Country) => void
    open: boolean
    // Liste déjà filtrée à afficher
    countries: Country[]
    onClose: () => void
}>(({ selected, onSelect, open, countries, onClose }, ref) => {

    const [query, setQuery] = useState("")
    const searchRef = useRef<HTMLInputElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const { t: tCommon } = useTranslation("common")

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim()
        if (!q) return countries
        return countries.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.dialCode.includes(q) ||
                c.code.toLowerCase().includes(q)
        )
    }, [query, countries])

    useEffect(() => {
        if (open) {
            setQuery("")
            setTimeout(() => searchRef.current?.focus(), 50)
        }
    }, [open])

    useImperativeHandle(ref, () => ({
        open: () => { triggerRef.current?.click() },
        close: () => { triggerRef.current?.click() },
        focusSearch: () => { searchRef.current?.focus() },
    }))

    return (
        <Popover
            onOpenChange={(isOpen) => {
                if (isOpen) {
                    setQuery("")
                    setTimeout(() => searchRef.current?.focus(), 50)
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    ref={triggerRef}
                    variant="ghost"
                    className="flex items-center justify-between w-[100px] gap-2 h-11 bg-neutral-500/5 dark:bg-white/5 border-zinc-500/10 px-3 border rounded-lg"
                >
                    <ReactCountryFlag
                        countryCode={selected.code.toUpperCase()}
                        svg
                        style={{ width: "1.2em", height: "1.2em" }}
                    />
                    <ChevronsUpDown className="w-4 h-4" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0 z-[999999] bg-card shadow">
                <Command className="bg-card">
                    <CommandInput
                        ref={searchRef}
                        placeholder={tCommon("search country")}
                        value={query}
                        onValueChange={setQuery}
                        className="bg-card"
                    />
                    <CommandList className="scrollbar bg-card">
                        <CommandEmpty>{tCommon("no country found")}</CommandEmpty>
                        <CommandGroup>
                            {filtered.map((item) => (
                                <CommandItem
                                    value={`${item.code} ${item.name} ${item.dialCode}`}
                                    key={item.code}
                                    onSelect={() => {
                                        onSelect(item)
                                        onClose()
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-1 h-4 w-4",
                                            item.code === selected.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <ReactCountryFlag
                                        countryCode={item.code.toUpperCase()}
                                        svg
                                        style={{ width: "1.2em", height: "1.2em" }}
                                    />
                                    <span className="flex-1">{item.name}</span>
                                    <span className="text-xs">{item.dialCode}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
})

CountryDropdown.displayName = "CountryDropdown"

export default CountryDropdown

export function PhoneInput({
    value,
    defaultCountry = "CM",
    onChange,
    onBlur,
    disabled = false,
    error,
    label,
    hint,
    required = false,
    name,
    id,
    className,
    placeholder,
    autoFocus = false,
    choosedCountry,
}: PhoneInputProps) {
    const inputId = id ?? `phone-${name ?? "input"}`

    // Liste de pays affichée dans le dropdown :
    // si choosedCountry est fourni, on filtre ALL_COUNTRIES à ces codes uniquement
    const availableCountries = useMemo(() => {
        if (!choosedCountry || choosedCountry.length === 0) return ALL_COUNTRIES
        const set = new Set(choosedCountry.map((c) => c.toUpperCase()))
        return ALL_COUNTRIES.filter((c) => set.has(c.code.toUpperCase()))
    }, [choosedCountry])

    // S'assurer que defaultCountry est dans la liste disponible ;
    // sinon prendre le premier pays de la liste
    const resolvedDefault = useMemo<CountryCode>(() => {
        const inList = availableCountries.some((c) => c.code === defaultCountry)
        return inList ? defaultCountry : (availableCountries[0]?.code ?? "CM")
    }, [defaultCountry, availableCountries])

    const [countryCode, setCountryCode] = useState<CountryCode>(resolvedDefault)
    const [displayValue, setDisplayValue] = useState("")
    const [touched, setTouched] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { t: tAuth } = useTranslation("auth")
    const dropdownRef = useRef<CountryDropdownRef>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedCountry = useMemo(
        () => availableCountries.find((c) => c.code === countryCode) ?? availableCountries[0],
        [countryCode, availableCountries]
    )

    const maxLength = useMemo(() => getMaxNationalLength(countryCode), [countryCode])
    const derivedPlaceholder = placeholder ?? getPlaceholder(countryCode)

    useEffect(() => {
        if (value !== undefined) {
            const raw = value.replace(/\D/g, "").slice(0, maxLength)
            setDisplayValue(formatAsYouType(raw, countryCode))
        }
    }, [value, countryCode, maxLength])

    const parsedValue = useMemo(() => {
        const raw = displayValue.replace(/\D/g, "")
        return parseValue(raw, selectedCountry)
    }, [displayValue, selectedCountry])

    const handleNumberChange = useCallback(
        (input: string) => {
            const digitsOnly = input.replace(/\D/g, "").slice(0, maxLength)
            const formatted = formatAsYouType(digitsOnly, countryCode)
            setDisplayValue(formatted)
            const result = parseValue(digitsOnly, selectedCountry)
            onChange?.(result)
        },
        [countryCode, selectedCountry, maxLength, onChange]
    )

    const handleCountryChange = useCallback(
        (country: Country) => {
            setCountryCode(country.code)
            const raw = displayValue.replace(/\D/g, "")
            const newMax = getMaxNationalLength(country.code)
            const trimmed = raw.slice(0, newMax)
            setDisplayValue(formatAsYouType(trimmed, country.code))
            onChange?.(parseValue(trimmed, country))
            setTimeout(() => inputRef.current?.focus(), 50)
            dropdownRef.current?.close()
        },
        [displayValue, onChange]
    )

    const handleBlur = useCallback(() => {
        setTouched(true)
        onBlur?.()
    }, [onBlur])

    const showError = !!error || (touched && !!parsedValue && !parsedValue.isValid && displayValue.length > 0)
    const showSuccess = touched && !!parsedValue?.isValid

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-medium text-muted-foreground mb-0"
                >
                    {tAuth(label ?? "phone number")}
                </label>
            )}
            <div className="flex gap-2 items-start">
                <CountryDropdown
                    selected={selectedCountry}
                    onSelect={handleCountryChange}
                    open={dropdownOpen}
                    countries={availableCountries}
                    onClose={() => setDropdownOpen(false)}
                    ref={dropdownRef}
                />

                <input
                    ref={inputRef}
                    id={inputId}
                    name={name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                    value={displayValue}
                    placeholder={derivedPlaceholder}
                    aria-invalid={!!showError}
                    aria-describedby={
                        [
                            hint ? `${inputId}-hint` : null,
                            showError ? `${inputId}-error` : null,
                        ]
                            .filter(Boolean)
                            .join(" ") || undefined
                    }
                    onChange={(e) => handleNumberChange(e.target.value)}
                    onBlur={handleBlur}
                    className={`
                        w-full px-4 py-3 text-sm rounded-xl
                        bg-neutral-500/5 dark:bg-white/5
                        border border-zinc-500/10
                        text-black dark:text-white
                        placeholder-zinc-500
                        focus:outline-none
                        focus:ring-2 focus:ring-indigo-500/40
                        focus:border-transparent
                        transition-all duration-200
                        ${showError ? "border-red-500/50 ring-red-500/20" : ""}
                        [:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                        dark:[:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                        [:-webkit-autofill]:text-black
                        dark:[:-webkit-autofill]:text-white
                    `}
                />
            </div>

            {showError && (
                <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1">
                    {error ?? tAuth("invalid number for this country")}
                </p>
            )}
        </div>
    )
}
