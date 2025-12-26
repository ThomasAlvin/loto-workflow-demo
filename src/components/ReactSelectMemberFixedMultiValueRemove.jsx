import { Flex } from "@chakra-ui/react";
import { IoIosLock } from "react-icons/io";
import { components } from "react-select";

export default function ReactSelectMemberFixedMultiValueRemove(props) {
  // If the option is fixed, replace the "x" with a lock icon
  return props.data.isDisabled ? (
    <Flex alignItems={"center"} color={"#dedede"} pr={"4px"}>
      <IoIosLock />
    </Flex>
  ) : (
    <components.MultiValueRemove {...props} />
  );
}
