import { Avatar, Flex, Tooltip } from "@chakra-ui/react";
import { FaLock, FaUserAlt } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { components } from "react-select";

export default function ReactSelectMemberFixedMultiValueRemove(props) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  // If the option is fixed, replace the "x" with a lock icon
  return props.data.isDisabled ? (
    <Flex alignItems={"center"} color={"#dedede"} pr={"4px"}>
      <IoIosLock />
    </Flex>
  ) : (
    <components.MultiValueRemove {...props} />
  );
}
