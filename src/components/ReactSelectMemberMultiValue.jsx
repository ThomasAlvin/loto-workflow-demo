import { Avatar, Flex } from "@chakra-ui/react";
import { FaUserAlt } from "react-icons/fa";
import { components } from "react-select";

export default function ReactSelectMemberMultiValue(props) {
  return (
    <components.MultiValue {...props}>
      <Flex alignItems={"center"} gap={"5px"}>
        {props.data?.user?.first_name ? (
          <Avatar
            size={"xs"}
            background={
              props.data?.user.profile_image_url ? "white" : undefined
            }
            outline={"1px solid #dc143c"}
            border={"1px solid white"}
            name={props.data.user.first_name + " " + props.data.user.last_name}
            src={
              props.data?.user.profile_image_url
                ? props.data?.user.profile_image_url
                : null
            }
          ></Avatar>
        ) : (
          <Flex
            outline={"1px solid #dc143c"}
            bg={"#bababa"}
            borderRadius={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"48px"}
            w={"48px"}
            border={"2px solid white"}
          >
            <Flex color={"white"} fontSize={"24px"}>
              <FaUserAlt />
            </Flex>
          </Flex>
        )}
        <Flex fontSize={"13px"}>{props.data.label}</Flex>
      </Flex>
    </components.MultiValue>
  );
}
