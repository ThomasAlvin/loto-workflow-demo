import { Avatar, Flex } from "@chakra-ui/react";
import { components } from "react-select";
import labelizeRole from "../utils/labelizeRole";
export default function ReactSelectMemberSelection(props) {
  return (
    <>
      <components.Option {...props}>
        {props.data.value === "all" ? (
          <Flex fontWeight={700} alignItems={"center"}>
            <Flex>Select All&nbsp;</Flex>
          </Flex>
        ) : (
          <Flex alignItems={"center"} gap={"10px"}>
            {props.data?.user.first_name ? (
              <Avatar
                outline={"1px solid #dc143c"}
                border={"2px solid white"}
                name={
                  props.data?.user.first_name + " " + props.data?.user.last_name
                }
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
            <Flex flexDir={"column"}>
              {props.data ? (
                <>
                  <Flex>
                    {props.data?.user.first_name +
                      " " +
                      props.data?.user.last_name}
                  </Flex>
                  <Flex
                    fontWeight={400}
                    fontSize={"14px"}
                    color={props.isSelected ? "#dbdbdb" : "#848484"}
                  >
                    {labelizeRole(props.data.role)} - {props.data.employee_id}
                  </Flex>
                </>
              ) : (
                <Flex color={"#848484"}>Not assigned yet</Flex>
              )}
            </Flex>
          </Flex>
        )}
      </components.Option>
    </>
  );
}
