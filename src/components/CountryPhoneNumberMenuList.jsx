import { Flex, MenuItem, MenuList } from "@chakra-ui/react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { memo, useMemo } from "react";
import ReactCountryFlag from "react-country-flag";
function CountryPhoneNumberMenuListMemo({
  menuListRef,
  setSelectedCountryCode,
  registerId,
  variant,
}) {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const countryData = useMemo(() => {
    return getCountries()
      .map((country) => ({
        value: country,
        name: regionNames.of(country),
        callingCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  return (
    <MenuList ref={menuListRef} maxH="200px" overflowY="auto">
      {countryData.map((c) => (
        <MenuItem
          onClick={() => {
            if (variant === "RHF") {
              setSelectedCountryCode(registerId, c);
            } else {
              setSelectedCountryCode((prevState) => ({
                ...prevState,
                [registerId]: c,
              }));
            }
          }}
          key={c.value}
        >
          <Flex gap={"8px"} alignItems={"center"}>
            <Flex>
              <ReactCountryFlag
                svg
                countryCode={c.value}
                style={{ width: "1.5em", height: "1.5em" }}
              />
            </Flex>
            <Flex>{c.name}</Flex>
            <Flex color={"#848484"}>{c.callingCode}</Flex>
          </Flex>
        </MenuItem>
      ))}
    </MenuList>
  );
}
const CountryPhoneNumberMenuList = memo(CountryPhoneNumberMenuListMemo);
export default CountryPhoneNumberMenuList;
