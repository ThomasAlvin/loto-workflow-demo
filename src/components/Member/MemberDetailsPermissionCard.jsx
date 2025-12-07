import { Checkbox, Flex } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
import formatString from "../../utils/formatString";

export default function MemberDetailsPermissionCard({
  module,
  permission,
  permissionLength,
  index2,
  value,
}) {
  function isWorkOrderViewOwnedOrViewAll(module, permission) {
    if (module.name !== "work_orders") return "";
    if (permission.permission === "view_owned") return "manage_own";
    if (permission.permission === "view") return "manage_all";
    if (permission.permission === "manage") return "none";

    return "none";
  }

  return isWorkOrderViewOwnedOrViewAll(module, permission) === "none" ? (
    ""
  ) : (
    <Flex
      borderBottom={
        isWorkOrderViewOwnedOrViewAll(module, permission) === "manage_own" ||
        permissionLength - 1 === index2
          ? ""
          : "1px solid #bababa"
      }
      //   opacity={value ? 1 : 0.7}
      bg={"#f8f9fa"}
      //   _hover={{
      //     background: tinycolor("#f8f9fa").darken(5).toString(),
      //   }}
      alignItems={"center"}
      justify={"space-between"}
      p={"10px"}
    >
      <Flex opacity={value ? 1 : 0.7} flexDir={"column"}>
        <Flex alignItems={"center"} gap={"5px"}>
          <Flex fontWeight={700} color={value ? "black" : "#373737ff"}>
            {formatString(
              (isWorkOrderViewOwnedOrViewAll(module, permission)
                ? isWorkOrderViewOwnedOrViewAll(module, permission)
                : permission.permission === "view"
                ? "view_all"
                : permission.permission +
                  (module.name === "members" && permission.permission !== "view"
                    ? "s"
                    : "")) +
                "_" +
                (module.name === "members" ? "" : module.name),
              true,
              true,
              true
            )}
          </Flex>
        </Flex>
        <Flex fontSize={"14px"} color={"#848484"}>
          {permission?.description || "Give your department a clear name"}
        </Flex>
      </Flex>
      <Flex>
        <Checkbox
          size={"lg"}
          bg={"#ededed"}
          boxShadow={"none"}
          colorScheme={value ? "green" : "red"}
          {...(!value ? { icon: <IoMdClose /> } : {})}
          isChecked={true}
          pointerEvents={"none"}
        ></Checkbox>
      </Flex>
    </Flex>
  );
}
