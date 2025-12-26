import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function removeCountryCode(phone, country) {
  if (!phone) return null;
  const parsed = parsePhoneNumberFromString(phone, country);

  if (!parsed) {
    return null;
  }

  return parsed.nationalNumber;
}
