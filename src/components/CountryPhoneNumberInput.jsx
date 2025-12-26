import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { forwardRef, memo, useEffect } from "react";
import CountryPhoneNumberMenu from "./CountryPhoneNumberMenu";

const CountryPhoneNumberInput = forwardRef(
  (
    {
      selectedCountryCodeValue,
      selectedCountryCodeCallingCode,
      setSelectedCountryCode,
      registerId,
      variant,
      trigger,
      formikValidateField,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (variant === "RHF") {
        trigger("phoneNumber");
      } else {
        formikValidateField("phoneNumber");
      }
    }, [selectedCountryCodeValue, trigger, formikValidateField]);
    return (
      <Flex>
        <CountryPhoneNumberMenu
          selectedCountryCodeValue={selectedCountryCodeValue}
          setSelectedCountryCode={setSelectedCountryCode}
          registerId={registerId}
          variant={variant}
        />

        <InputGroup>
          <InputLeftElement pl="10px" w="max-content" pointerEvents="none">
            {selectedCountryCodeCallingCode}
          </InputLeftElement>

          <Input
            ref={ref}
            pl={`${15 + selectedCountryCodeCallingCode.length * 9}px`}
            {...props}
          />
        </InputGroup>
      </Flex>
    );
  }
);

export default memo(CountryPhoneNumberInput);
