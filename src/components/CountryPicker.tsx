"use client";
import React, { useState, useRef, useEffect, ForwardedRef } from "react";
import PhoneInput from "react-phone-number-input";
import {
  parsePhoneNumberFromString,
  AsYouType,
  getExampleNumber,
} from "libphonenumber-js/min";
import metadata from "libphonenumber-js/metadata.min.json";
import "react-phone-number-input/style.css";
import TextField from "@mui/material/TextField";

type PhoneNumberFieldProps = {
  value?: string;
  onChange: ({ number, country }: { number: string; country: string }) => void;
};

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(value || "");
  const [country, setCountry] = useState<string>("CM");
  const [error, setError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getMaxLength = (countryCode: string): number => {
    try {
      const exampleNumber = getExampleNumber(countryCode, metadata);
      return exampleNumber ? exampleNumber.nationalNumber.length : 15;
    } catch {
      return 15;
    }
  };

  const maxLength = getMaxLength(country);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue]);

  const formatPhoneNumber = (number: string): string => {
    if (!number) return "";
    return new AsYouType(country).input(number);
  };

  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;
    const formatted = formatPhoneNumber(newValue);
    const parsedNumber = parsePhoneNumberFromString(formatted, country);
    const nationalNumber = parsedNumber?.nationalNumber;
    if (nationalNumber?.length > maxLength) return;
    setInputValue(formatted);
  };

  const handleBlur = () => {
    if (!inputValue) {
      setError(false);
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(inputValue, country);
    if (phoneNumber && phoneNumber.isValid()) {
      onChange({ number: phoneNumber.formatInternational(), country });
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <PhoneInput
      international
      defaultCountry={"CM"}
      value={inputValue}
      onChange={handleChange}
      onCountryChange={(newCountry) => {
        setCountry(newCountry);
        // setInputValue("");
      }}
      inputComponent={React.forwardRef<HTMLInputElement, any>(
        ({ value, onChange, ...props }, ref) => (
          <TextField
            {...props}
            inputRef={(el: HTMLInputElement | null) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref)
                (ref as ForwardedRef<HTMLInputElement>).current = el;
            }}
            value={inputValue}
            size="small"
            label="Numero"
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={handleBlur}
            variant="outlined"
            fullWidth
            error={error}
            helperText={error ? "Invalid phone number" : ""}
          />
        )
      )}
    />
  );
};

export default React.memo(PhoneNumberField);
