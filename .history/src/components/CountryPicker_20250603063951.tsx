// "use client";
// import React, { useState, useRef, useEffect, ForwardedRef } from "react";
// import PhoneInput from "react-phone-number-input";
// import {
//   parsePhoneNumberFromString,
//   AsYouType,
//   getExampleNumber,
// } from "libphonenumber-js/min";
// import metadata from "libphonenumber-js/metadata.min.json";
// import "react-phone-number-input/style.css";
// import TextField from "@mui/material/TextField";
// import { useTranslation } from "react-i18next";

// type PhoneNumberFieldProps = {
//   value?: string;
//   onChange: ({
//     number,
//     country,
//     error,
//   }: {
//     number: string;
//     country: string;
//     error: boolean;
//   }) => void;
// };

// const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
//   value,
//   onChange,
// }) => {
//   const [inputValue, setInputValue] = useState<string>(value || "");
//   const [country, setCountry] = useState<string>("CM");
//   const [error, setError] = useState<boolean>(false);
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const getMaxLength = (countryCode: string): number => {
//     try {
//       const exampleNumber = getExampleNumber(countryCode, metadata);
//       return exampleNumber ? exampleNumber.nationalNumber.length : 15;
//     } catch {
//       return 15;
//     }
//   };

//   const maxLength = getMaxLength(country);
//   const { t: tCommon } = useTranslation('common');

//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [inputValue]);

//   const formatPhoneNumber = (number: string): string => {
//     if (!number) return "";
//     return new AsYouType(country).input(number);
//   };

//   const handleChange = (newValue: string | undefined) => {
//     if (!newValue) return;
//     const formatted = formatPhoneNumber(newValue);
//     const parsedNumber = parsePhoneNumberFromString(formatted, country);
//     const nationalNumber = parsedNumber?.nationalNumber;
//     if (nationalNumber?.length > maxLength) return;
//     setInputValue(formatted);
//   };

//   const handleBlur = () => {
//     if (!inputValue) {
//       setError(false);
//       onChange({ number: "", country, error: false });
//       return;
//     }

//     const phoneNumber = parsePhoneNumberFromString(inputValue, country);
//     const isValid = phoneNumber?.isValid() ?? false;

//     setError(!isValid);

//     onChange({
//       number: phoneNumber?.formatInternational() ?? inputValue,
//       country,
//       error: !isValid,
//     });
//   };

//   return (
//     <PhoneInput
//       international
//       defaultCountry={"CI"}
//       value={inputValue}
//       onChange={handleChange}
//       onCountryChange={(newCountry) => {
//         setCountry(newCountry);
//         // setInputValue("");
//       }}
//       inputComponent={React.forwardRef<HTMLInputElement, any>(
//         ({ value, onChange, ...props }, ref) => (
//           <TextField
//             {...props}
//             inputRef={(el: HTMLInputElement | null) => {
//               inputRef.current = el;
//               if (typeof ref === "function") ref(el);
//               else if (ref)
//                 (ref as ForwardedRef<HTMLInputElement>).current = el;
//             }}
//             value={inputValue}
//             size="small"
//             label="Numero"
//             onChange={(e) => onChange?.(e.target.value)}
//             onBlur={handleBlur}
//             variant="outlined"
//             fullWidth
//             error={error}
//             helperText={error ? tCommon("invalid_phone_number") : ""}
//           />
//         )
//       )}
//     />
//   );
// };

// export default React.memo(PhoneNumberField);
