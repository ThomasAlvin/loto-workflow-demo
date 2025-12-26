import { getCountryCallingCode } from "libphonenumber-js";

export default function getPhoneCountryDetailsByCountryCode(countryCode) {
  if (!countryCode) return null;

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  return {
    value: countryCode,
    name: regionNames.of(countryCode),
    callingCode: `+${getCountryCallingCode(countryCode)}`,
  };
}
