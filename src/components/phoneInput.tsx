"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { ChevronsUpDown } from "lucide-react"
import { countries } from "@/utils/countries"

type PhoneValue = {
    country: string
    dialCode: string
    nationalNumber: string
    internationalNumber: string
    isValid: boolean
}

type Props = {
    onChange?: (value: PhoneValue) => void
}

export function PhoneInput({ onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [countryCode, setCountryCode] = useState("CM")
    const [number, setNumber] = useState("")

    const selectedCountry = useMemo(
        () => countries.find((c) => c.code === countryCode)!,
        [countryCode]
    )

    const handleNumberChange = (value: string) => {
        const clean = value.replace(/\D/g, "")
        setNumber(clean)

        const full = `${selectedCountry.dialCode}${clean}`

        const parsed = parsePhoneNumberFromString(full)

        const result: PhoneValue = {
            country: selectedCountry.code,
            dialCode: selectedCountry.dialCode,
            nationalNumber: clean,
            internationalNumber: parsed?.number || full,
            isValid: parsed?.isValid() || false,
        }

        onChange?.(result)
    }

    return (
        <div className="flex w-full gap-2">

            {/* Country Selector with search */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-[80px] justify-between"
                    >
                        <div className="flex items-center gap-2">
                            {/* <span>{selectedCountry.flag}</span> */}
                            <span>{selectedCountry.dialCode}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[220px] p-0">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.code}
                                        value={country.name}
                                        onSelect={() => {
                                            setCountryCode(country.code)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex w-full items-center gap-2">
                                            <span>{country.flag}</span>
                                            <span>{country.name}</span>
                                            <span className="ml-auto text-muted-foreground text-sm">
                                                {country.dialCode}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Phone Input */}
            <Input
                type="tel"
                placeholder="699001122"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                className="flex-1"
            />
        </div>
    )
}