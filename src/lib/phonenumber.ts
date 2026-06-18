import { parsePhoneNumberFromString } from "libphonenumber-js";

export const formatPhoneNumber = (
  phoneNumber: string,
  country: string = "US"
): string => {
  const phoneNumberObj = parsePhoneNumberFromString(phoneNumber, country);
  if (!phoneNumberObj) return phoneNumber; // If parsing fails, return the input

  return phoneNumberObj.formatInternational(); // Format the phone number in the international format
};
