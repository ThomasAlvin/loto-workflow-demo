import {
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import ReactCountryFlag from "react-country-flag";
import { FaCaretDown } from "react-icons/fa";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import CountryPhoneNumberMenuList from "./CountryPhoneNumberMenuList";
function CountryPhoneNumberMenuMemo({
  selectedCountryCodeValue,
  setSelectedCountryCode,
  registerId,
  variant,
}) {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const { isOpen, onClose, onOpen } = useDisclosure();
  const menuListRef = useRef();

  useEffect(() => {
    if (isOpen && menuListRef.current) {
      menuListRef.current.scrollTop = 0;
    }
  }, [isOpen]);
  return (
    <Menu
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom-start"
      modifiers={[
        {
          name: "flip",
          enabled: false,
        },
      ]}
    >
      <MenuButton
        flexShrink={0}
        as={Button}
        onClick={isOpen ? onClose : onOpen}
        isActive={isOpen}
        borderRightRadius="0"
        pr={"8px"}
      >
        <Flex alignItems="center" gap="5px">
          <ReactCountryFlag
            svg
            countryCode={selectedCountryCodeValue}
            style={{ width: "1.5em", height: "1.5em" }}
          />
          <FaCaretDown />
        </Flex>
      </MenuButton>

      <CountryPhoneNumberMenuList
        menuListRef={menuListRef}
        setSelectedCountryCode={setSelectedCountryCode}
        registerId={registerId}
        variant={variant}
      />
    </Menu>
  );
}
const CountryPhoneNumberMenu = memo(CountryPhoneNumberMenuMemo);
export default CountryPhoneNumberMenu;
